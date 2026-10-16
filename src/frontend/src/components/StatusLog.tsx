import { EnergyTxKind } from "@/backend";
import { useEnergyHistory } from "@/hooks/useQueries";
import { useWallet } from "@/hooks/useWallet";
import { formatClockTime } from "@/lib/format";
import { Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatusLog() {
  const { wallet } = useWallet();
  const address = wallet?.address ?? null;
  const historyQuery = useEnergyHistory(address);
  const entries = historyQuery.data ?? [];

  return (
    <section
      data-ocid="status_log.panel"
      className="flex h-full flex-col rounded-2xl border border-border bg-card/70 shadow-panel"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-foreground">
          <Activity className="size-4 text-accent" aria-hidden="true" />
          Status Log
        </h2>
        <span className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
          {entries.length} eventos
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {!address ? (
          <div
            data-ocid="status_log.empty_state"
            className="flex h-full min-h-48 flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <Activity
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Conecta tu billetera para ver la actividad de energía.
            </p>
          </div>
        ) : historyQuery.isLoading ? (
          <div
            data-ocid="status_log.loading_state"
            className="flex flex-col gap-2"
          >
            {Array.from({ length: 4 }, (_, i) => `log-skeleton-${i}`).map(
              (id) => (
                <div
                  key={id}
                  className="h-12 animate-pulse rounded-xl bg-muted/60"
                />
              ),
            )}
          </div>
        ) : entries.length === 0 ? (
          <div
            data-ocid="status_log.empty_state"
            className="flex h-full min-h-48 flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <Activity
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Aún no hay actividad. Recarga energía o ejecuta una tarea de IA.
            </p>
          </div>
        ) : (
          <ul data-ocid="status_log.list" className="flex flex-col gap-2">
            {entries.map((tx, index) => {
              const isRecharge = tx.kind === EnergyTxKind.recharge;
              return (
                <li
                  key={`${tx.timestamp.toString()}-${tx.kind}-${index}`}
                  data-ocid={`status_log.item.${index + 1}`}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/30 px-3 py-2.5"
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                      isRecharge
                        ? "bg-primary/15 text-primary"
                        : "bg-accent/15 text-accent"
                    }`}
                  >
                    {isRecharge ? (
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    ) : (
                      <ArrowDownRight className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatClockTime(tx.timestamp)}
                    </p>
                    <p className="truncate text-sm text-foreground">
                      {isRecharge ? "Recarga confirmada" : "Tarea IA ejecutada"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-sm font-semibold ${
                      isRecharge ? "text-primary" : "text-accent"
                    }`}
                  >
                    {isRecharge ? "+" : "-"}
                    {tx.amount.toString()} SPR
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
