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
const elementEntityLiveStrict = true


type elementFailHook struct {
	sdk.BaseFeature
	unexpected int
}

func (f *elementFailHook) PreSpec(ctx *sdk.Context) {
	panic("element hook failed")
}

func (f *elementFailHook) PreUnexpected(ctx *sdk.Context) {
	f.unexpected++
}

func TestElementEntity(t *testing.T) {
	t.Run("instance", func(t *testing.T) {
		testsdk := sdk.TestSDK(nil, nil)
		ent := testsdk.Element(nil)
		if ent == nil {
			t.Fatal("expected non-nil ElementEntity")
		}
	})

	// Feature #4: the entity Stream(action, ...) method runs the op pipeline and
	// returns a channel over result items. With the streaming feature active it
	// yields the feature's incremental output; otherwise it falls back to the
	// materialised list so Stream always yields.
	t.Run("stream", func(t *testing.T) {
		seed := map[string]any{
			"entity": map[string]any{
				"element": map[string]any{
					"s1": map[string]any{"id": "s1"},
					"s2": map[string]any{"id": "s2"},
					"s3": map[string]any{"id": "s3"},
				},
			},
		}

		// Fallback: streaming inactive -> yields the materialised list items.
		base := sdk.TestSDK(seed, nil)
		var seen []any
		for si := range base.Element(nil).Stream("list", nil, nil) {
			if si.Err != nil {
				t.Fatalf("stream failed: %v", si.Err)
			}
			seen = append(seen, si.Item)
		}
		if len(seen) != 3 {
			t.Fatalf("expected 3 streamed items, got %d", len(seen))
		}

		// Inbound: streaming active -> yields each item from the feature iterator.
		hasStreaming := false
		if fm, ok := core.SharedConfig()["feature"].(map[string]any); ok {
			_, hasStreaming = fm["streaming"]
		}
		if hasStreaming {
			streamSdk := sdk.TestSDK(seed, map[string]any{
				"feature": map[string]any{"streaming": map[string]any{"active": true}},
			})
			var got []any
			for si := range streamSdk.Element(nil).Stream("list", nil, nil) {
				if si.Err != nil {
					t.Fatalf("stream failed: %v", si.Err)
				}
				if sub, ok := si.Item.([]any); ok {
					got = append(got, sub...)
				} else {
					got = append(got, si.Item)
				}
			}
			if len(got) != 3 {
				t.Fatalf("expected 3 items via streaming feature, got %d", len(got))
			}
		}
	})

	t.Run("stream-error", func(t *testing.T) {
		offline := map[string]any{"net": map[string]any{"offline": true}}
		var streamerr error
		for si := range sdk.TestSDK(offline, nil).Element(nil).Stream("list", nil, nil) {
			if si.Err != nil {
				streamerr = si.Err
			}
		}
		if nil == streamerr || !strings.Contains(streamerr.Error(), "offline") {
			t.Fatalf("expected the transport failure as a stream value, got %v", streamerr)
		}

		quiet := map[string]any{"ctrl": map[string]any{"throw": false}}
		for si := range sdk.TestSDK(offline, nil).Element(nil).Stream("list", nil, quiet) {
			if si.Err != nil {
				t.Fatalf("throw false: expected no error value, got %v", si.Err)
			}
		}

		if fhHasFeature("rbac") {
			denied := sdk.TestSDK(nil, map[string]any{
				"feature": map[string]any{"rbac": map[string]any{"active": true, "deny": true}},
			})
			var denyerr error
			for si := range denied.Element(nil).Stream("list", nil, nil) {
				if si.Err != nil {
					denyerr = si.Err
				}
			}
			if sdkerr, ok := denyerr.(*core.ElementdemoError); !ok || "rbac_denied" != sdkerr.Code {
				t.Fatalf("expected the rbac denial as a stream value, got %v", denyerr)
			}
		}
	})

	t.Run("stream-ctrl", func(t *testing.T) {
		explain := map[string]any{}
		ctrl := map[string]any{"explain": explain}
		for range sdk.TestSDK(nil, nil).Element(nil).Stream("list", nil, map[string]any{"ctrl": ctrl}) {
		}
		if _, has := ctrl["stream"]; has || 1 != len(ctrl) {
			t.Fatalf("the stream changed the caller's ctrl")
		}
		if 0 == len(explain) {
			t.Fatalf("the caller's explain record was not filled")
		}
	})

	t.Run("unexpected", func(t *testing.T) {
		hook := &elementFailHook{
			BaseFeature: sdk.BaseFeature{Version: "0.0.1", Name: "failhook", Active: true}}
		client := sdk.TestSDK(nil, map[string]any{"extend": []any{hook}})

		_, err := client.Element(nil).List(nil, nil)
		if nil == err || !strings.Contains(err.Error(), "hook failed") {
			t.Fatalf("expected the hook's failure, got %v", err)
		}
		if 0 == hook.unexpected {
			t.Fatalf("PreUnexpected did not fire")
		}

		fired := hook.unexpected
		if _, err := client.Element(nil).List(nil, map[string]any{"throw": false}); nil != err {
			t.Fatalf("throw false: expected no error, got %v", err)
		}
		if fired == hook.unexpected {
			t.Fatalf("throw false: PreUnexpected did not fire")
		}
	})

	t.Run("validate", func(t *testing.T) {
		if !fhHasFeature("validate") {
			t.Skip("feature not present in this SDK: validate")
		}
		client := sdk.TestSDK(nil, map[string]any{
			"feature": map[string]any{"validate": map[string]any{"active": true}},
		})
		_, err := client.Element(nil).List(map[string]any{"block": 1}, nil)
		if sdkerr, ok := err.(*core.ElementdemoError); !ok || "validate_failed" != sdkerr.Code {
			t.Fatalf("expected validate_failed, got %v", err)
		}
	})

	t.Run("basic", func(tt *testing.T) {
		var t testing.TB = tt
		setup := elementBasicSetup(nil)
		// Per-op sdk-test-control.json skip — basic test exercises a flow
		// with multiple ops; skipping any op skips the whole flow.
		_mode := "unit"
		if setup.live {
			_mode = "live"
		}
		for _, _op := range []string{"create", "list", "update", "load", "remove"} {
			if _shouldSkip, _reason := isControlSkipped("entityOp", "element." + _op, _mode); _shouldSkip {
				if _reason == "" {
					_reason = "skipped via sdk-test-control.json"
				}
				t.Skip(_reason)
				return
			}
		}
		if setup.live && os.Getenv("VOXGIG_GETONLY_GUARD") == "TRUE" {
			t.Log("LIVE STEP {\"id\":\"element.create.0\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs POST /element/{element_id}/ionize\"}")
			t.Log("LIVE STEP {\"id\":\"element.update.2\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs PUT /element/{element_id}\"}")
			t.Log("LIVE STEP {\"id\":\"element.remove.4\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs DELETE /element/{element_id}\"}")
			t.Log("LIVE STEP {\"id\":\"element.list.5\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: checks a removal this run does not make\"}")
		client := setup.client
		_ = client
		if setup.live {
			var _liveId any
			if !setup.syntheticOnly {
				_liveId = setup.idmap["element01"]
			}
			livePace()
			liveExisting(t, elementEntityLiveStrict, setup.data, "element", "id", _liveId,
				func() (any, error) {
					return client.Element(nil).List(map[string]any{}, nil)
				})
		}

		// Bootstrap entity data from existing test data (no create step in flow).
		elementRef01DataRaw := vs.Items(core.ToMapAny(vs.GetPath(setup.data, "existing.element")))
		var elementRef01Data map[string]any
		if len(elementRef01DataRaw) > 0 {
			elementRef01Data = core.ToMapAny(elementRef01DataRaw[0][1])
		}
		// Discard guards against Go's unused-var check when the flow's steps
		// happen not to consume the bootstrap data (e.g. list-only flows).
		_ = elementRef01Data

		if setup.live {
			livePace()
		}
		// LIST
		elementRef01Ent := client.Element(nil)
		elementRef01Match := map[string]any{}

		elementRef01ListResult, err := elementRef01Ent.List(elementRef01Match, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		_, elementRef01ListOk := elementRef01ListResult.([]any)
		if !elementRef01ListOk {
			t.Fatalf("expected list result to be an array, got %T", elementRef01ListResult)
		}

		if setup.live {
			livePace()
		}
		// LOAD
		elementRef01MatchDt0 := map[string]any{
			"id": elementRef01Data["id"],
		}
		elementRef01DataDt0Loaded, err := elementRef01Ent.Load(elementRef01MatchDt0, nil)
		if err != nil {
			t.Fatalf("load failed: %v", err)
		}
		elementRef01DataDt0LoadResult := core.ToMapAny(entityData(elementRef01DataDt0Loaded))
		if elementRef01DataDt0LoadResult == nil {
			t.Fatal("expected load result to be a map")
		}
		if !liveSameId(elementRef01DataDt0LoadResult["id"], elementRef01Data["id"]) {
			t.Fatal("expected load result id to match")
		}

		return
		}

		client := setup.client
		_ = client

		if setup.live {
			livePace()
		}
		// CREATE
		elementRef01Ent := client.Element(nil)
		elementRef01Data := core.ToMapAny(vs.GetProp(
			vs.GetPath(setup.data, []any{"new", "element"}), "element_ref01"))

		elementRef01DataResult, err := elementRef01Ent.Create(elementRef01Data, nil)
		if err != nil {
			t.Fatalf("create failed: %v", err)
		}
		elementRef01Data = core.ToMapAny(entityData(elementRef01DataResult))
		if elementRef01Data == nil {
			t.Fatal("expected create result to be a map")
		}
		if elementRef01Data["id"] == nil {
			t.Fatal("expected created entity to have an id")
		}

		if setup.live {
			livePace()
		}
		// LIST
		elementRef01Match := map[string]any{}

		elementRef01ListResult, err := elementRef01Ent.List(elementRef01Match, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		elementRef01List, elementRef01ListOk := elementRef01ListResult.([]any)
		if !elementRef01ListOk {
			t.Fatalf("expected list result to be an array, got %T", elementRef01ListResult)
		}

		foundItem := vs.Select(entityListToData(elementRef01List), map[string]any{"id": elementRef01Data["id"]})
		if vs.IsEmpty(foundItem) {
			t.Fatal("expected to find created entity in list")
		}

		if setup.live {
			livePace()
		}
		// UPDATE
		elementRef01DataUp0Up := map[string]any{
			"id": elementRef01Data["id"],
		}

		elementRef01MarkdefUp0Name := "block"
		elementRef01MarkdefUp0Value := fmt.Sprintf("Mark01-element_ref01_%d", setup.now)
		elementRef01DataUp0Up[elementRef01MarkdefUp0Name] = elementRef01MarkdefUp0Value

		elementRef01ResdataUp0Result, err := elementRef01Ent.Update(elementRef01DataUp0Up, nil)
		if err != nil {
			t.Fatalf("update failed: %v", err)
		}
		elementRef01ResdataUp0 := core.ToMapAny(entityData(elementRef01ResdataUp0Result))
		if elementRef01ResdataUp0 == nil {
			t.Fatal("expected update result to be a map")
		}
		if !liveSameId(elementRef01ResdataUp0["id"], elementRef01DataUp0Up["id"]) {
			t.Fatal("expected update result id to match")
		}
		if elementRef01ResdataUp0[elementRef01MarkdefUp0Name] != elementRef01MarkdefUp0Value {
			t.Fatalf("expected %s to be updated, got %v", elementRef01MarkdefUp0Name, elementRef01ResdataUp0[elementRef01MarkdefUp0Name])
		}

		if setup.live {
			livePace()
		}
		// LOAD
		elementRef01MatchDt0 := map[string]any{
			"id": elementRef01Data["id"],
		}
		elementRef01DataDt0Loaded, err := elementRef01Ent.Load(elementRef01MatchDt0, nil)
		if err != nil {
			t.Fatalf("load failed: %v", err)
		}
		elementRef01DataDt0LoadResult := core.ToMapAny(entityData(elementRef01DataDt0Loaded))
		if elementRef01DataDt0LoadResult == nil {
			t.Fatal("expected load result to be a map")
		}
		if !liveSameId(elementRef01DataDt0LoadResult["id"], elementRef01Data["id"]) {
			t.Fatal("expected load result id to match")
		}

		if setup.live {
			livePace()
		}
		// REMOVE
		elementRef01MatchRm0 := map[string]any{
			"id": elementRef01Data["id"],
		}
		_, err = elementRef01Ent.Remove(elementRef01MatchRm0, nil)
		if err != nil {
			t.Fatalf("remove failed: %v", err)
		}

		if setup.live {
			livePace()
		}
		// LIST
		elementRef01MatchRt0 := map[string]any{}

		elementRef01ListRt0Result, err := elementRef01Ent.List(elementRef01MatchRt0, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		elementRef01ListRt0, elementRef01ListRt0Ok := elementRef01ListRt0Result.([]any)
		if !elementRef01ListRt0Ok {
			t.Fatalf("expected list result to be an array, got %T", elementRef01ListRt0Result)
		}

		notFoundItem := vs.Select(entityListToData(elementRef01ListRt0), map[string]any{"id": elementRef01Data["id"]})
		if !vs.IsEmpty(notFoundItem) {
			t.Fatal("expected removed entity to not be in list")
		}

	})
}

func elementBasicSetup(extra map[string]any) *entityTestSetup {
	loadEnvLocal()

	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)

	entityDataFile := filepath.Join(dir, "..", "..", ".sdk", "test", "entity", "element", "ElementTestData.json")

	entityDataSource, err := os.ReadFile(entityDataFile)
	if err != nil {
		panic("failed to read element test data: " + err.Error())
	}

	var entityData map[string]any
	if err := json.Unmarshal(entityDataSource, &entityData); err != nil {
		panic("failed to parse element test data: " + err.Error())
	}

	options := map[string]any{}
	options["entity"] = entityData["existing"]

	client := sdk.TestSDK(options, extra)

	// Generate idmap via transform, matching TS pattern.
	idmap, _ := vs.Transform(
		[]any{"element01", "element02", "element03"},
		map[string]any{
			"`$PACK`": []any{"", map[string]any{
				"`$KEY`": "`$COPY`",
				"`$VAL`": []any{"`$FORMAT`", "upper", "`$COPY`"},
			}},
		},
	)

	// Whether *_ENTID supplied the idmap, read before envOverride consumes it:
	// without it, the ids a live flow binds are the fixture's synthetic ones.
	entidEnvRaw := os.Getenv("ELEMENTDEMO_TEST_ELEMENT_ENTID")
	idmapOverridden := entidEnvRaw != "" && strings.HasPrefix(strings.TrimSpace(entidEnvRaw), "{")

	env := envOverride(map[string]any{
		"ELEMENTDEMO_TEST_ELEMENT_ENTID": idmap,
		"ELEMENTDEMO_TEST_LIVE":      "FALSE",
		"ELEMENTDEMO_TEST_EXPLAIN":   "FALSE",
		"ELEMENTDEMO_APIKEY":         "",
		"ELEMENTDEMO_SERVER_ACCOUNT_ID": "",
	})

	idmapResolved := core.ToMapAny(env["ELEMENTDEMO_TEST_ELEMENT_ENTID"])
	if idmapResolved == nil {
		idmapResolved = core.ToMapAny(idmap)
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
