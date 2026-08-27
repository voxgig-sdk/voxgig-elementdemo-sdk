export class NotFoundError extends Error {
  statusCode = 404

  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends Error {
  statusCode = 400

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Client-supplied ids make a create collide with an existing record. The
// stores are Maps keyed by id, so without this the second create would
// silently overwrite the first and return 201 as though it had inserted.
export class ConflictError extends Error {
  statusCode = 409

  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' already exists`)
    this.name = 'ConflictError'
  }
}
