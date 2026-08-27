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
		for item := range base.Element(nil).Stream("list", nil, nil) {
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
			for item := range streamSdk.Element(nil).Stream("list", nil, nil) {
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
		// The basic flow consumes synthetic IDs from the fixture. In live mode
		// without an *_ENTID env override, those IDs hit the live API and 4xx.
		if setup.syntheticOnly {
			t.Skip("live entity test uses synthetic IDs from fixture — set ELEMENTDEMO_TEST_ELEMENT_ENTID JSON to run live")
			return
		}
		client := setup.client

		// CREATE
		elementRef01Ent := client.Element(nil)
		elementRef01Data := core.ToMapAny(vs.GetProp(
			vs.GetPath([]any{"new", "element"}, setup.data), "element_ref01"))

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
		if elementRef01ResdataUp0["id"] != elementRef01DataUp0Up["id"] {
			t.Fatal("expected update result id to match")
		}
		if elementRef01ResdataUp0[elementRef01MarkdefUp0Name] != elementRef01MarkdefUp0Value {
			t.Fatalf("expected %s to be updated, got %v", elementRef01MarkdefUp0Name, elementRef01ResdataUp0[elementRef01MarkdefUp0Name])
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
		if elementRef01DataDt0LoadResult["id"] != elementRef01Data["id"] {
			t.Fatal("expected load result id to match")
		}

		// REMOVE
		elementRef01MatchRm0 := map[string]any{
			"id": elementRef01Data["id"],
		}
		_, err = elementRef01Ent.Remove(elementRef01MatchRm0, nil)
		if err != nil {
			t.Fatalf("remove failed: %v", err)
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
	idmap := vs.Transform(
		[]any{"element01", "element02", "element03"},
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
	entidEnvRaw := os.Getenv("ELEMENTDEMO_TEST_ELEMENT_ENTID")
	idmapOverridden := entidEnvRaw != "" && strings.HasPrefix(strings.TrimSpace(entidEnvRaw), "{")

	env := envOverride(map[string]any{
		"ELEMENTDEMO_TEST_ELEMENT_ENTID": idmap,
		"ELEMENTDEMO_TEST_LIVE":      "FALSE",
		"ELEMENTDEMO_TEST_EXPLAIN":   "FALSE",
	})

	idmapResolved := core.ToMapAny(env["ELEMENTDEMO_TEST_ELEMENT_ENTID"])
	if idmapResolved == nil {
		idmapResolved = core.ToMapAny(idmap)
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
