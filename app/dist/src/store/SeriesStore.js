// READ-ONLY store, same shape and rationale as GroupStore: list and load are
// the only operations the API defines, so `seed` (startup load only) is the
// single way records get in.
export class SeriesStore {
    series;
    constructor() {
        this.series = new Map();
    }
    seed(series) {
        this.series.set(series.id, { ...series });
        return this.series.get(series.id);
    }
    getAll() {
        return Array.from(this.series.values());
    }
    getById(id) {
        return this.series.get(id);
    }
}
//# sourceMappingURL=SeriesStore.js.map