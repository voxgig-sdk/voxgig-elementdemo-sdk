"use strict";
// VENDORED: @voxgig/plugin 0.2.0 (typescript/src/Types.ts)
// Source: https://github.com/voxgig/plugin @ caa404b2dfa206d77db6c2869e5b31c2a3202b2d  [tag: sdk-20261016-0845-0]
// License: MIT (c) voxgig - see repository LICENSE. Do not edit: resync from upstream.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginError = exports.DETAIL_ORDER = void 0;
exports.formaterror = formaterror;
exports.fail = fail;
exports.DETAIL_ORDER = [
    'host', 'ref', 'name', 'tag', 'point', 'key', 'capability',
    'range', 'version', 'match', 'candidates', 'cycle', 'holders',
    'refs', 'path', 'cause',
];
/** `plugin/<code>: <text> [<key>=<value> …]`
 *
 * Values render as COMPACT JSON, so a value containing a space or a
 * bracket cannot break the parse, and a list renders as a JSON array.
 * The bracket is absent entirely when no field applies. */
function formaterror(code, text, details) {
    const d = details || {};
    const parts = [];
    for (const k of exports.DETAIL_ORDER) {
        if (undefined === d[k])
            continue;
        parts.push(k + '=' + JSON.stringify(d[k]));
    }
    const tail = 0 === parts.length ? '' : ' [' + parts.join(' ') + ']';
    return 'plugin/' + code + ': ' + text + tail;
}
class PluginError extends Error {
    code;
    text;
    details;
    constructor(code, text, details) {
        super(formaterror(code, text, details));
        this.name = 'PluginError';
        this.code = code;
        this.text = text;
        this.details = details || {};
    }
}
exports.PluginError = PluginError;
function fail(code, text, details) {
    throw new PluginError(code, text, details);
}
//# sourceMappingURL=Types.js.map