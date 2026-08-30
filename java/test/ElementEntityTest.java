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
public class ElementEntityTest {

  @Test
  public void instance() {
    ElementdemoSDK testsdk = ElementdemoSDK.testSDK();
    SdkEntity ent = testsdk.element(null);
    assertNotNull(ent, "expected non-null element entity");
  }

  @Test
  public void basic() {
    RunnerSupport.EntityTestSetup setup = elementBasicSetup(null);
    // Per-op sdk-test-control.json skip — basic test exercises a flow
    // with multiple ops; skipping any op skips the whole flow.
    String mode = setup.live ? "live" : "unit";
    for (String op : new String[] { "create", "list", "update", "load", "remove" }) {
      String reason = RunnerSupport.skipReason("entityOp", "element." + op, mode);
      Assumptions.assumeTrue(reason == null,
          reason == null || "".equals(reason)
              ? "skipped via sdk-test-control.json" : reason);
    }
    // The basic flow consumes synthetic IDs from the fixture. In live mode
    // without an *_ENTID env override, those IDs hit the live API and 4xx.
    Assumptions.assumeFalse(setup.syntheticOnly,
        "live entity test uses synthetic IDs from fixture — set ELEMENTDEMO_TEST_ELEMENT_ENTID JSON to run live");
    ElementdemoSDK client = setup.client;

    // CREATE
    SdkEntity elementRef01Ent = client.element(null);
    Map<String, Object> elementRef01Data = Helpers.toMapAny(Struct.getprop(
        Struct.getpath(setup.data, "new.element"), "element_ref01"));

    Object elementRef01DataResult = elementRef01Ent.create(elementRef01Data, null);
    elementRef01Data = Helpers.toMapAny(elementRef01DataResult instanceof SdkEntity ? ((SdkEntity) elementRef01DataResult).data() : elementRef01DataResult);
    assertNotNull(elementRef01Data, "expected create result to be a map");
    assertNotNull(elementRef01Data.get("id"), "expected created entity to have an id");

    // LIST
    Map<String, Object> elementRef01Match = new LinkedHashMap<>();

    Object elementRef01ListResult = elementRef01Ent.list(elementRef01Match, null);
    assertTrue(elementRef01ListResult instanceof List,
        "expected list result to be an array, got " + elementRef01ListResult);
    List<Object> elementRef01List = (List<Object>) elementRef01ListResult;

    List<Object> foundItem = Struct.select(
        RunnerSupport.entityListToData(elementRef01List),
        Struct.jm("id", elementRef01Data.get("id")));
    assertFalse(Struct.isempty(foundItem), "expected to find created entity in list");

    // UPDATE
    Map<String, Object> elementRef01DataUp0Up = new LinkedHashMap<>();
    elementRef01DataUp0Up.put("id", elementRef01Data.get("id"));

    String elementRef01MarkdefUp0Name = "block";
    String elementRef01MarkdefUp0Value = "Mark01-element_ref01_" + setup.now;
    elementRef01DataUp0Up.put(elementRef01MarkdefUp0Name, elementRef01MarkdefUp0Value);

    Object elementRef01ResdataUp0Result = elementRef01Ent.update(elementRef01DataUp0Up, null);
    Map<String, Object> elementRef01ResdataUp0 = Helpers.toMapAny(elementRef01ResdataUp0Result instanceof SdkEntity ? ((SdkEntity) elementRef01ResdataUp0Result).data() : elementRef01ResdataUp0Result);
    assertNotNull(elementRef01ResdataUp0, "expected update result to be a map");
    assertEquals(elementRef01DataUp0Up.get("id"), elementRef01ResdataUp0.get("id"),
        "expected update result id to match");
    assertEquals(elementRef01MarkdefUp0Value, elementRef01ResdataUp0.get(elementRef01MarkdefUp0Name),
        "expected " + elementRef01MarkdefUp0Name + " to be updated");

    // LOAD
    Map<String, Object> elementRef01MatchDt0 = new LinkedHashMap<>();
    elementRef01MatchDt0.put("id", elementRef01Data.get("id"));
    Object elementRef01DataDt0Loaded = elementRef01Ent.load(elementRef01MatchDt0, null);
    Map<String, Object> elementRef01DataDt0LoadResult = Helpers.toMapAny(elementRef01DataDt0Loaded instanceof SdkEntity ? ((SdkEntity) elementRef01DataDt0Loaded).data() : elementRef01DataDt0Loaded);
    assertNotNull(elementRef01DataDt0LoadResult, "expected load result to be a map");
    assertEquals(elementRef01Data.get("id"), elementRef01DataDt0LoadResult.get("id"),
        "expected load result id to match");

    // REMOVE
    Map<String, Object> elementRef01MatchRm0 = new LinkedHashMap<>();
    elementRef01MatchRm0.put("id", elementRef01Data.get("id"));
    elementRef01Ent.remove(elementRef01MatchRm0, null);

    // LIST
    Map<String, Object> elementRef01MatchRt0 = new LinkedHashMap<>();

    Object elementRef01ListRt0Result = elementRef01Ent.list(elementRef01MatchRt0, null);
    assertTrue(elementRef01ListRt0Result instanceof List,
        "expected list result to be an array, got " + elementRef01ListRt0Result);
    List<Object> elementRef01ListRt0 = (List<Object>) elementRef01ListRt0Result;

    List<Object> notFoundItem = Struct.select(
        RunnerSupport.entityListToData(elementRef01ListRt0),
        Struct.jm("id", elementRef01Data.get("id")));
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

    RunnerSupport.EntityTestSetup setup = elementBasicSetup(streamingActive);
    Assumptions.assumeFalse(setup.live,
        "stream test streams the seeded fixture data (unit mode only)");

    SdkEntity ent = setup.client.element(null);
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
    RunnerSupport.EntityTestSetup setup2 = elementBasicSetup(null);
    SdkEntity ent2 = setup2.client.element(null);
    List<Object> streamed2 = ent2.stream("list", match, null)
        .collect(Collectors.toList());
    assertEquals(listed.size(), streamed2.size(),
        "expected fallback stream to yield the materialised items");
  }

