export const authSchemas = {
  token: {
    params: {
      type: 'object',
      required: ['account_id'],
      properties: {
        account_id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      required: ['refresh_token'],
      properties: {
        refresh_token: { type: 'string' },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          token_type: { type: 'string' },
          expires_in_requests: { type: 'integer' },
        },
      },
      400: { $ref: 'error#' },
      401: { $ref: 'error#' },
    },
  },
}
