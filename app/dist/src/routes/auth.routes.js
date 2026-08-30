import { authSchemas } from '../schemas/auth.schemas.js';
// The one account-scoped route that does NOT require an access token: it is
// what issues them. Registered on its own scope, outside the one carrying
// the requireAccessToken hook (see routes/index.ts).
//
// Deliberately ABSENT from the OpenAPI definition, like /debug. The
// definition describes the periodic-table resources an SDK generates
// entity classes for; the credential round trip is transport plumbing that
// a generated SDK's auth layer performs, not a resource anyone models as
// an entity. Putting it in the spec would mint an `Auth` entity with a
// `token` operation in five languages, and every SDK would carry it.
export default async function authRoutes(fastify) {
    fastify.post('/auth/token', { schema: authSchemas.token }, async (request, reply) => {
        const { account_id } = request.params;
        const issued = fastify.accountStore.issue(account_id, request.body.refresh_token);
        reply.status(200).send({
            access_token: issued.token,
            token_type: 'Bearer',
            expires_in_requests: fastify.accountStore.maxUses,
        });
    });
}
//# sourceMappingURL=auth.routes.js.map