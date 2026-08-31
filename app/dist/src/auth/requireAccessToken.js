import { AuthError } from '../utils/errors.js';
// `Bearer <token>`, case-insensitively on the scheme. RFC 7235 makes the
// scheme case-insensitive, and clients disagree about it in practice.
const BEARER = /^bearer\s+(.+)$/i;
// Pull the bearer credential out of an Authorization header.
//
// Returns the token, or throws. A missing header and a malformed one are
// separate messages because they have different fixes — one caller sent no
// credential, the other sent one this server cannot read.
export function bearerToken(request) {
    const header = request.headers.authorization;
    if (null == header || '' === header.trim()) {
        throw new AuthError('missing Authorization header: expected `Authorization: Bearer <access-token>`');
    }
    const match = BEARER.exec(header.trim());
    if (null == match) {
        throw new AuthError('malformed Authorization header: expected `Authorization: Bearer <access-token>`');
    }
    return match[1].trim();
}
// The onRequest hook every account-scoped API route runs.
//
// onRequest rather than preHandler: it is the earliest hook with the route
// params resolved, so an unauthenticated request is refused before its body
// is parsed or validated. A caller with no credential should not be able to
// tell a 400 from a 401 by the shape of its own payload.
//
// The hook is registered on an ENCAPSULATED scope (see routes/index.ts), so
// the token endpoint that issues the credential sits outside it — a route
// that required the credential it hands out could never be called.
export async function requireAccessToken(request) {
    const accountId = request.params.account_id;
    if (null == accountId || '' === accountId) {
        throw new AuthError('missing account id in request path');
    }
    const token = bearerToken(request);
    // Spending the use is the authentication: consume() rejects an unknown,
    // spent or wrong-account token, and otherwise counts this request against
    // the token's four.
    request.server.accountStore.consume(token, accountId);
}
//# sourceMappingURL=requireAccessToken.js.map