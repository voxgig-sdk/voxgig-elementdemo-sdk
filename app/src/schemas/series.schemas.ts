// Series are read-only: list and get only, exactly like group.schemas.ts.
export const seriesSchemas = {
  list: {
    response: {
      200: {
        type: 'array',
        items: { $ref: 'series#' },
      },
    },
  },
  get: {
    params: {
      type: 'object',
      required: ['series_id'],
      properties: {
        series_id: { type: 'string' },
      },
    },
    response: {
      200: { $ref: 'series#' },
      404: { $ref: 'error#' },
    },
  },
}
