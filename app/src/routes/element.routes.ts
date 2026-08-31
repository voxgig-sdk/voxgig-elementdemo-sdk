import type { FastifyInstance } from 'fastify'
import { elementHandlers } from '../handlers/element.handlers.js'
import { elementSchemas } from '../schemas/element.schemas.js'

export default async function elementRoutes(fastify: FastifyInstance) {
  fastify.get('/element', { schema: elementSchemas.list }, elementHandlers.list)

  fastify.get(
    '/element/:element_id',
    { schema: elementSchemas.get },
    elementHandlers.get
  )

  fastify.post(
    '/element',
    { schema: elementSchemas.create },
    elementHandlers.create
  )

  fastify.put(
    '/element/:element_id',
    { schema: elementSchemas.update },
    elementHandlers.update
  )

  fastify.delete(
    '/element/:element_id',
    { schema: elementSchemas.delete },
    elementHandlers.delete
  )

  fastify.post(
    '/element/:element_id/ionize',
    { schema: elementSchemas.ionize },
    elementHandlers.ionize
  )
}
