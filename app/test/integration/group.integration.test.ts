import { describe, test, beforeEach, afterEach } from 'node:test'
import { strictEqual } from 'node:assert'
import { build } from '../../src/server.js'
import type { FastifyInstance } from 'fastify'
import { apiClient } from '../setup.js'

describe('Group API Integration', () => {
  let app: FastifyInstance
  let api: ReturnType<typeof apiClient>

  // Per TEST, not per file — see the note in element.integration.test.ts.
  // Groups are read-only so nothing here can leak state, but a shared
  // instance would still be an invitation to diverge from the other suites.
  beforeEach(async () => {
    app = await build()
    api = apiClient(app)
  })

  afterEach(async () => {
    await app.close()
  })

  test('GET /api/:account_id/group returns all groups', async () => {
    const res = await api.inject({
      method: 'GET',
      url: '/group',
    })

    strictEqual(res.statusCode, 200)
    const groups = JSON.parse(res.payload)
    strictEqual(groups.length, 18)
  })

  test('GET /api/:account_id/group/:group_id returns specific group', async () => {
    const res = await api.inject({
      method: 'GET',
      url: '/group/g1',
    })

    strictEqual(res.statusCode, 200)
    const group = JSON.parse(res.payload)
    strictEqual(group.id, 'g1')
    strictEqual(group.number, 1)
    strictEqual(group.cas, 'IA')
    strictEqual(group.name, 'alkali metals')
  })

  test('GET /api/:account_id/group/:group_id returns 404 for non-existent group', async () => {
    const res = await api.inject({
      method: 'GET',
      url: '/group/non-existent',
    })

    strictEqual(res.statusCode, 404)
  })

  // Groups are READ-ONLY: the OpenAPI definition has no create, update or
  // delete for them, so the routes must be ABSENT — a 404 in the standard
  // envelope, exactly like any other unmatched route. Registering a route
  // that refuses would be a different (and wrong) contract.
  test('write methods are not routes at all', async () => {
    const post = await api.inject({
      method: 'POST',
      url: '/group',
      payload: { id: 'g19', number: 19, cas: 'XXB' },
    })
    strictEqual(post.statusCode, 404)
    strictEqual(JSON.parse(post.payload).error, 'NotFoundError')

    const put = await api.inject({
      method: 'PUT',
      url: '/group/g1',
      payload: { name: 'hijacked' },
    })
    strictEqual(put.statusCode, 404)

    const del = await api.inject({
      method: 'DELETE',
      url: '/group/g1',
    })
    strictEqual(del.statusCode, 404)

    // and the record the writes aimed at is untouched
    const g1 = JSON.parse(
      (await api.inject({ method: 'GET', url: '/group/g1' })).payload
    )
    strictEqual(g1.name, 'alkali metals')
  })
})
