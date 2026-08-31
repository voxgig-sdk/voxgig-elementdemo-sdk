"use strict";
// VENDORED: @voxgig/sekreto 0.1.2 (typescript/src/index.ts)
// Source: https://github.com/voxgig/sekreto @ 65009cb5758850db767785ab666e71895f86086b
// License: MIT (c) voxgig - see repository LICENSE. Do not edit: resync from upstream.
// @voxgig/sekreto - one interface for secrets, wherever they live.
Object.defineProperty(exports, "__esModule", { value: true });
exports.kinds = exports.registered = exports.register = exports.makeprovider = exports.checkaddr = exports.memoryprovider = exports.envprovider = exports.vaultref = exports.validname = exports.sekreto = exports.redact = exports.parsedotenv = exports.flatname = exports.envkey = exports.awsparam = exports.SekretoError = exports.Sekreto = void 0;
var Sekreto_1 = require("./Sekreto");
Object.defineProperty(exports, "Sekreto", { enumerable: true, get: function () { return Sekreto_1.Sekreto; } });
Object.defineProperty(exports, "SekretoError", { enumerable: true, get: function () { return Sekreto_1.SekretoError; } });
Object.defineProperty(exports, "awsparam", { enumerable: true, get: function () { return Sekreto_1.awsparam; } });
Object.defineProperty(exports, "envkey", { enumerable: true, get: function () { return Sekreto_1.envkey; } });
Object.defineProperty(exports, "flatname", { enumerable: true, get: function () { return Sekreto_1.flatname; } });
Object.defineProperty(exports, "parsedotenv", { enumerable: true, get: function () { return Sekreto_1.parsedotenv; } });
Object.defineProperty(exports, "redact", { enumerable: true, get: function () { return Sekreto_1.redact; } });
Object.defineProperty(exports, "sekreto", { enumerable: true, get: function () { return Sekreto_1.sekreto; } });
Object.defineProperty(exports, "validname", { enumerable: true, get: function () { return Sekreto_1.validname; } });
Object.defineProperty(exports, "vaultref", { enumerable: true, get: function () { return Sekreto_1.vaultref; } });
// THE CORE SURFACE. Deliberately does NOT re-export the eleven provider
// kinds that need something of their runtime: pulling one through this
// file would make all of them reachable and put AWS request signing in
// every build, which is the thing the split removes.
//
// `env` and `memory` are here because they import nothing at all, and a
// chain with nowhere to read from is not usable or testable.
//
// Everything else registers itself when its module is imported:
//
//     import '@voxgig/sekreto/provider/dotenv'
//
// or, for the old all-in behaviour, `from '@voxgig/sekreto/Providers'`.
// See docs/design/plugin-providers.md.
var env_1 = require("./provider/env");
Object.defineProperty(exports, "envprovider", { enumerable: true, get: function () { return env_1.envprovider; } });
var memory_1 = require("./provider/memory");
Object.defineProperty(exports, "memoryprovider", { enumerable: true, get: function () { return memory_1.memoryprovider; } });
// A pure validator, no platform dependency - kept on the core surface
// because callers validate an address before configuring a provider.
var addr_1 = require("./provider/addr");
Object.defineProperty(exports, "checkaddr", { enumerable: true, get: function () { return addr_1.checkaddr; } });
var Registry_1 = require("./provider/Registry");
Object.defineProperty(exports, "makeprovider", { enumerable: true, get: function () { return Registry_1.makeprovider; } });
Object.defineProperty(exports, "register", { enumerable: true, get: function () { return Registry_1.register; } });
Object.defineProperty(exports, "registered", { enumerable: true, get: function () { return Registry_1.registered; } });
Object.defineProperty(exports, "kinds", { enumerable: true, get: function () { return Registry_1.kinds; } });
// `sigv4` is NOT on the core surface: it is the node:crypto edge, and
// only the two aws providers use it. Import it from the module that
// needs it - `@voxgig/sekreto/provider/aws` - or from the full-set
// barrel. Re-exporting it here would put request signing in every
// build again, which is the thing the split removes.
//# sourceMappingURL=index.js.map