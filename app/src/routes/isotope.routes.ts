import type { FastifyInstance } from 'fastify'
import { isotopeHandlers } from '../handlers/isotope.handlers.js'
import { isotopeSchemas } from '../schemas/isotope.schemas.js'

export default async function isotopeRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/api/element/:element_id/isotope',
    { schema: isotopeSchemas.list },
    isotopeHandlers.list
  )

  fastify.get(
    '/api/element/:element_id/isotope/:isotope_id',
    { schema: isotopeSchemas.get },
    isotopeHandlers.get
  )

  fastify.post(
    '/api/element/:element_id/isotope',
    { schema: isotopeSchemas.create },
    isotopeHandlers.create
  )

  fastify.put(
    '/api/element/:element_id/isotope/:isotope_id',
    { schema: isotopeSchemas.update },
    isotopeHandlers.update
  )

  fastify.delete(
    '/api/element/:element_id/isotope/:isotope_id',
    { schema: isotopeSchemas.delete },
    isotopeHandlers.delete
  )

  fastify.post(
    '/api/element/:element_id/isotope/:isotope_id/decay',
    { schema: isotopeSchemas.decay },
    isotopeHandlers.decay
  )
}
