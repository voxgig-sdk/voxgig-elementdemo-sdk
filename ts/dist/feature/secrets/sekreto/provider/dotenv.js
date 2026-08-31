"use strict";
// VENDORED: @voxgig/sekreto 0.1.2 (typescript/src/provider/dotenv.ts)
// Source: https://github.com/voxgig/sekreto @ 65009cb5758850db767785ab666e71895f86086b
// License: MIT (c) voxgig - see repository LICENSE. Do not edit: resync from upstream.
/* Copyright (c) 2025 Voxgig Ltd, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotenvprovider = dotenvprovider;
const support_1 = require("./support");
function dotenvprovider(file, prefix) {
    let values;
    const load = () => {
        if (undefined === values) {
            try {
                const { readFileSync } = (0, support_1.nodemod)('node:fs');
                values = (0, support_1.parsedotenv)(readFileSync(file, 'utf8'));
            }
            catch (err) {
                // An absent file - or an absent directory - means "no secrets
                // here", exactly like fileprovider. Anything else (permission
                // denied, an unreadable mount) is a store that could not answer,
                // and swallowing it would fall through to a weaker store.
                if ('ENOENT' === err.code || 'ENOTDIR' === err.code) {
                    values = {};
                }
                else {
                    throw new support_1.SekretoError('sekreto: dotenv provider cannot read ' + file + ': ' + err.message);
                }
            }
        }
        return values;
    };
    return {
        lookup: (name) => load()[(0, support_1.envkey)(name, prefix)],
        describe: () => 'dotenv:' + file,
    };
}
/** Literal values, keyed like environment variables. The spec uses this
 * to test chain behaviour without touching the outside world. */
// Registering at import is what makes this module's presence the only
// thing that decides whether the kind exists in a build.
const Registry_1 = require("./Registry");
(0, Registry_1.register)({
    name: 'dotenv',
    needs: ['fs'],
    define: (spec) => dotenvprovider(spec.file || '.env', spec.prefix),
});
//# sourceMappingURL=dotenv.js.map