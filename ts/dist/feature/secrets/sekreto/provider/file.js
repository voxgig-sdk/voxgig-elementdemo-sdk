"use strict";
// VENDORED: @voxgig/sekreto 0.1.2 (typescript/src/provider/file.ts)
// Source: https://github.com/voxgig/sekreto @ 65009cb5758850db767785ab666e71895f86086b
// License: MIT (c) voxgig - see repository LICENSE. Do not edit: resync from upstream.
/* Copyright (c) 2025 Voxgig Ltd, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileprovider = fileprovider;
const support_1 = require("./support");
function fileprovider(dir, prefix) {
    return {
        lookup: (name) => {
            const { join } = (0, support_1.nodemod)('node:path');
            const file = join(dir, (0, support_1.envkey)(name, prefix));
            let text;
            try {
                const { readFileSync } = (0, support_1.nodemod)('node:fs');
                text = readFileSync(file, 'utf8');
            }
            catch (err) {
                // An absent file - or an absent directory - means "no secrets
                // here", exactly like a missing .env. Anything else (permission
                // denied, an unreadable mount) is a store that could not answer.
                if ('ENOENT' === err.code || 'ENOTDIR' === err.code) {
                    return undefined;
                }
                throw new support_1.SekretoError('sekreto: file provider cannot read ' + file + ': ' + err.message);
            }
            return text.replace(/\r?\n$/, '');
        },
        describe: () => 'file:' + dir,
    };
}
/** Refuse to send a secret-bearing credential in the clear.
 *
 * A vault API is HTTPS in any real deployment; plaintext is a dev-mode
 * convenience. Sending a token over http to anything but the local
 * machine puts both the token and the secret it fetches on the wire for
 * anyone on the path, so sekreto will not do it. Loopback stays allowed:
 * that is `vault server -dev`, `boru vault serve`, and this repo's own
 * test harness. */
// Registering at import is what makes this module's presence the only
// thing that decides whether the kind exists in a build.
const Registry_1 = require("./Registry");
(0, Registry_1.register)({
    name: 'file',
    needs: ['fs'],
    define: (spec) => fileprovider(spec.dir || '', spec.prefix),
});
//# sourceMappingURL=file.js.map