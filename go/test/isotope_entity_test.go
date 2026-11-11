package sdktest

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	sdk "github.com/voxgig-sdk/voxgig-elementdemo-sdk/go"
	"github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/core"

	vs "github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/utility/struct"
)

// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const isotopeEntityLiveStrict = true


func TestIsotopeEntity(t *testing.T) {
	t.Run("instance", func(t *testing.T) {
		testsdk := sdk.TestSDK(nil, nil)
		ent := testsdk.Isotope(nil)
		if ent == nil {
			t.Fatal("expected non-nil IsotopeEntity")
		}
	})

	t.Run("validate", func(t *testing.T) {
		if !fhHasFeature("validate") {
			t.Skip("feature not present in this SDK: validate")
		}
		client := sdk.TestSDK(nil, map[string]any{
			"feature": map[string]any{"validate": map[string]any{"active": true}},
		})
		_, err := client.Isotope(nil).List(map[string]any{"element_id": 1}, nil)
		if sdkerr, ok := err.(*core.ElementdemoError); !ok || "validate_failed" != sdkerr.Code {
			t.Fatalf("expected validate_failed, got %v", err)
		}
	})

	t.Run("basic", func(tt *testing.T) {
		var t testing.TB = tt
		setup := isotopeBasicSetup(nil)
		// Per-op sdk-test-control.json skip — basic test exercises a flow
		// with multiple ops; skipping any op skips the whole flow.
		_mode := "unit"
		if setup.live {
			_mode = "live"
		}
		for _, _op := range []string{"create", "list", "update", "load", "remove"} {
			if _shouldSkip, _reason := isControlSkipped("entityOp", "isotope." + _op, _mode); _shouldSkip {
				if _reason == "" {
					_reason = "skipped via sdk-test-control.json"
				}
				t.Skip(_reason)
				return
			}
		}
		if setup.live && os.Getenv("VOXGIG_GETONLY_GUARD") == "TRUE" {
			t.Log("LIVE STEP {\"id\":\"isotope.create.0\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs POST /element/{element_id}/isotope/{isotope_id}/decay\"}")
			t.Log("LIVE STEP {\"id\":\"isotope.update.2\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs PUT /element/{element_id}/isotope/{isotope_id}\"}")
			t.Log("LIVE STEP {\"id\":\"isotope.remove.4\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs DELETE /element/{element_id}/isotope/{isotope_id}\"}")
			t.Log("LIVE STEP {\"id\":\"isotope.list.5\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: checks a removal this run does not make\"}")
		if setup.live {
			for _, _liveKey := range []string{"element01"} {
				if setup.syntheticOnly || setup.idmap[_liveKey] == nil {
					liveMiss(t, isotopeEntityLiveStrict, "Live entity test blocked: needs %s via ELEMENTDEMO_TEST_ISOTOPE_ENTID", _liveKey)
				}
			}
		}
		client := setup.client
		_ = client
		if setup.live {
			var _liveId any
			if !setup.syntheticOnly {
				_liveId = setup.idmap["isotope01"]
			}
			livePace()
			liveExisting(t, isotopeEntityLiveStrict, setup.data, "isotope", "id", _liveId,
				func() (any, error) {
					return client.Isotope(nil).List(map[string]any{"element_id": setup.idmap["element01"]}, nil)
				})
		}

		// Bootstrap entity data from existing test data (no create step in flow).
		isotopeRef01DataRaw := vs.Items(core.ToMapAny(vs.GetPath(setup.data, "existing.isotope")))
		var isotopeRef01Data map[string]any
		if len(isotopeRef01DataRaw) > 0 {
			isotopeRef01Data = core.ToMapAny(isotopeRef01DataRaw[0][1])
		}
		// Discard guards against Go's unused-var check when the flow's steps
		// happen not to consume the bootstrap data (e.g. list-only flows).
		_ = isotopeRef01Data

		if setup.live {
			livePace()
		}
		// LIST
		isotopeRef01Ent := client.Isotope(nil)
		isotopeRef01Match := map[string]any{
			"element_id": setup.idmap["element01"],
		}

		isotopeRef01ListResult, err := isotopeRef01Ent.List(isotopeRef01Match, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		_, isotopeRef01ListOk := isotopeRef01ListResult.([]any)
		if !isotopeRef01ListOk {
			t.Fatalf("expected list result to be an array, got %T", isotopeRef01ListResult)
		}

		if setup.live {
			livePace()
		}
		// LOAD
		isotopeRef01MatchDt0 := map[string]any{
			"id": isotopeRef01Data["id"],
		}
		switch v := isotopeRef01Data["element_id"].(type) {
		case string, bool, float64, int, int64:
			isotopeRef01MatchDt0["element_id"] = v
		default:
			if v := setup.idmap["element_id"]; v != nil {
				isotopeRef01MatchDt0["element_id"] = v
			} else {
				isotopeRef01MatchDt0["element_id"] = setup.idmap["element01"]
			}
		}
		isotopeRef01DataDt0Loaded, err := isotopeRef01Ent.Load(isotopeRef01MatchDt0, nil)
		if err != nil {
			t.Fatalf("load failed: %v", err)
		}
		isotopeRef01DataDt0LoadResult := core.ToMapAny(entityData(isotopeRef01DataDt0Loaded))
		if isotopeRef01DataDt0LoadResult == nil {
			t.Fatal("expected load result to be a map")
		}
		if !liveSameId(isotopeRef01DataDt0LoadResult["id"], isotopeRef01Data["id"]) {
			t.Fatal("expected load result id to match")
		}

		return
		}

		if setup.live {
			for _, _liveKey := range []string{"element01"} {
				if setup.syntheticOnly || setup.idmap[_liveKey] == nil {
					liveMiss(t, isotopeEntityLiveStrict, "Live entity test blocked: needs %s via ELEMENTDEMO_TEST_ISOTOPE_ENTID", _liveKey)
				}
			}
		}
		client := setup.client
		_ = client

		if setup.live {
			livePace()
		}
		// CREATE
		isotopeRef01Ent := client.Isotope(nil)
		isotopeRef01Data := core.ToMapAny(vs.GetProp(
			vs.GetPath(setup.data, []any{"new", "isotope"}), "isotope_ref01"))
		isotopeRef01Data["element_id"] = setup.idmap["element01"]

		isotopeRef01DataResult, err := isotopeRef01Ent.Create(isotopeRef01Data, nil)
		if err != nil {
			t.Fatalf("create failed: %v", err)
		}
		isotopeRef01Data = core.ToMapAny(entityData(isotopeRef01DataResult))
		if isotopeRef01Data == nil {
			t.Fatal("expected create result to be a map")
		}
		if isotopeRef01Data["id"] == nil {
			t.Fatal("expected created entity to have an id")
		}

		if setup.live {
			livePace()
		}
		// LIST
		isotopeRef01Match := map[string]any{
			"element_id": setup.idmap["element01"],
		}

		isotopeRef01ListResult, err := isotopeRef01Ent.List(isotopeRef01Match, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		isotopeRef01List, isotopeRef01ListOk := isotopeRef01ListResult.([]any)
		if !isotopeRef01ListOk {
			t.Fatalf("expected list result to be an array, got %T", isotopeRef01ListResult)
		}

		foundItem := vs.Select(entityListToData(isotopeRef01List), map[string]any{"id": isotopeRef01Data["id"]})
		if vs.IsEmpty(foundItem) {
			t.Fatal("expected to find created entity in list")
		}

		if setup.live {
			livePace()
		}
		// UPDATE
		isotopeRef01DataUp0Up := map[string]any{
			"id": isotopeRef01Data["id"],
			"element_id": setup.idmap["element_id"],
		}

		isotopeRef01MarkdefUp0Name := "halflife"
		isotopeRef01MarkdefUp0Value := fmt.Sprintf("Mark01-isotope_ref01_%d", setup.now)
		isotopeRef01DataUp0Up[isotopeRef01MarkdefUp0Name] = isotopeRef01MarkdefUp0Value

		isotopeRef01ResdataUp0Result, err := isotopeRef01Ent.Update(isotopeRef01DataUp0Up, nil)
		if err != nil {
			t.Fatalf("update failed: %v", err)
		}
		isotopeRef01ResdataUp0 := core.ToMapAny(entityData(isotopeRef01ResdataUp0Result))
		if isotopeRef01ResdataUp0 == nil {
			t.Fatal("expected update result to be a map")
		}
		if !liveSameId(isotopeRef01ResdataUp0["id"], isotopeRef01DataUp0Up["id"]) {
			t.Fatal("expected update result id to match")
		}
		if isotopeRef01ResdataUp0[isotopeRef01MarkdefUp0Name] != isotopeRef01MarkdefUp0Value {
			t.Fatalf("expected %s to be updated, got %v", isotopeRef01MarkdefUp0Name, isotopeRef01ResdataUp0[isotopeRef01MarkdefUp0Name])
		}

		if setup.live {
			livePace()
		}
		// LOAD
		isotopeRef01MatchDt0 := map[string]any{
			"id": isotopeRef01Data["id"],
		}
		switch v := isotopeRef01Data["element_id"].(type) {
		case string, bool, float64, int, int64:
			isotopeRef01MatchDt0["element_id"] = v
		default:
			if v := setup.idmap["element_id"]; v != nil {
				isotopeRef01MatchDt0["element_id"] = v
			} else {
				isotopeRef01MatchDt0["element_id"] = setup.idmap["element01"]
			}
		}
		isotopeRef01DataDt0Loaded, err := isotopeRef01Ent.Load(isotopeRef01MatchDt0, nil)
		if err != nil {
			t.Fatalf("load failed: %v", err)
		}
		isotopeRef01DataDt0LoadResult := core.ToMapAny(entityData(isotopeRef01DataDt0Loaded))
		if isotopeRef01DataDt0LoadResult == nil {
			t.Fatal("expected load result to be a map")
		}
		if !liveSameId(isotopeRef01DataDt0LoadResult["id"], isotopeRef01Data["id"]) {
			t.Fatal("expected load result id to match")
		}

		if setup.live {
			livePace()
		}
		// REMOVE
		isotopeRef01MatchRm0 := map[string]any{
			"id": isotopeRef01Data["id"],
		}
		if v := setup.idmap["element_id"]; v != nil {
			isotopeRef01MatchRm0["element_id"] = v
		} else {
			isotopeRef01MatchRm0["element_id"] = setup.idmap["element01"]
		}
		_, err = isotopeRef01Ent.Remove(isotopeRef01MatchRm0, nil)
		if err != nil {
			t.Fatalf("remove failed: %v", err)
		}

		if setup.live {
			livePace()
		}
		// LIST
		isotopeRef01MatchRt0 := map[string]any{
			"element_id": setup.idmap["element01"],
		}

		isotopeRef01ListRt0Result, err := isotopeRef01Ent.List(isotopeRef01MatchRt0, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		isotopeRef01ListRt0, isotopeRef01ListRt0Ok := isotopeRef01ListRt0Result.([]any)
		if !isotopeRef01ListRt0Ok {
			t.Fatalf("expected list result to be an array, got %T", isotopeRef01ListRt0Result)
		}

		notFoundItem := vs.Select(entityListToData(isotopeRef01ListRt0), map[string]any{"id": isotopeRef01Data["id"]})
		if !vs.IsEmpty(notFoundItem) {
			t.Fatal("expected removed entity to not be in list")
		}

	})
}

func isotopeBasicSetup(extra map[string]any) *entityTestSetup {
	loadEnvLocal()

	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)

	entityDataFile := filepath.Join(dir, "..", "..", ".sdk", "test", "entity", "isotope", "IsotopeTestData.json")

	entityDataSource, err := os.ReadFile(entityDataFile)
	if err != nil {
		panic("failed to read isotope test data: " + err.Error())
	}

	var entityData map[string]any
	if err := json.Unmarshal(entityDataSource, &entityData); err != nil {
		panic("failed to parse isotope test data: " + err.Error())
	}

	options := map[string]any{}
	options["entity"] = entityData["existing"]

	client := sdk.TestSDK(options, extra)

	// Generate idmap via transform, matching TS pattern.
	idmap, _ := vs.Transform(
		[]any{"isotope01", "isotope02", "isotope03", "element01", "element02", "element03"},
		map[string]any{
			"`$PACK`": []any{"", map[string]any{
				"`$KEY`": "`$COPY`",
				"`$VAL`": []any{"`$FORMAT`", "upper", "`$COPY`"},
			}},
		},
	)

	// Whether *_ENTID supplied the idmap, read before envOverride consumes it:
	// without it, the ids a live flow binds are the fixture's synthetic ones.
	entidEnvRaw := os.Getenv("ELEMENTDEMO_TEST_ISOTOPE_ENTID")
	idmapOverridden := entidEnvRaw != "" && strings.HasPrefix(strings.TrimSpace(entidEnvRaw), "{")

	env := envOverride(map[string]any{
		"ELEMENTDEMO_TEST_ISOTOPE_ENTID": idmap,
		"ELEMENTDEMO_TEST_LIVE":      "FALSE",
		"ELEMENTDEMO_TEST_EXPLAIN":   "FALSE",
		"ELEMENTDEMO_APIKEY":         "",
		"ELEMENTDEMO_SERVER_ACCOUNT_ID": "",
	})

	idmapResolved := core.ToMapAny(env["ELEMENTDEMO_TEST_ISOTOPE_ENTID"])
	if idmapResolved == nil {
		idmapResolved = core.ToMapAny(idmap)
	}
	// Add element_id alias for update test.
	if idmapResolved["element_id"] == nil {
		idmapResolved["element_id"] = idmapResolved["element01"]
	}

	if env["ELEMENTDEMO_TEST_LIVE"] == "TRUE" {
		// An empty map, not a nil one: Merge returns nil when its last entry
		// is nil, and BasicSetup is normally called with no extras - so a
		// bare nil silently discarded the apikey and server values below.
		extraOpts := extra
		if extraOpts == nil {
			extraOpts = map[string]any{}
		}

		mergedOpts := vs.Merge([]any{
			// liveClientOptions() FIRST, so the generated fields below win:
			// sdk-test-control.json's test.client.options adds to the live
			// client, it does not redirect it.
			liveClientOptions(),
			map[string]any{
				"apikey": env["ELEMENTDEMO_APIKEY"],
				"server": map[string]any{
					"account_id": env["ELEMENTDEMO_SERVER_ACCOUNT_ID"],
				},
			},
			extraOpts,
		})
		client = sdk.NewElementdemoSDK(core.ToMapAny(mergedOpts))
	}

	live := env["ELEMENTDEMO_TEST_LIVE"] == "TRUE"
	return &entityTestSetup{
		client:        client,
		data:          entityData,
		idmap:         idmapResolved,
		env:           env,
		explain:       env["ELEMENTDEMO_TEST_EXPLAIN"] == "TRUE",
		live:          live,
		syntheticOnly: live && !idmapOverridden,
		now:           time.Now().UnixMilli(),
	}
}
