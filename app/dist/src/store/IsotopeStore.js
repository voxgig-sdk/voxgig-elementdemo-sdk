export class IsotopeStore {
    isotopes;
    constructor() {
        this.isotopes = new Map();
    }
    getAll() {
        return Array.from(this.isotopes.values());
    }
    getById(id) {
        return this.isotopes.get(id);
    }
    getByElementId(elementId) {
        return Array.from(this.isotopes.values()).filter((isotope) => isotope.element_id === elementId);
    }
    create(isotope) {
        this.isotopes.set(isotope.id, { ...isotope });
        return this.isotopes.get(isotope.id);
    }
    update(id, updates) {
        const isotope = this.isotopes.get(id);
        if (!isotope) {
            return undefined;
        }
        const updated = { ...isotope, ...updates, id };
        this.isotopes.set(id, updated);
        return updated;
    }
    delete(id) {
        return this.isotopes.delete(id);
    }
}
//# sourceMappingURL=IsotopeStore.js.map