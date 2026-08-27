// Groups are read-only: list and get are the ONLY schemas, matching the only
// routes. There is deliberately no create/update/delete entry here.
export const groupSchemas = {
    list: {
        response: {
            200: {
                type: 'array',
                items: { $ref: 'group#' },
            },
        },
    },
    get: {
        params: {
            type: 'object',
            required: ['group_id'],
            properties: {
                group_id: { type: 'string' },
            },
        },
        response: {
            200: { $ref: 'group#' },
            404: { $ref: 'error#' },
        },
    },
};
//# sourceMappingURL=group.schemas.js.map