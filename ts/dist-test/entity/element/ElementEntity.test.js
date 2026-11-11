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
const live_runner_1 = require("../../live-runner");
const live_entity_1 = require("../../live-entity");
const __1 = require("../../..");
const utility_1 = require("../../utility");
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
    class FailHook extends __1.BaseFeature {
        name = 'failhook';
        version = '0.0.1';
        active = true;
        unexpected = 0;
        init() { }
        PreSpec() { throw new Error('element hook failed'); }
        PreUnexpected() { this.unexpected++; }
    }
    (0, node_test_1.test)('stream-error', async () => {
        const offline = { net: { offline: true } };
        await node_assert_1.default.rejects(async () => {
            for await (const _item of __1.ElementdemoSDK.test(offline).Element().stream('list')) { }
        }, /offline/);
        for await (const _item of __1.ElementdemoSDK.test(offline).Element()
            .stream('list', undefined, { ctrl: { throw: false } })) { }
        if (null != __1.config.feature?.rbac) {
            const denied = __1.ElementdemoSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } });
            await node_assert_1.default.rejects(async () => {
                for await (const _item of denied.Element().stream('list')) { }
            }, (err) => 'rbac_denied' === err.code);
        }
    });
    (0, node_test_1.test)('stream-ctrl', async () => {
        const explain = {};
        const ctrl = { explain };
        for await (const _item of __1.ElementdemoSDK.test().Element().stream('list', undefined, { ctrl })) { }
        node_assert_1.default.deepStrictEqual(Object.keys(ctrl), ['explain']);
        (0, node_assert_1.default)(explain === ctrl.explain && 0 < Object.keys(explain).length);
    });
    (0, node_test_1.test)('unexpected', async () => {
        const hook = new FailHook();
        const client = new __1.ElementdemoSDK({ feature: { test: { active: true } }, extend: [hook] });
        await node_assert_1.default.rejects(client.Element().list(), /hook failed/);
        (0, node_assert_1.default)(0 < hook.unexpected);
        const fired = hook.unexpected;
        node_assert_1.default.strictEqual(await client.Element().list(undefined, { throw: false }), undefined);
        (0, node_assert_1.default)(fired < hook.unexpected);
    });
    (0, node_test_1.test)('validate', async (t) => {
        if (null == __1.config.feature?.validate) {
            t.skip('feature not present in this SDK: validate');
            return;
        }
        const client = __1.ElementdemoSDK.test(undefined, { feature: { validate: { active: true } } });
        await node_assert_1.default.rejects(client.Element().list({ "block": 1 }), (err) => 'validate_failed' === err.code);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.ELEMENTDEMO_TEST_LIVE;
        for (const op of ['create', 'list', 'update', 'load', 'remove']) {
            if (!live && (0, utility_1.maybeSkipControl)(t, 'entityOp', 'element.' + op, live))
                return;
        }
        const setup = basicSetup();
        if (setup.live) {
            return (0, live_entity_1.runLiveEntity)(setup, { "active": true, "alias": { "field": {} }, "fields": { "block": { "a": true, "h": "Block", "n": "block", "r": true, "sh": "Orbital block, one of s, p, d, f.", "t": "`$STRING`", "key$": "block", "index$": 0 }, "discovered": { "a": true, "h": "Discovered", "n": "discovered", "r": false, "sh": "Year of discovery, absent for elements known since antiquity.", "t": "`$INTEGER`", "key$": "discovered", "index$": 1 }, "group": { "a": true, "h": "Group", "n": "group", "r": false, "sh": "Periodic table column, 1 to 18, absent for the f-block.", "t": "`$INTEGER`", "key$": "group", "index$": 2 }, "id": { "a": true, "h": "Id", "n": "id", "r": true, "sh": "Element identifier, the lowercase symbol.", "t": "`$STRING`", "key$": "id", "index$": 3 }, "mass": { "a": true, "fo": "float", "h": "Mass", "n": "mass", "r": true, "sh": "Standard atomic weight in daltons.", "t": "`$NUMBER`", "key$": "mass", "index$": 4 }, "name": { "a": true, "h": "Name", "n": "name", "r": true, "sh": "Element name.", "t": "`$STRING`", "key$": "name", "index$": 5 }, "number": { "a": true, "h": "Number", "n": "number", "r": true, "sh": "Atomic number.", "t": "`$INTEGER`", "key$": "number", "index$": 6 }, "period": { "a": true, "h": "Period", "n": "period", "r": true, "sh": "Periodic table row, 1 to 7.", "t": "`$INTEGER`", "key$": "period", "index$": 7 }, "phase": { "a": true, "h": "Phase", "n": "phase", "r": false, "sh": "Phase at standard temperature and pressure.", "t": "`$STRING`", "key$": "phase", "index$": 8 }, "series_id": { "a": true, "h": "Series Id", "n": "series_id", "r": true, "sh": "Chemical series this element belongs to.", "t": "`$STRING`", "key$": "series_id", "index$": 9 }, "symbol": { "a": true, "h": "Symbol", "n": "symbol", "r": true, "sh": "Chemical symbol.", "t": "`$STRING`", "key$": "symbol", "index$": 10 } }, "id": { "field": "id", "name": "id" }, "name": "element", "op": { "create": { "input": "data", "name": "create", "points": [{ "a": true, "bf": ["charge"], "co": { "id": "POST /element/{element_id}/ionize", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "POST", "o": "/element/{element_id}/ionize", "q": { "$action": "ionize", "exist": ["id"] }, "r": { "param": { "element_id": "id" } }, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }, { "var": "id" }, { "lit": "ionize" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }, { "a": true, "bf": ["block", "discovered", "group", "id", "mass", "name", "number", "period", "phase", "series_id", "symbol"], "co": { "id": "POST /element", "source": "openapi3", "version": 2 }, "g": {}, "k": "http", "m": "POST", "o": "/element", "q": {}, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 1 }], "key$": "create" }, "list": { "input": "data", "name": "list", "points": [{ "a": true, "co": { "id": "GET /element", "source": "openapi3", "version": 2 }, "g": {}, "k": "http", "m": "GET", "o": "/element", "q": {}, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "list" }, "load": { "input": "data", "name": "load", "points": [{ "a": true, "co": { "id": "GET /element/{element_id}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "GET", "o": "/element/{element_id}", "q": { "exist": ["id"] }, "r": { "param": { "element_id": "id" } }, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }, { "var": "id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "load" }, "remove": { "input": "data", "name": "remove", "points": [{ "a": true, "co": { "id": "DELETE /element/{element_id}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "DELETE", "o": "/element/{element_id}", "q": { "exist": ["id"] }, "r": { "param": { "element_id": "id" } }, "s": [{ "lit": "element" }, { "var": "id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "remove" }, "update": { "input": "data", "name": "update", "points": [{ "a": true, "bf": ["block", "discovered", "group", "id", "mass", "name", "number", "period", "phase", "series_id", "symbol"], "co": { "id": "PUT /element/{element_id}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "PUT", "o": "/element/{element_id}", "q": { "exist": ["id"] }, "r": { "param": { "element_id": "id" } }, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }, { "var": "id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "update" } }, "relations": { "ancestors": [] }, "key$": "element", "name__orig": "element", "Name": "Element", "name_": "element", "name-": "element", "NAME": "ELEMENT", "index$": 0 }, { "active": true, "entity": "element", "key$": "BasicElementFlow", "kind": "basic", "name": "BasicElementFlow", "param": {}, "step": [{ "a": true, "d": {}, "i": { "ref": "element_ref01" }, "m": {}, "o": "create", "s": [], "v": [], "index$": 0 }, { "a": true, "d": {}, "i": {}, "m": {}, "o": "list", "s": [], "v": [{ "apply": "ItemExists", "def": { "ref": "element_ref01" } }], "index$": 0 }, { "a": true, "d": {}, "i": { "ref": "element_ref01", "srcdatavar": "element_ref01_data", "suffix": "_up0", "textfield": "block" }, "m": {}, "o": "update", "s": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-element_ref01" } }], "v": [], "index$": 2 }, { "a": true, "d": {}, "i": { "ref": "element_ref01", "srcdatavar": "element_ref01_data", "suffix": "_dt0" }, "m": { "id": "element01" }, "o": "load", "s": [], "v": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-element_ref01" } }], "index$": 1, "route": "GET /element/{element_id}", "record": {} }, { "a": true, "d": {}, "i": { "ref": "element_ref01", "suffix": "_rm0" }, "m": { "id": "element01" }, "o": "remove", "s": [], "v": [], "index$": 4 }, { "a": true, "d": {}, "i": { "suffix": "_rt0" }, "m": {}, "o": "list", "s": [], "v": [{ "apply": "ItemNotExists", "def": { "ref": "element_ref01" } }], "index$": 5 }] }, 'Element', { "POST /element/{element_id}/ionize": { "protocol": "http", "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": { "charge": { "type": "integer" } } } } } }, "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }] }, "POST /element": { "protocol": "http", "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["id", "name", "symbol", "number", "period", "block", "series_id", "mass"], "properties": { "id": { "type": "string", "description": "Element identifier, the lowercase symbol.", "key$": "id" }, "name": { "type": "string", "description": "Element name.", "key$": "name" }, "symbol": { "type": "string", "description": "Chemical symbol.", "key$": "symbol" }, "number": { "type": "integer", "description": "Atomic number.", "key$": "number" }, "period": { "type": "integer", "description": "Periodic table row, 1 to 7.", "key$": "period" }, "block": { "type": "string", "description": "Orbital block, one of s, p, d, f.", "key$": "block" }, "series_id": { "type": "string", "description": "Chemical series this element belongs to.", "key$": "series_id" }, "mass": { "type": "number", "format": "float", "description": "Standard atomic weight in daltons.", "key$": "mass" }, "group": { "type": "integer", "description": "Periodic table column, 1 to 18, absent for the f-block.", "key$": "group" }, "phase": { "type": "string", "description": "Phase at standard temperature and pressure.", "key$": "phase" }, "discovered": { "type": "integer", "description": "Year of discovery, absent for elements known since antiquity.", "key$": "discovered" } }, "x-ref": "#/components/schemas/Element", "index$": 1 } } } }, "parameters": [] }, "GET /element": { "protocol": "http", "parameters": [] }, "GET /element/{element_id}": { "protocol": "http", "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }] }, "DELETE /element/{element_id}": { "protocol": "http", "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }] }, "PUT /element/{element_id}": { "protocol": "http", "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["id", "name", "symbol", "number", "period", "block", "series_id", "mass"], "properties": { "id": { "type": "string", "description": "Element identifier, the lowercase symbol.", "key$": "id" }, "name": { "type": "string", "description": "Element name.", "key$": "name" }, "symbol": { "type": "string", "description": "Chemical symbol.", "key$": "symbol" }, "number": { "type": "integer", "description": "Atomic number.", "key$": "number" }, "period": { "type": "integer", "description": "Periodic table row, 1 to 7.", "key$": "period" }, "block": { "type": "string", "description": "Orbital block, one of s, p, d, f.", "key$": "block" }, "series_id": { "type": "string", "description": "Chemical series this element belongs to.", "key$": "series_id" }, "mass": { "type": "number", "format": "float", "description": "Standard atomic weight in daltons.", "key$": "mass" }, "group": { "type": "integer", "description": "Periodic table column, 1 to 18, absent for the f-block.", "key$": "group" }, "phase": { "type": "string", "description": "Phase at standard temperature and pressure.", "key$": "phase" }, "discovered": { "type": "integer", "description": "Year of discovery, absent for elements known since antiquity.", "key$": "discovered" } }, "x-ref": "#/components/schemas/Element", "index$": 1 } } } }, "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }] } }, { strict: LIVE_STRICT, t }, 'TRUE' === process.env.VOXGIG_GETONLY_GUARD ? { "element.create.0": "GET-only live run: needs POST /element/{element_id}/ionize", "element.update.2": "GET-only live run: needs PUT /element/{element_id}", "element.remove.4": "GET-only live run: needs DELETE /element/{element_id}", "element.list.5": "GET-only live run: checks a removal this run does not make" } : {});
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
// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true;
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
    const env = (0, utility_1.envOverride)({
        'ELEMENTDEMO_TEST_ELEMENT_ENTID': idmap,
        'ELEMENTDEMO_TEST_LIVE': 'FALSE',
        'ELEMENTDEMO_TEST_EXPLAIN': 'FALSE',
        'ELEMENTDEMO_APIKEY': '',
        'ELEMENTDEMO_SERVER_ACCOUNT_ID': "",
    });
    idmap = env['ELEMENTDEMO_TEST_ELEMENT_ENTID'];
    const live = 'TRUE' === env.ELEMENTDEMO_TEST_LIVE;
    const transport = (0, live_runner_1.createLiveTransport)();
    if (live) {
        const rawIds = process.env['ELEMENTDEMO_TEST_ELEMENT_ENTID'];
        idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {};
        if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
            throw new Error('Live ENTID must be a JSON object');
        }
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
            extra || {},
            { system: { fetch: transport.fetch } }
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
        transport,
        now: Date.now(),
    };
    return setup;
}
//# sourceMappingURL=ElementEntity.test.js.map