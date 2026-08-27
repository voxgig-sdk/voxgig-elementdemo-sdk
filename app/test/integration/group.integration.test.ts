import { describe, test, beforeEach, afterEach } from 'node:test'
import { strictEqual } from 'node:assert'
import { build } from '../../src/server.js'
import type { FastifyInstance } from 'fastify'

describe('Group API Integration', () => {
  let app: FastifyInstance

  // Per TEST, not per file — see the note in element.integration.test.ts.
  // Groups are read-only so nothing here can leak state, but a shared
  // instance would still be an invitation to diverge from the other suites.
  beforeEach(async () => {
    app = await build()
  })

  afterEach(async () => {
    await app.close()
  })

  test('GET /api/group returns all groups', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/group',
    })

    strictEqual(res.statusCode, 200)
    const groups = JSON.parse(res.payload)
    strictEqual(groups.length, 18)
  })

  test('GET /api/group/:group_id returns specific group', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/group/g1',
    })

    strictEqual(res.statusCode, 200)
    const group = JSON.parse(res.payload)
    strictEqual(group.id, 'g1')
    strictEqual(group.number, 1)
    strictEqual(group.cas, 'IA')
    strictEqual(group.name, 'alkali metals')
  })

  test('GET /api/group/:group_id returns 404 for non-existent group', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/group/non-existent',
    })

    strictEqual(res.statusCode, 404)
  })

  // Groups are READ-ONLY: the OpenAPI definition has no create, update or
  // delete for them, so the routes must be ABSENT — a 404 in the standard
  // envelope, exactly like any other unmatched route. Registering a route
  // that refuses would be a different (and wrong) contract.
  test('write methods are not routes at all', async () => {
    const post = await app.inject({
      method: 'POST',
      url: '/api/group',
      payload: { id: 'g19', number: 19, cas: 'XXB' },
    })
    strictEqual(post.statusCode, 404)
    strictEqual(JSON.parse(post.payload).error, 'NotFoundError')

    const put = await app.inject({
      method: 'PUT',
      url: '/api/group/g1',
      payload: { name: 'hijacked' },
    })
    strictEqual(put.statusCode, 404)

    const del = await app.inject({
      method: 'DELETE',
      url: '/api/group/g1',
    })
    strictEqual(del.statusCode, 404)

    // and the record the writes aimed at is untouched
    const g1 = JSON.parse(
      (await app.inject({ method: 'GET', url: '/api/group/g1' })).payload
    )
    strictEqual(g1.name, 'alkali metals')
  })
})
