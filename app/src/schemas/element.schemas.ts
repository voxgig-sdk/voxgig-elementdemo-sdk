export const elementSchemas = {
  list: {
    response: {
      200: {
        type: 'array',
        items: { $ref: 'element#' },
      },
    },
  },
  get: {
    params: {
      type: 'object',
      required: ['element_id'],
      properties: {
        element_id: { type: 'string' },
      },
    },
    response: {
      200: { $ref: 'element#' },
      404: { $ref: 'error#' },
    },
  },
  create: {
    body: {
      type: 'object',
      required: ['name', 'symbol', 'number', 'period', 'block', 'series_id', 'mass'],
      properties: {
        // OpenAPI's POST /api/element body is the full Element schema, which
        // requires `id`, and the generated SDK create type likewise requires
        // it — so every SDK caller sends one. Accepted here, and optional so
        // the server stays a superset of the spec: omit it and one is
        // generated.
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
      additionalProperties: false,
    },
    response: {
      201: { $ref: 'element#' },
      400: { $ref: 'error#' },
      409: { $ref: 'error#' },
    },
  },
  update: {
    params: {
      type: 'object',
      required: ['element_id'],
      properties: {
        element_id: { type: 'string' },
      },
    },
    body: {
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
      additionalProperties: false,
    },
    response: {
      200: { $ref: 'element#' },
      404: { $ref: 'error#' },
    },
  },
  delete: {
    params: {
      type: 'object',
      required: ['element_id'],
      properties: {
        element_id: { type: 'string' },
      },
    },
    response: {
      204: {
        type: 'null',
      },
      404: { $ref: 'error#' },
    },
  },
  ionize: {
    params: {
      type: 'object',
      required: ['element_id'],
      properties: {
        element_id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      properties: {
        charge: { type: 'integer' },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          ion: { type: 'string' },
        },
      },
      404: { $ref: 'error#' },
    },
  },
}
