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
(0, node_test_1.describe)('IsotopeEntity', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when ELEMENTDEMO_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('ELEMENTDEMO_TEST_LIVE'));
    (0, node_test_1.test)('instance', async () => {
        const testsdk = __1.ElementdemoSDK.test();
        const ent = testsdk.Isotope();
        (0, node_assert_1.default)(null != ent);
    });
    (0, node_test_1.test)('validate', async (t) => {
        if (null == __1.config.feature?.validate) {
            t.skip('feature not present in this SDK: validate');
            return;
        }
        const client = __1.ElementdemoSDK.test(undefined, { feature: { validate: { active: true } } });
        await node_assert_1.default.rejects(client.Isotope().list({ "element_id": 1 }), (err) => 'validate_failed' === err.code);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.ELEMENTDEMO_TEST_LIVE;
        for (const op of ['create', 'list', 'update', 'load', 'remove']) {
            if (!live && (0, utility_1.maybeSkipControl)(t, 'entityOp', 'isotope.' + op, live))
                return;
        }
        const setup = basicSetup();
        if (setup.live) {
            return (0, live_entity_1.runLiveEntity)(setup, { "active": true, "alias": { "field": {} }, "fields": { "abundance": { "a": true, "fo": "float", "h": "Abundance", "n": "abundance", "r": false, "sh": "Natural abundance as a fraction, absent for synthetic isotopes.", "t": "`$NUMBER`", "key$": "abundance", "index$": 0 }, "element_id": { "a": true, "h": "Element Id", "n": "element_id", "r": true, "sh": "Parent element identifier.", "t": "`$STRING`", "key$": "element_id", "index$": 1 }, "halflife": { "a": true, "h": "Halflife", "n": "halflife", "r": false, "sh": "Half-life, absent for stable isotopes.", "t": "`$STRING`", "key$": "halflife", "index$": 2 }, "id": { "a": true, "h": "Id", "n": "id", "r": true, "sh": "Isotope identifier, symbol dash mass number.", "t": "`$STRING`", "key$": "id", "index$": 3 }, "mass": { "a": true, "fo": "float", "h": "Mass", "n": "mass", "r": true, "sh": "Isotopic mass in daltons.", "t": "`$NUMBER`", "key$": "mass", "index$": 4 }, "mass_number": { "a": true, "h": "Mass Number", "n": "mass_number", "r": true, "sh": "Total protons and neutrons.", "t": "`$INTEGER`", "key$": "mass_number", "index$": 5 }, "mode": { "a": true, "h": "Mode", "n": "mode", "r": false, "sh": "Primary decay mode, absent for stable isotopes.", "t": "`$STRING`", "key$": "mode", "index$": 6 }, "name": { "a": true, "h": "Name", "n": "name", "r": true, "sh": "Isotope name.", "t": "`$STRING`", "key$": "name", "index$": 7 }, "product": { "a": true, "h": "Product", "n": "product", "r": false, "sh": "Primary decay product isotope, absent for stable isotopes.", "t": "`$STRING`", "key$": "product", "index$": 8 }, "stable": { "a": true, "h": "Stable", "n": "stable", "r": true, "sh": "True if the isotope is stable.", "t": "`$BOOLEAN`", "key$": "stable", "index$": 9 } }, "id": { "field": "id", "name": "id" }, "name": "isotope", "op": { "create": { "input": "data", "name": "create", "points": [{ "a": true, "bf": ["steps"], "co": { "id": "POST /element/{element_id}/isotope/{isotope_id}/decay", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "element_id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }, { "a": true, "k": "param", "n": "id", "or": "isotope_id", "r": true, "t": "`$STRING`", "index$": 1 }] }, "k": "http", "m": "POST", "o": "/element/{element_id}/isotope/{isotope_id}/decay", "q": { "$action": "decay", "exist": ["element_id", "id"] }, "r": { "param": { "isotope_id": "id" } }, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }, { "var": "element_id" }, { "lit": "isotope" }, { "var": "id" }, { "lit": "decay" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }, { "a": true, "bf": ["abundance", "element_id", "halflife", "id", "mass", "mass_number", "mode", "name", "product", "stable"], "co": { "id": "POST /element/{element_id}/isotope", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "element_id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "POST", "o": "/element/{element_id}/isotope", "q": { "exist": ["element_id"] }, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }, { "var": "element_id" }, { "lit": "isotope" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 1 }], "key$": "create" }, "list": { "input": "data", "name": "list", "points": [{ "a": true, "co": { "id": "GET /element/{element_id}/isotope", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "element_id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "GET", "o": "/element/{element_id}/isotope", "q": { "exist": ["element_id"] }, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }, { "var": "element_id" }, { "lit": "isotope" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "list" }, "load": { "input": "data", "name": "load", "points": [{ "a": true, "co": { "id": "GET /element/{element_id}/isotope/{isotope_id}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "element_id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }, { "a": true, "k": "param", "n": "id", "or": "isotope_id", "r": true, "t": "`$STRING`", "index$": 1 }] }, "k": "http", "m": "GET", "o": "/element/{element_id}/isotope/{isotope_id}", "q": { "exist": ["element_id", "id"] }, "r": { "param": { "isotope_id": "id" } }, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }, { "var": "element_id" }, { "lit": "isotope" }, { "var": "id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "load" }, "remove": { "input": "data", "name": "remove", "points": [{ "a": true, "co": { "id": "DELETE /element/{element_id}/isotope/{isotope_id}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "element_id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }, { "a": true, "k": "param", "n": "id", "or": "isotope_id", "r": true, "t": "`$STRING`", "index$": 1 }] }, "k": "http", "m": "DELETE", "o": "/element/{element_id}/isotope/{isotope_id}", "q": { "exist": ["element_id", "id"] }, "r": { "param": { "isotope_id": "id" } }, "s": [{ "lit": "element" }, { "var": "element_id" }, { "lit": "isotope" }, { "var": "id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "remove" }, "update": { "input": "data", "name": "update", "points": [{ "a": true, "bf": ["abundance", "element_id", "halflife", "id", "mass", "mass_number", "mode", "name", "product", "stable"], "co": { "id": "PUT /element/{element_id}/isotope/{isotope_id}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "element_id", "or": "element_id", "r": true, "t": "`$STRING`", "index$": 0 }, { "a": true, "k": "param", "n": "id", "or": "isotope_id", "r": true, "t": "`$STRING`", "index$": 1 }] }, "k": "http", "m": "PUT", "o": "/element/{element_id}/isotope/{isotope_id}", "q": { "exist": ["element_id", "id"] }, "r": { "param": { "isotope_id": "id" } }, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "element" }, { "var": "element_id" }, { "lit": "isotope" }, { "var": "id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "update" } }, "relations": { "ancestors": [["$.main.kit.entity.element"]] }, "key$": "isotope", "name__orig": "isotope", "Name": "Isotope", "name_": "isotope", "name-": "isotope", "NAME": "ISOTOPE", "index$": 2 }, { "active": true, "entity": "isotope", "key$": "BasicIsotopeFlow", "kind": "basic", "name": "BasicIsotopeFlow", "param": {}, "step": [{ "a": true, "d": {}, "i": { "ref": "isotope_ref01" }, "m": { "element_id": "element01" }, "o": "create", "s": [], "v": [], "index$": 0 }, { "a": true, "d": {}, "i": {}, "m": { "element_id": "element01" }, "o": "list", "s": [], "v": [{ "apply": "ItemExists", "def": { "ref": "isotope_ref01" } }], "index$": 0 }, { "a": true, "d": { "element_id": "element01" }, "i": { "ref": "isotope_ref01", "srcdatavar": "isotope_ref01_data", "suffix": "_up0", "textfield": "halflife" }, "m": {}, "o": "update", "s": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-isotope_ref01" } }], "v": [], "index$": 2 }, { "a": true, "d": {}, "i": { "ref": "isotope_ref01", "srcdatavar": "isotope_ref01_data", "suffix": "_dt0" }, "m": { "element_id": "element01", "id": "isotope01" }, "o": "load", "s": [], "v": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-isotope_ref01" } }], "index$": 1, "route": "GET /element/{element_id}/isotope/{isotope_id}", "record": { "element_id": "element_id" } }, { "a": true, "d": {}, "i": { "ref": "isotope_ref01", "suffix": "_rm0" }, "m": { "element_id": "element01", "id": "isotope01" }, "o": "remove", "s": [], "v": [], "index$": 4 }, { "a": true, "d": {}, "i": { "suffix": "_rt0" }, "m": { "element_id": "element01" }, "o": "list", "s": [], "v": [{ "apply": "ItemNotExists", "def": { "ref": "isotope_ref01" } }], "index$": 5 }] }, 'Isotope', { "POST /element/{element_id}/isotope/{isotope_id}/decay": { "protocol": "http", "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": { "steps": { "type": "integer" } } } } } }, "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }, { "name": "isotope_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 1 }] }, "POST /element/{element_id}/isotope": { "protocol": "http", "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["id", "element_id", "name", "mass_number", "mass", "stable"], "properties": { "id": { "type": "string", "description": "Isotope identifier, symbol dash mass number.", "key$": "id" }, "element_id": { "type": "string", "description": "Parent element identifier.", "key$": "element_id" }, "name": { "type": "string", "description": "Isotope name.", "key$": "name" }, "mass_number": { "type": "integer", "description": "Total protons and neutrons.", "key$": "mass_number" }, "mass": { "type": "number", "format": "float", "description": "Isotopic mass in daltons.", "key$": "mass" }, "stable": { "type": "boolean", "description": "True if the isotope is stable.", "key$": "stable" }, "abundance": { "type": "number", "format": "float", "description": "Natural abundance as a fraction, absent for synthetic isotopes.", "key$": "abundance" }, "halflife": { "type": "string", "description": "Half-life, absent for stable isotopes.", "key$": "halflife" }, "mode": { "type": "string", "description": "Primary decay mode, absent for stable isotopes.", "key$": "mode" }, "product": { "type": "string", "description": "Primary decay product isotope, absent for stable isotopes.", "key$": "product" } }, "x-ref": "#/components/schemas/Isotope", "index$": 1 } } } }, "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }] }, "GET /element/{element_id}/isotope": { "protocol": "http", "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }] }, "GET /element/{element_id}/isotope/{isotope_id}": { "protocol": "http", "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }, { "name": "isotope_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 1 }] }, "DELETE /element/{element_id}/isotope/{isotope_id}": { "protocol": "http", "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }, { "name": "isotope_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 1 }] }, "PUT /element/{element_id}/isotope/{isotope_id}": { "protocol": "http", "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["id", "element_id", "name", "mass_number", "mass", "stable"], "properties": { "id": { "type": "string", "description": "Isotope identifier, symbol dash mass number.", "key$": "id" }, "element_id": { "type": "string", "description": "Parent element identifier.", "key$": "element_id" }, "name": { "type": "string", "description": "Isotope name.", "key$": "name" }, "mass_number": { "type": "integer", "description": "Total protons and neutrons.", "key$": "mass_number" }, "mass": { "type": "number", "format": "float", "description": "Isotopic mass in daltons.", "key$": "mass" }, "stable": { "type": "boolean", "description": "True if the isotope is stable.", "key$": "stable" }, "abundance": { "type": "number", "format": "float", "description": "Natural abundance as a fraction, absent for synthetic isotopes.", "key$": "abundance" }, "halflife": { "type": "string", "description": "Half-life, absent for stable isotopes.", "key$": "halflife" }, "mode": { "type": "string", "description": "Primary decay mode, absent for stable isotopes.", "key$": "mode" }, "product": { "type": "string", "description": "Primary decay product isotope, absent for stable isotopes.", "key$": "product" } }, "x-ref": "#/components/schemas/Isotope", "index$": 1 } } } }, "parameters": [{ "name": "element_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 0 }, { "name": "isotope_id", "in": "path", "required": true, "schema": { "type": "string" }, "index$": 1 }] } }, { strict: LIVE_STRICT, t }, 'TRUE' === process.env.VOXGIG_GETONLY_GUARD ? { "isotope.create.0": "GET-only live run: needs POST /element/{element_id}/isotope/{isotope_id}/decay", "isotope.update.2": "GET-only live run: needs PUT /element/{element_id}/isotope/{isotope_id}", "isotope.remove.4": "GET-only live run: needs DELETE /element/{element_id}/isotope/{isotope_id}", "isotope.list.5": "GET-only live run: checks a removal this run does not make" } : {});
        }
        const client = setup.client;
        const struct = setup.struct;
        const isempty = struct.isempty;
        const select = struct.select;
        // CREATE
        const isotope_ref01_ent = client.Isotope();
        let isotope_ref01_data = setup.data.new.isotope['isotope_ref01'];
        isotope_ref01_data['element_id'] = setup.idmap['element01'];
        isotope_ref01_data = (await isotope_ref01_ent.create(isotope_ref01_data)).data();
        (0, node_assert_1.default)(null != isotope_ref01_data.id);
        // LIST
        const isotope_ref01_match = {};
        isotope_ref01_match['element_id'] = setup.idmap['element01'];
        const isotope_ref01_list = (await isotope_ref01_ent.list(isotope_ref01_match)).map((e) => e.data());
        (0, node_assert_1.default)(!isempty(select(isotope_ref01_list, { id: isotope_ref01_data.id })));
        // UPDATE
        const isotope_ref01_data_up0 = {};
        isotope_ref01_data_up0.id = isotope_ref01_data.id;
        isotope_ref01_data_up0['element_id'] = setup.idmap['element_id'] ?? setup.idmap['element01'];
        const isotope_ref01_markdef_up0 = { name: 'halflife', value: 'Mark01-isotope_ref01_' + setup.now };
        isotope_ref01_data_up0[isotope_ref01_markdef_up0.name] = isotope_ref01_markdef_up0.value;
        const isotope_ref01_resdata_up0 = (await isotope_ref01_ent.update(isotope_ref01_data_up0)).data();
        (0, node_assert_1.default)(isotope_ref01_resdata_up0.id === isotope_ref01_data_up0.id);
        (0, node_assert_1.default)(isotope_ref01_resdata_up0[isotope_ref01_markdef_up0.name] === isotope_ref01_markdef_up0.value);
        // LOAD
        const isotope_ref01_match_dt0 = {};
        isotope_ref01_match_dt0.id = isotope_ref01_data.id;
        isotope_ref01_match_dt0['element_id'] = ['string', 'number', 'boolean'].includes(typeof isotope_ref01_data['element_id']) ?
            isotope_ref01_data['element_id'] : setup.idmap['element_id'] ?? setup.idmap['element01'];
        const isotope_ref01_data_dt0 = (await isotope_ref01_ent.load(isotope_ref01_match_dt0)).data();
        (0, node_assert_1.default)(isotope_ref01_data_dt0.id === isotope_ref01_data.id);
        // REMOVE
        const isotope_ref01_match_rm0 = { id: isotope_ref01_data.id };
        isotope_ref01_match_rm0['element_id'] = setup.idmap['element_id'] ?? setup.idmap['element01'];
        await isotope_ref01_ent.remove(isotope_ref01_match_rm0);
        // LIST
        const isotope_ref01_match_rt0 = {};
        isotope_ref01_match_rt0['element_id'] = setup.idmap['element01'];
        const isotope_ref01_list_rt0 = (await isotope_ref01_ent.list(isotope_ref01_match_rt0)).map((e) => e.data());
        (0, node_assert_1.default)(isempty(select(isotope_ref01_list_rt0, { id: isotope_ref01_data.id })));
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
    const entityDataFile = node_path_1.default.resolve(__dirname, '../../../../.sdk/test/entity/isotope/IsotopeTestData.json');
    // TODO: file ready util needed?
    const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8');
    // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
    const entityData = JSON.parse(entityDataSource);
    options.entity = entityData.existing;
    let client = __1.ElementdemoSDK.test(options, extra);
    const struct = client.utility().struct;
    const merge = struct.merge;
    const transform = struct.transform;
    let idmap = transform(['isotope01', 'isotope02', 'isotope03', 'element01', 'element02', 'element03'], {
        '`$PACK`': ['', {
                '`$KEY`': '`$COPY`',
                '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
            }]
    });
    const env = (0, utility_1.envOverride)({
        'ELEMENTDEMO_TEST_ISOTOPE_ENTID': idmap,
        'ELEMENTDEMO_TEST_LIVE': 'FALSE',
        'ELEMENTDEMO_TEST_EXPLAIN': 'FALSE',
        'ELEMENTDEMO_APIKEY': '',
        'ELEMENTDEMO_SERVER_ACCOUNT_ID': "",
    });
    idmap = env['ELEMENTDEMO_TEST_ISOTOPE_ENTID'];
    const live = 'TRUE' === env.ELEMENTDEMO_TEST_LIVE;
    const transport = (0, live_runner_1.createLiveTransport)();
    if (live) {
        const rawIds = process.env['ELEMENTDEMO_TEST_ISOTOPE_ENTID'];
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
//# sourceMappingURL=IsotopeEntity.test.js.map