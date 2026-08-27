// READ-ONLY store. The API exposes only list and load for groups, so this
// store has no create/update/delete surface for handlers to reach — `seed`
// exists solely for the startup load in server.ts (and test fixtures).
// Not having the methods beats having-and-not-routing them: there is then
// nothing a later edit could accidentally wire a write route to.
export class GroupStore {
    groups;
    constructor() {
        this.groups = new Map();
    }
    seed(group) {
        this.groups.set(group.id, { ...group });
        return this.groups.get(group.id);
    }
    getAll() {
        return Array.from(this.groups.values());
    }
    getById(id) {
        return this.groups.get(id);
    }
}
//# sourceMappingURL=GroupStore.js.map