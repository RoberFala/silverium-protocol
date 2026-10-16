import Map "mo:core/Map";
import EnergyLib "../lib/energy";
import Inference "../lib/inference";
import Types "../types/energy";

mixin (
  balances : Map.Map<Types.WalletAddress, Nat>,
  history : Map.Map<Types.WalletAddress, [Types.EnergyTx]>,
) {
  /// Read the current SPR Energy balance for a wallet (0 when unknown).
  public query func getEnergyBalance(wallet : Types.WalletAddress) : async Nat {
    EnergyLib.getBalance(balances, wallet);
  };

  /// Credit exactly 10 SPR Energy to a wallet and return the new balance.
  public shared ({ caller }) func rechargeEnergy(wallet : Types.WalletAddress) : async Nat {
    ignore caller;
    EnergyLib.recharge(balances, history, wallet);
  };

  /// Spend exactly 1 SPR Energy to run an AI knowledge task, returning the
  /// generated contribution and the resulting balance, or an error when the
  /// balance is zero.
  public shared ({ caller }) func runAiTask(wallet : Types.WalletAddress) : async { #ok : Types.AiTaskResult; #err : Types.EnergyError } {
    ignore caller;
    switch (EnergyLib.spendOne(balances, history, wallet)) {
      case (#err(e)) { #err(e) };
      case (#ok(balanceAfter)) {
        let contribution = await* Inference.runContribution<system>(
          "You are a decentralized AI knowledge agent on the Silverium Protocol (SPR). " #
          "Provide one concise, high-value contribution about emerging technology, " #
          "decentralized infrastructure (DePIN), or applied artificial intelligence. " #
          "Answer in Spanish, in at most three sentences."
        );
        #ok({ contribution; balanceAfter });
      };
    };
  };

  /// Return the SPR Energy ledger for a wallet, newest first.
  public query func getEnergyHistory(wallet : Types.WalletAddress) : async [Types.EnergyTx] {
    EnergyLib.getHistory(history, wallet);
  };
};
