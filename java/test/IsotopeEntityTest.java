package voxgig.elementdemosdk.sdktest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import voxgig.elementdemosdk.core.Config;
import voxgig.elementdemosdk.core.Context;
import voxgig.elementdemosdk.core.Helpers;
import voxgig.elementdemosdk.core.SdkEntity;
import voxgig.elementdemosdk.core.SdkError;
import voxgig.elementdemosdk.core.ElementdemoSDK;
import voxgig.elementdemosdk.feature.BaseFeature;
import voxgig.elementdemosdk.utility.Json;
import voxgig.elementdemosdk.utility.struct.Struct;

@SuppressWarnings({"unchecked", "unused"})
public class IsotopeEntityTest {

  // main.kit.test.live.strict is true (the default is true): a live
  // request that fails, or a live test missing an input it needs,
  // fails the test.
  // An account with no record for a test to read skips it either way.
  static final boolean LIVE_STRICT = true;

  @Test
  public void instance() {
    ElementdemoSDK testsdk = ElementdemoSDK.testSDK();
    SdkEntity ent = testsdk.isotope(null);
    assertNotNull(ent, "expected non-null isotope entity");
  }

  @Test
  public void basic() {
    RunnerSupport.EntityTestSetup setup = isotopeBasicSetup(null);
    // Per-op sdk-test-control.json skip — basic test exercises a flow
    // with multiple ops; skipping any op skips the whole flow.
    String mode = setup.live ? "live" : "unit";
    for (String op : new String[] { "create", "list", "update", "load", "remove" }) {
      String reason = RunnerSupport.skipReason("entityOp", "isotope." + op, mode);
      Assumptions.assumeTrue(reason == null,
          reason == null || "".equals(reason)
              ? "skipped via sdk-test-control.json" : reason);
    }
    if (setup.live && "TRUE".equals(System.getenv("VOXGIG_GETONLY_GUARD"))) {
      System.out.println("LIVE STEP {\"id\":\"isotope.create.0\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs POST /element/{element_id}/isotope/{isotope_id}/decay\"}");
      System.out.println("LIVE STEP {\"id\":\"isotope.update.2\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs PUT /element/{element_id}/isotope/{isotope_id}\"}");
      System.out.println("LIVE STEP {\"id\":\"isotope.remove.4\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs DELETE /element/{element_id}/isotope/{isotope_id}\"}");
      System.out.println("LIVE STEP {\"id\":\"isotope.list.5\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: checks a removal this run does not make\"}");
    if (setup.live) {
      for (String liveKey : new String[] { "element01" }) {
        if (setup.syntheticOnly || setup.idmap.get(liveKey) == null) {
          RunnerSupport.liveMiss(LIVE_STRICT, "Live entity test blocked: needs " + liveKey + " via ELEMENTDEMO_TEST_ISOTOPE_ENTID");
        }
      }
    }
    ElementdemoSDK client = setup.client;
    if (setup.live) {
      Object liveId = setup.syntheticOnly ? null : setup.idmap.get("isotope01");
      RunnerSupport.livePace();
      RunnerSupport.liveExisting(setup.data, LIVE_STRICT, "isotope",
          "id", liveId, () -> {
        Map<String, Object> match = new LinkedHashMap<>(); match.put("element_id", setup.idmap.get("element01"));
        return client.isotope(null).list(match, null);
      });
    }

    // Bootstrap entity data from existing test data (no create step in flow).
    List<List<Object>> isotopeRef01DataRaw = Struct.items(Helpers.toMapAny(
        Struct.getpath(setup.data, "existing.isotope")));
    Map<String, Object> isotopeRef01Data = isotopeRef01DataRaw.isEmpty()
        ? null : Helpers.toMapAny(isotopeRef01DataRaw.get(0).get(1));

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // LIST
    SdkEntity isotopeRef01Ent = client.isotope(null);
    Map<String, Object> isotopeRef01Match = new LinkedHashMap<>();
    isotopeRef01Match.put("element_id", setup.idmap.get("element01"));

    Object isotopeRef01ListResult = isotopeRef01Ent.list(isotopeRef01Match, null);
    assertTrue(isotopeRef01ListResult instanceof List,
        "expected list result to be an array, got " + isotopeRef01ListResult);

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // LOAD
    Map<String, Object> isotopeRef01MatchDt0 = new LinkedHashMap<>();
    isotopeRef01MatchDt0.put("id", isotopeRef01Data.get("id"));
    isotopeRef01MatchDt0.put("element_id", isotopeRef01Data.get("element_id") instanceof String || isotopeRef01Data.get("element_id") instanceof Number
        || isotopeRef01Data.get("element_id") instanceof Boolean ? isotopeRef01Data.get("element_id") : (null != setup.idmap.get("element_id") ? setup.idmap.get("element_id") : setup.idmap.get("element01")));
    Object isotopeRef01DataDt0Loaded = isotopeRef01Ent.load(isotopeRef01MatchDt0, null);
    Map<String, Object> isotopeRef01DataDt0LoadResult = Helpers.toMapAny(isotopeRef01DataDt0Loaded instanceof SdkEntity ? ((SdkEntity) isotopeRef01DataDt0Loaded).data() : isotopeRef01DataDt0Loaded);
    assertNotNull(isotopeRef01DataDt0LoadResult, "expected load result to be a map");
    assertTrue(RunnerSupport.liveSameId(isotopeRef01DataDt0LoadResult.get("id"), isotopeRef01Data.get("id")), "expected load result id to match");

      return;
    }

    if (setup.live) {
      for (String liveKey : new String[] { "element01" }) {
        if (setup.syntheticOnly || setup.idmap.get(liveKey) == null) {
          RunnerSupport.liveMiss(LIVE_STRICT, "Live entity test blocked: needs " + liveKey + " via ELEMENTDEMO_TEST_ISOTOPE_ENTID");
        }
      }
    }
    ElementdemoSDK client = setup.client;

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // CREATE
    SdkEntity isotopeRef01Ent = client.isotope(null);
    Map<String, Object> isotopeRef01Data = Helpers.toMapAny(Struct.getprop(
        Struct.getpath(setup.data, "new.isotope"), "isotope_ref01"));
    isotopeRef01Data.put("element_id", setup.idmap.get("element01"));

    Object isotopeRef01DataResult = isotopeRef01Ent.create(isotopeRef01Data, null);
    isotopeRef01Data = Helpers.toMapAny(isotopeRef01DataResult instanceof SdkEntity ? ((SdkEntity) isotopeRef01DataResult).data() : isotopeRef01DataResult);
    assertNotNull(isotopeRef01Data, "expected create result to be a map");
    assertNotNull(isotopeRef01Data.get("id"), "expected created entity to have an id");

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // LIST
    Map<String, Object> isotopeRef01Match = new LinkedHashMap<>();
    isotopeRef01Match.put("element_id", setup.idmap.get("element01"));

    Object isotopeRef01ListResult = isotopeRef01Ent.list(isotopeRef01Match, null);
    assertTrue(isotopeRef01ListResult instanceof List,
        "expected list result to be an array, got " + isotopeRef01ListResult);
    List<Object> isotopeRef01List = (List<Object>) isotopeRef01ListResult;

    List<Object> foundItem = Struct.select(
        RunnerSupport.entityListToData(isotopeRef01List),
        Struct.jm("id", isotopeRef01Data.get("id")));
    assertFalse(Struct.isempty(foundItem), "expected to find created entity in list");

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // UPDATE
    Map<String, Object> isotopeRef01DataUp0Up = new LinkedHashMap<>();
    isotopeRef01DataUp0Up.put("id", isotopeRef01Data.get("id"));
    isotopeRef01DataUp0Up.put("element_id", setup.idmap.get("element_id"));

    String isotopeRef01MarkdefUp0Name = "halflife";
    String isotopeRef01MarkdefUp0Value = "Mark01-isotope_ref01_" + setup.now;
    isotopeRef01DataUp0Up.put(isotopeRef01MarkdefUp0Name, isotopeRef01MarkdefUp0Value);

    Object isotopeRef01ResdataUp0Result = isotopeRef01Ent.update(isotopeRef01DataUp0Up, null);
    Map<String, Object> isotopeRef01ResdataUp0 = Helpers.toMapAny(isotopeRef01ResdataUp0Result instanceof SdkEntity ? ((SdkEntity) isotopeRef01ResdataUp0Result).data() : isotopeRef01ResdataUp0Result);
    assertNotNull(isotopeRef01ResdataUp0, "expected update result to be a map");
    assertTrue(RunnerSupport.liveSameId(isotopeRef01ResdataUp0.get("id"), isotopeRef01DataUp0Up.get("id")), "expected update result id to match");
    assertEquals(isotopeRef01MarkdefUp0Value, isotopeRef01ResdataUp0.get(isotopeRef01MarkdefUp0Name),
        "expected " + isotopeRef01MarkdefUp0Name + " to be updated");

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // LOAD
    Map<String, Object> isotopeRef01MatchDt0 = new LinkedHashMap<>();
    isotopeRef01MatchDt0.put("id", isotopeRef01Data.get("id"));
    isotopeRef01MatchDt0.put("element_id", isotopeRef01Data.get("element_id") instanceof String || isotopeRef01Data.get("element_id") instanceof Number
        || isotopeRef01Data.get("element_id") instanceof Boolean ? isotopeRef01Data.get("element_id") : (null != setup.idmap.get("element_id") ? setup.idmap.get("element_id") : setup.idmap.get("element01")));
    Object isotopeRef01DataDt0Loaded = isotopeRef01Ent.load(isotopeRef01MatchDt0, null);
    Map<String, Object> isotopeRef01DataDt0LoadResult = Helpers.toMapAny(isotopeRef01DataDt0Loaded instanceof SdkEntity ? ((SdkEntity) isotopeRef01DataDt0Loaded).data() : isotopeRef01DataDt0Loaded);
    assertNotNull(isotopeRef01DataDt0LoadResult, "expected load result to be a map");
    assertTrue(RunnerSupport.liveSameId(isotopeRef01DataDt0LoadResult.get("id"), isotopeRef01Data.get("id")), "expected load result id to match");

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // REMOVE
    Map<String, Object> isotopeRef01MatchRm0 = new LinkedHashMap<>();
    isotopeRef01MatchRm0.put("id", isotopeRef01Data.get("id"));
    isotopeRef01MatchRm0.put("element_id", null != setup.idmap.get("element_id")
        ? setup.idmap.get("element_id") : setup.idmap.get("element01"));
    isotopeRef01Ent.remove(isotopeRef01MatchRm0, null);

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // LIST
    Map<String, Object> isotopeRef01MatchRt0 = new LinkedHashMap<>();
    isotopeRef01MatchRt0.put("element_id", setup.idmap.get("element01"));

    Object isotopeRef01ListRt0Result = isotopeRef01Ent.list(isotopeRef01MatchRt0, null);
    assertTrue(isotopeRef01ListRt0Result instanceof List,
        "expected list result to be an array, got " + isotopeRef01ListRt0Result);
    List<Object> isotopeRef01ListRt0 = (List<Object>) isotopeRef01ListRt0Result;

    List<Object> notFoundItem = Struct.select(
        RunnerSupport.entityListToData(isotopeRef01ListRt0),
        Struct.jm("id", isotopeRef01Data.get("id")));
    assertTrue(Struct.isempty(notFoundItem), "expected removed entity to not be in list");

  }

