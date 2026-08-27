import type { Element } from '../types.js'
import type { IsotopeStore } from './IsotopeStore.js'

export class ElementStore {
  private elements: Map<string, Element>
  private isotopeStore: IsotopeStore

  constructor(isotopeStore: IsotopeStore) {
    this.elements = new Map()
    this.isotopeStore = isotopeStore
  }

  getAll(): Element[] {
    return Array.from(this.elements.values())
  }

  getById(id: string): Element | undefined {
    return this.elements.get(id)
  }

  create(element: Element): Element {
    this.elements.set(element.id, { ...element })
    return this.elements.get(element.id)!
  }

  update(id: string, updates: Partial<Element>): Element | undefined {
    const element = this.elements.get(id)
    if (!element) {
      return undefined
    }

    const updated = { ...element, ...updates, id }
    this.elements.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    const element = this.elements.get(id)
    if (!element) {
      return false
    }

    const isotopes = this.isotopeStore.getByElementId(id)
    isotopes.forEach((isotope) => this.isotopeStore.delete(isotope.id))

    return this.elements.delete(id)
  }
}
