import type { ConnectedWallet, WalletChain } from "@/types/energy";
import { WALLET_OPTIONS } from "@/types/energy";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "silverium.wallet";

interface WalletContextValue {
  wallet: ConnectedWallet | null;
  isConnecting: boolean;
  error: string | null;
  connect: (chain: WalletChain) => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

/**
 * Deterministic demo address per chain, without touching a real chain.
 * Stable for a given chain so the wallet — and the SPR Energy balance the
 * canister stores for it — is recovered after a page reload.
 */
function buildAddress(chain: WalletChain): string {
  const option = WALLET_OPTIONS.find((item) => item.id === chain);
  const prefix = option?.prefix ?? "";
  const hex = "0123456789abcdef";
  let seed = 0;
  for (let i = 0; i < chain.length; i += 1) {
    seed = (seed * 31 + chain.charCodeAt(i)) >>> 0;
  }
  let body = "";
  for (let i = 0; i < 40; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    body += hex[seed % hex.length];
  }
  return `${prefix}${body}`;
}

function readStoredWallet(): ConnectedWallet | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConnectedWallet>;
    if (
      typeof parsed.address === "string" &&
      typeof parsed.walletName === "string" &&
      (parsed.chain === "ethereum" ||
        parsed.chain === "bnb" ||
        parsed.chain === "solana")
    ) {
      return {
        address: parsed.address,
        chain: parsed.chain,
        walletName: parsed.walletName,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(
    readStoredWallet,
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (wallet) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (private mode); the session still works in memory.
    }
  }, [wallet]);

  const connect = useCallback(async (chain: WalletChain) => {
    const option = WALLET_OPTIONS.find((item) => item.id === chain);
    if (!option) {
      setError("Red no soportada. Elige Ethereum, BNB Chain o Solana.");
      return;
    }
    setError(null);
    setIsConnecting(true);
    try {
      // Simulated provider handshake: mirrors a wallet popup round-trip.
      await new Promise((resolve) => setTimeout(resolve, 650));
      setWallet({
        address: buildAddress(chain),
        chain,
        walletName: option.name,
      });
    } catch {
      setError("La conexión fue rechazada. Inténtalo de nuevo.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({ wallet, isConnecting, error, connect, disconnect, clearError }),
    [wallet, isConnecting, error, connect, disconnect, clearError],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
