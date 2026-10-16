import {
  useEnergyBalance,
  useRechargeEnergy,
  useRunAiTask,
} from "@/hooks/useQueries";
import { useWallet } from "@/hooks/useWallet";
import { formatAmount } from "@/lib/format";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/types/energy";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

function BalanceDisplay({
  balance,
  isLoading,
}: {
  balance: bigint;
  isLoading: boolean;
}) {
  return (
    <div
      data-ocid="energy.balance_panel"
      className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card/80 p-6 text-center shadow-panel glow-primary sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent"
      />
      <p className="relative label-eyebrow">
        Balance de Energía SPR Disponible
      </p>
      <p className="relative mt-3 font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
        {isLoading ? (
          <span className="inline-block h-12 w-40 animate-pulse rounded-lg bg-muted align-middle motion-reduce:animate-none" />
        ) : (
          <>
            {formatAmount(balance)}
            <span className="ml-2 text-2xl font-semibold text-primary sm:text-3xl">
              SPR
            </span>
          </>
        )}
      </p>
      <p className="relative mt-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
        Grid de energía descentralizada
      </p>
    </div>
  );
}

export function EnergyPanel() {
  const { wallet } = useWallet();
  const address = wallet?.address ?? null;
  const [method, setMethod] = useState<PaymentMethodId>("solana");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const balanceQuery = useEnergyBalance(address);
  const recharge = useRechargeEnergy();
  const runTask = useRunAiTask();

  const connected = !!wallet;
  const balance = balanceQuery.data ?? 0n;
  const busy = recharge.isPending || runTask.isPending;

  const handleRecharge = () => {
    if (!address) return;
    setAiError(null);
    recharge.mutate(address);
  };

  const handleRunTask = () => {
    if (!address) return;
    setAiError(null);
    setAiResult(null);
    runTask.mutate(address, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          setAiResult(result.ok.contribution);
        } else {
          setAiError(
            `Energía insuficiente: tienes ${result.err.insufficientBalance.available.toString()} SPR y necesitas ${result.err.insufficientBalance.required.toString()} SPR. Recarga para continuar.`,
          );
        }
      },
      onError: () => {
        setAiError("No se pudo ejecutar la tarea de IA. Inténtalo de nuevo.");
      },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <BalanceDisplay balance={balance} isLoading={balanceQuery.isLoading} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          data-ocid="energy.recharge_button"
          disabled={!connected || busy}
          onClick={handleRecharge}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-display text-sm font-semibold text-primary-foreground transition-smooth hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {recharge.isPending ? (
            <Loader2
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Zap className="size-4" aria-hidden="true" />
          )}
          Recargar 10 SPR de Energía
        </button>
        <button
          type="button"
          data-ocid="energy.run_task_button"
          disabled={!connected || busy}
          onClick={handleRunTask}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-accent/60 bg-accent/5 px-6 py-3.5 font-display text-sm font-semibold text-accent transition-smooth hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {runTask.isPending ? (
            <Loader2
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Sparkles className="size-4" aria-hidden="true" />
          )}
          Ejecutar Tarea de IA (-1 SPR)
        </button>
      </div>

      {!connected && (
        <p
          data-ocid="energy.connect_notice"
          className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-center font-mono text-xs uppercase tracking-widest text-warning"
        >
          Conecta tu billetera
        </p>
      )}

      <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-panel">
        <p className="label-eyebrow mb-3">Método de pago</p>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Método de pago</legend>
          {PAYMENT_METHODS.map((option) => {
            const active = option.id === method;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                data-ocid={`energy.payment_method.${option.id}`}
                onClick={() => setMethod(option.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </fieldset>
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          Pago simulado · sin liquidación on-chain
        </p>
      </div>

      {recharge.isPending && (
        <output
          data-ocid="energy.recharge_loading_state"
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary"
        >
          <Loader2
            className="size-3.5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Confirmando pago y acreditando 10 SPR…
        </output>
      )}

      {recharge.isError && (
        <div
          role="alert"
          data-ocid="energy.recharge_error_state"
          className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          No se pudo completar la recarga. Inténtalo de nuevo.
        </div>
      )}

      {aiResult && (
        <div
          data-ocid="energy.ai_success_state"
          className="rounded-2xl border border-primary/40 bg-primary/5 p-5"
        >
          <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Tarea de IA ejecutada · -1 SPR
          </p>
          <p className="text-sm leading-relaxed text-foreground">{aiResult}</p>
        </div>
      )}

      {aiError && (
        <div
          role="alert"
          data-ocid="energy.ai_error_state"
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{aiError}</span>
        </div>
      )}
    </div>
  );
}
