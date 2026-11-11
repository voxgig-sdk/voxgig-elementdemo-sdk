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
public class ElementEntityTest {

  // main.kit.test.live.strict is true (the default is true): a live
  // request that fails, or a live test missing an input it needs,
  // fails the test.
  // An account with no record for a test to read skips it either way.
  static final boolean LIVE_STRICT = true;

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
    if (setup.live && "TRUE".equals(System.getenv("VOXGIG_GETONLY_GUARD"))) {
      System.out.println("LIVE STEP {\"id\":\"element.create.0\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs POST /element/{element_id}/ionize\"}");
      System.out.println("LIVE STEP {\"id\":\"element.update.2\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs PUT /element/{element_id}\"}");
      System.out.println("LIVE STEP {\"id\":\"element.remove.4\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs DELETE /element/{element_id}\"}");
      System.out.println("LIVE STEP {\"id\":\"element.list.5\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: checks a removal this run does not make\"}");
    ElementdemoSDK client = setup.client;
    if (setup.live) {
      Object liveId = setup.syntheticOnly ? null : setup.idmap.get("element01");
      RunnerSupport.livePace();
      RunnerSupport.liveExisting(setup.data, LIVE_STRICT, "element",
          "id", liveId, () -> {
        Map<String, Object> match = new LinkedHashMap<>();
        return client.element(null).list(match, null);
      });
    }

    // Bootstrap entity data from existing test data (no create step in flow).
    List<List<Object>> elementRef01DataRaw = Struct.items(Helpers.toMapAny(
        Struct.getpath(setup.data, "existing.element")));
    Map<String, Object> elementRef01Data = elementRef01DataRaw.isEmpty()
        ? null : Helpers.toMapAny(elementRef01DataRaw.get(0).get(1));

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // LIST
    SdkEntity elementRef01Ent = client.element(null);
    Map<String, Object> elementRef01Match = new LinkedHashMap<>();

    Object elementRef01ListResult = elementRef01Ent.list(elementRef01Match, null);
    assertTrue(elementRef01ListResult instanceof List,
        "expected list result to be an array, got " + elementRef01ListResult);

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // LOAD
    Map<String, Object> elementRef01MatchDt0 = new LinkedHashMap<>();
    elementRef01MatchDt0.put("id", elementRef01Data.get("id"));
    Object elementRef01DataDt0Loaded = elementRef01Ent.load(elementRef01MatchDt0, null);
    Map<String, Object> elementRef01DataDt0LoadResult = Helpers.toMapAny(elementRef01DataDt0Loaded instanceof SdkEntity ? ((SdkEntity) elementRef01DataDt0Loaded).data() : elementRef01DataDt0Loaded);
    assertNotNull(elementRef01DataDt0LoadResult, "expected load result to be a map");
    assertTrue(RunnerSupport.liveSameId(elementRef01DataDt0LoadResult.get("id"), elementRef01Data.get("id")), "expected load result id to match");

      return;
    }

    ElementdemoSDK client = setup.client;

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // CREATE
    SdkEntity elementRef01Ent = client.element(null);
    Map<String, Object> elementRef01Data = Helpers.toMapAny(Struct.getprop(
        Struct.getpath(setup.data, "new.element"), "element_ref01"));

    Object elementRef01DataResult = elementRef01Ent.create(elementRef01Data, null);
    elementRef01Data = Helpers.toMapAny(elementRef01DataResult instanceof SdkEntity ? ((SdkEntity) elementRef01DataResult).data() : elementRef01DataResult);
    assertNotNull(elementRef01Data, "expected create result to be a map");
    assertNotNull(elementRef01Data.get("id"), "expected created entity to have an id");

    if (setup.live) {
      RunnerSupport.livePace();
    }
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

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // UPDATE
    Map<String, Object> elementRef01DataUp0Up = new LinkedHashMap<>();
    elementRef01DataUp0Up.put("id", elementRef01Data.get("id"));

    String elementRef01MarkdefUp0Name = "block";
    String elementRef01MarkdefUp0Value = "Mark01-element_ref01_" + setup.now;
    elementRef01DataUp0Up.put(elementRef01MarkdefUp0Name, elementRef01MarkdefUp0Value);

    Object elementRef01ResdataUp0Result = elementRef01Ent.update(elementRef01DataUp0Up, null);
    Map<String, Object> elementRef01ResdataUp0 = Helpers.toMapAny(elementRef01ResdataUp0Result instanceof SdkEntity ? ((SdkEntity) elementRef01ResdataUp0Result).data() : elementRef01ResdataUp0Result);
    assertNotNull(elementRef01ResdataUp0, "expected update result to be a map");
    assertTrue(RunnerSupport.liveSameId(elementRef01ResdataUp0.get("id"), elementRef01DataUp0Up.get("id")), "expected update result id to match");
    assertEquals(elementRef01MarkdefUp0Value, elementRef01ResdataUp0.get(elementRef01MarkdefUp0Name),
        "expected " + elementRef01MarkdefUp0Name + " to be updated");

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // LOAD
    Map<String, Object> elementRef01MatchDt0 = new LinkedHashMap<>();
    elementRef01MatchDt0.put("id", elementRef01Data.get("id"));
    Object elementRef01DataDt0Loaded = elementRef01Ent.load(elementRef01MatchDt0, null);
    Map<String, Object> elementRef01DataDt0LoadResult = Helpers.toMapAny(elementRef01DataDt0Loaded instanceof SdkEntity ? ((SdkEntity) elementRef01DataDt0Loaded).data() : elementRef01DataDt0Loaded);
    assertNotNull(elementRef01DataDt0LoadResult, "expected load result to be a map");
    assertTrue(RunnerSupport.liveSameId(elementRef01DataDt0LoadResult.get("id"), elementRef01Data.get("id")), "expected load result id to match");

