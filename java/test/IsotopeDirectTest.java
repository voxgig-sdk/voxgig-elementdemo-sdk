package voxgig.elementdemosdk.sdktest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Supplier;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import voxgig.elementdemosdk.core.Helpers;
import voxgig.elementdemosdk.core.ElementdemoSDK;
import voxgig.elementdemosdk.utility.Json;

@SuppressWarnings({"unchecked", "unused"})
public class IsotopeDirectTest {

  static Map<String, Object> jm(Object... kv) {
    Map<String, Object> out = new LinkedHashMap<>();
    for (int i = 0; i < kv.length - 1; i += 2) {
      out.put(String.valueOf(kv[i]), kv[i + 1]);
    }
    return out;
  }

  @Test
  public void directListIsotope() {
    List<Object> mockres = new ArrayList<>();
    mockres.add(jm("id", "direct01"));
    mockres.add(jm("id", "direct02"));
    DirectSetup setup = directSetup(mockres);
    String mode = setup.live ? "live" : "unit";
    String reason = RunnerSupport.skipReason("direct", "direct-list-isotope", mode);
    Assumptions.assumeTrue(reason == null,
        reason == null || "".equals(reason)
            ? "skipped via sdk-test-control.json" : reason);
    if (setup.live) {
      for (String liveKey : new String[] { "element01" }) {
        Assumptions.assumeTrue(setup.idmap.get(liveKey) != null,
            "live test needs " + liveKey + " via *_ENTID env var (synthetic IDs only)");
      }
    }
    ElementdemoSDK client = setup.client;

    Map<String, Object> params = new LinkedHashMap<>();
    if (setup.live) {
      params.put("element_id", setup.idmap.get("element01"));
    }
    else {
      params.put("element_id", "direct01");
    }

    Map<String, Object> result = client.direct(jm(
        "path", "element/{element_id}/isotope",
        "method", "GET",
        "params", params));
    if (setup.live) {
      // Live mode is lenient: synthetic IDs frequently 4xx and the
      // list-response shape varies wildly across public APIs. Skip
      // rather than fail when the call doesn't return a usable list.
      Assumptions.assumeTrue(Boolean.TRUE.equals(result.get("ok")),
          "list call not ok (likely synthetic IDs against live API): " + result);
      int status = Helpers.toInt(result.get("status"));
      Assumptions.assumeTrue(status >= 200 && status < 300,
          "expected 2xx status, got " + result.get("status"));
    }
    else {
      assertEquals(true, result.get("ok"), "expected ok to be true");
      assertEquals(200, Helpers.toInt(result.get("status")), "expected status 200");
    }

    if (!setup.live) {
      assertTrue(result.get("data") instanceof List,
          "expected data to be an array, got " + result.get("data"));
      assertEquals(2, ((List<Object>) result.get("data")).size(), "expected 2 items");

      assertEquals(1, setup.calls.size(), "expected 1 call");
      Map<String, Object> call = setup.calls.get(0);
      Map<String, Object> initMap = Helpers.toMapAny(call.get("init"));
      if (initMap != null) {
        assertEquals("GET", initMap.get("method"), "expected method GET");
      }
      String url = call.get("url") instanceof String ? (String) call.get("url") : "";
      assertTrue(url.contains("direct01"),
          "expected url to contain direct01, got " + url);
    }
  }

