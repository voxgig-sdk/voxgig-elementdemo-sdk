import type { FastifyInstance } from 'fastify'
import authRoutes from './auth.routes.js'
import elementRoutes from './element.routes.js'
import isotopeRoutes from './isotope.routes.js'
import groupRoutes from './group.routes.js'
import seriesRoutes from './series.routes.js'
import { debugRouteEnabled } from '../config.js'
import { requireAccessToken } from '../auth/requireAccessToken.js'

// Every API path is account-scoped: /api/<account-id>/<resource>. The
// account is a routing PARAMETER, not a header or a query value, because
// it is part of the resource's identity — and because that puts it in the
// one place an OpenAPI server URL can carry it
// (http://localhost:8902/api/{account_id}), which is what lets a generated
// SDK take it as a construction option and never mention it again.
const ACCOUNT_PREFIX = '/api/:account_id'

export default async function routes(fastify: FastifyInstance) {
  fastify.addSchema({
    $id: 'element',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      symbol: { type: 'string' },
      number: { type: 'integer' },
      period: { type: 'integer' },
      block: { type: 'string' },
      series_id: { type: 'string' },
      mass: { type: 'number' },
      group: { type: 'integer' },
      phase: { type: 'string' },
      discovered: { type: 'integer' },
    },
  })

  fastify.addSchema({
    $id: 'isotope',
    type: 'object',
    properties: {
      id: { type: 'string' },
      element_id: { type: 'string' },
      name: { type: 'string' },
      mass_number: { type: 'integer' },
      mass: { type: 'number' },
      stable: { type: 'boolean' },
      abundance: { type: 'number' },
      halflife: { type: 'string' },
      mode: { type: 'string' },
      product: { type: 'string' },
    },
  })

  fastify.addSchema({
    $id: 'group',
    type: 'object',
    properties: {
      id: { type: 'string' },
      number: { type: 'integer' },
      cas: { type: 'string' },
      name: { type: 'string' },
    },
  })

  fastify.addSchema({
    $id: 'series',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      color: { type: 'string' },
      description: { type: 'string' },
    },
  })

  fastify.addSchema({
    $id: 'error',
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
    },
  })

  // Registered only when it cannot be reached off-box. See debugRouteEnabled:
  // this dumps the whole store with no auth and is not in the OpenAPI
  // definition, so on a non-loopback bind it is a data-disclosure endpoint.
  // Not registering beats registering-and-refusing: there is then no route to
  // find, and no handler that a later edit could accidentally un-guard.
  if (debugRouteEnabled()) {
    fastify.get('/debug', async (request, reply) => {
      reply.send({
        data: {
          element: fastify.elementStore.getAll(),
          isotope: fastify.isotopeStore.getAll(),
          group: fastify.groupStore.getAll(),
          series: fastify.seriesStore.getAll(),
        },
      })
    })
  }

  // The token endpoint: account-scoped, but NOT behind the access-token
  // hook — it is what issues access tokens. Its own scope, so the hook
  // registered on the sibling scope below cannot reach it.
  await fastify.register(authRoutes, { prefix: ACCOUNT_PREFIX })

  // Everything else: account-scoped AND authenticated. The hook is added
  // inside the registered plugin, so Fastify's encapsulation confines it to
  // the routes registered in this scope. Adding it at the root instead
  // would apply it to /debug and to the token endpoint too — the second of
  // which could then never be called, since the only way to get a token
  // would be to already have one.
  await fastify.register(async (scope: FastifyInstance) => {
    scope.addHook('onRequest', requireAccessToken)

    await scope.register(elementRoutes)
    await scope.register(isotopeRoutes)
    await scope.register(groupRoutes)
    await scope.register(seriesRoutes)
  }, { prefix: ACCOUNT_PREFIX })
}
