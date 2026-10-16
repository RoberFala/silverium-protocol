import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  public type WalletAddress = Text;
  public type Timestamp = Int;
  public type EnergyTxKind = { #recharge; #spend };
  public type EnergyTx = {
    timestamp : Timestamp;
    kind : EnergyTxKind;
    amount : Nat;
    balanceAfter : Nat;
  };

  public type OldActor = {};
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    balances : Map.Map<WalletAddress, Nat>;
    history : Map.Map<WalletAddress, [EnergyTx]>;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      balances = Map.empty();
      history = Map.empty();
    };
  };
};
