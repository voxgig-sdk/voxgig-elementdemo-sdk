import type { Element, Isotope, Group, Series } from '../src/types.js'

export function createTestElement(overrides?: Partial<Element>): Element {
  return {
    id: 'test-element',
    name: 'Test Element',
    symbol: 'Te',
    number: 999,
    period: 7,
    block: 's',
    series_id: 'nonmetal',
    mass: 100.5,
    ...overrides,
  }
}

export function createTestIsotope(overrides?: Partial<Isotope>): Isotope {
  return {
    id: 'test-isotope',
    element_id: 'test-element',
    name: 'Test Isotope',
    mass_number: 100,
    mass: 100.001,
    stable: true,
    ...overrides,
  }
}

export function createTestGroup(overrides?: Partial<Group>): Group {
  return {
    id: 'test-group',
    number: 99,
    cas: 'XXA',
    ...overrides,
  }
}

export function createTestSeries(overrides?: Partial<Series>): Series {
  return {
    id: 'test-series',
    name: 'Test Series',
    color: 'octarine',
    description: 'A series that exists only in tests.',
    ...overrides,
  }
}
