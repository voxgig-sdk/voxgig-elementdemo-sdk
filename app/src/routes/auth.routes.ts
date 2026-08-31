import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { TokenRequest } from '../types.js'
import { authSchemas } from '../schemas/auth.schemas.js'

// The one account-scoped route that does NOT require an access token: it is
// what issues them. Registered on its own scope, outside the one carrying
// the requireAccessToken hook (see routes/index.ts).
//
// DESCRIBED in the OpenAPI definition, unlike /debug. A client cannot
// authenticate without this call, and its request and response bodies are
// as much the contract as any element's, so a real API publishes it — and a
// bespoke exchange like this one (JSON body, no `grant_type`, expiry in
// requests) has nowhere else to live: an `oauth2` scheme's `tokenUrl` would
// misdescribe it.
//
// This is deliberately awkward for a generator. sdkgen has no
// operation-level exclusion, so it mints an `Auth` entity with a `token`
// operation in five languages, which is the wrong shape: a credential
// exchange is auth plumbing, not an entity anyone calls. The definition is
// written the way a real API's would be, and closing that gap is sdkgen's
// job, not this spec's.
export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/auth/token',
    { schema: authSchemas.token },
    async (
      request: FastifyRequest<{
        Params: { account_id: string }
        Body: TokenRequest
      }>,
      reply
    ) => {
      const { account_id } = request.params

      const issued = fastify.accountStore.issue(
        account_id, request.body.refresh_token)

      reply.status(200).send({
        access_token: issued.token,
        token_type: 'Bearer',
        expires_in_requests: fastify.accountStore.maxUses,
      })
    }
  )
}
