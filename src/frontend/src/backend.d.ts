import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AiTaskResult {
    balanceAfter: bigint;
    contribution: string;
}
export interface Cell {
    value: Value;
    name: string;
}
export type EnergyError = {
    __kind__: "insufficientBalance";
    insufficientBalance: {
        available: bigint;
        required: bigint;
    };
};
export interface EnergyTx {
    kind: EnergyTxKind;
    timestamp: Timestamp;
    balanceAfter: bigint;
    amount: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export type WalletAddress = string;
export enum EnergyTxKind {
    spend = "spend",
    recharge = "recharge"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static Markdown documentation of the Silverium Protocol (SPR) backend API.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Read the current SPR Energy balance for a wallet (0 when unknown).
     */
    getEnergyBalance(wallet: WalletAddress): Promise<bigint>;
    /**
     * / Return the SPR Energy ledger for a wallet, newest first.
     */
    getEnergyHistory(wallet: WalletAddress): Promise<Array<EnergyTx>>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Credit exactly 10 SPR Energy to a wallet and return the new balance.
     */
    rechargeEnergy(wallet: WalletAddress): Promise<bigint>;
    /**
     * / Spend exactly 1 SPR Energy to run an AI knowledge task, returning the
     * / generated contribution and the resulting balance, or an error when the
     * / balance is zero.
     */
    runAiTask(wallet: WalletAddress): Promise<{
        __kind__: "ok";
        ok: AiTaskResult;
    } | {
        __kind__: "err";
        err: EnergyError;
    }>;
    schema(): Promise<string>;
}
