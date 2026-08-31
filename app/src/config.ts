import type { Account } from './types.js'

export const config = {
  server: {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT || '8902', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'error',
  },
  data: {
    initialDataPath: process.env.DATA_PATH || './element.data.json',
  },
}


// The default account and its refresh token.
//
// Real values, not placeholders: this is a reference server whose whole job
// is to be talked to, and an SDK's live run has to know the pair up front.
// They are DEV credentials to a server that holds public chemistry data —
// there is nothing here to protect — and naming them so in the value itself
// keeps them from ever reading as a leaked production secret.
const DEFAULT_ACCOUNT_ID = 'acc01'
const DEFAULT_REFRESH_TOKEN = 'rt-elementdemo-dev-refresh-token'

// How many requests one access token serves before it dies. See
// AccountStore: expiry is counted in requests, not seconds.
const DEFAULT_ACCESS_TOKEN_USES = 4


// The accounts this server serves, parsed from ACCOUNTS as
// `<id>:<refresh-token>` pairs, comma-separated:
//
//   ACCOUNTS='acc01:rt-one,acc02:rt-two'
//
// Reads process.env at CALL time rather than off `config` above, for the
// same reason debugRouteEnabled does: `config` is evaluated once at import,
// so a test could not vary it in-process. build() calls this when it
// constructs the AccountStore, so the value in force then is what serves.
export function accountList(env: NodeJS.ProcessEnv = process.env): Account[] {
  const raw = (env.ACCOUNTS || '').trim()

  if ('' === raw) {
    return [{
      id: env.ACCOUNT_ID || DEFAULT_ACCOUNT_ID,
      refresh_token: env.REFRESH_TOKEN || DEFAULT_REFRESH_TOKEN,
    }]
  }

  return raw
    .split(',')
    .map((pair) => pair.trim())
    .filter((pair) => '' !== pair)
    .map((pair) => {
      // A refresh token may itself contain ':' — split on the FIRST one
      // only, or `acc01:rt:with:colons` would silently lose its tail and
      // every request would then fail 401 with nothing pointing here.
      const at = pair.indexOf(':')
      if (0 >= at) {
        throw new Error(
          `ACCOUNTS entry '${pair}' is not '<id>:<refresh-token>'`)
      }
      return {
        id: pair.slice(0, at),
        refresh_token: pair.slice(at + 1),
      }
    })
}


// How many requests an access token serves before the server drops it.
// Call-time env read, as above.
export function accessTokenUses(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.ACCESS_TOKEN_USES

  if (null == raw || '' === raw.trim()) {
    return DEFAULT_ACCESS_TOKEN_USES
  }

  const n = parseInt(raw, 10)

  if (!Number.isFinite(n) || 1 > n) {
    throw new Error(
      `ACCESS_TOKEN_USES must be a positive integer, got '${raw}'`)
  }

  return n
}


// Hosts from which /debug cannot be reached off-box.
const LOOPBACK_HOSTS = new Set([
  'localhost', '127.0.0.1', '::1', '0:0:0:0:0:0:0:1',
])

// Should GET /debug be registered at all?
//
// /debug returns the ENTIRE store, unauthenticated, and is absent from the
// OpenAPI definition. That is deliberate test-server design, and it is only
// harmless on the default localhost bind — which stops being true the moment
// HOST is set to something reachable. Registering the route unconditionally
// would make the safety a property of the default value rather than of the
// code.
//
// So the bind address decides: loopback keeps it, anything else drops the
// route entirely (404, as though it never existed). DEBUG_ROUTE=true|false
// overrides in either direction, for the case where you do want it on a
// reachable bind and are choosing that deliberately.
//
// Reads process.env at CALL time rather than off `config` above: `config` is
// evaluated once at import, so a test could not vary it in-process. This runs
// when build() registers routes, so the value in force then is what decides.
export function debugRouteEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const flag = env.DEBUG_ROUTE

  if ('true' === flag) {
    return true
  }
  if ('false' === flag) {
    return false
  }

  return LOOPBACK_HOSTS.has(env.HOST || 'localhost')
}
