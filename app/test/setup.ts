import type {
  FastifyInstance, InjectOptions, LightMyRequestResponse,
} from 'fastify'
import type { Element, Isotope, Group, Series } from '../src/types.js'

export function createTestElement(overrides?: Partial<Element>): Element {
  return {
    id: 'test-element',
    name: 'Test Element',
    symbol: 'Te',
    number: 999,
    period: 7,
    block: 's',
    series_id: 'nonmetal',
    mass: 100.5,
    ...overrides,
  }
}

export function createTestIsotope(overrides?: Partial<Isotope>): Isotope {
  return {
    id: 'test-isotope',
    element_id: 'test-element',
    name: 'Test Isotope',
    mass_number: 100,
    mass: 100.001,
    stable: true,
    ...overrides,
  }
}

export function createTestGroup(overrides?: Partial<Group>): Group {
  return {
    id: 'test-group',
    number: 99,
    cas: 'XXA',
    ...overrides,
  }
}

export function createTestSeries(overrides?: Partial<Series>): Series {
  return {
    id: 'test-series',
    name: 'Test Series',
    color: 'octarine',
    description: 'A series that exists only in tests.',
    ...overrides,
  }
}


// The account and refresh token app/src/config.ts seeds when ACCOUNTS,
// ACCOUNT_ID and REFRESH_TOKEN are all unset — which is how every suite here
// builds the server.
export const TEST_ACCOUNT_ID = 'acc01'
export const TEST_REFRESH_TOKEN = 'rt-elementdemo-dev-refresh-token'


// `url` is required here where InjectOptions leaves it optional: this client
// builds the account prefix onto it, and there is no useful behaviour for a
// call that names no path.
type InjectArgs = InjectOptions & { url: string }
type InjectResult = LightMyRequestResponse


// An authenticated client for the account-scoped API, for suites whose
// subject is a resource rather than the credential flow.
//
// It does the two things every real client of this API has to do, and does
// them so the resource suites do not have to:
//
//   1. prefixes /api/<account-id> onto the path, so a test names the
//      resource (`/element/fe`) and nothing else;
//   2. buys an access token on first use, and buys another whenever one
//      comes back 401 — which happens every fifth request, by design.
//
// (2) is not incidental. An access token here serves FOUR requests, and the
// suites below make far more than four, so without the refresh-and-retry
// every file would start failing partway through for reasons that have
// nothing to do with what it is testing. Retrying once on 401 is exactly
// what the generated SDK's tokenauth feature does — this helper is the same
// contract, written small.
//
// The credential flow itself is NOT tested through this helper: see
// auth.integration.test.ts, which drives app.inject directly so it can
// observe the 401s this one hides.
export function apiClient(
  app: FastifyInstance,
  accountId: string = TEST_ACCOUNT_ID,
  refreshToken: string = TEST_REFRESH_TOKEN,
) {
  let access: string | null = null
  let refreshes = 0

  async function refresh(): Promise<void> {
    const res = await app.inject({
      method: 'POST',
      url: `/api/${accountId}/auth/token`,
      payload: { refresh_token: refreshToken },
    })

    if (200 !== res.statusCode) {
      throw new Error(
        `apiClient: could not obtain an access token: ` +
        `${res.statusCode} ${res.payload}`)
    }

    access = JSON.parse(res.payload).access_token
    refreshes++
  }

  return {
    async inject(opts: InjectArgs): Promise<InjectResult> {
      if (null == access) {
        await refresh()
      }

      const send = () => app.inject({
        ...opts,
        url: `/api/${accountId}${opts.url}`,
        headers: {
          ...(opts.headers || {}),
          authorization: `Bearer ${access}`,
        },
      } as InjectArgs)

      const res = await send()

      // ONE retry. A second 401 on a token this call just bought is a real
      // failure — a wrong account, a revoked refresh token — and looping on
      // it would turn that into a hang instead of a test failure.
      if (401 !== res.statusCode) {
        return res
      }

      await refresh()
      return send()
    },

    // How many times a token had to be bought. auth.integration.test.ts
    // asserts on it; the resource suites ignore it.
    refreshes: () => refreshes,
  }
}
