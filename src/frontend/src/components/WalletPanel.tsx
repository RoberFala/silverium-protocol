import { useWallet } from "@/hooks/useWallet";
import { WALLET_OPTIONS, shortenAddress } from "@/types/energy";
import { AlertTriangle, Loader2, Wallet } from "lucide-react";

export function WalletPanel() {
  const { wallet, isConnecting, error, connect, disconnect, clearError } =
    useWallet();

  if (wallet) {
    return (
      <section
        data-ocid="wallet.panel"
        className="rounded-2xl border border-primary/30 bg-card/70 p-5 shadow-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
              <Wallet className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="label-eyebrow">Billetera conectada</p>
              <p className="truncate font-mono text-sm text-foreground">
                {shortenAddress(wallet.address)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent">
              {wallet.walletName}
            </span>
            <button
              type="button"
              data-ocid="wallet.disconnect_button"
              onClick={disconnect}
              className="rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-destructive/60 hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Desconectar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-ocid="wallet.panel"
      className="rounded-2xl border border-border bg-card/70 p-5 shadow-panel"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
          <Wallet className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">
            Conecta tu billetera
          </h2>
          <p className="text-sm text-muted-foreground">
            Vincula una billetera EVM o Solana para gestionar tu Energía SPR.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {WALLET_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            data-ocid={`wallet.connect_button.${option.id}`}
            disabled={isConnecting}
            onClick={() => void connect(option.id)}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left transition-smooth hover:border-primary/60 hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {option.name}
              </span>
              <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                {option.network}
              </span>
            </span>
            {isConnecting ? (
              <Loader2
                className="size-4 shrink-0 animate-spin text-primary motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <span className="font-mono text-xs text-primary opacity-0 transition-smooth group-hover:opacity-100">
                →
              </span>
            )}
          </button>
        ))}
      </div>

      {isConnecting && (
        <output
          data-ocid="wallet.loading_state"
          className="mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary"
        >
          <Loader2
            className="size-3.5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Esperando confirmación de la billetera…
        </output>
      )}

      {error && (
        <div
          role="alert"
          data-ocid="wallet.error_state"
          className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            data-ocid="wallet.error_dismiss_button"
            onClick={clearError}
            className="font-mono text-xs uppercase tracking-widest text-destructive/80 transition-smooth hover:text-destructive"
          >
            Cerrar
          </button>
        </div>
      )}
    </section>
  );
}
