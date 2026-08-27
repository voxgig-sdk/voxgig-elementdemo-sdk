import type { FastifyInstance } from 'fastify'
import elementRoutes from './element.routes.js'
import isotopeRoutes from './isotope.routes.js'
import groupRoutes from './group.routes.js'
import seriesRoutes from './series.routes.js'
import { debugRouteEnabled } from '../config.js'

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

  await fastify.register(elementRoutes)
  await fastify.register(isotopeRoutes)
  await fastify.register(groupRoutes)
  await fastify.register(seriesRoutes)
}
