import { describe, test, beforeEach, afterEach } from 'node:test';
import { strictEqual } from 'node:assert';
import { build } from '../../src/server.js';
import { apiClient } from '../setup.js';
describe('Series API Integration', () => {
    let app;
    let api;
    // Per TEST, not per file — see the note in element.integration.test.ts.
    beforeEach(async () => {
        app = await build();
        api = apiClient(app);
    });
    afterEach(async () => {
        await app.close();
    });
    test('GET /api/:account_id/series returns all series', async () => {
        const res = await api.inject({
            method: 'GET',
            url: '/series',
        });
        strictEqual(res.statusCode, 200);
        const series = JSON.parse(res.payload);
        strictEqual(series.length, 10);
    });
    test('GET /api/:account_id/series/:series_id returns specific series', async () => {
        const res = await api.inject({
            method: 'GET',
            url: '/series/alkali-metal',
        });
        strictEqual(res.statusCode, 200);
        const series = JSON.parse(res.payload);
        strictEqual(series.id, 'alkali-metal');
        strictEqual(series.name, 'Alkali metal');
        strictEqual(series.color, 'red');
    });
    test('GET /api/:account_id/series/:series_id returns 404 for non-existent series', async () => {
        const res = await api.inject({
            method: 'GET',
            url: '/series/non-existent',
        });
        strictEqual(res.statusCode, 404);
    });
    // Series are READ-ONLY, same contract as group.integration.test.ts: the
    // write routes are absent, not refusing.
    test('write methods are not routes at all', async () => {
        const post = await api.inject({
            method: 'POST',
            url: '/series',
            payload: {
                id: 'unobtainium', name: 'Unobtainium',
                color: 'octarine', description: 'Not a thing.',
            },
        });
        strictEqual(post.statusCode, 404);
        strictEqual(JSON.parse(post.payload).error, 'NotFoundError');
        const put = await api.inject({
            method: 'PUT',
            url: '/series/alkali-metal',
            payload: { name: 'hijacked' },
        });
        strictEqual(put.statusCode, 404);
        const del = await api.inject({
            method: 'DELETE',
            url: '/series/alkali-metal',
        });
        strictEqual(del.statusCode, 404);
        // and the record the writes aimed at is untouched
        const series = JSON.parse((await api.inject({ method: 'GET', url: '/series/alkali-metal' }))
            .payload);
        strictEqual(series.name, 'Alkali metal');
    });
});
//# sourceMappingURL=series.integration.test.js.map