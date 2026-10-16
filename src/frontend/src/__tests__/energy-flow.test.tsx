import App from "@/App";
import type { EnergyTx, backendInterface } from "@/backend";
import { EnergyTxKind } from "@/backend";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithActor } from "./test-utils";

type ActorMethods = Pick<
  backendInterface,
  "getEnergyBalance" | "getEnergyHistory" | "rechargeEnergy" | "runAiTask"
>;

interface FakeActorOptions {
  balance?: bigint;
  history?: EnergyTx[];
}

/**
 * Stateful fake actor mirroring the canister's public energy API. Every read
 * returns a fresh snapshot so the query cache never aliases the mutable store.
 */
function createFakeActor(options: FakeActorOptions = {}) {
  let balance = options.balance ?? 0n;
  let history: EnergyTx[] = options.history ?? [];

  const getEnergyBalance = vi.fn<backendInterface["getEnergyBalance"]>(
    async () => balance,
  );
  const getEnergyHistory = vi.fn<backendInterface["getEnergyHistory"]>(
    async () => structuredClone(history),
  );
  const rechargeEnergy = vi.fn<backendInterface["rechargeEnergy"]>(async () => {
    balance += 10n;
    history = [
      {
        kind: EnergyTxKind.recharge,
        timestamp: 1_700_000_000_000_000_000n,
        amount: 10n,
        balanceAfter: balance,
      },
      ...history,
    ];
    return balance;
  });
  const runAiTask = vi.fn<backendInterface["runAiTask"]>(async () => {
    if (balance < 1n) {
      return {
        __kind__: "err",
        err: {
          __kind__: "insufficientBalance",
          insufficientBalance: { available: balance, required: 1n },
        },
      };
    }
    balance -= 1n;
    history = [
      {
        kind: EnergyTxKind.spend,
        timestamp: 1_700_000_000_000_000_000n,
        amount: 1n,
        balanceAfter: balance,
      },
      ...history,
    ];
    return {
      __kind__: "ok",
      ok: { contribution: "Aporte de IA verificado.", balanceAfter: balance },
    };
  });

  const actor = {
    getEnergyBalance,
    getEnergyHistory,
    rechargeEnergy,
    runAiTask,
  } satisfies ActorMethods;

  return {
    actor,
    getEnergyBalance,
    getEnergyHistory,
    rechargeEnergy,
    runAiTask,
  };
}

async function connectWallet(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId("wallet.connect_button.ethereum"));
  await waitFor(() =>
    expect(screen.getByTestId("wallet.address_chip")).toBeInTheDocument(),
  );
}

describe("Energy SPR flow", () => {
  // The connected wallet is persisted to localStorage; isolate each test so it
  // starts from the disconnected state the flow assertions expect.
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the default route without a blank screen", () => {
    const { actor } = createFakeActor();
    renderWithActor(<App />, actor);

    expect(
      screen.getByText("Balance de Energía SPR Disponible"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("status_log.panel")).toBeInTheDocument();
  });

  it("shows the disconnected state and disables actions with a notice", () => {
    const { actor } = createFakeActor();
    renderWithActor(<App />, actor);

    expect(screen.getByTestId("energy.connect_notice")).toHaveTextContent(
      "Conecta tu billetera",
    );
    expect(screen.getByTestId("energy.recharge_button")).toBeDisabled();
    expect(screen.getByTestId("energy.run_task_button")).toBeDisabled();
    expect(screen.getByTestId("status_log.empty_state")).toBeInTheDocument();
  });

  it("shows the short address and enables actions after connecting", async () => {
    const user = userEvent.setup();
    const { actor } = createFakeActor();
    renderWithActor(<App />, actor);

    await connectWallet(user);

    const chip = screen.getByTestId("wallet.address_chip");
    expect(chip.textContent).toMatch(/0x[0-9a-f]{4}…[0-9a-f]{4}/);
    expect(screen.getByTestId("energy.recharge_button")).toBeEnabled();
    expect(screen.getByTestId("energy.run_task_button")).toBeEnabled();
    expect(
      screen.queryByTestId("energy.connect_notice"),
    ).not.toBeInTheDocument();
  });

  it("credits exactly 10 SPR and logs a recharge entry", async () => {
    const user = userEvent.setup();
    const { actor, rechargeEnergy } = createFakeActor();
    renderWithActor(<App />, actor);

    await connectWallet(user);
    await user.click(screen.getByTestId("energy.recharge_button"));

    await waitFor(() => expect(rechargeEnergy).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByTestId("energy.balance_panel")).toHaveTextContent(
        "10",
      ),
    );

    const list = await screen.findByTestId("status_log.list");
    const item = within(list).getByTestId("status_log.item.1");
    expect(item).toHaveTextContent("Recarga confirmada");
    expect(item).toHaveTextContent("+10 SPR");
  });

  it("debits exactly 1 SPR, shows success, and logs a spend entry", async () => {
    const user = userEvent.setup();
    const { actor, runAiTask } = createFakeActor({ balance: 5n });
    renderWithActor(<App />, actor);

    await connectWallet(user);
    await user.click(screen.getByTestId("energy.run_task_button"));

    await waitFor(() => expect(runAiTask).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByTestId("energy.ai_success_state"),
    ).toHaveTextContent("Aporte de IA verificado.");
    await waitFor(() =>
      expect(screen.getByTestId("energy.balance_panel")).toHaveTextContent("4"),
    );

    const list = await screen.findByTestId("status_log.list");
    const item = within(list).getByTestId("status_log.item.1");
    expect(item).toHaveTextContent("Tarea IA ejecutada");
    expect(item).toHaveTextContent("-1 SPR");
  });

  it("shows an insufficient-balance error and does not debit at zero", async () => {
    const user = userEvent.setup();
    const { actor, runAiTask } = createFakeActor({ balance: 0n });
    renderWithActor(<App />, actor);

    await connectWallet(user);
    await user.click(screen.getByTestId("energy.run_task_button"));

    await waitFor(() => expect(runAiTask).toHaveBeenCalledTimes(1));
    const error = await screen.findByTestId("energy.ai_error_state");
    expect(error).toHaveTextContent("Energía insuficiente");
    expect(error).toHaveTextContent("0 SPR");
    expect(
      screen.queryByTestId("energy.ai_success_state"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("energy.balance_panel")).toHaveTextContent("0");
  });

  it("reads the persisted canister balance for the same wallet on a fresh mount", async () => {
    const user = userEvent.setup();
    // The canister already holds 10 SPR for this wallet from a prior session.
    const { actor, getEnergyBalance } = createFakeActor({ balance: 10n });
    renderWithActor(<App />, actor);

    await connectWallet(user);

    await waitFor(() =>
      expect(screen.getByTestId("energy.balance_panel")).toHaveTextContent(
        "10",
      ),
    );
    expect(getEnergyBalance).toHaveBeenCalled();
  });
});
