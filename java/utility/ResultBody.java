package voxgig.elementdemosdk.utility;

import voxgig.elementdemosdk.core.Context;
import voxgig.elementdemosdk.core.Response;
import voxgig.elementdemosdk.core.Result;

final class ResultBody {

  private ResultBody() {}

  static Result resultBody(Context ctx) {
    Response response = ctx.response;
    Result result = ctx.result;

    if (result != null) {
      if (response != null && response.jsonFunc != null && response.body != null) {
        result.body = response.jsonFunc.get();
      }
    }

    return result;
  }
}
