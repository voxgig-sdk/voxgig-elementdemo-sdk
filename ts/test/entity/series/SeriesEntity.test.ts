

import Path from 'node:path'
import * as Fs from 'node:fs'

import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert'
import { createLiveTransport } from '../../live-runner'
import { runLiveEntity } from '../../live-entity'


import { ElementdemoSDK, BaseFeature, config, stdutil } from '../../..'

import {
  envOverride,
  liveClientOptions,
  liveDelay,
  loadEnvLocal,
  makeCtrl,
  makeMatch,
  makeReqdata,
  makeStepData,
  makeValid,
  maybeSkipControl,
} from '../../utility'


loadEnvLocal(__dirname + '/../../../.env.local')


describe('SeriesEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when ELEMENTDEMO_TEST_LIVE=TRUE.
  afterEach(liveDelay('ELEMENTDEMO_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = ElementdemoSDK.test()
    const ent = testsdk.Series()
    assert(null != ent)
  })


  class FailHook extends BaseFeature {
    name = 'failhook'
    version = '0.0.1'
    active = true
    unexpected = 0
    init() { }
    PreSpec() { throw new Error('series hook failed') }
    PreUnexpected() { this.unexpected++ }
  }

  test('stream-error', async () => {
    const offline = { net: { offline: true } }
    await assert.rejects(async () => {
      for await (const _item of ElementdemoSDK.test(offline).Series().stream('list')) { }
    }, /offline/)

    for await (const _item of ElementdemoSDK.test(offline).Series()
      .stream('list', undefined, { ctrl: { throw: false } })) { }

    if (null != (config as any).feature?.rbac) {
      const denied = ElementdemoSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } })
      await assert.rejects(async () => {
        for await (const _item of denied.Series().stream('list')) { }
      }, (err: any) => 'rbac_denied' === err.code)
    }
  })

  test('stream-ctrl', async () => {
    const explain: any = {}
    const ctrl: any = { explain }
    for await (const _item of ElementdemoSDK.test().Series().stream('list', undefined, { ctrl })) { }
    assert.deepStrictEqual(Object.keys(ctrl), ['explain'])
    assert(explain === ctrl.explain && 0 < Object.keys(explain).length)
  })

  test('unexpected', async () => {
    const hook = new FailHook()
    const client = new ElementdemoSDK({ feature: { test: { active: true } }, extend: [hook] })
    await assert.rejects(client.Series().list(), /hook failed/)
    assert(0 < hook.unexpected)

    const fired = hook.unexpected
    assert.strictEqual(await client.Series().list(undefined, { throw: false }), undefined)
    assert(fired < hook.unexpected)
  })

  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = ElementdemoSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Series().list({"color":1} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.ELEMENTDEMO_TEST_LIVE
    for (const op of ['list', 'load']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'series.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"color":{"a":true,"h":"Color","n":"color","r":true,"sh":"Display color used by the element card renderer.","t":"`$STRING`","key$":"color","index$":0},"description":{"a":true,"h":"Description","n":"description","r":true,"sh":"One-line description of the series.","t":"`$STRING`","key$":"description","index$":1},"id":{"a":true,"h":"Id","n":"id","r":true,"sh":"Series identifier.","t":"`$STRING`","key$":"id","index$":2},"name":{"a":true,"h":"Name","n":"name","r":true,"sh":"Series name.","t":"`$STRING`","key$":"name","index$":3}},"id":{"field":"id","name":"id"},"name":"series","op":{"list":{"input":"data","name":"list","points":[{"a":true,"co":{"id":"GET /series","source":"openapi3","version":2},"g":{},"k":"http","m":"GET","o":"/series","q":{},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"series"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"list"},"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /series/{series_id}","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"id","or":"series_id","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"GET","o":"/series/{series_id}","q":{"exist":["id"]},"r":{"param":{"series_id":"id"}},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"series"},{"var":"id"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[]},"key$":"series","name__orig":"series","Name":"Series","name_":"series","name-":"series","NAME":"SERIES","index$":3}, {"active":true,"entity":"series","key$":"BasicSeriesFlow","kind":"basic","name":"BasicSeriesFlow","param":{},"step":[{"a":true,"d":{},"i":{},"m":{},"o":"list","s":[],"v":[{"apply":"ItemExists","def":{"ref":"series_ref01"}}],"index$":0},{"a":true,"d":{},"i":{"ref":"series_ref01","srcdatavar":"series_ref01_data","suffix":"_dt0"},"m":{"id":"series01"},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-series_ref01"}}],"index$":1,"route":"GET /series/{series_id}","record":{}}]}, 'Series', {"GET /series":{"protocol":"http","parameters":[]},"GET /series/{series_id}":{"protocol":"http","parameters":[{"name":"series_id","in":"path","required":true,"schema":{"type":"string"},"index$":0}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let series_ref01_data = Object.values(setup.data.existing.series)[0] as any

    // LIST
    const series_ref01_ent = client.Series()
    const series_ref01_match: any = {}

    const series_ref01_list = (await series_ref01_ent.list(series_ref01_match)).map((e: any) => e.data())


    // LOAD
    const series_ref01_match_dt0: any = {}
    series_ref01_match_dt0.id = series_ref01_data.id
    const series_ref01_data_dt0 = (await series_ref01_ent.load(series_ref01_match_dt0)).data()
    assert(series_ref01_data_dt0.id === series_ref01_data.id)


  })
})



// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true

function basicSetup(extra?: any) {
  // TODO: fix test def options
  const options: any = {} // null

  // TODO: needs test utility to resolve path
  const entityDataFile =
    Path.resolve(__dirname, 
      '../../../../.sdk/test/entity/series/SeriesTestData.json')

  // TODO: file ready util needed?
  const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8')

  // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
  const entityData = JSON.parse(entityDataSource)

  options.entity = entityData.existing

  let client = ElementdemoSDK.test(options, extra)
  const struct = client.utility().struct
  const merge = struct.merge
  const transform = struct.transform

  let idmap = transform(
    ['series01','series02','series03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'ELEMENTDEMO_TEST_SERIES_ENTID': idmap,
    'ELEMENTDEMO_TEST_LIVE': 'FALSE',
    'ELEMENTDEMO_TEST_EXPLAIN': 'FALSE',
    'ELEMENTDEMO_APIKEY': '',
    'ELEMENTDEMO_SERVER_ACCOUNT_ID': "",
  })

  idmap = env['ELEMENTDEMO_TEST_SERIES_ENTID']

  const live = 'TRUE' === env.ELEMENTDEMO_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['ELEMENTDEMO_TEST_SERIES_ENTID']
    idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {}
    if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
      throw new Error('Live ENTID must be a JSON object')
    }
    client = new ElementdemoSDK(merge([
      // FIRST, so the generated fields below win: sdk-test-control.json's
      // test.client.options adds to the live client, it does not redirect it.
      liveClientOptions(),
      {
        apikey: env.ELEMENTDEMO_APIKEY,
        server: {
          account_id: env.ELEMENTDEMO_SERVER_ACCOUNT_ID,
        },
      },
      // 'extra || {}', not a bare 'extra': struct.merge returns UNDEFINED when the
      // last entry is undefined, and basicSetup is normally called with no
      // argument at all - so a bare 'extra' silently discarded the apikey
      // and server values above and handed the SDK undefined. Harmless
      // while there was nothing in that object; not harmless now.
      extra || {},
      { system: { fetch: transport.fetch } }
    ]))
  }

  const setup = {
    idmap,
    env,
    options,
    client,
    struct,
    data: entityData,
    explain: 'TRUE' === env.ELEMENTDEMO_TEST_EXPLAIN,
    live,
    transport,
    now: Date.now(),
  }

  return setup
}
  
