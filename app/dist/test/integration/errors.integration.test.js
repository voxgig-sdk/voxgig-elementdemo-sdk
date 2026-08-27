import { describe, test, beforeEach, afterEach } from 'node:test';
import { strictEqual, match } from 'node:assert';
import { build } from '../../src/server.js';
// Pins the ERROR ENVELOPE: every failure is { error, message } and `error` is
// a PascalCase name derived from the STATUS, not from whatever internal name
// the throwing library used.
//
// Left unpinned, an Ajv schema violation — the commonest 400 this server
// produces — would reach clients as "Error", a malformed JSON body as
// "FastifyError", and an unmatched route as "Not Found" with an extra
// statusCode field. Every case below returns a 4xx either way, so only the
// label distinguishes the right behaviour from the wrong one — which is
// exactly why it needs a test.
describe('Error envelope', () => {
    let app;
    beforeEach(async () => {
        app = await build();
    });
    afterEach(async () => {
        await app.close();
    });
    async function envelope(req) {
        const res = await app.inject(req);
        return { status: res.statusCode, body: JSON.parse(res.body) };
    }
    test('a schema violation is a ValidationError, not "Error"', async () => {
        const { status, body } = await envelope({
            method: 'POST', url: '/api/element', payload: { block: 's' },
        });
        strictEqual(status, 400);
        strictEqual(body.error, 'ValidationError');
        match(body.message, /required property/);
    });
    test('a malformed JSON body is a ValidationError, not "FastifyError"', async () => {
        const { status, body } = await envelope({
            method: 'POST',
            url: '/api/element',
            payload: '{bad',
            headers: { 'content-type': 'application/json' },
        });
        strictEqual(status, 400);
        strictEqual(body.error, 'ValidationError');
    });
    test('a missing record is a NotFoundError', async () => {
        const { status, body } = await envelope({
            method: 'GET', url: '/api/element/no-such-element',
        });
        strictEqual(status, 404);
        strictEqual(body.error, 'NotFoundError');
    });
    test('an unmatched route is a NotFoundError, not "Not Found"', async () => {
        const { status, body } = await envelope({ method: 'GET', url: '/no-such-route' });
        strictEqual(status, 404);
        strictEqual(body.error, 'NotFoundError');
        strictEqual(body.statusCode, undefined, 'the envelope is exactly { error, message }');
    });
    test('an unsupported method on a real path is a NotFoundError', async () => {
        const { status, body } = await envelope({ method: 'PATCH', url: '/api/element' });
        strictEqual(status, 404);
        strictEqual(body.error, 'NotFoundError');
    });
    test('a write to a read-only entity is a NotFoundError in the envelope', async () => {
        // POST /api/group is not a route at all — group is read-only — so it
        // travels Fastify's own not-found path, the one setErrorHandler never
        // sees. This is the case that makes the not-found handler earn its keep.
        const { status, body } = await envelope({
            method: 'POST', url: '/api/group', payload: { id: 'g19' },
        });
        strictEqual(status, 404);
        strictEqual(body.error, 'NotFoundError');
    });
    test('a duplicate id is a ConflictError', async () => {
        const { status, body } = await envelope({
            method: 'POST',
            url: '/api/element',
            payload: {
                id: 'fe', name: 'Iron again', symbol: 'Fe',
                number: 26, period: 4, block: 'd',
                series_id: 'transition-metal', mass: 55.845,
            },
        });
        strictEqual(status, 409);
        strictEqual(body.error, 'ConflictError');
    });
    test('every failure carries both error and message', async () => {
        for (const req of [
            { method: 'POST', url: '/api/element', payload: { block: 's' } },
            { method: 'GET', url: '/api/element/no-such-element' },
            // Unmatched route and unsupported method: these do NOT go through
            // setErrorHandler — Fastify answers them on its own not-found path — so
            // leaving them out of this list is what would let the envelope diverge
            // here while every case above passed.
            { method: 'GET', url: '/no-such-route' },
            { method: 'PATCH', url: '/api/element' },
            { method: 'POST', url: '/api/group', payload: { id: 'g19' } },
        ]) {
            const { body } = await envelope(req);
            strictEqual(typeof body.error, 'string', 'error must be present');
            strictEqual(typeof body.message, 'string', 'message must be present');
            match(body.error, /^[A-Z][A-Za-z]*Error$/, `not PascalCase: ${body.error}`);
        }
    });
});
//# sourceMappingURL=errors.integration.test.js.map