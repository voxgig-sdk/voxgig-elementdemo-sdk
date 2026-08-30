package voxgig.elementdemosdk.sdktest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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

import voxgig.elementdemosdk.core.Helpers;
import voxgig.elementdemosdk.core.SdkEntity;
import voxgig.elementdemosdk.core.ElementdemoSDK;
import voxgig.elementdemosdk.utility.Json;
import voxgig.elementdemosdk.utility.struct.Struct;

@SuppressWarnings({"unchecked", "unused"})
public class IsotopeEntityTest {

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
    // The basic flow consumes synthetic IDs from the fixture. In live mode
    // without an *_ENTID env override, those IDs hit the live API and 4xx.
    Assumptions.assumeFalse(setup.syntheticOnly,
        "live entity test uses synthetic IDs from fixture — set ELEMENTDEMO_TEST_ISOTOPE_ENTID JSON to run live");
    ElementdemoSDK client = setup.client;

    // CREATE
    SdkEntity isotopeRef01Ent = client.isotope(null);
    Map<String, Object> isotopeRef01Data = Helpers.toMapAny(Struct.getprop(
        Struct.getpath(setup.data, "new.isotope"), "isotope_ref01"));
    isotopeRef01Data.put("element_id", setup.idmap.get("element01"));

    Object isotopeRef01DataResult = isotopeRef01Ent.create(isotopeRef01Data, null);
    isotopeRef01Data = Helpers.toMapAny(isotopeRef01DataResult instanceof SdkEntity ? ((SdkEntity) isotopeRef01DataResult).data() : isotopeRef01DataResult);
    assertNotNull(isotopeRef01Data, "expected create result to be a map");
    assertNotNull(isotopeRef01Data.get("id"), "expected created entity to have an id");

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
    assertEquals(isotopeRef01DataUp0Up.get("id"), isotopeRef01ResdataUp0.get("id"),
        "expected update result id to match");
    assertEquals(isotopeRef01MarkdefUp0Value, isotopeRef01ResdataUp0.get(isotopeRef01MarkdefUp0Name),
        "expected " + isotopeRef01MarkdefUp0Name + " to be updated");

    // LOAD
    Map<String, Object> isotopeRef01MatchDt0 = new LinkedHashMap<>();
    isotopeRef01MatchDt0.put("id", isotopeRef01Data.get("id"));
    Object isotopeRef01DataDt0Loaded = isotopeRef01Ent.load(isotopeRef01MatchDt0, null);
    Map<String, Object> isotopeRef01DataDt0LoadResult = Helpers.toMapAny(isotopeRef01DataDt0Loaded instanceof SdkEntity ? ((SdkEntity) isotopeRef01DataDt0Loaded).data() : isotopeRef01DataDt0Loaded);
    assertNotNull(isotopeRef01DataDt0LoadResult, "expected load result to be a map");
    assertEquals(isotopeRef01Data.get("id"), isotopeRef01DataDt0LoadResult.get("id"),
        "expected load result id to match");

    // REMOVE
    Map<String, Object> isotopeRef01MatchRm0 = new LinkedHashMap<>();
    isotopeRef01MatchRm0.put("id", isotopeRef01Data.get("id"));
    isotopeRef01Ent.remove(isotopeRef01MatchRm0, null);

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

  @Test
  public void stream() {
    Map<String, Object> streamingActive = new LinkedHashMap<>();
    Map<String, Object> streamingOpts = new LinkedHashMap<>();
    streamingOpts.put("active", true);
    Map<String, Object> featureOpts = new LinkedHashMap<>();
    featureOpts.put("streaming", streamingOpts);
    streamingActive.put("feature", featureOpts);

    RunnerSupport.EntityTestSetup setup = isotopeBasicSetup(streamingActive);
    Assumptions.assumeFalse(setup.live,
        "stream test streams the seeded fixture data (unit mode only)");

    SdkEntity ent = setup.client.isotope(null);
    Map<String, Object> match = new LinkedHashMap<>();

    // Materialised list result for the same op.
    Object listedResult = ent.list(match, null);
    List<Object> listed = listedResult instanceof List
        ? (List<Object>) listedResult : new ArrayList<>();

    // stream("list") yields items via the streaming feature's iterator.
    List<Object> streamed = ent.stream("list", match, null)
        .collect(Collectors.toList());
    assertTrue(streamed.size() > 0, "expected stream to yield items");
    assertEquals(listed.size(), streamed.size(),
        "expected stream to yield the same item count as list");

    // Fallback: with streaming inactive, stream still yields the
    // materialised items.
    RunnerSupport.EntityTestSetup setup2 = isotopeBasicSetup(null);
    SdkEntity ent2 = setup2.client.isotope(null);
    List<Object> streamed2 = ent2.stream("list", match, null)
        .collect(Collectors.toList());
    assertEquals(listed.size(), streamed2.size(),
        "expected fallback stream to yield the materialised items");
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

    // Detect ENTID env override before envOverride consumes it. When live
    // mode is on without a real override, the basic test runs against
    // synthetic IDs from the fixture and 4xx's. Surface this so the test
    // can skip.
    String entidEnvRaw = RunnerSupport.getenv("ELEMENTDEMO_TEST_ISOTOPE_ENTID");
    boolean idmapOverridden = entidEnvRaw != null
        && entidEnvRaw.trim().startsWith("{");

    Map<String, Object> envm = new LinkedHashMap<>();
    envm.put("ELEMENTDEMO_TEST_ISOTOPE_ENTID", idmap);
    envm.put("ELEMENTDEMO_TEST_LIVE", "FALSE");
    envm.put("ELEMENTDEMO_TEST_EXPLAIN", "FALSE");
    envm.put("ELEMENTDEMO_APIKEY", "NONE");
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
