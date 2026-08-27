import type { Series } from '../types.js';
export declare class SeriesStore {
    private series;
    constructor();
    seed(series: Series): Series;
    getAll(): Series[];
    getById(id: string): Series | undefined;
}
