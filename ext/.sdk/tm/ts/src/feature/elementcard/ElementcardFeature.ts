// elementcard's OVERLAY for the bundled `ts` target.
//
// The bundled ts target's own template tree knows nothing about this
// feature and must not be edited to learn — this package ships the source
// at the layout `ts` uses (`src/feature/<name>/`) under its own `tm/ts`,
// and the fan-out copies it across at `feature add` time.
//
// Renders a result record shaped like an element (number, symbol, name,
// mass) as an ASCII periodic-table tile. Shape-triggered, not entity-bound:
// any single-record result with those four fields gets a card. The card,
// exactly (inner width 9; number left, symbol right; name and mass centred
// with the left bias; integral numbers without a decimal point; names
// truncate at 9):
//
//   +---------+
//   |26     Fe|
//   |  Iron   |
//   | 55.845  |
//   +---------+
//
// State lands on the client as `_elementcard: { count, last }` — the
// record the shared feature corpus asserts on. `print: true` writes each
// card to the console.

import type { Context, FeatureOptions } from '../../types'
import type { ProjectNameSDK } from '../../ProjectNameSDK'

import { BaseFeature } from '../base/BaseFeature'


const CARD_WIDTH = 9
const CARD_EDGE = '+' + '-'.repeat(CARD_WIDTH) + '+'


// Integral numbers render without a decimal point; anything else as the
// language prints it. Keeps '247' and '55.845' identical across targets.
function numstr(n: number): string {
  return String(n)
}


function pad(n: number): string {
  return ' '.repeat(Math.max(0, n))
}


function center(s: string, w: number): string {
  if (s.length >= w) {
    return s.slice(0, w)
  }
  const p = w - s.length
  const left = Math.floor(p / 2)
  return pad(left) + s + pad(p - left)
}


// True when the record is a single element-shaped result.
function shaped(data: any): boolean {
  return null != data && 'object' === typeof data && !Array.isArray(data)
    && 'number' === typeof data.number
    && 'string' === typeof data.symbol
    && 'string' === typeof data.name
    && 'number' === typeof data.mass
}


// The card for one element-shaped record.
function renderElementCard(rec: any): string {
  const num = numstr(rec.number)
  const sym = String(rec.symbol)
  const line2 = '|' + num + pad(CARD_WIDTH - num.length - sym.length) + sym + '|'
  return [
    CARD_EDGE,
    line2,
    '|' + center(String(rec.name), CARD_WIDTH) + '|',
    '|' + center(numstr(rec.mass), CARD_WIDTH) + '|',
    CARD_EDGE,
  ].join('\n')
}


class ElementcardFeature extends BaseFeature {
  version = '0.1.0'
  name = 'elementcard'
  active = true

  _client?: ProjectNameSDK
  _options: any = {}


  init(ctx: Context, options: FeatureOptions): void | Promise<any> {
    this._client = ctx.client
    this._options = options || {}
    this.active = !!(options as any).active

    // The record exists from construction, so "never fired" is a
    // well-defined { count: 0 } rather than an absent property.
    const client: any = ctx.client
    if (null == client._elementcard) {
      client._elementcard = { count: 0, last: '' }
    }
  }


  render(rec: any): string {
    return renderElementCard(rec)
  }


  PreResult(this: any, ctx: any) {
    if (!this.active) {
      return
    }

    const result = ctx.result
    const data = null == result ? undefined :
      (undefined === result.resdata ? result.body : result.resdata)

    if (!shaped(data)) {
      return
    }

    const card = renderElementCard(data)

    const client: any = this._client || ctx.client
    if (null == client._elementcard) {
      client._elementcard = { count: 0, last: '' }
    }
    client._elementcard.count++
    client._elementcard.last = card

    if (this._options.print) {
      console.log(card)
    }
  }
}


export {
  ElementcardFeature,
  renderElementCard,
}
