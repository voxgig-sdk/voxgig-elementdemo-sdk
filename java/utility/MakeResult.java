package voxgig.elementdemosdk.utility;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import voxgig.elementdemosdk.core.Context;
import voxgig.elementdemosdk.core.Entity;
import voxgig.elementdemosdk.core.Operation;
import voxgig.elementdemosdk.core.Result;
import voxgig.elementdemosdk.core.Spec;
import voxgig.elementdemosdk.core.Utility;

@SuppressWarnings({"unchecked"})
final class MakeResult {

  private MakeResult() {}

  static Result makeResult(Context ctx) {
    Object outResult = ctx.out.get("result");
    if (outResult instanceof Result) {
      return (Result) outResult;
    }

    Utility utility = ctx.utility;
    Operation op = ctx.op;
    Entity entity = ctx.entity;
    Spec spec = ctx.spec;
    Result result = ctx.result;

    if (spec == null) {
      throw ctx.makeError("result_no_spec",
          "Expected context spec property to be defined.");
    }
    if (result == null) {
      throw ctx.makeError("result_no_result",
          "Expected context result property to be defined.");
    }

    spec.step = "result";

    utility.transformResponse.apply(ctx);

    if ("list".equals(op.name)) {
      Object resdata = result.resdata;
      result.resdata = new ArrayList<>();

      if (resdata instanceof List && !((List<Object>) resdata).isEmpty()
          && entity != null) {
        List<Object> entities = new ArrayList<>();
        for (Object entry : (List<Object>) resdata) {
          Entity ent = entity.make();
          if (entry instanceof Map) {
            ent.data(entry);
          }
          entities.add(ent);
        }
        result.resdata = entities;
      }
    }

    if (ctx.ctrl.explain != null) {
      ctx.ctrl.explain.put("result", result);
    }

    return result;
  }
}
