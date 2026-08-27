import { describe, test } from 'node:test';
import { strictEqual, deepStrictEqual, ok } from 'node:assert';
import { GroupStore } from '../../src/store/GroupStore.js';
import { createTestGroup } from '../setup.js';
// Groups are read-only: seed/getAll/getById is the WHOLE surface, and part of
// what these tests pin is that it stays that way — a write method appearing
// here would mean a write route is one edit away.
describe('GroupStore', () => {
    test('seed adds group to store', () => {
        const store = new GroupStore();
        const group = createTestGroup();
        const seeded = store.seed(group);
        deepStrictEqual(seeded, group);
        const retrieved = store.getById('test-group');
        deepStrictEqual(retrieved, group);
    });
    test('getAll returns all groups', () => {
        const store = new GroupStore();
        store.seed(createTestGroup({ id: 'g1', number: 1 }));
        store.seed(createTestGroup({ id: 'g2', number: 2 }));
        const all = store.getAll();
        strictEqual(all.length, 2);
    });
    test('getById returns undefined for non-existent group', () => {
        const store = new GroupStore();
        const result = store.getById('non-existent');
        strictEqual(result, undefined);
    });
    test('the store exposes no write methods beyond seed', () => {
        const store = new GroupStore();
        for (const method of ['create', 'update', 'delete']) {
            ok(undefined === store[method], `GroupStore.${method} exists — groups are read-only, so the store ` +
                `must not offer it for a route to reach`);
        }
    });
});
//# sourceMappingURL=GroupStore.test.js.map