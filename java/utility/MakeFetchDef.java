package voxgig.elementdemosdk.utility;

import java.util.LinkedHashMap;
import java.util.Map;

import voxgig.elementdemosdk.core.Context;
import voxgig.elementdemosdk.core.Result;
import voxgig.elementdemosdk.core.Spec;
import voxgig.elementdemosdk.utility.struct.Struct;

final class MakeFetchDef {

  private MakeFetchDef() {}

  static Map<String, Object> makeFetchDef(Context ctx) {
    Spec spec = ctx.spec;
    if (spec == null) {
      throw ctx.makeError("fetchdef_no_spec",
          "Expected context spec property to be defined.");
    }

    if (ctx.result == null) {
      ctx.result = new Result(new LinkedHashMap<>());
    }

    spec.step = "prepare";

    String url = ctx.utility.makeUrl.apply(ctx);

    spec.url = url;

    Map<String, Object> fetchdef = new LinkedHashMap<>();
    fetchdef.put("url", url);
    fetchdef.put("method", spec.method);
    fetchdef.put("headers", spec.headers);

    if (spec.body != null) {
      if (spec.body instanceof Map) {
        fetchdef.put("body", Struct.jsonify(spec.body));
      }
      else {
        fetchdef.put("body", spec.body);
      }
    }

    return fetchdef;
  }
}
