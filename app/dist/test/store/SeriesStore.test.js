import { describe, test } from 'node:test';
import { strictEqual, deepStrictEqual, ok } from 'node:assert';
import { SeriesStore } from '../../src/store/SeriesStore.js';
import { createTestSeries } from '../setup.js';
// Series are read-only, same contract as GroupStore.test.ts.
describe('SeriesStore', () => {
    test('seed adds series to store', () => {
        const store = new SeriesStore();
        const series = createTestSeries();
        const seeded = store.seed(series);
        deepStrictEqual(seeded, series);
        const retrieved = store.getById('test-series');
        deepStrictEqual(retrieved, series);
    });
    test('getAll returns all series', () => {
        const store = new SeriesStore();
        store.seed(createTestSeries({ id: 's1', name: 'Series 1' }));
        store.seed(createTestSeries({ id: 's2', name: 'Series 2' }));
        const all = store.getAll();
        strictEqual(all.length, 2);
    });
    test('getById returns undefined for non-existent series', () => {
        const store = new SeriesStore();
        const result = store.getById('non-existent');
        strictEqual(result, undefined);
    });
    test('the store exposes no write methods beyond seed', () => {
        const store = new SeriesStore();
        for (const method of ['create', 'update', 'delete']) {
            ok(undefined === store[method], `SeriesStore.${method} exists — series are read-only, so the store ` +
                `must not offer it for a route to reach`);
        }
    });
});
//# sourceMappingURL=SeriesStore.test.js.map