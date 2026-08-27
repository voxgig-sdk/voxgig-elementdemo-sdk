import { describe, test, afterEach } from 'node:test';
import { strictEqual } from 'node:assert';
import { build } from '../../src/server.js';
import { debugRouteEnabled } from '../../src/config.js';
// GET /debug dumps the entire store, unauthenticated, and is not in the
// OpenAPI definition. Registered unconditionally, its safety would be a
// property of HOST's DEFAULT VALUE rather than of any code — nothing would
// fail if you set HOST=0.0.0.0, it would just quietly become reachable.
//
// These pin the decision itself. The pure-function tests cover the matrix
// without a server; the integration tests prove the decision actually reaches
// route registration, which is the part that could silently stop working.
describe('debug route guard', () => {
    test('loopback binds keep it', () => {
        for (const HOST of ['localhost', '127.0.0.1', '::1', '0:0:0:0:0:0:0:1']) {
            strictEqual(debugRouteEnabled({ HOST }), true, HOST);
        }
    });
    test('an unset HOST keeps it (the default bind is loopback)', () => {
        strictEqual(debugRouteEnabled({}), true);
    });
    test('a reachable bind drops it', () => {
        for (const HOST of ['0.0.0.0', '::', '192.168.1.10', 'elementdemo.example.com']) {
            strictEqual(debugRouteEnabled({ HOST }), false, HOST);
        }
    });
    test('DEBUG_ROUTE overrides in both directions', () => {
        strictEqual(debugRouteEnabled({ HOST: '0.0.0.0', DEBUG_ROUTE: 'true' }), true);
        strictEqual(debugRouteEnabled({ HOST: 'localhost', DEBUG_ROUTE: 'false' }), false);
    });
    test('anything other than true/false is not an override', () => {
        // Guards against a truthy-string bug: DEBUG_ROUTE=0 or =no must not read
        // as "on" just by being a non-empty string.
        for (const DEBUG_ROUTE of ['1', '0', 'yes', 'no', '']) {
            strictEqual(debugRouteEnabled({ HOST: '0.0.0.0', DEBUG_ROUTE }), false, DEBUG_ROUTE);
        }
    });
    describe('registration follows the decision', () => {
        let app;
        const saved = { HOST: process.env.HOST, DEBUG_ROUTE: process.env.DEBUG_ROUTE };
        afterEach(async () => {
            if (app)
                await app.close();
            process.env.HOST = saved.HOST;
            process.env.DEBUG_ROUTE = saved.DEBUG_ROUTE;
            if (undefined === saved.HOST)
                delete process.env.HOST;
            if (undefined === saved.DEBUG_ROUTE)
                delete process.env.DEBUG_ROUTE;
        });
        test('served on the default loopback bind', async () => {
            delete process.env.HOST;
            delete process.env.DEBUG_ROUTE;
            app = await build();
            const res = await app.inject({ method: 'GET', url: '/debug' });
            strictEqual(res.statusCode, 200);
        });
        test('404 on a reachable bind — the route is absent, not refused', async () => {
            process.env.HOST = '0.0.0.0';
            delete process.env.DEBUG_ROUTE;
            app = await build();
            const res = await app.inject({ method: 'GET', url: '/debug' });
            strictEqual(res.statusCode, 404, '/debug is reachable on a non-loopback bind — it dumps the whole store');
        });
        test('DEBUG_ROUTE=true restores it on a reachable bind', async () => {
            process.env.HOST = '0.0.0.0';
            process.env.DEBUG_ROUTE = 'true';
            app = await build();
            const res = await app.inject({ method: 'GET', url: '/debug' });
            strictEqual(res.statusCode, 200);
        });
    });
});
//# sourceMappingURL=debugroute.integration.test.js.map