"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareQuery = prepareQuery;
const ParamUtility_1 = require("./ParamUtility");
function prepareQuery(ctx) {
    const utility = ctx.utility;
    const struct = utility.struct;
    const items = struct.items;
    const point = ctx.point;
    let params = point.params;
    let reqmatch = ctx.reqmatch;
    params = params || [];
    reqmatch = reqmatch || {};
    // A path parameter travels in the path. The generated config lists them as
    // args.params, which prepareParams reads; params is the older list of names.
    const inpath = params.concat((point.args?.params || []).map((p) => p?.name));
    // A query parameter travels under the name the definition gives it, its
    // orig, which the model may have renamed for the caller.
    const wire = Object.create(null);
    const declared = [];
    for (const q of (point.args?.query || [])) {
        if ('string' === typeof q?.name) {
            declared.push(q.name);
            if ('string' === typeof q?.orig && '' !== q.orig) {
                wire[q.name] = q.orig;
            }
        }
    }
    // A header or cookie argument travels in the headers, and a field the point's
    // body declares in the body, unless a query parameter shares its name.
    const elsewhere = (point.args?.header || []).concat(point.args?.cookie || [])
        .map((a) => a?.name)
        .concat(Array.isArray(point.fields) ? point.fields : [])
        .filter((name) => !declared.includes(name));
    const out = {};
    for (let [key, val] of items(reqmatch)) {
        if (null != val && '$action' !== key && !inpath.includes(key) && !elsewhere.includes(key)) {
            out[wire[key] ?? key] = val;
        }
    }
    // A create or update passes its query arguments in its data.
    for (const arg of (0, ParamUtility_1.callArgs)(ctx, 'query')) {
        if (null != arg.val && !inpath.includes(arg.name)) {
            out[arg.wire] = arg.val;
        }
    }
    return out;
}
//# sourceMappingURL=PrepareQueryUtility.js.map