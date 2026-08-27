export class ElementStore {
    elements;
    isotopeStore;
    constructor(isotopeStore) {
        this.elements = new Map();
        this.isotopeStore = isotopeStore;
    }
    getAll() {
        return Array.from(this.elements.values());
    }
    getById(id) {
        return this.elements.get(id);
    }
    create(element) {
        this.elements.set(element.id, { ...element });
        return this.elements.get(element.id);
    }
    update(id, updates) {
        const element = this.elements.get(id);
        if (!element) {
            return undefined;
        }
        const updated = { ...element, ...updates, id };
        this.elements.set(id, updated);
        return updated;
    }
    delete(id) {
        const element = this.elements.get(id);
        if (!element) {
            return false;
        }
        const isotopes = this.isotopeStore.getByElementId(id);
        isotopes.forEach((isotope) => this.isotopeStore.delete(isotope.id));
        return this.elements.delete(id);
    }
}
//# sourceMappingURL=ElementStore.js.map