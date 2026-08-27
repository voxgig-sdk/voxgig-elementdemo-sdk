import { describe, test, before, after } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { FastifyInstance } from 'fastify'

// DATA_PATH is documented in config.ts; this pins that it is actually read,
// and that ALL FOUR collections come from it — a hardcoded seed file, or one
// that only wired up some of the stores, would fail here.
//
// config.ts is evaluated when server.js is first imported, so DATA_PATH has
// to be set BEFORE that import — hence the dynamic import inside before().
// `node --test` runs each test file in its own process, so this cannot leak
// into the other suites, which rely on the default seed data.
describe('DATA_PATH', () => {
  let app: FastifyInstance

  before(async () => {
    const file = join(
      mkdtempSync(join(tmpdir(), 'elementdemo-datapath-')),
      'alt.data.json'
    )

    writeFileSync(
      file,
      JSON.stringify({
        element: {
          xa: {
            id: 'xa', name: 'Xanadium', symbol: 'Xa', number: 200,
            period: 8, block: 's', series_id: 'imaginary', mass: 500.5,
          },
        },
        isotope: {
          'xa-500': {
            id: 'xa-500', element_id: 'xa', name: 'Xanadium-500',
            mass_number: 500, mass: 500.001, stable: true,
          },
        },
        group: {
          g99: { id: 'g99', number: 99, cas: 'XXA', name: 'imaginary metals' },
        },
        series: {
          imaginary: {
            id: 'imaginary', name: 'Imaginary', color: 'octarine',
            description: 'Elements that do not exist.',
          },
        },
      })
    )

    process.env.DATA_PATH = file

    const { build } = await import('../../src/server.js')
    app = await build()
  })

  after(async () => {
    delete process.env.DATA_PATH
    await app.close()
  })

  test('an absolute DATA_PATH replaces the default seed data', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/element' })

    strictEqual(res.statusCode, 200)
    const elements = JSON.parse(res.payload)

    // The default file seeds 118 elements; this one seeds exactly one, so a
    // hardcoded path would show up here as 118 rather than 1.
    strictEqual(elements.length, 1)
    strictEqual(elements[0].id, 'xa')
  })

  test('nested data from DATA_PATH is loaded too', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/element/xa/isotope/xa-500',
    })

    strictEqual(res.statusCode, 200)
    const isotope = JSON.parse(res.payload)
    strictEqual(isotope.name, 'Xanadium-500')
    strictEqual(isotope.element_id, 'xa')
  })

  test('the read-only collections come from DATA_PATH too', async () => {
    const groupRes = await app.inject({ method: 'GET', url: '/api/group' })
    strictEqual(groupRes.statusCode, 200)
    const groups = JSON.parse(groupRes.payload)
    strictEqual(groups.length, 1)
    strictEqual(groups[0].id, 'g99')

    const seriesRes = await app.inject({ method: 'GET', url: '/api/series/imaginary' })
    strictEqual(seriesRes.statusCode, 200)
    strictEqual(JSON.parse(seriesRes.payload).name, 'Imaginary')
  })

  test('an element from the default seed data is absent', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/element/fe' })

    ok(
      404 === res.statusCode,
      'fe comes from the default file — seeing it means DATA_PATH was ignored'
    )
  })
})
