import App from "@/App";
import type { EnergyTx, backendInterface } from "@/backend";
import { EnergyTxKind } from "@/backend";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithActor } from "./test-utils";

const STORAGE_KEY = "silverium.wallet";

type ActorMethods = Pick<
  backendInterface,
  "getEnergyBalance" | "getEnergyHistory" | "rechargeEnergy" | "runAiTask"
>;

/**
 * Minimal stateful fake actor: the persistence tests only need reads to resolve
 * so the connected UI settles. Every read returns a fresh snapshot.
 */
function createFakeActor(balance = 0n) {
  let current = balance;
  let history: EnergyTx[] = [];

  const getEnergyBalance = vi.fn<backendInterface["getEnergyBalance"]>(
    async () => current,
  );
  const getEnergyHistory = vi.fn<backendInterface["getEnergyHistory"]>(
    async () => structuredClone(history),
  );
  const rechargeEnergy = vi.fn<backendInterface["rechargeEnergy"]>(async () => {
    current += 10n;
    history = [
      {
        kind: EnergyTxKind.recharge,
        timestamp: 1_700_000_000_000_000_000n,
        amount: 10n,
        balanceAfter: current,
      },
      ...history,
    ];
    return current;
  });
  const runAiTask = vi.fn<backendInterface["runAiTask"]>(async () => {
    if (current < 1n) {
      return {
        __kind__: "err",
        err: {
          __kind__: "insufficientBalance",
          insufficientBalance: { available: current, required: 1n },
        },
      };
    }
    current -= 1n;
    return {
      __kind__: "ok",
      ok: { contribution: "Aporte de IA verificado.", balanceAfter: current },
    };
  });

  const actor = {
    getEnergyBalance,
    getEnergyHistory,
    rechargeEnergy,
    runAiTask,
  } satisfies ActorMethods;

  return { actor, getEnergyBalance };
}

async function connectEthereum(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId("wallet.connect_button.ethereum"));
  await waitFor(() =>
    expect(screen.getByTestId("wallet.address_chip")).toBeInTheDocument(),
  );
}

describe("Wallet persistence and deterministic addresses", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("persists the connected wallet to localStorage", async () => {
    const user = userEvent.setup();
    const { actor } = createFakeActor();
    renderWithActor(<App />, actor);

    await connectEthereum(user);

    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const stored = JSON.parse(raw as string) as {
        address: string;
        chain: string;
        walletName: string;
      };
      expect(stored.chain).toBe("ethereum");
      expect(stored.walletName).toBe("MetaMask");
      expect(stored.address).toMatch(/^0x[0-9a-f]{40}$/);
    });
  });

  it("restores the stored wallet on a fresh mount without reconnecting", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        chain: "ethereum",
        walletName: "MetaMask",
      }),
    );

    const { actor } = createFakeActor(10n);
    renderWithActor(<App />, actor);

    // The header chip and enabled actions prove the wallet was recovered.
    expect(screen.getByTestId("wallet.address_chip")).toBeInTheDocument();
    expect(screen.getByTestId("energy.recharge_button")).toBeEnabled();
    expect(screen.getByTestId("energy.run_task_button")).toBeEnabled();
    expect(
      screen.queryByTestId("energy.connect_notice"),
    ).not.toBeInTheDocument();
  });

  it("derives the same address for the same chain across sessions", async () => {
    const user = userEvent.setup();
    const first = createFakeActor();
    const firstRender = renderWithActor(<App />, first.actor);
    await connectEthereum(user);
    const firstAddress = window.localStorage.getItem(STORAGE_KEY);
    firstRender.unmount();

    window.localStorage.clear();
    const second = createFakeActor();
    renderWithActor(<App />, second.actor);
    await connectEthereum(user);
    const secondAddress = window.localStorage.getItem(STORAGE_KEY);

    expect(secondAddress).toBe(firstAddress);
  });

  it("clears the stored wallet on disconnect", async () => {
    const user = userEvent.setup();
    const { actor } = createFakeActor();
    renderWithActor(<App />, actor);

    await connectEthereum(user);
    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull(),
    );

    const panel = screen.getByTestId("wallet.panel");
    await user.click(within(panel).getByTestId("wallet.disconnect_button"));

    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull(),
    );
    expect(screen.queryByTestId("wallet.address_chip")).not.toBeInTheDocument();
  });
});
