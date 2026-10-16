import Common "../types/common";

module {
  public type WalletAddress = Common.WalletAddress;
  public type Timestamp = Common.Timestamp;

  /// Kind of an SPR Energy ledger entry.
  public type EnergyTxKind = {
    #recharge;
    #spend;
  };

  /// A single SPR Energy ledger entry for a wallet.
  public type EnergyTx = {
    timestamp : Timestamp;
    kind : EnergyTxKind;
    amount : Nat;
    balanceAfter : Nat;
  };

  /// Result of running an AI task: the knowledge/technology contribution text
  /// produced by the platform inference service, plus the resulting balance.
  public type AiTaskResult = {
    contribution : Text;
    balanceAfter : Nat;
  };

  /// Error returned when a wallet has no SPR Energy left to spend.
  public type EnergyError = {
    #insufficientBalance : { available : Nat; required : Nat };
  };
};
