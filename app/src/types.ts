import type { AccountStore } from './store/AccountStore.js'
import type { ElementStore } from './store/ElementStore.js'
import type { IsotopeStore } from './store/IsotopeStore.js'
import type { GroupStore } from './store/GroupStore.js'
import type { SeriesStore } from './store/SeriesStore.js'

export interface Element {
  id: string
  name: string
  symbol: string
  number: number
  period: number
  block: string
  series_id: string
  mass: number
  group?: number
  phase?: string
  discovered?: number
}

export interface Isotope {
  id: string
  element_id: string
  name: string
  mass_number: number
  mass: number
  stable: boolean
  abundance?: number
  halflife?: string
  mode?: string
  product?: string
}

// Group and Series are READ-ONLY reference data: the OpenAPI definition
// exposes only list and load for them, so there are no Create/Update input
// types below and the stores carry no write methods beyond the startup seed.
export interface Group {
  id: string
  number: number
  cas: string
  name?: string
}

export interface Series {
  id: string
  name: string
  color: string
  description: string
}

// An API account. `id` is the `<account-id>` segment every API path
// carries; `refresh_token` is the long-lived secret that buys access
// tokens for it.
export interface Account {
  id: string
  refresh_token: string
}

// An issued access token and how much life it has left. `uses` counts
// requests, not seconds — see AccountStore.
export interface AccessToken {
  token: string
  account_id: string
  uses: number
}

export interface TokenRequest {
  refresh_token: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  // Requests, not seconds: this API expires access tokens by use count so
  // a client's refresh path can be tested deterministically.
  expires_in_requests: number
}

export interface IonizeRequest {
  charge?: number
}

export interface IonizeResponse {
  ok: boolean
  ion: string
}

export interface DecayRequest {
  steps?: number
}

export interface DecayResponse {
  ok: boolean
  mode: string
  product?: string
}

// `id` is OPTIONAL on create, not absent: OpenAPI and the generated SDK types
// both require the client to supply one, and the server generates it only when
// it is omitted. `Omit<_, 'id'>` alone would make the handlers overwrite it.
export type CreateElementInput = Omit<Element, 'id'> & { id?: string }
export type UpdateElementInput = Partial<Element>
export type CreateIsotopeInput = Omit<Isotope, 'id'> & { id?: string }
export type UpdateIsotopeInput = Partial<Isotope>

declare module 'fastify' {
  interface FastifyInstance {
    accountStore: AccountStore
    elementStore: ElementStore
    isotopeStore: IsotopeStore
    groupStore: GroupStore
    seriesStore: SeriesStore
  }
}
