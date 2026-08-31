import { describe, test, beforeEach, afterEach } from 'node:test'
import { strictEqual } from 'node:assert'
import { build } from '../../src/server.js'
import type { FastifyInstance } from 'fastify'
import { apiClient } from '../setup.js'

describe('Isotope API Integration', () => {
  let app: FastifyInstance
  let api: ReturnType<typeof apiClient>

  // Per TEST, not per file. build() re-reads element.data.json into fresh
  // stores (src/server.ts), so every test starts from the seed — see the note
  // in element.integration.test.ts.
  beforeEach(async () => {
    app = await build()
    api = apiClient(app)
  })

  afterEach(async () => {
    await app.close()
  })

  test('GET /api/:account_id/element/:element_id/isotope returns isotopes for element', async () => {
    const res = await api.inject({
      method: 'GET',
      url: '/element/h/isotope',
    })

    strictEqual(res.statusCode, 200)
    const isotopes = JSON.parse(res.payload)
    strictEqual(isotopes.length, 3)
    strictEqual(isotopes[0].name, 'Hydrogen-1')
  })

  test('GET /api/:account_id/element/:element_id/isotope returns 404 for non-existent element', async () => {
    const res = await api.inject({
      method: 'GET',
      url: '/element/non-existent/isotope',
    })

    strictEqual(res.statusCode, 404)
  })

  test('GET /api/:account_id/element/:element_id/isotope/:isotope_id returns specific isotope', async () => {
    const res = await api.inject({
      method: 'GET',
      url: '/element/h/isotope/h-2',
    })

    strictEqual(res.statusCode, 200)
    const isotope = JSON.parse(res.payload)
    strictEqual(isotope.id, 'h-2')
    strictEqual(isotope.name, 'Hydrogen-2')
    strictEqual(isotope.element_id, 'h')
    strictEqual(isotope.stable, true)
  })

  test('GET /api/:account_id/element/:element_id/isotope/:isotope_id returns 404 for non-existent isotope', async () => {
    const res = await api.inject({
      method: 'GET',
      url: '/element/h/isotope/non-existent',
    })

    strictEqual(res.statusCode, 404)
  })

  test('full isotope lifecycle', async () => {
    const createRes = await api.inject({
      method: 'POST',
      url: '/element/c/isotope',
      payload: {
        name: 'Carbon-11',
        element_id: 'c',
        mass_number: 11,
        mass: 11.011433,
        stable: false,
        halflife: '20.4 min',
        mode: 'beta+',
        product: 'b-11',
      },
    })
    strictEqual(createRes.statusCode, 201)
    const created = JSON.parse(createRes.payload)
    const isotopeId = created.id

    const getRes = await api.inject({
      method: 'GET',
      url: `/element/c/isotope/${isotopeId}`,
    })
    strictEqual(getRes.statusCode, 200)
    const isotope = JSON.parse(getRes.payload)
    strictEqual(isotope.name, 'Carbon-11')

    const updateRes = await api.inject({
      method: 'PUT',
      url: `/element/c/isotope/${isotopeId}`,
      payload: {
        name: 'Updated Carbon-11',
        element_id: 'c',
        mass_number: 11,
        mass: 11.011433,
        stable: false,
      },
    })
    strictEqual(updateRes.statusCode, 200)
    const updated = JSON.parse(updateRes.payload)
    strictEqual(updated.name, 'Updated Carbon-11')

    const deleteRes = await api.inject({
      method: 'DELETE',
      url: `/element/c/isotope/${isotopeId}`,
    })
    strictEqual(deleteRes.statusCode, 204)

    const notFoundRes = await api.inject({
      method: 'GET',
      url: `/element/c/isotope/${isotopeId}`,
    })
    strictEqual(notFoundRes.statusCode, 404)
  })

  test('POST /api/:account_id/element/:element_id/isotope returns 404 for non-existent element', async () => {
    const res = await api.inject({
      method: 'POST',
      url: '/element/non-existent/isotope',
      payload: {
        name: 'Test Isotope',
        element_id: 'non-existent',
        mass_number: 1,
        mass: 1.0,
        stable: true,
      },
    })

    strictEqual(res.statusCode, 404)
  })

  test('POST /api/:account_id/element/:element_id/isotope validates element_id match', async () => {
    const res = await api.inject({
      method: 'POST',
      url: '/element/h/isotope',
      payload: {
        name: 'Test Isotope',
        element_id: 'he',
        mass_number: 1,
        mass: 1.0,
        stable: true,
      },
    })

    strictEqual(res.statusCode, 400)
  })

  test('filtering isotopes by element_id', async () => {
    const feRes = await api.inject({
      method: 'GET',
      url: '/element/fe/isotope',
    })

    strictEqual(feRes.statusCode, 200)
    const feIsotopes = JSON.parse(feRes.payload)
    strictEqual(feIsotopes.length, 4)

    const uRes = await api.inject({
      method: 'GET',
      url: '/element/u/isotope',
    })

    strictEqual(uRes.statusCode, 200)
    const uIsotopes = JSON.parse(uRes.payload)
    strictEqual(uIsotopes.length, 3)
  })

  // C3 — the parent id in the path is part of the identity. Matching on
  // isotope_id alone would let an isotope be read, mutated or destroyed
  // through an element it does not belong to.
  describe('nested routes enforce the parent element_id', () => {
    // h-2 belongs to h; address it under fe.
    test('GET under the wrong parent returns 404', async () => {
      const right = await api.inject({
        method: 'GET',
        url: '/element/h/isotope/h-2',
      })
      strictEqual(right.statusCode, 200)

      const wrong = await api.inject({
        method: 'GET',
        url: '/element/fe/isotope/h-2',
      })
      strictEqual(wrong.statusCode, 404)
    })

    test('PUT under the wrong parent returns 404 and does not mutate', async () => {
      const res = await api.inject({
        method: 'PUT',
        url: '/element/fe/isotope/h-2',
        payload: { name: 'Hijacked' },
      })
      strictEqual(res.statusCode, 404)

      const h2 = JSON.parse(
        (await api.inject({ method: 'GET', url: '/element/h/isotope/h-2' }))
          .payload
      )
      strictEqual(h2.name, 'Hydrogen-2')
    })

    test('DELETE under the wrong parent returns 404 and does not delete', async () => {
      const res = await api.inject({
        method: 'DELETE',
        url: '/element/fe/isotope/h-2',
      })
      strictEqual(res.statusCode, 404)

      const still = await api.inject({
        method: 'GET',
        url: '/element/h/isotope/h-2',
      })
      strictEqual(still.statusCode, 200)
    })

    test('PUT cannot reparent an isotope via the body', async () => {
      const res = await api.inject({
        method: 'PUT',
        url: '/element/h/isotope/h-2',
        payload: { element_id: 'fe' },
      })
      strictEqual(res.statusCode, 400)

      const h2 = JSON.parse(
        (await api.inject({ method: 'GET', url: '/element/h/isotope/h-2' }))
          .payload
      )
      strictEqual(h2.element_id, 'h')
    })
  })

  // C1 — client-supplied ids, same contract as element create.
  test('POST isotope honours a client-supplied id and rejects duplicates', async () => {
    const created = await api.inject({
      method: 'POST',
      url: '/element/h/isotope',
      payload: {
        id: 'h-4',
        name: 'Hydrogen-4',
        element_id: 'h',
        mass_number: 4,
        mass: 4.026431,
        stable: false,
        halflife: '139 ys',
        mode: 'n',
        product: 'h-3',
      },
    })
    strictEqual(created.statusCode, 201)
    strictEqual(JSON.parse(created.payload).id, 'h-4')

    const dup = await api.inject({
      method: 'POST',
      url: '/element/h/isotope',
      payload: {
        id: 'h-4',
        name: 'Impostor',
        element_id: 'h',
        mass_number: 4,
        mass: 4.0,
        stable: true,
      },
    })
    strictEqual(dup.statusCode, 409)

    await api.inject({
      method: 'DELETE',
      url: '/element/h/isotope/h-4',
    })
  })

  describe('POST decay walks the decay chain', () => {
    test('a stable isotope does not decay', async () => {
      const res = await api.inject({
        method: 'POST',
        url: '/element/he/isotope/he-4/decay',
        payload: {},
      })

      strictEqual(res.statusCode, 200)
      const body = JSON.parse(res.payload)
      strictEqual(body.ok, false)
      strictEqual(body.mode, 'stable')
      strictEqual(body.product, undefined, 'a non-decay reports no product')
    })

    test('a single step reports the record\'s own mode and product', async () => {
      const res = await api.inject({
        method: 'POST',
        url: '/element/c/isotope/c-14/decay',
        payload: { steps: 1 },
      })

      strictEqual(res.statusCode, 200)
      const body = JSON.parse(res.payload)
      strictEqual(body.ok, true)
      strictEqual(body.mode, 'beta-')
      strictEqual(body.product, 'n-14')
    })

    test('steps defaults to 1', async () => {
      const res = await api.inject({
        method: 'POST',
        url: '/element/c/isotope/c-14/decay',
        payload: {},
      })

      strictEqual(res.statusCode, 200)
      strictEqual(JSON.parse(res.payload).product, 'n-14')
    })

    test('the chain stops early when the product is not in the store', async () => {
      // u-238's product th-234 is not a record, so even steps: 3 applies
      // exactly one decay and reports where the chain left the store.
      const res = await api.inject({
        method: 'POST',
        url: '/element/u/isotope/u-238/decay',
        payload: { steps: 3 },
      })

      strictEqual(res.statusCode, 200)
      const body = JSON.parse(res.payload)
      strictEqual(body.ok, true)
      strictEqual(body.mode, 'alpha')
      strictEqual(body.product, 'th-234')
    })

    test('the chain follows an unstable product for a further step', async () => {
      // ra-226 -> rn-222 (a record, unstable) -> po-218 (not a record): two
      // steps apply, the third cannot.
      const res = await api.inject({
        method: 'POST',
        url: '/element/ra/isotope/ra-226/decay',
        payload: { steps: 3 },
      })

      strictEqual(res.statusCode, 200)
      const body = JSON.parse(res.payload)
      strictEqual(body.ok, true)
      strictEqual(body.mode, 'alpha')
      strictEqual(body.product, 'po-218')
    })

    test('the chain stops early when the product is stable', async () => {
      // h-3 -> he-3, which is a record but stable: one step, however many
      // are asked for.
      const res = await api.inject({
        method: 'POST',
        url: '/element/h/isotope/h-3/decay',
        payload: { steps: 5 },
      })

      strictEqual(res.statusCode, 200)
      const body = JSON.parse(res.payload)
      strictEqual(body.ok, true)
      strictEqual(body.mode, 'beta-')
      strictEqual(body.product, 'he-3')
    })

    test('steps limits how far an intact chain is walked', async () => {
      // ra-226 with steps: 1 stops at rn-222 even though rn-222 is itself
      // unstable — the limit, not the chain, ends the walk.
      const res = await api.inject({
        method: 'POST',
        url: '/element/ra/isotope/ra-226/decay',
        payload: { steps: 1 },
      })

      strictEqual(res.statusCode, 200)
      const body = JSON.parse(res.payload)
      strictEqual(body.ok, true)
      strictEqual(body.mode, 'alpha')
      strictEqual(body.product, 'rn-222')
    })

    test('decay on a non-existent isotope returns 404', async () => {
      const res = await api.inject({
        method: 'POST',
        url: '/element/h/isotope/non-existent/decay',
        payload: {},
      })

      strictEqual(res.statusCode, 404)
    })

    test('decay under the wrong parent returns 404', async () => {
      const res = await api.inject({
        method: 'POST',
        url: '/element/fe/isotope/c-14/decay',
        payload: {},
      })

      strictEqual(res.statusCode, 404)
    })

    test('decay on a non-existent element returns 404', async () => {
      const res = await api.inject({
        method: 'POST',
        url: '/element/non-existent/isotope/c-14/decay',
        payload: {},
      })

      strictEqual(res.statusCode, 404)
    })
  })
  // ISOLATION GUARD — the same pair element.integration.test.ts carries.
  // These run in declaration order, the first deliberately leaves an isotope
  // behind, the second requires it gone.
  test('isolation guard: leave an isotope behind', async () => {
    const res = await api.inject({
      method: 'POST',
      url: '/element/h/isotope',
      payload: {
        id: 'isolation-probe-isotope', element_id: 'h',
        name: 'Probe', mass_number: 9, mass: 9.0, stable: true,
      },
    })
    strictEqual(res.statusCode, 201)
  })

  test('isolation guard: the next test cannot see it', async () => {
    const res = await api.inject({
      method: 'GET',
      url: '/element/h/isotope/isolation-probe-isotope',
    })
    strictEqual(res.statusCode, 404,
      'an isotope created by the previous test survived — the suite is sharing ' +
      'one server again, so its assertions are order-dependent')
  })
})