  @Test
  public void directLoadIsotope() {
    DirectSetup setup = directSetup(jm("id", "direct01"));
    String mode = setup.live ? "live" : "unit";
    String reason = RunnerSupport.skipReason("direct", "direct-load-isotope", mode);
    Assumptions.assumeTrue(reason == null,
        reason == null || "".equals(reason)
            ? "skipped via sdk-test-control.json" : reason);
    if (setup.live) {
      for (String liveKey : new String[] { "element01" }) {
        Assumptions.assumeTrue(setup.idmap.get(liveKey) != null,
            "live test needs " + liveKey + " via *_ENTID env var (synthetic IDs only)");
      }
    }
    ElementdemoSDK client = setup.client;

    Map<String, Object> params = new LinkedHashMap<>();
    Map<String, Object> query = new LinkedHashMap<>();
    if (setup.live) {
      Map<String, Object> listParams = new LinkedHashMap<>();
      listParams.put("element_id", setup.idmap.get("element01"));
      Map<String, Object> listResult = client.direct(jm(
          "path", "element/{element_id}/isotope",
          "method", "GET",
          "params", listParams));
      Assumptions.assumeTrue(Boolean.TRUE.equals(listResult.get("ok")),
          "list call not ok (likely synthetic IDs against live API): " + listResult);

      // Get first entity ID from list
      List<Object> listData = listResult.get("data") instanceof List
          ? (List<Object>) listResult.get("data") : new ArrayList<>();
      Assumptions.assumeTrue(!listData.isEmpty(), "no entities to load in live mode");
      Map<String, Object> firstEnt = Helpers.toMapAny(listData.get(0));
      params.put("id", firstEnt.get("id"));
      params.put("element_id", setup.idmap.get("element01"));
    }
    else {
      params.put("element_id", "direct01");
      params.put("id", "direct02");
    }

    Map<String, Object> result = client.direct(jm(
        "path", "element/{element_id}/isotope/{id}",
        "method", "GET",
        "params", params,
        "query", query));
    if (setup.live) {
      // Live mode is lenient: synthetic IDs frequently 4xx. Skip rather
      // than fail when the load endpoint isn't reachable with the IDs we
      // can construct from setup.idmap.
      Assumptions.assumeTrue(Boolean.TRUE.equals(result.get("ok")),
          "load call not ok (likely synthetic IDs against live API): " + result);
      int status = Helpers.toInt(result.get("status"));
      Assumptions.assumeTrue(status >= 200 && status < 300,
          "expected 2xx status, got " + result.get("status"));
    }
    else {
      assertEquals(true, result.get("ok"), "expected ok to be true");
      assertEquals(200, Helpers.toInt(result.get("status")), "expected status 200");
      assertNotNull(result.get("data"), "expected data to be non-null");
    }

    if (!setup.live) {
      Map<String, Object> dataMap = Helpers.toMapAny(result.get("data"));
      if (dataMap != null) {
        assertEquals("direct01", dataMap.get("id"), "expected data.id to be direct01");
      }

      assertEquals(1, setup.calls.size(), "expected 1 call");
      Map<String, Object> call = setup.calls.get(0);
      Map<String, Object> initMap = Helpers.toMapAny(call.get("init"));
      if (initMap != null) {
        assertEquals("GET", initMap.get("method"), "expected method GET");
      }
      String url = call.get("url") instanceof String ? (String) call.get("url") : "";
      assertTrue(url.contains("direct01"),
          "expected url to contain direct01, got " + url);
      assertTrue(url.contains("direct02"),
          "expected url to contain direct02, got " + url);
    }
  }

  static class DirectSetup {
    ElementdemoSDK client;
    List<Map<String, Object>> calls;
    boolean live;
    Map<String, Object> idmap;
  }

  static DirectSetup directSetup(Object mockres) {
    RunnerSupport.loadEnvLocal();

    final List<Map<String, Object>> calls = new ArrayList<>();

    Map<String, Object> envm = new LinkedHashMap<>();
    envm.put("ELEMENTDEMO_TEST_ISOTOPE_ENTID", new LinkedHashMap<>());
    envm.put("ELEMENTDEMO_TEST_LIVE", "FALSE");
    envm.put("ELEMENTDEMO_APIKEY", "NONE");
    envm.put("ELEMENTDEMO_SERVER_ACCOUNT_ID", "");
    Map<String, Object> env = RunnerSupport.envOverride(envm);

    boolean live = "TRUE".equals(env.get("ELEMENTDEMO_TEST_LIVE"));

    DirectSetup setup = new DirectSetup();
    setup.calls = calls;

    if (live) {
      // sdk-test-control.json's test.client.options seeds the live
      // client; the generated fields below overwrite anything they name.
      Map<String, Object> mergedOpts =
          new LinkedHashMap<>(RunnerSupport.liveClientOptions());
      mergedOpts.put("apikey", env.get("ELEMENTDEMO_APIKEY"));
      Map<String, Object> serveropt = new LinkedHashMap<>();
      serveropt.put("account_id", env.get("ELEMENTDEMO_SERVER_ACCOUNT_ID"));
      mergedOpts.put("server", serveropt);
      setup.client = new ElementdemoSDK(mergedOpts);
      setup.live = true;

      Map<String, Object> idmap = new LinkedHashMap<>();
      Object entidRaw = env.get("ELEMENTDEMO_TEST_ISOTOPE_ENTID");
      if (entidRaw instanceof String && ((String) entidRaw).startsWith("{")) {
        Map<String, Object> parsed = Helpers.toMapAny(Json.parseOrNull((String) entidRaw));
        if (parsed != null) {
          idmap = parsed;
        }
      }
      else if (entidRaw instanceof Map) {
        idmap = (Map<String, Object>) entidRaw;
      }
      setup.idmap = idmap;
      return setup;
    }

    final Object mockdata = mockres != null ? mockres : jm("id", "direct01");
    BiFunction<String, Map<String, Object>, Map<String, Object>> mockFetch =
        (url, init) -> {
          calls.add(jm("url", url, "init", init));
          return jm(
              "status", 200,
              "statusText", "OK",
              "headers", new LinkedHashMap<>(),
              "json", (Supplier<Object>) () -> mockdata);
        };

    setup.client = new ElementdemoSDK(jm(
        "base", "http://localhost:8080",
        "system", jm("fetch", mockFetch)));
    setup.live = false;
    setup.idmap = new LinkedHashMap<>();
    return setup;
  }
}
