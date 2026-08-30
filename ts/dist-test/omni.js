"use strict";
// The corpus test runner: vendored @voxgig/omni behind the struct-runner
// API the corpus tests already use (`import { makeRunner } from '../omni'`
// instead of the old hand-vendored '../runner').
//
// Two local decisions, both required (see vendor/omni/compat.ts):
//
// 1. SPEC PATH. The compat shim's caller-directory heuristic resolves a
//    relative test-file path one level too deep for this layout (loader in
//    dist-test/, test files in dist-test/utility/) - its own header says a
//    port must resolve the path itself. This module compiles to
//    dist-test/omni.js, the same depth as the old dist-test/runner.js, so
//    the existing TEST_JSON_FILE constant keeps working verbatim.
//
// 2. PROVIDER DELEGATION. Corpus-driven contexts get `ctx.client` set to
//    the runner's provider. The stock structprovider forwards utility()
//    and tester() but not options()/_features/_rootctx/_mode, which the
//    corpus subjects and pipeline utilities (prepareHeaders via
//    client.options(), test helpers via client._rootctx) do reach. The
//    provider below is built by PROTOTYPE DELEGATION over the live SDK
//    instance, so every SDK member resolves while the four omni hooks sit
//    on top. Upstream omni's compat shim could adopt the same shape.
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullModifier = exports.OmniError = exports.UNDEFMARK = exports.NULLMARK = exports.EXISTSMARK = void 0;
exports.makeRunner = makeRunner;
const node_path_1 = require("node:path");
const compat_1 = require("./vendor/omni/compat");
Object.defineProperty(exports, "EXISTSMARK", { enumerable: true, get: function () { return compat_1.EXISTSMARK; } });
Object.defineProperty(exports, "NULLMARK", { enumerable: true, get: function () { return compat_1.NULLMARK; } });
Object.defineProperty(exports, "UNDEFMARK", { enumerable: true, get: function () { return compat_1.UNDEFMARK; } });
Object.defineProperty(exports, "nullModifier", { enumerable: true, get: function () { return compat_1.nullModifier; } });
const index_1 = require("./vendor/omni/index");
Object.defineProperty(exports, "OmniError", { enumerable: true, get: function () { return index_1.OmniError; } });
// Wrap the SDK as an omni provider WITHOUT hiding it: hooks from the stock
// structprovider, everything else through the prototype chain.
function sdkprovider(sdk) {
    const hooks = (0, compat_1.structprovider)(sdk);
    const provider = Object.assign(Object.create(sdk), hooks);
    // DEF.client entries become SDK instances too - rewrap with the same
    // delegating shape, not the stock one.
    provider.client = async (options) => sdkprovider(await sdk.tester(options));
    return provider;
}
// struct's makeRunner(testfile, client) signature, backed by vendored omni.
// Also accepts an already-parsed spec object (omni's own capability), which
// keeps smoke tests free of fixture files.
async function makeRunner(testfile, client) {
    const specref = 'string' !== typeof testfile ? testfile
        : (0, node_path_1.isAbsolute)(testfile) ? testfile
            : (0, node_path_1.join)(__dirname, testfile);
    const provider = sdkprovider(client);
    const runner = await (0, index_1.makeRunner)(specref, provider);
    return async function structrunner(name, store) {
        const runpack = await runner(name, store);
        return {
            spec: runpack.spec,
            runset: runpack.runset,
            runsetflags: runpack.runsetflags,
            subject: runpack.subject,
            client: provider,
        };
    };
}
//# sourceMappingURL=omni.js.map