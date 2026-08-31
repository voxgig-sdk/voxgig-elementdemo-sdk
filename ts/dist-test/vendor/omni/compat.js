"use strict";
// VENDORED: @voxgig/omni 0.1.2 (typescript/compat/struct.ts), import path adapted ('../src' -> './index').
// Source: https://github.com/voxgig/omni @ 5956cc4e5ecdaeebd11eab8bb4b9462dfc76e018
// License: MIT (c) voxgig - see repository LICENSE. Do not edit: resync from upstream.
// Drop-in replacement for the in-situ test runner in the voxgig/struct
// repository (`typescript/test/runner.ts`).
//
// struct's own runner and omni's runner implement the same spec format;
// this module exposes omni behind struct's exact runner API, so a struct
// port switches over by changing one import:
//
//   -import { makeRunner, nullModifier, NULLMARK } from './runner'
//   +import { makeRunner, nullModifier, NULLMARK } from './omni'
//
// where `./omni` is a small resolver in the port's test directory that
// locates a local omni checkout. Everything else - the corpus, the SDK,
// the test file - is unchanged. This is the TypeScript peer of
// javascript/compat/struct.js and python/voxgig_omni/compat/struct.py.
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullModifier = exports.UNDEFMARK = exports.NULLMARK = exports.EXISTSMARK = void 0;
exports.makeRunner = makeRunner;
exports.structprovider = structprovider;
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const index_1 = require("./index");
Object.defineProperty(exports, "EXISTSMARK", { enumerable: true, get: function () { return index_1.EXISTSMARK; } });
Object.defineProperty(exports, "NULLMARK", { enumerable: true, get: function () { return index_1.NULLMARK; } });
Object.defineProperty(exports, "UNDEFMARK", { enumerable: true, get: function () { return index_1.UNDEFMARK; } });
// The directory this shim was loaded from: dist/compat when built, compat
// when run from source. Its parent is the port root, so every frame from
// inside omni is skipped when locating the caller.
//
// It is derived from __dirname rather than matched against a known path,
// so it holds wherever the package sits - a checkout, or
// node_modules/@voxgig/omni. The trailing separator matters: without it a
// sibling whose name merely EXTENDS this one (`omni-js-extra` beside
// `omni-js`) would read as inside.
const OMNIDIR = (0, node_path_1.dirname)(__dirname);
// A relative test-file path is resolved against the first stack frame
// outside omni - the caller.
//
// PREFER AN ABSOLUTE PATH. This heuristic guesses at what "relative to"
// means, and the guess is wrong whenever a consumer's test FILES sit at a
// different depth from the module that loads the runner. struct's TypeScript
// port is exactly that shape: its loader compiles to `dist-test/` and its
// test files to `dist-test/utility/`, so the same relative string resolved
// one directory too deep and read `typescript/build/test/test.json`. That
// port now resolves the path itself, in `test/omni.ts`, and never reaches
// this. (An earlier version of this comment asserted it already did - it did
// not; this shim shipped before any consumer had proved it.)
// A stack frame's file, as a filesystem path.
//
// An ESM caller's frame reports a file:// URL rather than a path, and
// `dirname('file:///a/b.mjs')` yields 'file:/a', so a relative spec path
// resolved against it died on `ENOENT ... 'file:/.../fib.json'`. Frames
// that name no path at all - node: internals, data: URLs, eval - are
// skipped rather than mistaken for the caller.
function framepath(frame) {
    const file = 'function' === typeof frame.getFileName ? frame.getFileName() : null;
    if (null == file) {
        return null;
    }
    if (file.startsWith('file://')) {
        try {
            return (0, node_url_1.fileURLToPath)(file);
        }
        catch {
            return null;
        }
    }
    return (0, node_path_1.isAbsolute)(file) ? file : null;
}
function callerdir() {
    const original = Error.prepareStackTrace;
    Error.prepareStackTrace = (_err, stack) => stack;
    const holder = {};
    Error.captureStackTrace(holder, callerdir);
    const stack = holder.stack;
    Error.prepareStackTrace = original;
    for (const frame of stack) {
        const file = framepath(frame);
        if (file && !file.startsWith(OMNIDIR + node_path_1.sep)) {
            return (0, node_path_1.dirname)(file);
        }
    }
    return process.cwd();
}
// Wrap a struct SDK client as an omni provider.
function structprovider(sdk) {
    return {
        // struct resolves a subject from the utility, or from utility.struct.
        subject: (name) => {
            const utility = sdk.utility();
            return utility[name] || (utility.struct && utility.struct[name]);
        },
        // A DEF.client entry becomes another SDK instance.
        client: async (options) => structprovider(await sdk.tester(options)),
        // struct's SDK supplies its own context wrapper.
        contextify: (val) => {
            const utility = sdk.utility();
            const hook = 'function' === typeof utility.contextify
                ? utility.contextify
                : 'function' === typeof utility.makeContext
                    ? utility.makeContext
                    : null;
            const ctx = null == hook ? val : hook.call(utility, val);
            if (null != ctx && 'object' === typeof ctx) {
                ;
                ctx.utility = utility;
            }
            return ctx;
        },
        // Client options may reference the runner store.
        inject: (options, store) => {
            const structutils = sdk.utility().struct;
            if (structutils && 'function' === typeof structutils.inject) {
                return structutils.inject(options, store);
            }
            return options;
        },
        utility: () => sdk.utility(),
        tester: (options) => sdk.tester(options),
        sdk,
    };
}
// struct's makeRunner(testfile, client) signature, backed by omni.
async function makeRunner(testfile, client) {
    const specpath = (0, node_path_1.isAbsolute)(testfile) ? testfile : (0, node_path_1.join)(callerdir(), testfile);
    const provider = structprovider(client);
    const runner = await (0, index_1.makeRunner)(specpath, provider);
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
const nullModifier = index_1.nullmodifier;
exports.nullModifier = nullModifier;
//# sourceMappingURL=compat.js.map