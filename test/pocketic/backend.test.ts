import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state balance read instead of trapping", async () => {
  await expect(actor.getEnergyBalance("wallet-empty")).resolves.toBe(0n);
  await expect(actor.getEnergyHistory("wallet-empty")).resolves.toEqual([]);
});

it("credits exactly 10 SPR and records a recharge entry", async () => {
  const wallet = "wallet-recharge";
  await expect(actor.rechargeEnergy(wallet)).resolves.toBe(10n);
  await expect(actor.getEnergyBalance(wallet)).resolves.toBe(10n);

  const history = await actor.getEnergyHistory(wallet);
  expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({
    kind: { recharge: null },
    amount: 10n,
    balanceAfter: 10n,
  });
});

it("accumulates recharges and keeps the newest entry first", async () => {
  const wallet = "wallet-accumulate";
  await actor.rechargeEnergy(wallet);
  await expect(actor.rechargeEnergy(wallet)).resolves.toBe(20n);

  const history = await actor.getEnergyHistory(wallet);
  expect(history).toHaveLength(2);
  expect(history[0].balanceAfter).toBe(20n);
  expect(history[1].balanceAfter).toBe(10n);
});

it("rejects an AI task at zero balance without debiting", async () => {
  const wallet = "wallet-broke";
  const result = await actor.runAiTask(wallet);
  expect(result).toEqual({
    err: { insufficientBalance: { available: 0n, required: 1n } },
  });
  await expect(actor.getEnergyBalance(wallet)).resolves.toBe(0n);
  await expect(actor.getEnergyHistory(wallet)).resolves.toEqual([]);
});

it("keeps balances isolated per wallet", async () => {
  await actor.rechargeEnergy("wallet-a");
  await expect(actor.getEnergyBalance("wallet-b")).resolves.toBe(0n);
  await expect(actor.getEnergyBalance("wallet-a")).resolves.toBe(10n);
});
