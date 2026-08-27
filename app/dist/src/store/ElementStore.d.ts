import type { Element } from '../types.js';
import type { IsotopeStore } from './IsotopeStore.js';
export declare class ElementStore {
    private elements;
    private isotopeStore;
    constructor(isotopeStore: IsotopeStore);
    getAll(): Element[];
    getById(id: string): Element | undefined;
    create(element: Element): Element;
    update(id: string, updates: Partial<Element>): Element | undefined;
    delete(id: string): boolean;
}
