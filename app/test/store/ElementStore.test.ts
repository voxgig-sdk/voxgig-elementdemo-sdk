import { describe, test } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'
import { ElementStore } from '../../src/store/ElementStore.js'
import { IsotopeStore } from '../../src/store/IsotopeStore.js'
import { createTestElement, createTestIsotope } from '../setup.js'

describe('ElementStore', () => {
  test('create adds element to store', () => {
    const isotopeStore = new IsotopeStore()
    const store = new ElementStore(isotopeStore)

    const element = createTestElement()
    const created = store.create(element)

    deepStrictEqual(created, element)

    const retrieved = store.getById('test-element')
    deepStrictEqual(retrieved, element)
  })

  test('getAll returns all elements', () => {
    const isotopeStore = new IsotopeStore()
    const store = new ElementStore(isotopeStore)

    const element1 = createTestElement({ id: 'e1', name: 'Element 1' })
    const element2 = createTestElement({ id: 'e2', name: 'Element 2' })

    store.create(element1)
    store.create(element2)

    const all = store.getAll()
    strictEqual(all.length, 2)
  })

  test('getById returns undefined for non-existent element', () => {
    const isotopeStore = new IsotopeStore()
    const store = new ElementStore(isotopeStore)

    const result = store.getById('non-existent')
    strictEqual(result, undefined)
  })

  test('update modifies existing element', () => {
    const isotopeStore = new IsotopeStore()
    const store = new ElementStore(isotopeStore)

    const element = createTestElement()
    store.create(element)

    const updated = store.update('test-element', { name: 'Updated Element' })
    strictEqual(updated?.name, 'Updated Element')
    strictEqual(updated?.mass, 100.5)
  })

  test('update returns undefined for non-existent element', () => {
    const isotopeStore = new IsotopeStore()
    const store = new ElementStore(isotopeStore)

    const result = store.update('non-existent', { name: 'Test' })
    strictEqual(result, undefined)
  })

  test('delete removes element and cascades to isotopes', () => {
    const isotopeStore = new IsotopeStore()
    const store = new ElementStore(isotopeStore)

    const element = createTestElement({ id: 'e1' })
    const isotope1 = createTestIsotope({ id: 'i1', element_id: 'e1' })
    const isotope2 = createTestIsotope({ id: 'i2', element_id: 'e1' })

    store.create(element)
    isotopeStore.create(isotope1)
    isotopeStore.create(isotope2)

    const deleted = store.delete('e1')
    strictEqual(deleted, true)
    strictEqual(store.getById('e1'), undefined)
    strictEqual(isotopeStore.getById('i1'), undefined)
    strictEqual(isotopeStore.getById('i2'), undefined)
  })

  test('delete returns false for non-existent element', () => {
    const isotopeStore = new IsotopeStore()
    const store = new ElementStore(isotopeStore)

    const deleted = store.delete('non-existent')
    strictEqual(deleted, false)
  })
})
