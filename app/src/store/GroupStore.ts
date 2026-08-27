import type { Group } from '../types.js'

// READ-ONLY store. The API exposes only list and load for groups, so this
// store has no create/update/delete surface for handlers to reach — `seed`
// exists solely for the startup load in server.ts (and test fixtures).
// Not having the methods beats having-and-not-routing them: there is then
// nothing a later edit could accidentally wire a write route to.
export class GroupStore {
  private groups: Map<string, Group>

  constructor() {
    this.groups = new Map()
  }

  seed(group: Group): Group {
    this.groups.set(group.id, { ...group })
    return this.groups.get(group.id)!
  }

  getAll(): Group[] {
    return Array.from(this.groups.values())
  }

  getById(id: string): Group | undefined {
    return this.groups.get(id)
  }
}
