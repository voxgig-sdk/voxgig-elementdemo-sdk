import type { ElementStore } from './store/ElementStore.js';
import type { IsotopeStore } from './store/IsotopeStore.js';
import type { GroupStore } from './store/GroupStore.js';
import type { SeriesStore } from './store/SeriesStore.js';
export interface Element {
    id: string;
    name: string;
    symbol: string;
    number: number;
    period: number;
    block: string;
    series_id: string;
    mass: number;
    group?: number;
    phase?: string;
    discovered?: number;
}
export interface Isotope {
    id: string;
    element_id: string;
    name: string;
    mass_number: number;
    mass: number;
    stable: boolean;
    abundance?: number;
    halflife?: string;
    mode?: string;
    product?: string;
}
export interface Group {
    id: string;
    number: number;
    cas: string;
    name?: string;
}
export interface Series {
    id: string;
    name: string;
    color: string;
    description: string;
}
export interface IonizeRequest {
    charge?: number;
}
export interface IonizeResponse {
    ok: boolean;
    ion: string;
}
export interface DecayRequest {
    steps?: number;
}
export interface DecayResponse {
    ok: boolean;
    mode: string;
    product?: string;
}
export type CreateElementInput = Omit<Element, 'id'> & {
    id?: string;
};
export type UpdateElementInput = Partial<Element>;
export type CreateIsotopeInput = Omit<Isotope, 'id'> & {
    id?: string;
};
export type UpdateIsotopeInput = Partial<Isotope>;
declare module 'fastify' {
    interface FastifyInstance {
        elementStore: ElementStore;
        isotopeStore: IsotopeStore;
        groupStore: GroupStore;
        seriesStore: SeriesStore;
    }
}
