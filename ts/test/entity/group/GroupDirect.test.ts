
const envlocal = __dirname + '/../../../.env.local'
require('dotenv').config({ quiet: true, path: [envlocal] })

import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert'


import { ElementdemoSDK } from '../../..'

import {
  envOverride,
  liveDelay,
  maybeSkipControl,
  skipIfMissingIds,
} from '../../utility'


describe('GroupDirect', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when ELEMENTDEMO_TEST_LIVE=TRUE.
  afterEach(liveDelay('ELEMENTDEMO_TEST_LIVE'))

  test('direct-exists', async () => {
    const sdk = new ElementdemoSDK({
      // Concrete base: a live construction must satisfy any server
      // variables a templated base URL declares; overriding base with a
      // literal (as the direct flow tests do) sidesteps the requirement.
      base: 'http://localhost:8080',
      system: { fetch: async () => ({}) }
    })
    assert('function' === typeof sdk.direct)
    assert('function' === typeof sdk.prepare)
  })


  test('direct-load-group', async (t: any) => {
    const setup = directSetup({ id: 'direct01' })
    if (maybeSkipControl(t, 'direct', 'direct-load-group', setup.live)) return
    const { client, calls } = setup

    const params: any = {}
    const query: any = {}
    if (setup.live) {
      const listResult: any = await client.direct({
        path: 'api/group',
        method: 'GET',
        params: {

        },
      })
      if (!listResult.ok) {
        return // skip: list call failed (likely synthetic IDs against live API)
      }
      const listArr = unwrapListData(listResult.data)
      if (null == listArr || listArr.length === 0) {
        return // skip: no entities to load in live mode
      }
      const candidateId = listArr[0]?.id ?? listArr[0]?.id
      if (null == candidateId) {
        return // skip: list response shape does not expose load identifier
      }
      params.id = candidateId

    } else {
      params.id = 'direct01'
    }

    const result: any = await client.direct({
      path: 'api/group/{id}',
      method: 'GET',
      params,
      query,
    })

    assert(result.ok === true)
    assert(result.status === 200)
    assert(null != result.data)
    assert(result.data.id === 'direct01')
    assert(calls.length === 1)
    assert(calls[0].init.method === 'GET')
    assert(calls[0].url.includes('direct01'))

  })

  test('direct-list-group', async (t: any) => {
    const setup = directSetup([{ id: 'direct01' }, { id: 'direct02' }])
    if (maybeSkipControl(t, 'direct', 'direct-list-group', setup.live)) return
    const { client, calls } = setup

    const params: any = {}
    const query: any = {}

    const result: any = await client.direct({
      path: 'api/group',
      method: 'GET',
      params,
      query,
    })

    assert(result.ok === true)
    assert(result.status === 200)
    assert(null != result.data)
    const listArr = unwrapListData(result.data)
    assert(Array.isArray(listArr))
    assert(listArr!.length === 2)
    assert(calls.length === 1)
    assert(calls[0].init.method === 'GET')

  })

})



function directSetup(mockres?: any) {
  const calls: any[] = []

  const env = envOverride({
    'ELEMENTDEMO_TEST_GROUP_ENTID': {},
    'ELEMENTDEMO_TEST_LIVE': 'FALSE',
  })

  const live = 'TRUE' === env.ELEMENTDEMO_TEST_LIVE

  if (live) {
    const client = new ElementdemoSDK({
    })

    let idmap: any = env['ELEMENTDEMO_TEST_GROUP_ENTID']
    if ('string' === typeof idmap && idmap.startsWith('{')) {
      idmap = JSON.parse(idmap)
    }

    return { client, calls, live, idmap }
  }

  const mockFetch = async (url: string, init: any) => {
    calls.push({ url, init })
    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      json: async () => (null != mockres ? mockres : { id: 'direct01' }),
    }
  }

  const client = new ElementdemoSDK({
    base: 'http://localhost:8080',
    system: { fetch: mockFetch },
  })

  return { client, calls, live, idmap: {} as any }
}

// direct() returns the raw response body. List endpoints often wrap the
// array in an envelope (e.g. { data: [...] }, { entities: [...] },
// { pagination, data: [...] }). The test transforms the raw body to
// extract the first array — either the body itself or the first array
// property of an envelope object.
function unwrapListData(data: any): any[] | null {
  if (Array.isArray(data)) return data
  if (data && 'object' === typeof data) {
    for (const v of Object.values(data)) {
      if (Array.isArray(v)) return v as any[]
    }
  }
  return null
}
  
