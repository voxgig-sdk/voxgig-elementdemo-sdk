"use strict";
// VENDORED: @voxgig/sekreto 0.1.2 (typescript/src/index.ts)
// Source: https://github.com/voxgig/sekreto @ a8c293be1b6c33d65223b2b2275797c241b1a1f1
// License: MIT (c) voxgig - see repository LICENSE. Do not edit: resync from upstream.
// @voxgig/sekreto - one interface for secrets, wherever they live.
Object.defineProperty(exports, "__esModule", { value: true });
exports.sigv4 = exports.onepasswordprovider = exports.memoryprovider = exports.makeprovider = exports.infisicalprovider = exports.hashicorpprovider = exports.gcpsecretsprovider = exports.fileprovider = exports.envprovider = exports.dotenvprovider = exports.dopplerprovider = exports.checkaddr = exports.boruprovider = exports.azuresecretsprovider = exports.awssecretsprovider = exports.awsparamsprovider = exports.vaultref = exports.validname = exports.sekreto = exports.redact = exports.parsedotenv = exports.flatname = exports.envkey = exports.awsparam = exports.SekretoError = exports.Sekreto = void 0;
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
var Providers_1 = require("./Providers");
Object.defineProperty(exports, "awsparamsprovider", { enumerable: true, get: function () { return Providers_1.awsparamsprovider; } });
Object.defineProperty(exports, "awssecretsprovider", { enumerable: true, get: function () { return Providers_1.awssecretsprovider; } });
Object.defineProperty(exports, "azuresecretsprovider", { enumerable: true, get: function () { return Providers_1.azuresecretsprovider; } });
Object.defineProperty(exports, "boruprovider", { enumerable: true, get: function () { return Providers_1.boruprovider; } });
Object.defineProperty(exports, "checkaddr", { enumerable: true, get: function () { return Providers_1.checkaddr; } });
Object.defineProperty(exports, "dopplerprovider", { enumerable: true, get: function () { return Providers_1.dopplerprovider; } });
Object.defineProperty(exports, "dotenvprovider", { enumerable: true, get: function () { return Providers_1.dotenvprovider; } });
Object.defineProperty(exports, "envprovider", { enumerable: true, get: function () { return Providers_1.envprovider; } });
Object.defineProperty(exports, "fileprovider", { enumerable: true, get: function () { return Providers_1.fileprovider; } });
Object.defineProperty(exports, "gcpsecretsprovider", { enumerable: true, get: function () { return Providers_1.gcpsecretsprovider; } });
Object.defineProperty(exports, "hashicorpprovider", { enumerable: true, get: function () { return Providers_1.hashicorpprovider; } });
Object.defineProperty(exports, "infisicalprovider", { enumerable: true, get: function () { return Providers_1.infisicalprovider; } });
Object.defineProperty(exports, "makeprovider", { enumerable: true, get: function () { return Providers_1.makeprovider; } });
Object.defineProperty(exports, "memoryprovider", { enumerable: true, get: function () { return Providers_1.memoryprovider; } });
Object.defineProperty(exports, "onepasswordprovider", { enumerable: true, get: function () { return Providers_1.onepasswordprovider; } });
var Sigv4_1 = require("./Sigv4");
Object.defineProperty(exports, "sigv4", { enumerable: true, get: function () { return Sigv4_1.sigv4; } });
//# sourceMappingURL=index.js.map