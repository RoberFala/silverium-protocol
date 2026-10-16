import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import EnergyApi "mixins/energy-api";
import ApiDocMixin "mixins/api-doc";
import Types "types/energy";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let balances : Map.Map<Types.WalletAddress, Nat>;
  let history : Map.Map<Types.WalletAddress, [Types.EnergyTx]>;

  include MixinAuthorization(accessControlState, null);
  include EnergyApi(balances, history);
  include ApiDocMixin();
  include Expose({
    entities = [
      OQL.Entity.manual<(Types.WalletAddress, Nat)>(
        "balance",
        func () = balances.entries(),
        "Balance",
        "wallet",
      )
        .sample(("", 0))
        .payload("wallet", func ((wallet, _)) = wallet)
        .payload("amount", func ((_, amount)) = amount)
        .controllerOnly()
        .build(),
    ];
  });
};
