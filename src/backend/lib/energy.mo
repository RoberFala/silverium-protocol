import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/energy";

module {
  /// SPR Energy credited by a single recharge.
  public let rechargeAmount : Nat = 10;

  /// SPR Energy debited by a single AI task.
  public let spendAmount : Nat = 1;

  /// Read the current SPR Energy balance for a wallet (0 when unknown).
  public func getBalance(
    balances : Map.Map<Types.WalletAddress, Nat>,
    wallet : Types.WalletAddress,
  ) : Nat {
    balances.get(wallet) ?? 0;
  };

  /// Append a ledger entry for a wallet, keeping the newest entry first.
  public func recordTx(
    history : Map.Map<Types.WalletAddress, [Types.EnergyTx]>,
    wallet : Types.WalletAddress,
    tx : Types.EnergyTx,
  ) {
    let existing = history.get(wallet) ?? [];
    history.add(wallet, [tx].concat(existing));
  };

  /// Credit exactly 10 SPR Energy to a wallet and return the new balance.
  public func recharge(
    balances : Map.Map<Types.WalletAddress, Nat>,
    history : Map.Map<Types.WalletAddress, [Types.EnergyTx]>,
    wallet : Types.WalletAddress,
  ) : Nat {
    let newBalance = getBalance(balances, wallet) + rechargeAmount;
    balances.add(wallet, newBalance);
    recordTx(history, wallet, {
      timestamp = Time.now();
      kind = #recharge;
      amount = rechargeAmount;
      balanceAfter = newBalance;
    });
    newBalance;
  };

  /// Debit exactly 1 SPR Energy from a wallet. Returns the new balance, or the
  /// insufficient-balance error when the wallet has no energy left.
  public func spendOne(
    balances : Map.Map<Types.WalletAddress, Nat>,
    history : Map.Map<Types.WalletAddress, [Types.EnergyTx]>,
    wallet : Types.WalletAddress,
  ) : { #ok : Nat; #err : Types.EnergyError } {
    let current = getBalance(balances, wallet);
    if (current < spendAmount) {
      return #err(#insufficientBalance({ available = current; required = spendAmount }));
    };
    let newBalance = current - spendAmount;
    balances.add(wallet, newBalance);
    recordTx(history, wallet, {
      timestamp = Time.now();
      kind = #spend;
      amount = spendAmount;
      balanceAfter = newBalance;
    });
    #ok(newBalance);
  };

  /// Return the SPR Energy ledger for a wallet, newest first.
  public func getHistory(
    history : Map.Map<Types.WalletAddress, [Types.EnergyTx]>,
    wallet : Types.WalletAddress,
  ) : [Types.EnergyTx] {
    history.get(wallet) ?? [];
  };
};