  static RunnerSupport.EntityTestSetup elementBasicSetup(Map<String, Object> extra) {
    RunnerSupport.loadEnvLocal();

    Map<String, Object> entityData;
    try {
      String entityDataSource = Files.readString(Path.of(
          "..", ".sdk", "test", "entity", "element", "ElementTestData.json"));
      entityData = Helpers.toMapAny(Json.parse(entityDataSource));
    }
    catch (Exception e) {
      throw new AssertionError("failed to read element test data: " + e.getMessage(), e);
    }

    Map<String, Object> options = new LinkedHashMap<>();
    options.put("entity", entityData.get("existing"));

    ElementdemoSDK client = ElementdemoSDK.testSDK(options, extra);

    // Generate idmap via transform, matching TS pattern.
    List<Object> idnames = new ArrayList<>();
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
    String entidEnvRaw = RunnerSupport.getenv("ELEMENTDEMO_TEST_ELEMENT_ENTID");
    boolean idmapOverridden = entidEnvRaw != null
        && entidEnvRaw.trim().startsWith("{");

    Map<String, Object> envm = new LinkedHashMap<>();
    envm.put("ELEMENTDEMO_TEST_ELEMENT_ENTID", idmap);
    envm.put("ELEMENTDEMO_TEST_LIVE", "FALSE");
    envm.put("ELEMENTDEMO_TEST_EXPLAIN", "FALSE");
    envm.put("ELEMENTDEMO_APIKEY", "NONE");
    envm.put("ELEMENTDEMO_SERVER_ACCOUNT_ID", "");
    Map<String, Object> env = RunnerSupport.envOverride(envm);

    Map<String, Object> idmapResolved = Helpers.toMapAny(env.get("ELEMENTDEMO_TEST_ELEMENT_ENTID"));
    if (idmapResolved == null) {
      idmapResolved = Helpers.toMapAny(idmap);
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