  static boolean hasFeature(String name) {
    Map<String, Object> fm = Helpers.toMapAny(Config.makeConfig().get("feature"));
    return fm != null && fm.get(name) != null;
  }

  @Test
  public void validate() {
    Assumptions.assumeTrue(hasFeature("validate"), "feature not present in this SDK: validate");
    ElementdemoSDK client = ElementdemoSDK.testSDK(null,
        Struct.jm("feature", Struct.jm("validate", Struct.jm("active", true))));
    SdkError err = assertThrows(SdkError.class, () ->
        client.isotope(null).list(Struct.jm("element_id", 1), null));
    assertEquals("validate_failed", err.code);
  }

  static RunnerSupport.EntityTestSetup isotopeBasicSetup(Map<String, Object> extra) {
    RunnerSupport.loadEnvLocal();

    Map<String, Object> entityData;
    try {
      String entityDataSource = Files.readString(Path.of(
          "..", ".sdk", "test", "entity", "isotope", "IsotopeTestData.json"));
      entityData = Helpers.toMapAny(Json.parse(entityDataSource));
    }
    catch (Exception e) {
      throw new AssertionError("failed to read isotope test data: " + e.getMessage(), e);
    }

    Map<String, Object> options = new LinkedHashMap<>();
    options.put("entity", entityData.get("existing"));

    ElementdemoSDK client = ElementdemoSDK.testSDK(options, extra);

    // Generate idmap via transform, matching TS pattern.
    List<Object> idnames = new ArrayList<>();
    idnames.add("isotope01");
    idnames.add("isotope02");
    idnames.add("isotope03");
    idnames.add("element01");
    idnames.add("element02");
    idnames.add("element03");
    Object idmap = Struct.transform(idnames, Json.parse(
        "{\"`$PACK`\": [\"\", {"
        + "\"`$KEY`\": \"`$COPY`\","
        + "\"`$VAL`\": [\"`$FORMAT`\", \"upper\", \"`$COPY`\"]"
        + "}]}"));

    // Whether *_ENTID supplied the idmap, read before envOverride consumes
    // it: without it, the ids a live flow binds are the fixture's synthetic ones.
    String entidEnvRaw = RunnerSupport.getenv("ELEMENTDEMO_TEST_ISOTOPE_ENTID");
    boolean idmapOverridden = entidEnvRaw != null
        && entidEnvRaw.trim().startsWith("{");

    Map<String, Object> envm = new LinkedHashMap<>();
    envm.put("ELEMENTDEMO_TEST_ISOTOPE_ENTID", idmap);
    envm.put("ELEMENTDEMO_TEST_LIVE", "FALSE");
    envm.put("ELEMENTDEMO_TEST_EXPLAIN", "FALSE");
    envm.put("ELEMENTDEMO_APIKEY", "");
    envm.put("ELEMENTDEMO_SERVER_ACCOUNT_ID", "");
    Map<String, Object> env = RunnerSupport.envOverride(envm);

    Map<String, Object> idmapResolved = Helpers.toMapAny(env.get("ELEMENTDEMO_TEST_ISOTOPE_ENTID"));
    if (idmapResolved == null) {
      idmapResolved = Helpers.toMapAny(idmap);
    }
    // Add element_id alias for update test.
    if (idmapResolved.get("element_id") == null) {
      idmapResolved.put("element_id", idmapResolved.get("element01"));
    }

    boolean live = "TRUE".equals(env.get("ELEMENTDEMO_TEST_LIVE"));
    if (live) {
      // sdk-test-control.json's test.client.options seeds the live
      // client; the generated fields below overwrite anything they name.
      Map<String, Object> liveOpts =
          new LinkedHashMap<>(RunnerSupport.liveClientOptions());
      liveOpts.put("apikey", env.get("ELEMENTDEMO_APIKEY"));
      Map<String, Object> serveropt = new LinkedHashMap<>();
      serveropt.put("account_id", env.get("ELEMENTDEMO_SERVER_ACCOUNT_ID"));
      liveOpts.put("server", serveropt);
      // An empty map, not a null one: merge answers null when its last
      // entry is null, and basicSetup is normally called with no extras -
      // so a bare null silently discarded the apikey and server values
      // above.
      Map<String, Object> extraOpts =
          extra == null ? new LinkedHashMap<>() : extra;
      Object mergedOpts = Struct.merge(Struct.jt(liveOpts, extraOpts));
      client = new ElementdemoSDK(Helpers.toMapAny(mergedOpts));
    }

    RunnerSupport.EntityTestSetup setup = new RunnerSupport.EntityTestSetup();
    setup.client = client;
    setup.data = entityData;
    setup.idmap = idmapResolved;
    setup.env = env;
    setup.explain = "TRUE".equals(env.get("ELEMENTDEMO_TEST_EXPLAIN"));
    setup.live = live;
    setup.syntheticOnly = live && !idmapOverridden;
    setup.now = System.currentTimeMillis();
    return setup;
  }
}
