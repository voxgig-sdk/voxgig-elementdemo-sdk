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
public class SeriesEntityTest {

  @Test
  public void instance() {
    ElementdemoSDK testsdk = ElementdemoSDK.testSDK();
    SdkEntity ent = testsdk.series(null);
    assertNotNull(ent, "expected non-null series entity");
  }

  @Test
  public void basic() {
    RunnerSupport.EntityTestSetup setup = seriesBasicSetup(null);
    // Per-op sdk-test-control.json skip — basic test exercises a flow
    // with multiple ops; skipping any op skips the whole flow.
    String mode = setup.live ? "live" : "unit";
    for (String op : new String[] { "list", "load" }) {
      String reason = RunnerSupport.skipReason("entityOp", "series." + op, mode);
      Assumptions.assumeTrue(reason == null,
          reason == null || "".equals(reason)
              ? "skipped via sdk-test-control.json" : reason);
    }
    // The basic flow consumes synthetic IDs from the fixture. In live mode
    // without an *_ENTID env override, those IDs hit the live API and 4xx.
    Assumptions.assumeFalse(setup.syntheticOnly,
        "live entity test uses synthetic IDs from fixture — set ELEMENTDEMO_TEST_SERIES_ENTID JSON to run live");
    ElementdemoSDK client = setup.client;

    // Bootstrap entity data from existing test data (no create step in flow).
    List<List<Object>> seriesRef01DataRaw = Struct.items(Helpers.toMapAny(
        Struct.getpath(setup.data, "existing.series")));
    Map<String, Object> seriesRef01Data = seriesRef01DataRaw.isEmpty()
        ? null : Helpers.toMapAny(seriesRef01DataRaw.get(0).get(1));

    // LIST
    SdkEntity seriesRef01Ent = client.series(null);
    Map<String, Object> seriesRef01Match = new LinkedHashMap<>();

    Object seriesRef01ListResult = seriesRef01Ent.list(seriesRef01Match, null);
    assertTrue(seriesRef01ListResult instanceof List,
        "expected list result to be an array, got " + seriesRef01ListResult);

    // LOAD
    Map<String, Object> seriesRef01MatchDt0 = new LinkedHashMap<>();
    seriesRef01MatchDt0.put("id", seriesRef01Data.get("id"));
    Object seriesRef01DataDt0Loaded = seriesRef01Ent.load(seriesRef01MatchDt0, null);
    Map<String, Object> seriesRef01DataDt0LoadResult = Helpers.toMapAny(seriesRef01DataDt0Loaded instanceof SdkEntity ? ((SdkEntity) seriesRef01DataDt0Loaded).data() : seriesRef01DataDt0Loaded);
    assertNotNull(seriesRef01DataDt0LoadResult, "expected load result to be a map");
    assertEquals(seriesRef01Data.get("id"), seriesRef01DataDt0LoadResult.get("id"),
        "expected load result id to match");

  }

  @Test
  public void stream() {
    Map<String, Object> streamingActive = new LinkedHashMap<>();
    Map<String, Object> streamingOpts = new LinkedHashMap<>();
    streamingOpts.put("active", true);
    Map<String, Object> featureOpts = new LinkedHashMap<>();
    featureOpts.put("streaming", streamingOpts);
    streamingActive.put("feature", featureOpts);

    RunnerSupport.EntityTestSetup setup = seriesBasicSetup(streamingActive);
    Assumptions.assumeFalse(setup.live,
        "stream test streams the seeded fixture data (unit mode only)");

    SdkEntity ent = setup.client.series(null);
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
    RunnerSupport.EntityTestSetup setup2 = seriesBasicSetup(null);
    SdkEntity ent2 = setup2.client.series(null);
    List<Object> streamed2 = ent2.stream("list", match, null)
        .collect(Collectors.toList());
    assertEquals(listed.size(), streamed2.size(),
        "expected fallback stream to yield the materialised items");
  }

  static RunnerSupport.EntityTestSetup seriesBasicSetup(Map<String, Object> extra) {
    RunnerSupport.loadEnvLocal();

    Map<String, Object> entityData;
    try {
      String entityDataSource = Files.readString(Path.of(
          "..", ".sdk", "test", "entity", "series", "SeriesTestData.json"));
      entityData = Helpers.toMapAny(Json.parse(entityDataSource));
    }
    catch (Exception e) {
      throw new AssertionError("failed to read series test data: " + e.getMessage(), e);
    }

    Map<String, Object> options = new LinkedHashMap<>();
    options.put("entity", entityData.get("existing"));

    ElementdemoSDK client = ElementdemoSDK.testSDK(options, extra);

    // Generate idmap via transform, matching TS pattern.
    List<Object> idnames = new ArrayList<>();
    idnames.add("series01");
    idnames.add("series02");
    idnames.add("series03");
    Object idmap = Struct.transform(idnames, Json.parse(
        "{\"`$PACK`\": [\"\", {"
        + "\"`$KEY`\": \"`$COPY`\","
        + "\"`$VAL`\": [\"`$FORMAT`\", \"upper\", \"`$COPY`\"]"
        + "}]}"));

    // Detect ENTID env override before envOverride consumes it. When live
    // mode is on without a real override, the basic test runs against
    // synthetic IDs from the fixture and 4xx's. Surface this so the test
    // can skip.
    String entidEnvRaw = RunnerSupport.getenv("ELEMENTDEMO_TEST_SERIES_ENTID");
    boolean idmapOverridden = entidEnvRaw != null
        && entidEnvRaw.trim().startsWith("{");

    Map<String, Object> envm = new LinkedHashMap<>();
    envm.put("ELEMENTDEMO_TEST_SERIES_ENTID", idmap);
    envm.put("ELEMENTDEMO_TEST_LIVE", "FALSE");
    envm.put("ELEMENTDEMO_TEST_EXPLAIN", "FALSE");
    envm.put("ELEMENTDEMO_APIKEY", "");
    envm.put("ELEMENTDEMO_SERVER_ACCOUNT_ID", "");
    Map<String, Object> env = RunnerSupport.envOverride(envm);

    Map<String, Object> idmapResolved = Helpers.toMapAny(env.get("ELEMENTDEMO_TEST_SERIES_ENTID"));
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
