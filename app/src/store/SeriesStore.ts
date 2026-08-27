import type { Series } from '../types.js'

// READ-ONLY store, same shape and rationale as GroupStore: list and load are
// the only operations the API defines, so `seed` (startup load only) is the
// single way records get in.
export class SeriesStore {
  private series: Map<string, Series>

  constructor() {
    this.series = new Map()
  }

  seed(series: Series): Series {
    this.series.set(series.id, { ...series })
    return this.series.get(series.id)!
  }

  getAll(): Series[] {
    return Array.from(this.series.values())
  }

  getById(id: string): Series | undefined {
    return this.series.get(id)
  }
}
