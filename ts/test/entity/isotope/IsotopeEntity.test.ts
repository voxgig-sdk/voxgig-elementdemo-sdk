

import Path from 'node:path'
import * as Fs from 'node:fs'

import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert'


import { ElementdemoSDK, BaseFeature, stdutil } from '../../..'

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


// AFTER the imports on purpose: TypeScript hoists `import` above any
// statement in the emitted CommonJS, so a loader placed above them would
// run only after every imported module had already been evaluated - and
// anything reading process.env at module scope would miss these values.
loadEnvLocal(__dirname + '/../../../.env.local')


describe('IsotopeEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when ELEMENTDEMO_TEST_LIVE=TRUE.
  afterEach(liveDelay('ELEMENTDEMO_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = ElementdemoSDK.test()
    const ent = testsdk.Isotope()
    assert(null != ent)
  })


  test('basic', async (t) => {

    const live = 'TRUE' === process.env.ELEMENTDEMO_TEST_LIVE
    for (const op of ['create', 'list', 'update', 'load', 'remove']) {
      if (maybeSkipControl(t, 'entityOp', 'isotope.' + op, live)) return
    }

    const setup = basicSetup()
    // The basic flow consumes synthetic IDs and field values from the
    // fixture (entity TestData.json). Those don't exist on the live API.
    // Skip live runs unless the user provided a real ENTID env override.
    if (setup.syntheticOnly) {
      t.skip('live entity test uses synthetic IDs from fixture — set ELEMENTDEMO_TEST_ISOTOPE_ENTID JSON to run live')
      return
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select


    // CREATE
    const isotope_ref01_ent = client.Isotope()
    let isotope_ref01_data = setup.data.new.isotope['isotope_ref01']
    isotope_ref01_data['element_id'] = setup.idmap['element01']

    isotope_ref01_data = (await isotope_ref01_ent.create(isotope_ref01_data)).data()
    assert(null != isotope_ref01_data.id)


    // LIST
    const isotope_ref01_match: any = {}
    isotope_ref01_match['element_id'] = setup.idmap['element01']

    const isotope_ref01_list = (await isotope_ref01_ent.list(isotope_ref01_match)).map((e: any) => e.data())

    assert(!isempty(select(isotope_ref01_list, { id: isotope_ref01_data.id })))


    // UPDATE
    const isotope_ref01_data_up0: any = {}
    isotope_ref01_data_up0.id = isotope_ref01_data.id
    isotope_ref01_data_up0 ['element_id'] = setup.idmap['element_id']

    const isotope_ref01_markdef_up0 = { name: 'halflife', value: 'Mark01-isotope_ref01_' + setup.now }
    ;(isotope_ref01_data_up0 as any)[isotope_ref01_markdef_up0.name] = isotope_ref01_markdef_up0.value

    const isotope_ref01_resdata_up0 = (await isotope_ref01_ent.update(isotope_ref01_data_up0)).data()
    assert(isotope_ref01_resdata_up0.id === isotope_ref01_data_up0.id)

    assert((isotope_ref01_resdata_up0 as any)[isotope_ref01_markdef_up0.name] === isotope_ref01_markdef_up0.value)


    // LOAD
    const isotope_ref01_match_dt0: any = {}
    isotope_ref01_match_dt0.id = isotope_ref01_data.id
    const isotope_ref01_data_dt0 = (await isotope_ref01_ent.load(isotope_ref01_match_dt0)).data()
    assert(isotope_ref01_data_dt0.id === isotope_ref01_data.id)


    // REMOVE
    const isotope_ref01_match_rm0: any = { id: isotope_ref01_data.id }
    await isotope_ref01_ent.remove(isotope_ref01_match_rm0)
  

    // LIST
    const isotope_ref01_match_rt0: any = {}
    isotope_ref01_match_rt0['element_id'] = setup.idmap['element01']

    const isotope_ref01_list_rt0 = (await isotope_ref01_ent.list(isotope_ref01_match_rt0)).map((e: any) => e.data())

    assert(isempty(select(isotope_ref01_list_rt0, { id: isotope_ref01_data.id })))


  })
})



function basicSetup(extra?: any) {
  // TODO: fix test def options
  const options: any = {} // null

  // TODO: needs test utility to resolve path
  const entityDataFile =
    Path.resolve(__dirname, 
      '../../../../.sdk/test/entity/isotope/IsotopeTestData.json')

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
    ['isotope01','isotope02','isotope03','element01','element02','element03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  // Detect whether the user provided a real ENTID JSON via env var. The
  // basic flow consumes synthetic IDs from the fixture file; without an
  // override those synthetic IDs reach the live API and 4xx. Surface this
  // to the test so it can skip rather than fail.
  const idmapEnvVal = process.env['ELEMENTDEMO_TEST_ISOTOPE_ENTID']
  const idmapOverridden = null != idmapEnvVal && idmapEnvVal.trim().startsWith('{')

  const env = envOverride({
    'ELEMENTDEMO_TEST_ISOTOPE_ENTID': idmap,
    'ELEMENTDEMO_TEST_LIVE': 'FALSE',
    'ELEMENTDEMO_TEST_EXPLAIN': 'FALSE',
    'ELEMENTDEMO_APIKEY': '',
    'ELEMENTDEMO_SERVER_ACCOUNT_ID': "",
  })

  idmap = env['ELEMENTDEMO_TEST_ISOTOPE_ENTID']

  const live = 'TRUE' === env.ELEMENTDEMO_TEST_LIVE

  if (live) {
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
      extra || {}
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
    syntheticOnly: live && !idmapOverridden,
    now: Date.now(),
  }

  return setup
}
  
