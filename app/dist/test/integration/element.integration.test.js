import { describe, test, beforeEach, afterEach } from 'node:test';
import { strictEqual, ok } from 'node:assert';
import { build } from '../../src/server.js';
describe('Element API Integration', () => {
    let app;
    // Per TEST, not per file. build() re-reads element.data.json into fresh
    // stores (src/server.ts), so every test starts from the seed.
    //
    // Sharing one instance would make every absolute-count assertion in this
    // file depend on each mutating test remembering its own cleanup DELETE, and
    // on node:test running them in declaration order — nothing would enforce
    // either. Per-test builds remove the dependency rather than relying on it.
    beforeEach(async () => {
        app = await build();
    });
    afterEach(async () => {
        await app.close();
    });
    test('GET /api/element returns all elements', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/element',
        });
        strictEqual(res.statusCode, 200);
        const elements = JSON.parse(res.payload);
        strictEqual(elements.length, 118);
    });
    test('GET /api/element/:element_id returns specific element', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/element/fe',
        });
        strictEqual(res.statusCode, 200);
        const element = JSON.parse(res.payload);
        strictEqual(element.id, 'fe');
        strictEqual(element.name, 'Iron');
        strictEqual(element.symbol, 'Fe');
        strictEqual(element.number, 26);
    });
    test('GET /api/element/:element_id returns 404 for non-existent element', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/element/non-existent',
        });
        strictEqual(res.statusCode, 404);
    });
    test('full element lifecycle', async () => {
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/element',
            payload: {
                name: 'Testium',
                symbol: 'Ts',
                number: 999,
                period: 8,
                block: 's',
                series_id: 'nonmetal',
                mass: 300.1,
            },
        });
        strictEqual(createRes.statusCode, 201);
        const created = JSON.parse(createRes.payload);
        const elementId = created.id;
        const getRes = await app.inject({
            method: 'GET',
            url: `/api/element/${elementId}`,
        });
        strictEqual(getRes.statusCode, 200);
        const element = JSON.parse(getRes.payload);
        strictEqual(element.name, 'Testium');
        const updateRes = await app.inject({
            method: 'PUT',
            url: `/api/element/${elementId}`,
            payload: {
                name: 'Updated Testium',
                symbol: 'Ts',
                number: 999,
                period: 8,
                block: 's',
                series_id: 'nonmetal',
                mass: 300.1,
            },
        });
        strictEqual(updateRes.statusCode, 200);
        const updated = JSON.parse(updateRes.payload);
        strictEqual(updated.name, 'Updated Testium');
        const deleteRes = await app.inject({
            method: 'DELETE',
            url: `/api/element/${elementId}`,
        });
        strictEqual(deleteRes.statusCode, 204);
        const notFoundRes = await app.inject({
            method: 'GET',
            url: `/api/element/${elementId}`,
        });
        strictEqual(notFoundRes.statusCode, 404);
    });
    test('POST /api/element/:element_id/ionize builds the ion notation', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/element/fe/ionize',
            payload: { charge: 3 },
        });
        strictEqual(res.statusCode, 200);
        const body = JSON.parse(res.payload);
        strictEqual(body.ok, true);
        strictEqual(body.ion, 'Fe3+');
    });
    test('POST /api/element/:element_id/ionize handles negative charges', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/element/o/ionize',
            payload: { charge: -2 },
        });
        strictEqual(res.statusCode, 200);
        const body = JSON.parse(res.payload);
        strictEqual(body.ok, true);
        strictEqual(body.ion, 'O2-');
    });
    test('ionize omits the magnitude when it is one', async () => {
        const plus = await app.inject({
            method: 'POST',
            url: '/api/element/na/ionize',
            payload: { charge: 1 },
        });
        strictEqual(JSON.parse(plus.payload).ion, 'Na+');
        const minus = await app.inject({
            method: 'POST',
            url: '/api/element/cl/ionize',
            payload: { charge: -1 },
        });
        strictEqual(JSON.parse(minus.payload).ion, 'Cl-');
    });
    test('ionize defaults the charge to 1', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/element/h/ionize',
            payload: {},
        });
        strictEqual(res.statusCode, 200);
        const body = JSON.parse(res.payload);
        strictEqual(body.ok, true);
        strictEqual(body.ion, 'H+');
    });
    test('ionize with charge 0 is no ion at all', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/element/fe/ionize',
            payload: { charge: 0 },
        });
        strictEqual(res.statusCode, 200);
        const body = JSON.parse(res.payload);
        strictEqual(body.ok, false);
        strictEqual(body.ion, 'Fe');
    });
    test('POST /api/element creates an element visible in /debug', async () => {
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/element',
            payload: {
                name: 'Debug Test Element',
                symbol: 'Dt',
                number: 998,
                period: 8,
                block: 'p',
                series_id: 'nonmetal',
                mass: 299.9,
            },
        });
        strictEqual(createRes.statusCode, 201);
        const created = JSON.parse(createRes.payload);
        const elementId = created.id;
        const debugRes = await app.inject({
            method: 'GET',
            url: '/debug',
        });
        strictEqual(debugRes.statusCode, 200);
        const debug = JSON.parse(debugRes.payload);
        const debugElement = debug.data.element.find((e) => e.id === elementId);
        ok(debugElement, 'New element should appear in debug output');
        strictEqual(debugElement.name, 'Debug Test Element');
        strictEqual(debugElement.symbol, 'Dt');
        strictEqual(debugElement.mass, 299.9);
        // Clean up
        await app.inject({ method: 'DELETE', url: `/api/element/${elementId}` });
    });
    test('ionize on non-existent element returns 404', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/element/non-existent/ionize',
            payload: { charge: 1 },
        });
        strictEqual(res.statusCode, 404);
    });
    // C1 — a client-supplied id must survive create. OpenAPI requires one and
    // the generated SDK create type requires it too, so every SDK caller sends
    // one; a schema that rejects it, or a handler that overwrites it, breaks
    // the whole SDK round-trip.
    test('POST /api/element honours a client-supplied id', async () => {
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/element',
            payload: {
                id: 'uue',
                name: 'Ununennium',
                symbol: 'Uue',
                number: 119,
                period: 8,
                block: 's',
                series_id: 'alkali-metal',
                mass: 315,
            },
        });
        strictEqual(createRes.statusCode, 201);
        strictEqual(JSON.parse(createRes.payload).id, 'uue');
        // and it is addressable by the id the caller chose
        const getRes = await app.inject({ method: 'GET', url: '/api/element/uue' });
        strictEqual(getRes.statusCode, 200);
        strictEqual(JSON.parse(getRes.payload).name, 'Ununennium');
        await app.inject({ method: 'DELETE', url: '/api/element/uue' });
    });
    test('POST /api/element still generates an id when none is given', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/element',
            payload: {
                name: 'Nameless',
                symbol: 'Nl',
                number: 997,
                period: 8,
                block: 'd',
                series_id: 'transition-metal',
                mass: 280,
            },
        });
        strictEqual(res.statusCode, 201);
        const created = JSON.parse(res.payload);
        ok(created.id, 'server should generate an id when the client omits one');
        await app.inject({ method: 'DELETE', url: `/api/element/${created.id}` });
    });
    test('POST /api/element rejects a duplicate id with 409', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/element',
            payload: {
                id: 'fe',
                name: 'Impostor',
                symbol: 'Im',
                number: 1,
                period: 1,
                block: 's',
                series_id: 'nonmetal',
                mass: 1,
            },
        });
        strictEqual(res.statusCode, 409);
        // the original must be untouched, not overwritten
        const fe = JSON.parse((await app.inject({ method: 'GET', url: '/api/element/fe' })).payload);
        strictEqual(fe.name, 'Iron');
    });
    // ISOLATION GUARD. These two run in declaration order (node:test default),
    // and the pair only passes when each test gets a fresh server: the first
    // deliberately leaves an element behind, the second asserts it is gone.
    //
    // Revert the hooks above to before/after and the second fails. Without this,
    // the isolation would be an unenforced convention — the next person to
    // "simplify" the hooks back would find every test still green.
    test('isolation guard: leave an element behind', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/element',
            payload: {
                id: 'isolation-probe',
                name: 'Probe',
                symbol: 'Pr',
                number: 996,
                period: 8,
                block: 's',
                series_id: 'nonmetal',
                mass: 1,
            },
        });
        strictEqual(res.statusCode, 201);
    });
    test('isolation guard: the next test cannot see it', async () => {
        const res = await app.inject({ method: 'GET', url: '/api/element/isolation-probe' });
        strictEqual(res.statusCode, 404, 'a record created by the previous test survived — the suite is sharing ' +
            'one server again, so every count assertion here is order-dependent');
    });
});
//# sourceMappingURL=element.integration.test.js.map