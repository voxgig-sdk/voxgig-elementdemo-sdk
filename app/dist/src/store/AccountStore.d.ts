import type { Account, AccessToken } from '../types.js';
export declare class AccountStore {
    private accounts;
    private tokens;
    readonly maxUses: number;
    constructor(accounts: Account[], maxUses: number);
    getAccount(id: string): Account | undefined;
    accountIds(): string[];
    issue(accountId: string, refreshToken: string): AccessToken;
    consume(token: string, accountId: string): AccessToken;
    liveTokenCount(): number;
}
