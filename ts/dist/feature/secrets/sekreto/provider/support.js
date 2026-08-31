"use strict";
// VENDORED: @voxgig/sekreto 0.1.2 (typescript/src/provider/support.ts)
// Source: https://github.com/voxgig/sekreto @ 65009cb5758850db767785ab666e71895f86086b
// License: MIT (c) voxgig - see repository LICENSE. Do not edit: resync from upstream.
// The providers a Sekreto chains together.
//
// A provider answers one question: "do you have this secret?" It returns
// the value, or undefined to mean "ask the next one". Nothing else about
// a provider is visible to the caller - which is the point: an app reads
// `api.token` and never learns whether it came from the environment, a
// .env file, HashiCorp Vault, AWS, GCP, Azure or a boru vault.
//
// Two failure shapes, and they are never interchangeable. A store that
// does not hold the secret is a MISS (undefined) - the chain carries on.
// A store that could not answer - bad credentials, unreachable host,
// missing configuration - is an ERROR: falling through there would
// quietly reach for a weaker store.
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaultref = exports.parsedotenv = exports.flatname = exports.envkey = exports.checkname = exports.awsparam = exports.SekretoError = void 0;
exports.nodemod = nodemod;
const Sekreto_1 = require("../Sekreto");
Object.defineProperty(exports, "SekretoError", { enumerable: true, get: function () { return Sekreto_1.SekretoError; } });
Object.defineProperty(exports, "awsparam", { enumerable: true, get: function () { return Sekreto_1.awsparam; } });
Object.defineProperty(exports, "checkname", { enumerable: true, get: function () { return Sekreto_1.checkname; } });
Object.defineProperty(exports, "envkey", { enumerable: true, get: function () { return Sekreto_1.envkey; } });
Object.defineProperty(exports, "flatname", { enumerable: true, get: function () { return Sekreto_1.flatname; } });
Object.defineProperty(exports, "parsedotenv", { enumerable: true, get: function () { return Sekreto_1.parsedotenv; } });
Object.defineProperty(exports, "vaultref", { enumerable: true, get: function () { return Sekreto_1.vaultref; } });
// NODE BUILTINS, LOADED ON FIRST USE.
//
// These were top-level imports, which made them a side effect of importing
// sekreto AT ALL: `child_process`, `fs` and `path` entered the module graph
// for a caller who only ever used a `memory` or `env` provider, and any
// runtime lacking them failed at import time rather than at the point of
// use. Sekreto.ts imports makeprovider from this module, so the chain
// reached everything.
//
// A plain require(), not `await import()`: dotenvprovider, fileprovider and
// boruprovider all have SYNCHRONOUS lookups, and making them async to
// accommodate a dynamic import would change observable behaviour for anyone
// calling a provider directly. The package is CommonJS ("type":
// "commonjs"), so require is available and synchronous.
//
// What this buys and what it does not: the builtins are no longer evaluated
// at import time, so importing sekreto is safe in a runtime that lacks them
// and a bundler can drop an unreachable provider along with its edge. It is
// NOT by itself a complete browser story — a bundler still resolves a
// require it can see statically, so a browser build wants conditional
// exports ("browser" field) as well. That is a packaging change, tracked
// separately.
const nodemods = {};
function nodemod(name) {
    let mod = nodemods[name];
    if (undefined === mod) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            mod = nodemods[name] = require(name);
        }
        catch (err) {
            throw new Sekreto_1.SekretoError('sekreto: this provider needs ' +
                name +
                ', which this runtime does not provide: ' +
                err.message);
        }
    }
    return mod;
}
//# sourceMappingURL=support.js.map