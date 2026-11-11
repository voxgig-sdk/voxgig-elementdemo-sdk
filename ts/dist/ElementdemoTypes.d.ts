export interface Element {
    block: string;
    discovered?: number;
    group?: number;
    id: string;
    mass: number;
    name: string;
    number: number;
    period: number;
    phase?: string;
    series_id: string;
    symbol: string;
}
export interface ElementLoadMatch {
    id: string;
}
export interface ElementListMatch {
    block?: string;
    discovered?: number;
    group?: number;
    id?: string;
    mass?: number;
    name?: string;
    number?: number;
    period?: number;
    phase?: string;
    series_id?: string;
    symbol?: string;
}
export interface ElementCreateData {
    block: string;
    discovered?: number;
    group?: number;
    id: string;
    mass: number;
    name: string;
    number: number;
    period: number;
    phase?: string;
    series_id: string;
    symbol: string;
    $action?: string;
    [action: string]: any;
}
export interface ElementUpdateData {
    id: string;
    block?: string;
    discovered?: number;
    group?: number;
    mass?: number;
    name?: string;
    number?: number;
    period?: number;
    phase?: string;
    series_id?: string;
    symbol?: string;
}
export interface ElementRemoveMatch {
    id: string;
}
export interface Group {
    cas: string;
    id: string;
    name?: string;
    number: number;
}
export interface GroupLoadMatch {
    id: string;
}
export interface GroupListMatch {
    cas?: string;
    id?: string;
    name?: string;
    number?: number;
}
export interface Isotope {
    abundance?: number;
    element_id: string;
    halflife?: string;
    id: string;
    mass: number;
    mass_number: number;
    mode?: string;
    name: string;
    product?: string;
    stable: boolean;
}
export interface IsotopeLoadMatch {
    element_id: string;
    id: string;
}
export interface IsotopeListMatch {
    element_id: string;
}
export interface IsotopeCreateData {
    element_id: string;
    abundance?: number;
    halflife?: string;
    id: string;
    mass: number;
    mass_number: number;
    mode?: string;
    name: string;
    product?: string;
    stable: boolean;
    $action?: string;
    [action: string]: any;
}
export interface IsotopeUpdateData {
    element_id: string;
    id: string;
    abundance?: number;
    halflife?: string;
    mass?: number;
    mass_number?: number;
    mode?: string;
    name?: string;
    product?: string;
    stable?: boolean;
}
export interface IsotopeRemoveMatch {
    element_id: string;
    id: string;
}
export interface Series {
    color: string;
    description: string;
    id: string;
    name: string;
}
export interface SeriesLoadMatch {
    id: string;
}
export interface SeriesListMatch {
    color?: string;
    description?: string;
    id?: string;
    name?: string;
}
