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

func TestIsotopeEntity(t *testing.T) {
	t.Run("instance", func(t *testing.T) {
		testsdk := sdk.TestSDK(nil, nil)
		ent := testsdk.Isotope(nil)
		if ent == nil {
			t.Fatal("expected non-nil IsotopeEntity")
		}
	})

	// Feature #4: the entity Stream(action, ...) method runs the op pipeline and
	// returns a channel over result items. With the streaming feature active it
	// yields the feature's incremental output; otherwise it falls back to the
	// materialised list so Stream always yields.
	t.Run("stream", func(t *testing.T) {
		seed := map[string]any{
			"entity": map[string]any{
				"isotope": map[string]any{
					"s1": map[string]any{"id": "s1"},
					"s2": map[string]any{"id": "s2"},
					"s3": map[string]any{"id": "s3"},
				},
			},
		}

		// Fallback: streaming inactive -> yields the materialised list items.
		base := sdk.TestSDK(seed, nil)
		var seen []any
		for item := range base.Isotope(nil).Stream("list", nil, nil) {
			seen = append(seen, item)
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
			for item := range streamSdk.Isotope(nil).Stream("list", nil, nil) {
				if sub, ok := item.([]any); ok {
					got = append(got, sub...)
				} else {
					got = append(got, item)
				}
			}
			if len(got) != 3 {
				t.Fatalf("expected 3 items via streaming feature, got %d", len(got))
			}
		}
	})

	t.Run("basic", func(t *testing.T) {
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
		// The basic flow consumes synthetic IDs from the fixture. In live mode
		// without an *_ENTID env override, those IDs hit the live API and 4xx.
		if setup.syntheticOnly {
			t.Skip("live entity test uses synthetic IDs from fixture — set ELEMENTDEMO_TEST_ISOTOPE_ENTID JSON to run live")
			return
		}
		client := setup.client

		// CREATE
		isotopeRef01Ent := client.Isotope(nil)
		isotopeRef01Data := core.ToMapAny(vs.GetProp(
			vs.GetPath([]any{"new", "isotope"}, setup.data), "isotope_ref01"))
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
		if isotopeRef01ResdataUp0["id"] != isotopeRef01DataUp0Up["id"] {
			t.Fatal("expected update result id to match")
		}
		if isotopeRef01ResdataUp0[isotopeRef01MarkdefUp0Name] != isotopeRef01MarkdefUp0Value {
			t.Fatalf("expected %s to be updated, got %v", isotopeRef01MarkdefUp0Name, isotopeRef01ResdataUp0[isotopeRef01MarkdefUp0Name])
		}

		// LOAD
		isotopeRef01MatchDt0 := map[string]any{
			"id": isotopeRef01Data["id"],
		}
		isotopeRef01DataDt0Loaded, err := isotopeRef01Ent.Load(isotopeRef01MatchDt0, nil)
		if err != nil {
			t.Fatalf("load failed: %v", err)
		}
		isotopeRef01DataDt0LoadResult := core.ToMapAny(entityData(isotopeRef01DataDt0Loaded))
		if isotopeRef01DataDt0LoadResult == nil {
			t.Fatal("expected load result to be a map")
		}
		if isotopeRef01DataDt0LoadResult["id"] != isotopeRef01Data["id"] {
			t.Fatal("expected load result id to match")
		}

		// REMOVE
		isotopeRef01MatchRm0 := map[string]any{
			"id": isotopeRef01Data["id"],
		}
		_, err = isotopeRef01Ent.Remove(isotopeRef01MatchRm0, nil)
		if err != nil {
			t.Fatalf("remove failed: %v", err)
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
	idmap := vs.Transform(
		[]any{"isotope01", "isotope02", "isotope03", "element01", "element02", "element03"},
		map[string]any{
			"`$PACK`": []any{"", map[string]any{
				"`$KEY`": "`$COPY`",
				"`$VAL`": []any{"`$FORMAT`", "upper", "`$COPY`"},
			}},
		},
	)

	// Detect ENTID env override before envOverride consumes it. When live
	// mode is on without a real override, the basic test runs against synthetic
	// IDs from the fixture and 4xx's. Surface this so the test can skip.
	entidEnvRaw := os.Getenv("ELEMENTDEMO_TEST_ISOTOPE_ENTID")
	idmapOverridden := entidEnvRaw != "" && strings.HasPrefix(strings.TrimSpace(entidEnvRaw), "{")

	env := envOverride(map[string]any{
		"ELEMENTDEMO_TEST_ISOTOPE_ENTID": idmap,
		"ELEMENTDEMO_TEST_LIVE":      "FALSE",
		"ELEMENTDEMO_TEST_EXPLAIN":   "FALSE",
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
		mergedOpts := vs.Merge([]any{
			map[string]any{
			},
			extra,
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
