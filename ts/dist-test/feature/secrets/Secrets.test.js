"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const node_http_1 = __importDefault(require("node:http"));
const index_1 = require("../../utility/index");
const __1 = require("../../..");
const ENVPREFIX = 'ELEMENTDEMO_TEST_SECRETS_';
// Read from the config, never from a probe: an SDK whose config declares no
// auth places no credential, and these tests assert on the one it places.
const NOAUTH = null == __1.config.options?.auth ?
    "this SDK's config declares no auth, so it places no credential" : false;
// The header the credential travels in: the DEFAULT client's auth.name,
// lower-cased as prepareAuth sends it. Read from a default client because
// a test's `auth: null` leaves no name to read.
const CREDHEADER = (() => {
    const auth = index_1.SDK.test({}, {}).options().auth;
    const name = null == auth ? null : auth.name;
    return 'string' === typeof name && '' !== name ?
        name.toLowerCase() : 'authorization';
})();
// prepare() returns the fetchdef the transport would receive — the closest
// observable point to the wire for header assertions — and it awaits
// secrets resolution itself, because it bypasses the feature hook pipeline.
async function prepared(sdkopts) {
    const sdk = index_1.SDK.test({}, sdkopts);
    const fetchdef = await sdk.prepare({ path: '/' });
    node_assert_1.default.ok(!(fetchdef instanceof Error), String(fetchdef));
    return { sdk, fetchdef };
}
// The form prepareAuth writes, from the DEFAULT client's auth: under Basic the
// token is the key half of the encoded pair, and a prefix is space-joined.
const CREDFORM = (() => {
    const auth = index_1.SDK.test({}, {}).options().auth || {};
    return { prefix: 'string' === typeof auth.prefix ? auth.prefix : '', basic: true === auth.basic };
})();
function credentialIs(header, token, secret) {
    const value = CREDFORM.basic ?
        Buffer.from(token + ':' + (secret || '')).toString('base64') : token;
    node_assert_1.default.equal(header, '' === CREDFORM.prefix ? value : CREDFORM.prefix + ' ' + value, 'expected the ' + CREDHEADER + ' header to carry ' + token);
}
// A stub standing in for both endpoints the flow touches: the token
// endpoint, and everything else.
//
// `apiStatus` is a SCRIPT — one status per API call, the last repeating —
// so a case can say "401 then 200" without counting calls itself.
function stubfetch(opts) {
    const o = opts || {};
    const tokens = o.tokens || ['ACCESS01', 'ACCESS02', 'ACCESS03'];
    const apiStatus = o.apiStatus || [200];
    const calls = [];
    let issued = 0;
    let apicall = -1;
    const fetch = async (url, init) => {
        calls.push({ url, init, auth: (init.headers || {})[CREDHEADER] });
        if (url.endsWith('/' + (o.path || 'auth/token'))) {
            if (true === o.tokenfails) {
                return { status: 401, json: async () => ({ error: 'nope' }), headers: {} };
            }
            const body = {};
            body[o.response || 'access_token'] = tokens[Math.min(issued, tokens.length - 1)];
            issued++;
            return { status: 200, json: async () => body, headers: {} };
        }
        apicall++;
        const status = apiStatus[Math.min(apicall, apiStatus.length - 1)];
        return { status, json: async () => ({ ok: status < 400 }), headers: {} };
    };
    return {
        fetch,
        calls,
        // Only the calls that went to the API, in order.
        api: () => calls.filter((c) => !c.url.endsWith('/' + (o.path || 'auth/token'))),
        token: () => calls.filter((c) => c.url.endsWith('/' + (o.path || 'auth/token'))),
    };
}
// Same rule as credentialIs, reading the header off a recorded call.
function authIs(call, token, secret) {
    credentialIs(null == call ? undefined : call.auth, token, secret);
}
// An env chain, the shape most of these tests use.
function envchain(extra) {
    return {
        feature: {
            secrets: Object.assign({
                active: true,
                providers: [{ kind: 'env', prefix: ENVPREFIX }],
            }, extra || {}),
        },
    };
}
(0, node_test_1.describe)('secrets', { skip: NOAUTH }, () => {
    (0, node_test_1.beforeEach)(() => {
        delete process.env[ENVPREFIX + 'APIKEY'];
    });
    (0, node_test_1.test)('inactive: apikey option behaves exactly as before', async () => {
        const { sdk, fetchdef } = await prepared({ apikey: 'OPTKEY01' });
        credentialIs(fetchdef.headers[CREDHEADER], 'OPTKEY01');
        // No feature, no instance: the accessor is the only way in.
        node_assert_1.default.equal(sdk.secrets(), undefined);
    });
    (0, node_test_1.test)('inactive: no apikey means no credential header', async () => {
        const { fetchdef } = await prepared({});
        node_assert_1.default.equal(fetchdef.headers[CREDHEADER], undefined);
    });
    (0, node_test_1.test)('active: apikey option still wins over the chain', async () => {
        process.env[ENVPREFIX + 'APIKEY'] = 'ENVKEY01';
        const { sdk, fetchdef } = await prepared(Object.assign({ apikey: 'OPTKEY01' }, envchain()));
        credentialIs(fetchdef.headers[CREDHEADER], 'OPTKEY01');
        // The explicit option is a real store, not a special case: a directed
        // read names it like any other.
        node_assert_1.default.equal(await sdk.secrets().getfrom('options', 'apikey'), 'OPTKEY01');
    });
    (0, node_test_1.test)('active: an OMITTED apikey defers to the chain', async () => {
        process.env[ENVPREFIX + 'APIKEY'] = 'ENVKEY01';
        const { fetchdef } = await prepared(envchain());
        credentialIs(fetchdef.headers[CREDHEADER], 'ENVKEY01');
    });
    (0, node_test_1.test)('active: a resolved key is placed as prepareAuth places it, the secret kept', async () => {
        process.env[ENVPREFIX + 'APIKEY'] = 'ENVKEY03';
        const { fetchdef } = await prepared(Object.assign({ secret: 'PASS01' }, envchain()));
        credentialIs(fetchdef.headers[CREDHEADER], 'ENVKEY03', 'PASS01');
    });
    (0, node_test_1.test)('active: an explicitly EMPTY apikey also defers to the chain', async () => {
        process.env[ENVPREFIX + 'APIKEY'] = 'ENVKEY01';
        const { fetchdef } = await prepared(Object.assign({ apikey: '' }, envchain()));
        credentialIs(fetchdef.headers[CREDHEADER], 'ENVKEY01');
    });
    (0, node_test_1.test)('active: auth null suppresses the credential, chain or no chain', async () => {
        process.env[ENVPREFIX + 'APIKEY'] = 'ENVKEY01';
        const { sdk, fetchdef } = await prepared(Object.assign({ auth: null }, envchain()));
        // Nothing on the wire, even though the chain would have resolved.
        node_assert_1.default.equal(fetchdef.headers[CREDHEADER], undefined);
        // The suppression survives option validation rather than being
        // replaced by the optspec's default auth map.
        node_assert_1.default.equal(sdk.options().auth, null);
    });
    (0, node_test_1.test)('active: auth null suppresses an EXPLICIT apikey too', async () => {
        const { fetchdef } = await prepared(Object.assign({ apikey: 'OPTKEY01', auth: null }, envchain()));
        node_assert_1.default.equal(fetchdef.headers[CREDHEADER], undefined);
    });
    (0, node_test_1.test)('active: custom provider objects are accepted verbatim', async () => {
        const asked = [];
        const { fetchdef } = await prepared({
            feature: {
                secrets: {
                    active: true,
                    providers: [{
                            lookup(name) { asked.push(name); return 'CUSTOM01'; },
                            describe() { return 'custom:test'; },
                        }],
                },
            },
        });
        credentialIs(fetchdef.headers[CREDHEADER], 'CUSTOM01');
        node_assert_1.default.deepEqual(asked, ['apikey']);
    });
    (0, node_test_1.test)('active: a miss everywhere leaves the header off', async () => {
        const { sdk, fetchdef } = await prepared(envchain());
        node_assert_1.default.equal(fetchdef.headers[CREDHEADER], undefined);
        node_assert_1.default.equal(sdk.options().apikey, '');
    });
    (0, node_test_1.test)('active: a provider ERROR is returned by prepare, not thrown', async () => {
        const sdk = index_1.SDK.test({}, {
            feature: {
                secrets: {
                    active: true,
                    providers: [{
                            lookup(_name) { throw new Error('vault unreachable'); },
                            describe() { return 'broken:test'; },
                        }],
                },
            },
        });
        const out = await sdk.prepare({ path: '/' });
        node_assert_1.default.ok(out instanceof Error, 'expected an Error value, got ' + String(out));
        node_assert_1.default.match(String(out.message), /vault unreachable/);
    });
    // A settled promise must not be held forever. Holding a REJECTED one
    // meant a transient vault outage poisoned the client permanently: every
    // later operation kept failing with the original error long after the
    // vault recovered.
    (0, node_test_1.test)('active: a provider recovers after a transient failure', async () => {
        let calls = 0;
        const sdk = index_1.SDK.test({}, {
            feature: {
                secrets: {
                    active: true,
                    providers: [{
                            lookup(_name) {
                                calls++;
                                if (1 === calls)
                                    throw new Error('vault unreachable');
                                return 'RECOVERED01';
                            },
                            describe() { return 'flaky:test'; },
                        }],
                },
            },
        });
        const first = await sdk.prepare({ path: '/' });
        node_assert_1.default.ok(first instanceof Error, 'first attempt should surface the outage');
        const second = await sdk.prepare({ path: '/' });
        node_assert_1.default.ok(!(second instanceof Error), 'second attempt should recover, got ' + String(second));
        credentialIs(second.headers[CREDHEADER], 'RECOVERED01');
    });
    // `cache: false` is documented as "every resolve() asks the chain again".
    // Caching the settled promise made that a lie.
    (0, node_test_1.test)('active: cache false asks the chain on every resolve', async () => {
        let calls = 0;
        const sdk = index_1.SDK.test({}, {
            feature: {
                secrets: {
                    active: true,
                    cache: false,
                    providers: [{
                            lookup(_name) { calls++; return 'KEY' + calls; },
                            describe() { return 'counting:test'; },
                        }],
                },
            },
        });
        await sdk.prepare({ path: '/' });
        await sdk.prepare({ path: '/' });
        node_assert_1.default.ok(1 < calls, 'the chain was asked once and cached, despite cache: false');
    });
    (0, node_test_1.test)('active: a MISS is re-asked, so a late secret is picked up', async () => {
        let calls = 0;
        const sdk = index_1.SDK.test({}, {
            feature: {
                secrets: {
                    active: true,
                    providers: [{
                            lookup(_name) {
                                calls++;
                                // Absent on the first ask, present on the second.
                                return 1 < calls ? 'LATEKEY' : undefined;
                            },
                            describe() { return 'late:test'; },
                        }],
                },
            },
        });
        const first = await sdk.prepare({ path: '/' });
        node_assert_1.default.equal(first.headers[CREDHEADER], undefined, 'the first resolve missed, so no credential should go out');
        const second = await sdk.prepare({ path: '/' });
        credentialIs(second.headers[CREDHEADER], 'LATEKEY');
        node_assert_1.default.ok(1 < calls, 'the chain was asked once and the MISS cached: a secret that ' +
            'appears later can never be picked up');
    });
    // The other half of the same rule: a HIT is still cached by default, so
    // the fix above must not turn every request into a chain walk.
    (0, node_test_1.test)('active: a HIT is still cached by default', async () => {
        let calls = 0;
        const sdk = index_1.SDK.test({}, {
            feature: {
                secrets: {
                    active: true,
                    providers: [{
                            lookup(_name) { calls++; return 'KEY' + calls; },
                            describe() { return 'counting:test'; },
                        }],
                },
            },
        });
        await sdk.prepare({ path: '/' });
        await sdk.prepare({ path: '/' });
        node_assert_1.default.equal(calls, 1, 'a hit must be cached under the default cache: true');
    });
    (0, node_test_1.test)('active: secret name is configurable', async () => {
        process.env[ENVPREFIX + 'API_TOKEN'] = 'TOKKEY01';
        try {
            const { fetchdef } = await prepared(envchain({ name: 'api.token' }));
            credentialIs(fetchdef.headers[CREDHEADER], 'TOKKEY01');
        }
        finally {
            delete process.env[ENVPREFIX + 'API_TOKEN'];
        }
    });
    (0, node_test_1.test)('active: sekreto is live for arbitrary secrets and redaction', async () => {
        const { sdk } = await prepared({
            feature: {
                secrets: {
                    active: true,
                    providers: [{ kind: 'memory', values: { DB_PASSWORD: 'dbpass01' } }],
                },
            },
        });
        const secrets = sdk.secrets();
        node_assert_1.default.equal(await secrets.get('db.password'), 'dbpass01');
        node_assert_1.default.equal(secrets.redact('the password is dbpass01, keep it safe'), 'the password is [redacted], keep it safe');
    });
    (0, node_test_1.test)('active: entity ops resolve via the PreSpec hook', async () => {
        process.env[ENVPREFIX + 'APIKEY'] = 'ENVKEY02';
        const sdk = index_1.SDK.test({}, envchain());
        const names = Object.keys(sdk.options().entity || {});
        if (0 === names.length) {
            // An SDK with no entities has no PreSpec path to exercise.
            return;
        }
        // Before any op, nothing has been resolved.
        node_assert_1.default.equal(sdk.options().apikey, '');
        let ran = false;
        for (const one of names) {
            const acc = one.charAt(0).toUpperCase() + one.slice(1);
            const ent = sdk[acc]?.();
            if (null == ent) {
                continue;
            }
            const opname = ['list', 'load', 'create']
                .find((o) => 'function' === typeof ent[o]);
            if (null == opname) {
                continue;
            }
            // The op itself may fail (no seeded data, no live API) — irrelevant
            // here. What matters is that the awaited PreSpec hook ran and the
            // credential reached the live options before the spec was built.
            try {
                await ent[opname]({});
            }
            catch (_err) { }
            ran = true;
            break;
        }
        if (!ran) {
            // Entities, but not one callable op between them: no PreSpec path.
            return;
        }
        node_assert_1.default.equal(sdk.options().apikey, 'ENVKEY02', 'the entity op did not resolve the secret through PreSpec');
    });
});
(0, node_test_1.describe)('secrets exchange', { skip: NOAUTH }, () => {
    const BASE = 'http://exchange.test/api';
    const REFRESH = 'REFRESH01';
    (0, node_test_1.beforeEach)(() => {
        delete process.env[ENVPREFIX + 'REFRESH_TOKEN'];
    });
    function exchangeSdk(stub, extra, sdkopts) {
        return new index_1.SDK({
            ...(sdkopts || {}),
            base: BASE,
            system: { fetch: stub.fetch },
            feature: {
                secrets: Object.assign({
                    active: true,
                    name: 'refresh_token',
                    providers: [{ kind: 'env', prefix: ENVPREFIX }],
                    exchange: { active: true },
                }, extra || {}),
            },
        });
    }
    (0, node_test_1.test)('the refresh token buys an access token, and the request carries it', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch();
        const sdk = exchangeSdk(stub);
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.token().length, 1, 'expected exactly one token purchase');
        node_assert_1.default.deepEqual(JSON.parse(stub.token()[0].init.body), { refresh_token: REFRESH }, 'the refresh token is sent in the request field');
        node_assert_1.default.equal(stub.token()[0].init.redirect, 'manual', 'a supplied fetch is asked not to follow the exchange');
        node_assert_1.default.equal(stub.api().length, 1);
        authIs(stub.api()[0], 'ACCESS01');
    });
    (0, node_test_1.test)('an explicit exchange.refresh wins over the chain', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = 'FROMCHAIN';
        const stub = stubfetch();
        const sdk = exchangeSdk(stub, { exchange: { active: true, refresh: 'EXPLICIT01' } });
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.deepEqual(JSON.parse(stub.token()[0].init.body), { refresh_token: 'EXPLICIT01' });
    });
    (0, node_test_1.test)('one purchase serves many requests', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch();
        const sdk = exchangeSdk(stub);
        await sdk.direct({ path: '/one' });
        await sdk.direct({ path: '/two' });
        await sdk.direct({ path: '/three' });
        node_assert_1.default.equal(stub.token().length, 1, 'a token still working must not be re-bought');
        node_assert_1.default.equal(stub.api().length, 3);
    });
    (0, node_test_1.test)('concurrent first requests share ONE purchase', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch();
        const sdk = exchangeSdk(stub);
        await Promise.all([
            sdk.direct({ path: '/a' }),
            sdk.direct({ path: '/b' }),
            sdk.direct({ path: '/c' }),
        ]);
        node_assert_1.default.equal(stub.token().length, 1, 'four operations at once must not open four token requests');
    });
    (0, node_test_1.test)('a 401 buys another token and retries the SAME request', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        // First API call is refused, the retry succeeds.
        const stub = stubfetch({ apiStatus: [401, 200] });
        const sdk = exchangeSdk(stub);
        const res = await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.token().length, 2, 'expected a second token purchase');
        node_assert_1.default.equal(stub.api().length, 2, 'expected the request to be retried');
        authIs(stub.api()[0], 'ACCESS01');
        authIs(stub.api()[1], 'ACCESS02');
        node_assert_1.default.equal(res.ok, true, 'the caller sees the successful retry');
    });
    (0, node_test_1.test)('a token bought on a refusal is placed as prepareAuth places it, the secret kept', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch({ apiStatus: [401, 200] });
        const sdk = exchangeSdk(stub, {}, { secret: 'PASS01' });
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.api().length, 2, 'expected the request to be retried');
        authIs(stub.api()[0], 'ACCESS01', 'PASS01');
        authIs(stub.api()[1], 'ACCESS02', 'PASS01');
    });
    (0, node_test_1.test)('the retry happens once, not in a loop', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        // Every API call is refused: a second 401 on a token bought moments ago
        // is a real failure, and spinning on it would hang instead of failing.
        const stub = stubfetch({ apiStatus: [401] });
        const sdk = exchangeSdk(stub);
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.api().length, 2, 'exactly one retry');
        node_assert_1.default.equal(stub.token().length, 2);
    });
    (0, node_test_1.test)('a status outside exchange.statuses is not an expiry', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch({ apiStatus: [403] });
        const sdk = exchangeSdk(stub);
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.api().length, 1, '403 is not in the default statuses');
        node_assert_1.default.equal(stub.token().length, 1);
    });
    (0, node_test_1.test)('exchange.statuses is configurable', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch({ apiStatus: [403, 200] });
        const sdk = exchangeSdk(stub, { exchange: { active: true, statuses: [403] } });
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.api().length, 2, '403 was declared an expiry');
    });
    (0, node_test_1.test)('the request and response field names are configurable', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch({ response: 'token', path: 'oauth/grant' });
        const sdk = exchangeSdk(stub, {
            exchange: {
                active: true,
                path: 'oauth/grant',
                request: 'grant',
                response: 'token',
            },
        });
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.token().length, 1);
        node_assert_1.default.ok(stub.token()[0].url.endsWith('/oauth/grant'), 'the token endpoint is relative to base: ' + stub.token()[0].url);
        node_assert_1.default.deepEqual(JSON.parse(stub.token()[0].init.body), { grant: REFRESH });
        authIs(stub.api()[0], 'ACCESS01');
    });
    (0, node_test_1.test)('an explicit apikey is spent before anything is bought', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        // A caller who already holds an access token should use it; expiry is
        // what moves them onto the exchange, and the API is what says so.
        const stub = stubfetch({ apiStatus: [200] });
        const sdk = new index_1.SDK({
            base: BASE,
            apikey: 'HELDTOKEN01',
            system: { fetch: stub.fetch },
            feature: {
                secrets: {
                    active: true,
                    name: 'refresh_token',
                    providers: [{ kind: 'env', prefix: ENVPREFIX }],
                    exchange: { active: true },
                },
            },
        });
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.token().length, 0, 'nothing needed buying');
        authIs(stub.api()[0], 'HELDTOKEN01');
    });
    (0, node_test_1.test)('a held apikey that has expired falls through to the exchange', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch({ apiStatus: [401, 200] });
        const sdk = new index_1.SDK({
            base: BASE,
            apikey: 'STALETOKEN01',
            system: { fetch: stub.fetch },
            feature: {
                secrets: {
                    active: true,
                    name: 'refresh_token',
                    providers: [{ kind: 'env', prefix: ENVPREFIX }],
                    exchange: { active: true },
                },
            },
        });
        await sdk.direct({ path: '/thing' });
        authIs(stub.api()[0], 'STALETOKEN01');
        authIs(stub.api()[1], 'ACCESS01');
    });
    (0, node_test_1.test)('no refresh token anywhere is an error, not an unauthenticated call', async () => {
        const stub = stubfetch();
        const sdk = exchangeSdk(stub);
        const res = await sdk.direct({ path: '/thing' });
        node_assert_1.default.ok(res && false === res.ok && null != res.err, 'expected a failure, got: ' + JSON.stringify(res));
        node_assert_1.default.equal(stub.api().length, 0, 'a request must not go out unauthenticated because the chain was empty');
    });
    (0, node_test_1.test)('a failing token endpoint surfaces the API refusal, not a spin', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        // The first purchase succeeds; the second (after the 401) does not.
        const stub = stubfetch({ apiStatus: [401] });
        const failing = {
            ...stub,
            fetch: async (url, init) => {
                const res = await stub.fetch(url, init);
                return url.endsWith('/auth/token') && 1 < stub.token().length
                    ? { status: 500, json: async () => ({}), headers: {} }
                    : res;
            },
        };
        const sdk = exchangeSdk(failing);
        const res = await sdk.direct({ path: '/thing' });
        node_assert_1.default.ok(null != res, 'the caller got an answer rather than a hang');
        node_assert_1.default.equal(stub.api().length, 1, 'no retry after a failed purchase');
    });
    (0, node_test_1.test)('auth: null suppresses the credential, refusal or not', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch({ apiStatus: [401] });
        const sdk = new index_1.SDK({
            base: BASE,
            auth: null,
            system: { fetch: stub.fetch },
            feature: {
                secrets: {
                    active: true,
                    name: 'refresh_token',
                    providers: [{ kind: 'env', prefix: ENVPREFIX }],
                    exchange: { active: true },
                },
            },
        });
        await sdk.direct({ path: '/thing' });
        node_assert_1.default.equal(stub.api().length, 1, 'a suppressed request must not be retried');
        node_assert_1.default.equal(stub.api()[0].auth, undefined, 'no credential may be sent when auth is suppressed');
        node_assert_1.default.equal(stub.token().length, 0, 'auth: null suppressed the credential but the refresh token was ' +
            'still POSTed to the exchange endpoint');
    });
    (0, node_test_1.test)('a token another request already bought is spent, not re-bought', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch();
        const sdk = exchangeSdk(stub);
        await sdk.direct({ path: '/warmup' });
        const bought = stub.token().length;
        const feature = sdk._secrets;
        const fetchdef = { headers: { [CREDHEADER]: 'Bearer STALE01' } };
        sdk._options.apikey = 'STALE01';
        let calls = 0;
        const inner = async () => {
            calls++;
            if (1 === calls) {
                // While this request was in flight, another one refreshed.
                sdk._options.apikey = 'ACCESS09';
                return { status: 401, json: async () => ({}), headers: {} };
            }
            return { status: 200, json: async () => ({ ok: true }), headers: {} };
        };
        const res = await feature._withRefresh({}, BASE + '/two', fetchdef, inner);
        node_assert_1.default.equal(res.status, 200);
        node_assert_1.default.equal(calls, 2, 'the request was retried once');
        node_assert_1.default.equal(stub.token().length, bought, 'the retry must reuse the token another request already bought');
        authIs({ auth: fetchdef.headers[CREDHEADER] }, 'ACCESS09');
    });
    (0, node_test_1.test)('exchange off leaves the feature exactly as it was', async () => {
        process.env[ENVPREFIX + 'APIKEY'] = 'PLAINKEY01';
        const { fetchdef } = await prepared(envchain());
        credentialIs(fetchdef.headers[CREDHEADER], 'PLAINKEY01');
        delete process.env[ENVPREFIX + 'APIKEY'];
    });
    (0, node_test_1.test)('test mode buys nothing and needs no token endpoint', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = REFRESH;
        const stub = stubfetch();
        const sdk = index_1.SDK.test({}, {
            base: BASE,
            system: { fetch: stub.fetch },
            feature: {
                secrets: {
                    active: true,
                    name: 'refresh_token',
                    providers: [{ kind: 'env', prefix: ENVPREFIX }],
                    exchange: { active: true },
                },
            },
        });
        const fetchdef = await sdk.prepare({ path: '/' });
        node_assert_1.default.equal(stub.calls.length, 0, 'test mode must not do IO');
        // A deterministic placeholder, so offline suites need no configuration.
        credentialIs(fetchdef.headers[CREDHEADER], 'test-access_token');
    });
    // Real listeners and the platform fetch: a stub follows nothing. The
    // origin answers the exchange as `answer` says and records what else it gets.
    async function withOrigins(run) {
        const o = { elsewhere: [], followed: [], exchanged: 0, answer: [307, ''] };
        const other = node_http_1.default.createServer((req, res) => {
            let body = '';
            req.on('data', (chunk) => body += chunk);
            req.on('end', () => {
                o.elsewhere.push({ method: req.method, url: req.url, body });
                res.writeHead(200, { 'content-type': 'application/json', connection: 'close' });
                res.end('{"access_token":"ELSEWHERE01"}');
            });
        });
        const origin = node_http_1.default.createServer((req, res) => {
            let body = '';
            req.on('data', (chunk) => body += chunk);
            req.on('end', () => {
                if ('/api/auth/token' === req.url) {
                    o.exchanged++;
                    res.writeHead(o.answer[0], { location: o.answer[1], connection: 'close' });
                    res.end();
                    return;
                }
                o.followed.push((req.method + ' ' + req.url + ' ' + body).trim());
                res.writeHead(200, { 'content-type': 'application/json', connection: 'close' });
                res.end('{"access_token":"MOVED01"}');
            });
        });
        const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
        o.origin = 'http://127.0.0.1:' + (await listen(origin));
        o.base = o.origin + '/api';
        o.away = 'http://127.0.0.1:' + (await listen(other)) + '/api/auth/token';
        try {
            await run(o);
        }
        finally {
            origin.close();
            other.close();
        }
    }
    function redirectSdk(o, exchange) {
        return new index_1.SDK({
            base: o.base,
            feature: {
                secrets: {
                    active: true,
                    name: 'refresh_token',
                    exchange: Object.assign({ active: true, refresh: REFRESH }, exchange || {}),
                },
            },
        });
    }
    (0, node_test_1.test)('a redirect answering the exchange is a failure, and nothing follows it', async () => {
        await withOrigins(async (o) => {
            const answers = [[307, o.away], [308, o.away], [302, o.away], [307, '/api/moved/token']];
            const allowed = [];
            let refused = 0;
            for (const answer of answers) {
                o.answer = answer;
                const res = await redirectSdk(o).direct({ path: '/thing' });
                const message = String(null == res || null == res.err ? res : res.err.message);
                if (message.includes('token exchange failed: ' + answer[0] + ' from ' + o.base + '/auth/token')) {
                    refused++;
                }
                else {
                    allowed.push(answer[0] + ' to ' + answer[1] + ': ' + message);
                }
            }
            console.log('secrets: exchange refused ' + refused + ' redirect(s), ' +
                (o.elsewhere.length + o.followed.length) + ' followed');
            node_assert_1.default.deepEqual(o.elsewhere, [], 'the exchange reached another origin');
            node_assert_1.default.deepEqual(o.followed, [], 'a request followed a refused exchange');
            node_assert_1.default.deepEqual(allowed, [], 'a redirect was not a failed exchange');
            node_assert_1.default.equal(refused, answers.length);
        });
    });
    (0, node_test_1.test)('with the option, a redirect on the exchange\'s own origin is followed, and no other', async () => {
        await withOrigins(async (o) => {
            const sent = ' {"refresh_token":"' + REFRESH + '"}';
            // Each case: the status, the Location, and the path the exchange is
            // asked again at, or null where the redirect is refused.
            const cases = [
                [307, '/api/moved/token', '/api/moved/token'],
                [308, o.origin + '/api/moved/token', '/api/moved/token'],
                // A Location of a query alone keeps the path that answered.
                [307, '?step=2', '/api/auth/token?step=2'],
                [307, o.away, null],
                [302, '/api/moved/token', null],
                [307, '/api/auth/token', null],
            ];
            const wrong = [];
            let followed = 0;
            let refused = 0;
            let looped = 0;
            for (const [status, location, path] of cases) {
                o.answer = [status, location];
                o.followed.length = 0;
                o.exchanged = 0;
                const res = await redirectSdk(o, { redirect: 'same-origin' }).direct({ path: '/thing' });
                const message = String(null == res || null == res.err ? res : res.err.message);
                const seen = status + ' to ' + location + ': ' + message + ' ' + JSON.stringify(o.followed);
                if (null != path) {
                    if (true === res.ok && 'POST ' + path + sent === o.followed[0] &&
                        2 === o.followed.length)
                        followed++;
                    else
                        wrong.push(seen);
                }
                else if (0 === o.followed.length && message.includes('token exchange failed: ' + status + ' from ' + o.base + '/auth/token')) {
                    refused++;
                }
                else {
                    wrong.push(seen);
                }
                if ('/api/auth/token' === location)
                    looped = o.exchanged;
            }
            console.log('secrets: exchange opt-in followed ' + followed +
                ' redirect(s) on its own origin, refused ' + refused + ', ' +
                o.elsewhere.length + ' elsewhere');
            node_assert_1.default.deepEqual(o.elsewhere, [], 'the exchange reached another origin');
            node_assert_1.default.deepEqual(wrong, []);
            node_assert_1.default.equal(followed, 3);
            node_assert_1.default.equal(refused, 3);
            // A redirect to itself stops at the hop limit.
            node_assert_1.default.equal(looped, 6);
        });
    });
});
// Off by the config where it declares no auth, else by `auth: null`: either
// way the feature places no credential, buys no token and retries nothing.
const AUTHOFF = NOAUTH ? { by: 'config', opts: {} } : { by: 'option', opts: { auth: null } };
(0, node_test_1.describe)('secrets with auth off', () => {
    const BASE = 'http://authoff.test/api';
    const SECRETS = ['OFFKEY01', 'OFFKEY02', 'OFFREFRESH01', 'ACCESS01'];
    const sent = [];
    let bought = 0;
    (0, node_test_1.beforeEach)(() => {
        delete process.env[ENVPREFIX + 'APIKEY'];
        delete process.env[ENVPREFIX + 'REFRESH_TOKEN'];
    });
    (0, node_test_1.after)(() => {
        console.log('secrets: auth off by ' + AUTHOFF.by + ': ' + sent.length + ' request(s), ' +
            sent.filter(carries).length + ' credential(s), ' + bought + ' token(s)');
    });
    // The header prepareAuth writes, or any header holding one of the secrets.
    function carries(call) {
        const headers = call.init.headers || {};
        return undefined !== headers[CREDHEADER] || Object.values(headers)
            .some((v) => SECRETS.some((secret) => String(v).includes(secret)));
    }
    async function offsdk(stub, sdkopts, fopts) {
        const sdk = new index_1.SDK({
            ...sdkopts,
            ...AUTHOFF.opts,
            base: BASE,
            system: { fetch: stub.fetch },
            feature: {
                secrets: {
                    active: true,
                    providers: [{ kind: 'env', prefix: ENVPREFIX }],
                    ...fopts,
                },
            },
        });
        await sdk.direct({ path: '/thing' });
        sent.push(...stub.api());
        bought += stub.token().length;
        return sdk;
    }
    (0, node_test_1.test)('a key the chain resolves is not placed', async () => {
        process.env[ENVPREFIX + 'APIKEY'] = 'OFFKEY01';
        const stub = stubfetch();
        const sdk = await offsdk(stub, {}, {});
        node_assert_1.default.equal(stub.api().length, 1);
        node_assert_1.default.ok(!carries(stub.api()[0]), 'a credential was sent with auth off');
        node_assert_1.default.equal(sdk.options().apikey, '', 'the resolved key was placed where prepareAuth reads it');
    });
    (0, node_test_1.test)('an explicit apikey is not placed', async () => {
        const stub = stubfetch();
        await offsdk(stub, { apikey: 'OFFKEY02' }, {});
        node_assert_1.default.equal(stub.api().length, 1);
        node_assert_1.default.ok(!carries(stub.api()[0]), 'a credential was sent with auth off');
    });
    (0, node_test_1.test)('a refusal buys no token and is not retried', async () => {
        process.env[ENVPREFIX + 'REFRESH_TOKEN'] = 'OFFREFRESH01';
        const stub = stubfetch({ apiStatus: [401] });
        await offsdk(stub, {}, { name: 'refresh_token', exchange: { active: true } });
        node_assert_1.default.equal(stub.token().length, 0, 'a token was bought with auth off');
        node_assert_1.default.equal(stub.api().length, 1, 'a refusal was retried with auth off');
        node_assert_1.default.ok(!carries(stub.api()[0]), 'a credential was sent with auth off');
    });
});
//# sourceMappingURL=Secrets.test.js.map