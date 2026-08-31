import Fastify from 'fastify'
import { readFileSync } from 'node:fs'
import { resolve, dirname, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { config, accountList, accessTokenUses } from './config.js'
import { AccountStore } from './store/AccountStore.js'
import { ElementStore } from './store/ElementStore.js'
import { IsotopeStore } from './store/IsotopeStore.js'
import { GroupStore } from './store/GroupStore.js'
import { SeriesStore } from './store/SeriesStore.js'
import type { Element, Isotope, Group, Series } from './types.js'
import routes from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function build() {
  const fastify = Fastify({
    logger: config.logging,
  })

  // ONE envelope for every failure: { error, message }.
  //
  // Deriving `error` from err.name would only be meaningful for the error
  // classes this app throws. Fastify's own failures carry internal names, so
  // the commonest 400 of all — an Ajv schema violation — would reach clients
  // as
  //
  //     { "error": "Error", "message": "body must have required property 'name'" }
  //
  // and a malformed JSON body as "FastifyError". Fastify sets statusCode 400
  // on a validation error before any handler runs, so the status is the one
  // thing every failure reliably carries.
  //
  // Label per STATUS, not per thrown class.
  //
  // Nothing is lost: the map below reproduces every name this app throws
  // (NotFoundError 404, AuthError 401, ValidationError 400, ConflictError
  // 409), and deriving
  // from the status is what makes Fastify's own failures answer in the same
  // shape as ours.
  const STATUS_ERRORS: Record<number, string> = {
    400: 'ValidationError',
    401: 'AuthError',
    404: 'NotFoundError',
    409: 'ConflictError',
    500: 'InternalServerError',
  }

  fastify.setErrorHandler((error, request, reply) => {
    const err = error as any
    const status =
      'number' === typeof err.statusCode && 400 <= err.statusCode ? err.statusCode : 500

    const name = STATUS_ERRORS[status] ||
      (500 <= status ? 'InternalServerError' : 'RequestError')

    // Only server faults are ours to investigate; a 4xx is the caller's.
    if (500 <= status) {
      request.log.error(err)
    }

    reply.status(status).send({
      error: name,
      message: err.message,
    })
  })

  // Fastify's not-found path NEVER reaches setErrorHandler, so without this the
  // commonest 404 of all — an unmatched route or an unsupported method —
  // would answer with a different shape from every other failure:
  //
  //   {"message":"Route GET:/nope not found","error":"Not Found","statusCode":404}
  //
  // Three fields instead of two, and "Not Found" with a space: exactly the
  // style the error handler above exists to eliminate. This matters doubly
  // here, because group and series are read-only — POST /api/group is an
  // unmatched route by design, and it must fail in the standard envelope.
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'NotFoundError',
      message: `Route ${request.method}:${request.url} not found`,
    })
  })

  // A relative DATA_PATH resolves against the app root rather than the CWD —
  // the default './element.data.json' has to keep working whichever
  // directory the server is started from, and `npm start`, the test
  // harness and validate:full do not agree on that.
  const dataPath = isAbsolute(config.data.initialDataPath)
    ? config.data.initialDataPath
    : resolve(__dirname, '../..', config.data.initialDataPath)
  const rawData = JSON.parse(readFileSync(dataPath, 'utf-8')) as {
    element: Record<string, Element>
    isotope: Record<string, Isotope>
    group: Record<string, Group>
    series: Record<string, Series>
  }

  // Accounts and access-token expiry are read from the environment HERE
  // rather than off the module-level `config`, which is evaluated once at
  // import: a test that varied ACCOUNTS in-process could not otherwise take
  // effect. Same reason debugRouteEnabled reads env at call time.
  const accountStore = new AccountStore(accountList(), accessTokenUses())

  const isotopeStore = new IsotopeStore()
  const elementStore = new ElementStore(isotopeStore)
  const groupStore = new GroupStore()
  const seriesStore = new SeriesStore()

  Object.values(rawData.element).forEach((e) => elementStore.create(e))
  Object.values(rawData.isotope).forEach((i) => isotopeStore.create(i))
  Object.values(rawData.group).forEach((g) => groupStore.seed(g))
  Object.values(rawData.series).forEach((s) => seriesStore.seed(s))

  fastify.decorate('accountStore', accountStore)
  fastify.decorate('elementStore', elementStore)
  fastify.decorate('isotopeStore', isotopeStore)
  fastify.decorate('groupStore', groupStore)
  fastify.decorate('seriesStore', seriesStore)

  fastify.addHook('preParsing', async (request, _reply, payload) => {
    if (
      request.method === 'DELETE' &&
      request.headers['content-type']?.includes('application/json')
    ) {
      const chunks: Buffer[] = []
      for await (const chunk of payload) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk as Buffer)
      }
      const body = Buffer.concat(chunks).toString().trim()
      if (body === '') {
        return Readable.from(Buffer.from('{}'))
      }
      return Readable.from(Buffer.from(body))
    }
    return payload
  })

  await fastify.register(routes)

  return fastify
}

export async function main() {
  const fastify = await build()

  try {
    await fastify.listen({
      host: config.server.host,
      port: config.server.port,
    })
    // The account segment is part of every API path, so a base URL without
    // one is not something a caller can use. Print the form they need, and
    // the accounts this process will actually answer for.
    const base = `http://${config.server.host}:${config.server.port}`
    console.log(`Base URL: ${base}/api/<account-id>`)
    console.log(`Accounts: ${fastify.accountStore.accountIds().join(', ')}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
