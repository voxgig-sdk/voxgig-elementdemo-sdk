"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const Fs = __importStar(require("node:fs"));
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const __1 = require("../../..");
const utility_1 = require("../../utility");
// AFTER the imports on purpose: TypeScript hoists `import` above any
// statement in the emitted CommonJS, so a loader placed above them would
// run only after every imported module had already been evaluated - and
// anything reading process.env at module scope would miss these values.
(0, utility_1.loadEnvLocal)(__dirname + '/../../../.env.local');
(0, node_test_1.describe)('ElementEntity', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when ELEMENTDEMO_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('ELEMENTDEMO_TEST_LIVE'));
    (0, node_test_1.test)('instance', async () => {
        const testsdk = __1.ElementdemoSDK.test();
        const ent = testsdk.Element();
        (0, node_assert_1.default)(null != ent);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.ELEMENTDEMO_TEST_LIVE;
        for (const op of ['create', 'list', 'update', 'load', 'remove']) {
            if ((0, utility_1.maybeSkipControl)(t, 'entityOp', 'element.' + op, live))
                return;
        }
        const setup = basicSetup();
        // The basic flow consumes synthetic IDs and field values from the
        // fixture (entity TestData.json). Those don't exist on the live API.
        // Skip live runs unless the user provided a real ENTID env override.
        if (setup.syntheticOnly) {
            t.skip('live entity test uses synthetic IDs from fixture — set ELEMENTDEMO_TEST_ELEMENT_ENTID JSON to run live');
            return;
        }
        const client = setup.client;
        const struct = setup.struct;
        const isempty = struct.isempty;
        const select = struct.select;
        // CREATE
        const element_ref01_ent = client.Element();
        let element_ref01_data = setup.data.new.element['element_ref01'];
        element_ref01_data = (await element_ref01_ent.create(element_ref01_data)).data();
        (0, node_assert_1.default)(null != element_ref01_data.id);
        // LIST
        const element_ref01_match = {};
        const element_ref01_list = (await element_ref01_ent.list(element_ref01_match)).map((e) => e.data());
        (0, node_assert_1.default)(!isempty(select(element_ref01_list, { id: element_ref01_data.id })));
        // UPDATE
        const element_ref01_data_up0 = {};
        element_ref01_data_up0.id = element_ref01_data.id;
        const element_ref01_markdef_up0 = { name: 'block', value: 'Mark01-element_ref01_' + setup.now };
        element_ref01_data_up0[element_ref01_markdef_up0.name] = element_ref01_markdef_up0.value;
        const element_ref01_resdata_up0 = (await element_ref01_ent.update(element_ref01_data_up0)).data();
        (0, node_assert_1.default)(element_ref01_resdata_up0.id === element_ref01_data_up0.id);
        (0, node_assert_1.default)(element_ref01_resdata_up0[element_ref01_markdef_up0.name] === element_ref01_markdef_up0.value);
        // LOAD
        const element_ref01_match_dt0 = {};
        element_ref01_match_dt0.id = element_ref01_data.id;
        const element_ref01_data_dt0 = (await element_ref01_ent.load(element_ref01_match_dt0)).data();
        (0, node_assert_1.default)(element_ref01_data_dt0.id === element_ref01_data.id);
        // REMOVE
        const element_ref01_match_rm0 = { id: element_ref01_data.id };
        await element_ref01_ent.remove(element_ref01_match_rm0);
        // LIST
        const element_ref01_match_rt0 = {};
        const element_ref01_list_rt0 = (await element_ref01_ent.list(element_ref01_match_rt0)).map((e) => e.data());
        (0, node_assert_1.default)(isempty(select(element_ref01_list_rt0, { id: element_ref01_data.id })));
    });
});
function basicSetup(extra) {
    // TODO: fix test def options
    const options = {}; // null
    // TODO: needs test utility to resolve path
    const entityDataFile = node_path_1.default.resolve(__dirname, '../../../../.sdk/test/entity/element/ElementTestData.json');
    // TODO: file ready util needed?
    const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8');
    // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
    const entityData = JSON.parse(entityDataSource);
    options.entity = entityData.existing;
    let client = __1.ElementdemoSDK.test(options, extra);
    const struct = client.utility().struct;
    const merge = struct.merge;
    const transform = struct.transform;
    let idmap = transform(['element01', 'element02', 'element03'], {
        '`$PACK`': ['', {
                '`$KEY`': '`$COPY`',
                '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
            }]
    });
    // Detect whether the user provided a real ENTID JSON via env var. The
    // basic flow consumes synthetic IDs from the fixture file; without an
    // override those synthetic IDs reach the live API and 4xx. Surface this
    // to the test so it can skip rather than fail.
    const idmapEnvVal = process.env['ELEMENTDEMO_TEST_ELEMENT_ENTID'];
    const idmapOverridden = null != idmapEnvVal && idmapEnvVal.trim().startsWith('{');
    const env = (0, utility_1.envOverride)({
        'ELEMENTDEMO_TEST_ELEMENT_ENTID': idmap,
        'ELEMENTDEMO_TEST_LIVE': 'FALSE',
        'ELEMENTDEMO_TEST_EXPLAIN': 'FALSE',
        'ELEMENTDEMO_APIKEY': 'NONE',
        'ELEMENTDEMO_SERVER_ACCOUNT_ID': '',
    });
    idmap = env['ELEMENTDEMO_TEST_ELEMENT_ENTID'];
    const live = 'TRUE' === env.ELEMENTDEMO_TEST_LIVE;
    if (live) {
        client = new __1.ElementdemoSDK(merge([
            // FIRST, so the generated fields below win: sdk-test-control.json's
            // test.client.options adds to the live client, it does not redirect it.
            (0, utility_1.liveClientOptions)(),
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
        ]));
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
    };
    return setup;
}
//# sourceMappingURL=ElementEntity.test.js.map