import type { EnergyTx, EnergyTxKind } from "@/backend";

export type { EnergyTx, EnergyTxKind };

export type WalletChain = "ethereum" | "bnb" | "solana";

export interface WalletOption {
  id: WalletChain;
  name: string;
  /** Short chain label shown under the wallet name. */
  network: string;
  /** Address prefix used when generating a demo address. */
  prefix: string;
}

export const WALLET_OPTIONS: WalletOption[] = [
  { id: "ethereum", name: "MetaMask", network: "Ethereum", prefix: "0x" },
  { id: "bnb", name: "Binance Wallet", network: "BNB Chain", prefix: "0x" },
  { id: "solana", name: "Phantom", network: "Solana", prefix: "" },
];

export interface ConnectedWallet {
  address: string;
  chain: WalletChain;
  walletName: string;
}

export type PaymentMethodId =
  | "solana"
  | "icp"
  | "ethereum"
  | "silverium"
  | "usdt";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "solana", label: "Solana" },
  { id: "icp", label: "ICP" },
  { id: "ethereum", label: "Ethereum" },
  { id: "silverium", label: "Silverium Protocol" },
  { id: "usdt", label: "USDT" },
];

/** Truncate a wallet address to the 0x1234…abcd display form. */
export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
