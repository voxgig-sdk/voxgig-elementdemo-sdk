import type { Group } from '../types.js';
export declare class GroupStore {
    private groups;
    constructor();
    seed(group: Group): Group;
    getAll(): Group[];
    getById(id: string): Group | undefined;
}
