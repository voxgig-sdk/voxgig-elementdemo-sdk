import type { Isotope } from '../types.js';
export declare class IsotopeStore {
    private isotopes;
    constructor();
    getAll(): Isotope[];
    getById(id: string): Isotope | undefined;
    getByElementId(elementId: string): Isotope[];
    create(isotope: Isotope): Isotope;
    update(id: string, updates: Partial<Isotope>): Isotope | undefined;
    delete(id: string): boolean;
}
