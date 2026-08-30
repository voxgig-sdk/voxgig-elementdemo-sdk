export class NotFoundError extends Error {
    statusCode = 404;
    constructor(resource, id) {
        super(`${resource} with id '${id}' not found`);
        this.name = 'NotFoundError';
    }
}
export class ValidationError extends Error {
    statusCode = 400;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
// Client-supplied ids make a create collide with an existing record. The
// stores are Maps keyed by id, so without this the second create would
// silently overwrite the first and return 201 as though it had inserted.
export class ConflictError extends Error {
    statusCode = 409;
    constructor(resource, id) {
        super(`${resource} with id '${id}' already exists`);
        this.name = 'ConflictError';
    }
}
// A missing, malformed, unknown or spent credential. 401 rather than 403:
// the caller has not proved who it is, and the fix is to present a
// credential (or refresh the one it has), not to ask for more rights.
export class AuthError extends Error {
    statusCode = 401;
    constructor(message) {
        super(message);
        this.name = 'AuthError';
    }
}
//# sourceMappingURL=errors.js.map