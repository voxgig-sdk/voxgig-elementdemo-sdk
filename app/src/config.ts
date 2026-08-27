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
