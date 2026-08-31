import Nid from 'nid';
import { AuthError } from '../utils/errors.js';
const nid = Nid.default || Nid;
// Accounts and their access tokens.
//
// Two secrets, with deliberately different lifetimes:
//
//   REFRESH TOKEN  long-lived, per account, never sent to an API endpoint.
//                  It buys access tokens at POST /api/<account>/auth/token
//                  and nothing else. An SDK keeps it out of code — the
//                  generated TypeScript SDK reads it from a .env file
//                  through its vendored sekreto provider chain.
//
//   ACCESS TOKEN   short-lived, sent as `Authorization: Bearer <token>` on
//                  every API call, and DELIBERATELY FRAGILE: it dies after
//                  `maxUses` requests (4 by default). That is the whole
//                  point of this store — a client that does not implement
//                  the refresh round trip gets four requests in and then
//                  fails, so the SDK's refresh path is exercised by any
//                  test long enough to matter rather than by a special
//                  "please expire me" endpoint nobody would call.
//
// Expiry is counted in REQUESTS, not seconds. A wall-clock TTL would make
// every test either slow (wait for the expiry) or flaky (race it); a
// request count expires deterministically on a known call, so a test can
// assert exactly which request fails.
export class AccountStore {
    accounts;
    tokens;
    maxUses;
    constructor(accounts, maxUses) {
        this.accounts = new Map(accounts.map((a) => [a.id, { ...a }]));
        this.tokens = new Map();
        this.maxUses = maxUses;
    }
    getAccount(id) {
        return this.accounts.get(id);
    }
    accountIds() {
        return Array.from(this.accounts.keys());
    }
    // Exchange a refresh token for a fresh access token.
    //
    // An unknown account and a wrong refresh token answer with the SAME
    // error, because telling them apart is an account-enumeration oracle:
    // "no such account" confirms which ids exist to anyone who can guess.
    issue(accountId, refreshToken) {
        const account = this.accounts.get(accountId);
        if (null == account || account.refresh_token !== refreshToken) {
            throw new AuthError('refresh token is not valid for this account');
        }
        const token = {
            token: 'at-' + nid(16),
            account_id: account.id,
            uses: 0,
        };
        this.tokens.set(token.token, token);
        return token;
    }
    // Spend one use of an access token, on behalf of `accountId`.
    //
    // The account in the PATH must be the account the token was issued for.
    // Without that check a token would be a key to every account on the
    // server, and the account segment would be decoration.
    //
    // The token is deleted on its LAST allowed use, not on the first refused
    // one: the request that spends use `maxUses` still succeeds, and the next
    // one finds no token at all. Keeping a spent token around to answer
    // "expired" would leak how many requests a client had made.
    consume(token, accountId) {
        const found = this.tokens.get(token);
        if (null == found) {
            throw new AuthError('access token is invalid or expired');
        }
        if (found.account_id !== accountId) {
            throw new AuthError('access token is not valid for this account');
        }
        found.uses++;
        if (found.uses >= this.maxUses) {
            this.tokens.delete(token);
        }
        return found;
    }
    // Live token count — for tests and the /debug dump, never for a handler.
    liveTokenCount() {
        return this.tokens.size;
    }
}
//# sourceMappingURL=AccountStore.js.map