    if (setup.live) {
      RunnerSupport.livePace();
    }
    // REMOVE
    Map<String, Object> elementRef01MatchRm0 = new LinkedHashMap<>();
    elementRef01MatchRm0.put("id", elementRef01Data.get("id"));
    elementRef01Ent.remove(elementRef01MatchRm0, null);

    if (setup.live) {
      RunnerSupport.livePace();
    }
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

  static boolean hasFeature(String name) {
    Map<String, Object> fm = Helpers.toMapAny(Config.makeConfig().get("feature"));
    return fm != null && fm.get(name) != null;
  }

  public static final class FailHook extends BaseFeature {
    int unexpected = 0;

    FailHook() {
      super("failhook", "0.0.1", true);
    }

    @Override
    public void preSpec(Context ctx) {
      throw new RuntimeException("element hook failed");
    }

    @Override
    public void preUnexpected(Context ctx) {
      this.unexpected++;
    }
  }

  @Test
  public void streamError() {
    Map<String, Object> offline = Struct.jm("net", Struct.jm("offline", true));
    RuntimeException err = assertThrows(RuntimeException.class, () ->
        ElementdemoSDK.testSDK(offline, null).element(null).stream("list", null, null)
            .collect(Collectors.toList()));
    assertTrue(err.getMessage().contains("offline"), err.getMessage());

    ElementdemoSDK.testSDK(offline, null).element(null)
        .stream("list", null, Struct.jm("ctrl", Struct.jm("throw", false)))
        .collect(Collectors.toList());

    if (hasFeature("rbac")) {
      ElementdemoSDK denied = ElementdemoSDK.testSDK(null,
          Struct.jm("feature", Struct.jm("rbac", Struct.jm("active", true, "deny", true))));
      SdkError denyerr = assertThrows(SdkError.class, () ->
          denied.element(null).stream("list", null, null).collect(Collectors.toList()));
      assertEquals("rbac_denied", denyerr.code);
    }
  }

  @Test
  public void streamCtrl() {
    Map<String, Object> explain = new LinkedHashMap<>();
    Map<String, Object> ctrl = new LinkedHashMap<>();
    ctrl.put("explain", explain);
    ElementdemoSDK.testSDK().element(null).stream("list", null, Struct.jm("ctrl", ctrl))
        .collect(Collectors.toList());
    assertEquals(List.of("explain"), new ArrayList<>(ctrl.keySet()));
    assertTrue(explain == ctrl.get("explain") && !explain.isEmpty());
  }

  @Test
  public void unexpected() {
    FailHook hook = new FailHook();
    ElementdemoSDK client = new ElementdemoSDK(Struct.jm(
        "feature", Struct.jm("test", Struct.jm("active", true)),
        "extend", Struct.jt(hook)));

    RuntimeException err = assertThrows(RuntimeException.class, () ->
        client.element(null).list(null, null));
    assertTrue(err.getMessage().contains("hook failed"), err.getMessage());
    assertTrue(0 < hook.unexpected);

    int fired = hook.unexpected;
    client.element(null).list(null, Struct.jm("throw", false));
    assertTrue(fired < hook.unexpected);
  }

  @Test
  public void validate() {
    Assumptions.assumeTrue(hasFeature("validate"), "feature not present in this SDK: validate");
    ElementdemoSDK client = ElementdemoSDK.testSDK(null,
        Struct.jm("feature", Struct.jm("validate", Struct.jm("active", true))));
    SdkError err = assertThrows(SdkError.class, () ->
        client.element(null).list(Struct.jm("block", 1), null));
    assertEquals("validate_failed", err.code);
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

    // Whether *_ENTID supplied the idmap, read before envOverride consumes
    // it: without it, the ids a live flow binds are the fixture's synthetic ones.
    String entidEnvRaw = RunnerSupport.getenv("ELEMENTDEMO_TEST_ELEMENT_ENTID");
    boolean idmapOverridden = entidEnvRaw != null
        && entidEnvRaw.trim().startsWith("{");

    Map<String, Object> envm = new LinkedHashMap<>();
    envm.put("ELEMENTDEMO_TEST_ELEMENT_ENTID", idmap);
    envm.put("ELEMENTDEMO_TEST_LIVE", "FALSE");
    envm.put("ELEMENTDEMO_TEST_EXPLAIN", "FALSE");
    envm.put("ELEMENTDEMO_APIKEY", "");
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
