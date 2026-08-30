import type { FastifyInstance } from 'fastify'
import { groupHandlers } from '../handlers/group.handlers.js'
import { groupSchemas } from '../schemas/group.schemas.js'

// Groups are READ-ONLY per the OpenAPI definition: GET list and GET load are
// the only routes. POST/PUT/DELETE are deliberately not registered, so they
// answer 404 like any other unmatched route — absent, not refused.
export default async function groupRoutes(fastify: FastifyInstance) {
  fastify.get('/group', { schema: groupSchemas.list }, groupHandlers.list)

  fastify.get(
    '/group/:group_id',
    { schema: groupSchemas.get },
    groupHandlers.get
  )
}
