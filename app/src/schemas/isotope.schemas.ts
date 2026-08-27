export const isotopeSchemas = {
  list: {
    params: {
      type: 'object',
      required: ['element_id'],
      properties: {
        element_id: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'array',
        items: { $ref: 'isotope#' },
      },
      404: { $ref: 'error#' },
    },
  },
  get: {
    params: {
      type: 'object',
      required: ['element_id', 'isotope_id'],
      properties: {
        element_id: { type: 'string' },
        isotope_id: { type: 'string' },
      },
    },
    response: {
      200: { $ref: 'isotope#' },
      404: { $ref: 'error#' },
    },
  },
  create: {
    params: {
      type: 'object',
      required: ['element_id'],
      properties: {
        element_id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      required: ['element_id', 'name', 'mass_number', 'mass', 'stable'],
      properties: {
        // See the note in element.schemas.ts: OpenAPI's Isotope schema
        // requires `id` on create and the SDK always sends one. Optional here
        // so omitting it still generates an id.
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
      additionalProperties: false,
    },
    response: {
      201: { $ref: 'isotope#' },
      400: { $ref: 'error#' },
      404: { $ref: 'error#' },
      409: { $ref: 'error#' },
    },
  },
  update: {
    params: {
      type: 'object',
      required: ['element_id', 'isotope_id'],
      properties: {
        element_id: { type: 'string' },
        isotope_id: { type: 'string' },
      },
    },
    body: {
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
      additionalProperties: false,
    },
    response: {
      200: { $ref: 'isotope#' },
      404: { $ref: 'error#' },
    },
  },
  delete: {
    params: {
      type: 'object',
      required: ['element_id', 'isotope_id'],
      properties: {
        element_id: { type: 'string' },
        isotope_id: { type: 'string' },
      },
    },
    response: {
      204: {
        type: 'null',
      },
      404: { $ref: 'error#' },
    },
  },
  decay: {
    params: {
      type: 'object',
      required: ['element_id', 'isotope_id'],
      properties: {
        element_id: { type: 'string' },
        isotope_id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      properties: {
        steps: { type: 'integer' },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          mode: { type: 'string' },
          product: { type: 'string' },
        },
      },
      404: { $ref: 'error#' },
    },
  },
}
