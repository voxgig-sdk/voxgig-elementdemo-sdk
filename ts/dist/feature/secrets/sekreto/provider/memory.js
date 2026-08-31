"use strict";
// VENDORED: @voxgig/sekreto 0.1.2 (typescript/src/provider/memory.ts)
// Source: https://github.com/voxgig/sekreto @ 65009cb5758850db767785ab666e71895f86086b
// License: MIT (c) voxgig - see repository LICENSE. Do not edit: resync from upstream.
/* Copyright (c) 2025 Voxgig Ltd, MIT License */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryprovider = memoryprovider;
const support_1 = require("./support");
function memoryprovider(values, prefix) {
    return {
        lookup: (name) => values[(0, support_1.envkey)(name, prefix)],
        describe: () => 'memory' + (prefix ? ':' + prefix : ''),
    };
}
/** A directory of one-secret-per-file entries, keyed like the
 * environment: `api.token` reads `<dir>/API_TOKEN`.
 *
 * This is the shape of a mounted Kubernetes Secret, a Docker or Swarm
 * secret, and a systemd credentials directory, so those all work with no
 * further configuration. One trailing newline is stripped - tools that
 * write these files disagree about it, and a newline is never part of a
 * secret on purpose. */
// Registering at import is what makes this module's presence the only
// thing that decides whether the kind exists in a build.
const Registry_1 = require("./Registry");
(0, Registry_1.register)({
    name: 'memory',
    needs: [],
    define: (spec) => memoryprovider(spec.values || {}, spec.prefix),
});
//# sourceMappingURL=memory.js.map