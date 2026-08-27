import type { FastifyRequest, FastifyReply } from 'fastify'
import { NotFoundError } from '../utils/errors.js'

// Series are READ-ONLY reference data, same surface as groups: list and get.
export const seriesHandlers = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const seriesStore = request.server.seriesStore
    const series = seriesStore.getAll()
    reply.send(series)
  },

  async get(
    request: FastifyRequest<{ Params: { series_id: string } }>,
    reply: FastifyReply
  ) {
    const seriesStore = request.server.seriesStore
    const series = seriesStore.getById(request.params.series_id)

    if (!series) {
      throw new NotFoundError('Series', request.params.series_id)
    }

    reply.send(series)
  },
}
