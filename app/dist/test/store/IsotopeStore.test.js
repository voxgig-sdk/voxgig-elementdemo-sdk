import { describe, test } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { IsotopeStore } from '../../src/store/IsotopeStore.js';
import { createTestIsotope } from '../setup.js';
describe('IsotopeStore', () => {
    test('create adds isotope to store', () => {
        const store = new IsotopeStore();
        const isotope = createTestIsotope();
        const created = store.create(isotope);
        deepStrictEqual(created, isotope);
        const retrieved = store.getById('test-isotope');
        deepStrictEqual(retrieved, isotope);
    });
    test('getAll returns all isotopes', () => {
        const store = new IsotopeStore();
        const isotope1 = createTestIsotope({ id: 'i1', name: 'Isotope 1' });
        const isotope2 = createTestIsotope({ id: 'i2', name: 'Isotope 2' });
        store.create(isotope1);
        store.create(isotope2);
        const all = store.getAll();
        strictEqual(all.length, 2);
    });
    test('getById returns undefined for non-existent isotope', () => {
        const store = new IsotopeStore();
        const result = store.getById('non-existent');
        strictEqual(result, undefined);
    });
    test('getByElementId returns isotopes for specific element', () => {
        const store = new IsotopeStore();
        const isotope1 = createTestIsotope({ id: 'i1', element_id: 'e1' });
        const isotope2 = createTestIsotope({ id: 'i2', element_id: 'e1' });
        const isotope3 = createTestIsotope({ id: 'i3', element_id: 'e2' });
        store.create(isotope1);
        store.create(isotope2);
        store.create(isotope3);
        const e1Isotopes = store.getByElementId('e1');
        strictEqual(e1Isotopes.length, 2);
        const e2Isotopes = store.getByElementId('e2');
        strictEqual(e2Isotopes.length, 1);
    });
    test('getByElementId returns empty array when no isotopes exist', () => {
        const store = new IsotopeStore();
        const isotopes = store.getByElementId('non-existent');
        strictEqual(isotopes.length, 0);
    });
    test('update modifies existing isotope', () => {
        const store = new IsotopeStore();
        const isotope = createTestIsotope();
        store.create(isotope);
        const updated = store.update('test-isotope', { name: 'Updated Isotope' });
        strictEqual(updated?.name, 'Updated Isotope');
        strictEqual(updated?.mass_number, 100);
    });
    test('update returns undefined for non-existent isotope', () => {
        const store = new IsotopeStore();
        const result = store.update('non-existent', { name: 'Test' });
        strictEqual(result, undefined);
    });
    test('delete removes isotope from store', () => {
        const store = new IsotopeStore();
        const isotope = createTestIsotope();
        store.create(isotope);
        const deleted = store.delete('test-isotope');
        strictEqual(deleted, true);
        strictEqual(store.getById('test-isotope'), undefined);
    });
    test('delete returns false for non-existent isotope', () => {
        const store = new IsotopeStore();
        const deleted = store.delete('non-existent');
        strictEqual(deleted, false);
    });
});
//# sourceMappingURL=IsotopeStore.test.js.map