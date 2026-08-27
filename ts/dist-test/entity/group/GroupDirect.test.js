"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const envlocal = __dirname + '/../../../.env.local';
require('dotenv').config({ quiet: true, path: [envlocal] });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const __1 = require("../../..");
const utility_1 = require("../../utility");
(0, node_test_1.describe)('GroupDirect', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when ELEMENTDEMO_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('ELEMENTDEMO_TEST_LIVE'));
    (0, node_test_1.test)('direct-exists', async () => {
        const sdk = new __1.ElementdemoSDK({
            // Concrete base: a live construction must satisfy any server
            // variables a templated base URL declares; overriding base with a
            // literal (as the direct flow tests do) sidesteps the requirement.
            base: 'http://localhost:8080',
            system: { fetch: async () => ({}) }
        });
        (0, node_assert_1.default)('function' === typeof sdk.direct);
        (0, node_assert_1.default)('function' === typeof sdk.prepare);
    });
    (0, node_test_1.test)('direct-load-group', async (t) => {
        const setup = directSetup({ id: 'direct01' });
        if ((0, utility_1.maybeSkipControl)(t, 'direct', 'direct-load-group', setup.live))
            return;
        const { client, calls } = setup;
        const params = {};
        const query = {};
        if (setup.live) {
            const listResult = await client.direct({
                path: 'api/group',
                method: 'GET',
                params: {},
            });
            if (!listResult.ok) {
                return; // skip: list call failed (likely synthetic IDs against live API)
            }
            const listArr = unwrapListData(listResult.data);
            if (null == listArr || listArr.length === 0) {
                return; // skip: no entities to load in live mode
            }
            const candidateId = listArr[0]?.id ?? listArr[0]?.id;
            if (null == candidateId) {
                return; // skip: list response shape does not expose load identifier
            }
            params.id = candidateId;
        }
        else {
            params.id = 'direct01';
        }
        const result = await client.direct({
            path: 'api/group/{id}',
            method: 'GET',
            params,
            query,
        });
        (0, node_assert_1.default)(result.ok === true);
        (0, node_assert_1.default)(result.status === 200);
        (0, node_assert_1.default)(null != result.data);
        (0, node_assert_1.default)(result.data.id === 'direct01');
        (0, node_assert_1.default)(calls.length === 1);
        (0, node_assert_1.default)(calls[0].init.method === 'GET');
        (0, node_assert_1.default)(calls[0].url.includes('direct01'));
    });
    (0, node_test_1.test)('direct-list-group', async (t) => {
        const setup = directSetup([{ id: 'direct01' }, { id: 'direct02' }]);
        if ((0, utility_1.maybeSkipControl)(t, 'direct', 'direct-list-group', setup.live))
            return;
        const { client, calls } = setup;
        const params = {};
        const query = {};
        const result = await client.direct({
            path: 'api/group',
            method: 'GET',
            params,
            query,
        });
        (0, node_assert_1.default)(result.ok === true);
        (0, node_assert_1.default)(result.status === 200);
        (0, node_assert_1.default)(null != result.data);
        const listArr = unwrapListData(result.data);
        (0, node_assert_1.default)(Array.isArray(listArr));
        (0, node_assert_1.default)(listArr.length === 2);
        (0, node_assert_1.default)(calls.length === 1);
        (0, node_assert_1.default)(calls[0].init.method === 'GET');
    });
});
function directSetup(mockres) {
    const calls = [];
    const env = (0, utility_1.envOverride)({
        'ELEMENTDEMO_TEST_GROUP_ENTID': {},
        'ELEMENTDEMO_TEST_LIVE': 'FALSE',
    });
    const live = 'TRUE' === env.ELEMENTDEMO_TEST_LIVE;
    if (live) {
        const client = new __1.ElementdemoSDK({});
        let idmap = env['ELEMENTDEMO_TEST_GROUP_ENTID'];
        if ('string' === typeof idmap && idmap.startsWith('{')) {
            idmap = JSON.parse(idmap);
        }
        return { client, calls, live, idmap };
    }
    const mockFetch = async (url, init) => {
        calls.push({ url, init });
        return {
            status: 200,
            statusText: 'OK',
            headers: {},
            json: async () => (null != mockres ? mockres : { id: 'direct01' }),
        };
    };
    const client = new __1.ElementdemoSDK({
        base: 'http://localhost:8080',
        system: { fetch: mockFetch },
    });
    return { client, calls, live, idmap: {} };
}
// direct() returns the raw response body. List endpoints often wrap the
// array in an envelope (e.g. { data: [...] }, { entities: [...] },
// { pagination, data: [...] }). The test transforms the raw body to
// extract the first array — either the body itself or the first array
// property of an envelope object.
function unwrapListData(data) {
    if (Array.isArray(data))
        return data;
    if (data && 'object' === typeof data) {
        for (const v of Object.values(data)) {
            if (Array.isArray(v))
                return v;
        }
    }
    return null;
}
//# sourceMappingURL=GroupDirect.test.js.map