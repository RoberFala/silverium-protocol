mixin () {
  /// Static Markdown documentation of the Silverium Protocol (SPR) backend API.
  public query func getApiDoc() : async Text {
    "# Silverium Protocol (SPR) — Backend API\n\n" #
    "## Purpose\n\n" #
    "The canister is the SPR Energy ledger for the Silverium Protocol DePIN dashboard. " #
    "It stores a per-wallet SPR Energy balance and an append-only transaction history, " #
    "credits energy on recharge, debits energy when an AI knowledge task runs, and " #
    "returns the AI contribution produced by the platform inference service.\n\n" #
    "## Authentication and authorization\n\n" #
    "- `getEnergyBalance` and `getEnergyHistory` are `query` methods and are readable by " #
    "any caller, including anonymous ones. They are keyed by wallet address, not by caller.\n" #
    "- `rechargeEnergy` and `runAiTask` are update methods. They accept any caller " #
    "(including anonymous) and act on the wallet address supplied in the argument; " #
    "the caller principal is not used to scope the balance.\n" #
    "- The canister also exposes the shared authorization mixin (`_initialize_access_control` " #
    "and role management). The first signed-in caller to call `_initialize_access_control` " #
    "becomes the admin; later callers receive the user role. Role-guarded endpoints trap for " #
    "an unregistered or anonymous caller. Registration happens only when a caller signs in " #
    "through the app's own frontend, so a principal that never did so is unregistered even if " #
    "it belongs to the app owner.\n" #
    "- The frontend pins an Internet Identity derivation origin, published at " #
    "`/.well-known/ii-derivation-origin` when available. An agent already holding the user's " #
    "Internet Identity authorization derives the correct per-app principal against that origin " #
    "(for example `icp identity link web <name> --app <host>`). Such a delegation acts with the " #
    "user's full authority in this app until it expires.\n\n" #
    "## Units and encoding\n\n" #
    "- `WalletAddress` is a `Text` wallet address (Solana / BNB / Ethereum) used as the account key.\n" #
    "- SPR Energy amounts are `Nat` whole units. A recharge credits exactly 10; an AI task debits exactly 1.\n" #
    "- `Timestamp` is `Int` nanoseconds from `Time.now()` (UTC, signed).\n" #
    "- `EnergyTxKind` is the variant `#recharge` or `#spend`.\n" #
    "- `EnergyTx` is `{ timestamp : Timestamp; kind : EnergyTxKind; amount : Nat; balanceAfter : Nat }`.\n" #
    "- `AiTaskResult` is `{ contribution : Text; balanceAfter : Nat }`.\n" #
    "- `EnergyError` is the variant `#insufficientBalance : { available : Nat; required : Nat }`.\n\n" #
    "## Lifecycle and polling\n\n" #
    "- `rechargeEnergy` and `runAiTask` are update calls; `runAiTask` performs one outbound " #
    "HTTP call to the inference service and can take seconds. Poll `getEnergyBalance` and " #
    "`getEnergyHistory` (both `query`) to observe the resulting balance and ledger entries.\n" #
    "- `getEnergyHistory` returns entries newest first.\n\n" #
    "## Mutation retry safety\n\n" #
    "- `rechargeEnergy` is not idempotent: each successful call credits another 10 SPR and " #
    "appends a ledger entry. Retrying a call that already succeeded double-credits.\n" #
    "- `runAiTask` is not idempotent: each successful call debits 1 SPR and appends a ledger " #
    "entry. Retrying a call that already succeeded debits again.\n" #
    "- A call that returns `#err(#insufficientBalance ...)` made no state change and is safe to " #
    "retry after recharging.\n\n" #
    "## Errors and gotchas\n\n" #
    "- `runAiTask` returns `#err(#insufficientBalance { available; required })` when the wallet " #
    "has zero energy; no debit or ledger entry occurs in that case.\n" #
    "- `runAiTask` debits 1 SPR before awaiting the inference service. If the inference call " #
    "traps, the whole update is rolled back, so the debit and ledger entry are reverted too.\n" #
    "- `getEnergyBalance` returns 0 for an unknown wallet; it does not trap.\n" #
    "- Balances are keyed by the wallet address string, so the same address on different chains " #
    "is a distinct account unless the caller normalizes it.";
  };
};
