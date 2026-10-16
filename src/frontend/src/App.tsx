import { EnergyPanel } from "@/components/EnergyPanel";
import { Layout } from "@/components/Layout";
import { StatusLog } from "@/components/StatusLog";
import { WalletPanel } from "@/components/WalletPanel";
import { WalletProvider } from "@/hooks/useWallet";

export default function App() {
  return (
    <WalletProvider>
      <Layout>
        <div className="flex flex-col gap-6">
          <WalletPanel />
          <div className="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
            <EnergyPanel />
            <StatusLog />
          </div>
        </div>
      </Layout>
    </WalletProvider>
  );
}
