// Typed models for the Elementdemo SDK.
//
// GENERATED from the API model: main.kit.entity.<e>.fields[] and per-op
// params (op.<name>.points[].args.params[]). Field/param types come from the
// canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
// @voxgig/apidef VALID_CANON). Do not edit by hand.

export interface Element {
  block: string
  charge?: number
  discovered?: number
  group?: number
  id: string
  ion?: string
  mass: number
  name: string
  number: number
  ok?: boolean
  period: number
  phase?: string
  series_id: string
  symbol: string
}

export interface ElementLoadMatch {
  id: string
}

export interface ElementListMatch {
  block?: string
  charge?: number
  discovered?: number
  group?: number
  id?: string
  ion?: string
  mass?: number
  name?: string
  number?: number
  ok?: boolean
  period?: number
  phase?: string
  series_id?: string
  symbol?: string
}

export interface ElementCreateData {
  block: string
  charge?: number
  discovered?: number
  group?: number
  id: string
  ion?: string
  mass: number
  name: string
  number: number
  ok?: boolean
  period: number
  phase?: string
  series_id: string
  symbol: string

  // Selects a custom action instead of the plain create:
  //   'ionize'
  // The remaining keys are that action's own payload.
  $action?: string
  [action: string]: any
}

export interface ElementUpdateData {
  id: string
  block?: string
  charge?: number
  discovered?: number
  group?: number
  ion?: string
  mass?: number
  name?: string
  number?: number
  ok?: boolean
  period?: number
  phase?: string
  series_id?: string
  symbol?: string
}

export interface ElementRemoveMatch {
  id: string
}

export interface Group {
  cas: string
  id: string
  name?: string
  number: number
}

export interface GroupLoadMatch {
  id: string
}

export interface GroupListMatch {
  cas?: string
  id?: string
  name?: string
  number?: number
}

export interface Isotope {
  abundance?: number
  element_id: string
  halflife?: string
  id: string
  mass: number
  mass_number: number
  mode?: string
  name: string
  ok?: boolean
  product?: string
  stable: boolean
  steps?: number
}

export interface IsotopeLoadMatch {
  element_id: string
  id: string
}

export interface IsotopeListMatch {
  element_id: string
}

export interface IsotopeCreateData {
  element_id: string
  abundance?: number
  halflife?: string
  id: string
  mass: number
  mass_number: number
  mode?: string
  name: string
  ok?: boolean
  product?: string
  stable: boolean
  steps?: number

  // Selects a custom action instead of the plain create:
  //   'decay'
  // The remaining keys are that action's own payload.
  $action?: string
  [action: string]: any
}

export interface IsotopeUpdateData {
  element_id: string
  id: string
  abundance?: number
  halflife?: string
  mass?: number
  mass_number?: number
  mode?: string
  name?: string
  ok?: boolean
  product?: string
  stable?: boolean
  steps?: number
}

export interface IsotopeRemoveMatch {
  element_id: string
  id: string
}

export interface Series {
  color: string
  description: string
  id: string
  name: string
}

export interface SeriesLoadMatch {
  id: string
}

export interface SeriesListMatch {
  color?: string
  description?: string
  id?: string
  name?: string
}

