import type { Isotope } from '../types.js'

export class IsotopeStore {
  private isotopes: Map<string, Isotope>

  constructor() {
    this.isotopes = new Map()
  }

  getAll(): Isotope[] {
    return Array.from(this.isotopes.values())
  }

  getById(id: string): Isotope | undefined {
    return this.isotopes.get(id)
  }

  getByElementId(elementId: string): Isotope[] {
    return Array.from(this.isotopes.values()).filter(
      (isotope) => isotope.element_id === elementId
    )
  }

  create(isotope: Isotope): Isotope {
    this.isotopes.set(isotope.id, { ...isotope })
    return this.isotopes.get(isotope.id)!
  }

  update(id: string, updates: Partial<Isotope>): Isotope | undefined {
    const isotope = this.isotopes.get(id)
    if (!isotope) {
      return undefined
    }

    const updated = { ...isotope, ...updates, id }
    this.isotopes.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.isotopes.delete(id)
  }
}
