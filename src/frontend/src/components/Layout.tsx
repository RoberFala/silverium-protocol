import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/types/energy";
import { Hexagon } from "lucide-react";
import type { ReactNode } from "react";

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid size-10 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary glow-primary">
        <Hexagon className="size-5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-sm font-bold uppercase tracking-[0.22em] text-foreground">
          Silverium
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.42em] text-primary">
          Protocol
        </span>
      </span>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { wallet, disconnect } = useWallet();
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-dvh bg-background bg-grid text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-transparent to-transparent"
      />
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-3">
            {wallet ? (
              <>
                <span
                  data-ocid="wallet.address_chip"
                  className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 font-mono text-xs text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 animate-pulse-dot rounded-full bg-primary motion-reduce:animate-none"
                  />
                  {shortenAddress(wallet.address)}
                  <span className="hidden text-muted-foreground sm:inline">
                    conectada
                  </span>
                </span>
                <button
                  type="button"
                  data-ocid="wallet.disconnect_button"
                  onClick={disconnect}
                  className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-accent/60 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Sin conexión
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-border bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span className="font-mono uppercase tracking-widest">
            Silverium Protocol · DePIN Energy Grid
          </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="transition-smooth hover:text-primary"
          >
            © {year}. Built with love using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
