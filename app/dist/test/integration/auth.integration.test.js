import { describe, test, beforeEach, afterEach } from 'node:test';
import { strictEqual, ok, match, notStrictEqual } from 'node:assert';
import { build } from '../../src/server.js';
import { apiClient, TEST_ACCOUNT_ID, TEST_REFRESH_TOKEN } from '../setup.js';
// The credential flow, driven through app.inject directly.
//
// Every other suite goes through apiClient, which buys an access token and
// silently buys another whenever one expires — exactly what a real client
// does, and exactly what would hide a broken expiry. So this file uses no
// helper: it holds a token itself and watches it die on schedule.
describe('Account + access token auth', () => {
    let app;
    beforeEach(async () => {
        app = await build();
    });
    afterEach(async () => {
        await app.close();
    });
    const tokenPath = (account = TEST_ACCOUNT_ID) => `/api/${account}/auth/token`;
    const elementPath = (account = TEST_ACCOUNT_ID) => `/api/${account}/element/fe`;
    async function issue(account = TEST_ACCOUNT_ID, refresh_token = TEST_REFRESH_TOKEN) {
        return app.inject({
            method: 'POST',
            url: tokenPath(account),
            payload: { refresh_token },
        });
    }
    async function get(token, account = TEST_ACCOUNT_ID) {
        return app.inject({
            method: 'GET',
            url: elementPath(account),
            headers: { authorization: `Bearer ${token}` },
        });
    }
    describe('obtaining an access token', () => {
        test('the refresh token buys an access token', async () => {
            const res = await issue();
            strictEqual(res.statusCode, 200);
            const body = JSON.parse(res.payload);
            ok('string' === typeof body.access_token && 0 < body.access_token.length);
            strictEqual(body.token_type, 'Bearer');
            strictEqual(body.expires_in_requests, 4);
        });
        test('each exchange mints a NEW token', async () => {
            const first = JSON.parse((await issue()).payload).access_token;
            const second = JSON.parse((await issue()).payload).access_token;
            notStrictEqual(first, second, 'reusing one token across exchanges would make the use counter shared');
        });
        test('the token endpoint needs no access token of its own', async () => {
            // The bootstrap: an endpoint that required the credential it issues
            // could never be called. Asserted rather than assumed, because the
            // auth hook is registered on a sibling scope and one careless move to
            // the root would break exactly this.
            strictEqual((await issue()).statusCode, 200);
        });
        test('a wrong refresh token is refused', async () => {
            const res = await issue(TEST_ACCOUNT_ID, 'not-the-refresh-token');
            strictEqual(res.statusCode, 401);
            strictEqual(JSON.parse(res.payload).error, 'AuthError');
        });
        test('an unknown account is refused the same way as a wrong token', async () => {
            // Byte-identical, deliberately: a distinct "no such account" reply is
            // an enumeration oracle for account ids.
            const unknown = await issue('no-such-account', TEST_REFRESH_TOKEN);
            const wrong = await issue(TEST_ACCOUNT_ID, 'not-the-refresh-token');
            strictEqual(unknown.statusCode, 401);
            strictEqual(unknown.payload, wrong.payload);
        });
        test('a missing refresh_token is a schema violation, not a 401', async () => {
            const res = await app.inject({
                method: 'POST', url: tokenPath(), payload: {},
            });
            strictEqual(res.statusCode, 400);
            strictEqual(JSON.parse(res.payload).error, 'ValidationError');
        });
    });
    describe('using an access token', () => {
        test('no Authorization header is a 401', async () => {
            const res = await app.inject({ method: 'GET', url: elementPath() });
            strictEqual(res.statusCode, 401);
            const body = JSON.parse(res.payload);
            strictEqual(body.error, 'AuthError');
            match(body.message, /missing Authorization header/);
        });
        test('a non-Bearer Authorization header is a 401', async () => {
            const res = await app.inject({
                method: 'GET',
                url: elementPath(),
                headers: { authorization: 'Basic dXNlcjpwYXNz' },
            });
            strictEqual(res.statusCode, 401);
            match(JSON.parse(res.payload).message, /malformed Authorization header/);
        });
        test('the Bearer scheme is matched case-insensitively', async () => {
            const token = JSON.parse((await issue()).payload).access_token;
            const res = await app.inject({
                method: 'GET',
                url: elementPath(),
                headers: { authorization: `bearer ${token}` },
            });
            strictEqual(res.statusCode, 200);
        });
        test('an unknown token is a 401', async () => {
            const res = await get('at-never-issued');
            strictEqual(res.statusCode, 401);
            match(JSON.parse(res.payload).message, /invalid or expired/);
        });
        test('a token is refused for an account it was not issued for', async () => {
            process.env.ACCOUNTS = 'acc01:rt-one,acc02:rt-two';
            await app.close();
            app = await build();
            try {
                const token = JSON.parse((await issue('acc01', 'rt-one')).payload).access_token;
                strictEqual((await get(token, 'acc01')).statusCode, 200);
                const crossed = await get(token, 'acc02');
                strictEqual(crossed.statusCode, 401, 'a token for one account must not open another — the account ' +
                    'segment would be decoration');
                match(JSON.parse(crossed.payload).message, /not valid for this account/);
            }
            finally {
                delete process.env.ACCOUNTS;
            }
        });
    });
    describe('expiry', () => {
        test('a token serves exactly four requests, then dies', async () => {
            const token = JSON.parse((await issue()).payload).access_token;
            for (let i = 1; i <= 4; i++) {
                strictEqual((await get(token)).statusCode, 200, `request ${i} should succeed`);
            }
            const fifth = await get(token);
            strictEqual(fifth.statusCode, 401, 'the fifth request must fail');
            match(JSON.parse(fifth.payload).message, /invalid or expired/);
        });
        test('a spent token stays dead', async () => {
            const token = JSON.parse((await issue()).payload).access_token;
            for (let i = 0; i < 4; i++)
                await get(token);
            strictEqual((await get(token)).statusCode, 401);
            strictEqual((await get(token)).statusCode, 401);
        });
        test('the refresh token still works after an access token expires', async () => {
            // The whole point: expiry is recoverable without human intervention.
            const first = JSON.parse((await issue()).payload).access_token;
            for (let i = 0; i < 4; i++)
                await get(first);
            strictEqual((await get(first)).statusCode, 401);
            const second = JSON.parse((await issue()).payload).access_token;
            strictEqual((await get(second)).statusCode, 200);
        });
        test('the token endpoint does not spend the access token', async () => {
            const token = JSON.parse((await issue()).payload).access_token;
            await issue();
            await issue();
            await issue();
            // Still four left: the exchanges above consumed none of them.
            for (let i = 1; i <= 4; i++) {
                strictEqual((await get(token)).statusCode, 200, `request ${i}`);
            }
        });
        test('ACCESS_TOKEN_USES tunes the count', async () => {
            process.env.ACCESS_TOKEN_USES = '2';
            await app.close();
            app = await build();
            try {
                strictEqual(JSON.parse((await issue()).payload).expires_in_requests, 2);
                const token = JSON.parse((await issue()).payload).access_token;
                strictEqual((await get(token)).statusCode, 200);
                strictEqual((await get(token)).statusCode, 200);
                strictEqual((await get(token)).statusCode, 401);
            }
            finally {
                delete process.env.ACCESS_TOKEN_USES;
            }
        });
        test('apiClient rides through expiry, and says how often it refreshed', async () => {
            // The helper every other suite depends on, tested where it can be
            // seen: nine requests over a four-request token is three tokens.
            const api = apiClient(app);
            for (let i = 0; i < 9; i++) {
                strictEqual((await api.inject({ method: 'GET', url: '/element/fe' })).statusCode, 200);
            }
            strictEqual(api.refreshes(), 3);
        });
    });
    describe('scope of the credential', () => {
        test('/debug takes no credential — it is not account-scoped', async () => {
            // Unchanged by this feature, and worth pinning: the auth hook is
            // registered on an encapsulated scope, so moving it to the root
            // would silently start guarding /debug too.
            strictEqual((await app.inject({ method: 'GET', url: '/debug' })).statusCode, 200);
        });
        test('every entity is behind the credential, not just element', async () => {
            for (const path of ['/element', '/group', '/series', '/element/fe/isotope']) {
                const res = await app.inject({
                    method: 'GET', url: `/api/${TEST_ACCOUNT_ID}${path}`,
                });
                strictEqual(res.statusCode, 401, `${path} is not behind the credential`);
            }
        });
    });
});
//# sourceMappingURL=auth.integration.test.js.map