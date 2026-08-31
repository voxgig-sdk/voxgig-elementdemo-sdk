package sdktest

import (
	"encoding/json"
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

func TestSeriesEntity(t *testing.T) {
	t.Run("instance", func(t *testing.T) {
		testsdk := sdk.TestSDK(nil, nil)
		ent := testsdk.Series(nil)
		if ent == nil {
			t.Fatal("expected non-nil SeriesEntity")
		}
	})

	// Feature #4: the entity Stream(action, ...) method runs the op pipeline and
	// returns a channel over result items. With the streaming feature active it
	// yields the feature's incremental output; otherwise it falls back to the
	// materialised list so Stream always yields.
	t.Run("stream", func(t *testing.T) {
		seed := map[string]any{
			"entity": map[string]any{
				"series": map[string]any{
					"s1": map[string]any{"id": "s1"},
					"s2": map[string]any{"id": "s2"},
					"s3": map[string]any{"id": "s3"},
				},
			},
		}

		// Fallback: streaming inactive -> yields the materialised list items.
		base := sdk.TestSDK(seed, nil)
		var seen []any
		for item := range base.Series(nil).Stream("list", nil, nil) {
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
			for item := range streamSdk.Series(nil).Stream("list", nil, nil) {
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
		setup := seriesBasicSetup(nil)
		// Per-op sdk-test-control.json skip — basic test exercises a flow
		// with multiple ops; skipping any op skips the whole flow.
		_mode := "unit"
		if setup.live {
			_mode = "live"
		}
		for _, _op := range []string{"list", "load"} {
			if _shouldSkip, _reason := isControlSkipped("entityOp", "series." + _op, _mode); _shouldSkip {
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
			t.Skip("live entity test uses synthetic IDs from fixture — set ELEMENTDEMO_TEST_SERIES_ENTID JSON to run live")
			return
		}
		client := setup.client

		// Bootstrap entity data from existing test data (no create step in flow).
		seriesRef01DataRaw := vs.Items(core.ToMapAny(vs.GetPath(setup.data, "existing.series")))
		var seriesRef01Data map[string]any
		if len(seriesRef01DataRaw) > 0 {
			seriesRef01Data = core.ToMapAny(seriesRef01DataRaw[0][1])
		}
		// Discard guards against Go's unused-var check when the flow's steps
		// happen not to consume the bootstrap data (e.g. list-only flows).
		_ = seriesRef01Data

		// LIST
		seriesRef01Ent := client.Series(nil)
		seriesRef01Match := map[string]any{}

		seriesRef01ListResult, err := seriesRef01Ent.List(seriesRef01Match, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		_, seriesRef01ListOk := seriesRef01ListResult.([]any)
		if !seriesRef01ListOk {
			t.Fatalf("expected list result to be an array, got %T", seriesRef01ListResult)
		}

		// LOAD
		seriesRef01MatchDt0 := map[string]any{
			"id": seriesRef01Data["id"],
		}
		seriesRef01DataDt0Loaded, err := seriesRef01Ent.Load(seriesRef01MatchDt0, nil)
		if err != nil {
			t.Fatalf("load failed: %v", err)
		}
		seriesRef01DataDt0LoadResult := core.ToMapAny(entityData(seriesRef01DataDt0Loaded))
		if seriesRef01DataDt0LoadResult == nil {
			t.Fatal("expected load result to be a map")
		}
		if seriesRef01DataDt0LoadResult["id"] != seriesRef01Data["id"] {
			t.Fatal("expected load result id to match")
		}

	})
}

func seriesBasicSetup(extra map[string]any) *entityTestSetup {
	loadEnvLocal()

	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)

	entityDataFile := filepath.Join(dir, "..", "..", ".sdk", "test", "entity", "series", "SeriesTestData.json")

	entityDataSource, err := os.ReadFile(entityDataFile)
	if err != nil {
		panic("failed to read series test data: " + err.Error())
	}

	var entityData map[string]any
	if err := json.Unmarshal(entityDataSource, &entityData); err != nil {
		panic("failed to parse series test data: " + err.Error())
	}

	options := map[string]any{}
	options["entity"] = entityData["existing"]

	client := sdk.TestSDK(options, extra)

	// Generate idmap via transform, matching TS pattern.
	idmap, _ := vs.Transform(
		[]any{"series01", "series02", "series03"},
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
	entidEnvRaw := os.Getenv("ELEMENTDEMO_TEST_SERIES_ENTID")
	idmapOverridden := entidEnvRaw != "" && strings.HasPrefix(strings.TrimSpace(entidEnvRaw), "{")

	env := envOverride(map[string]any{
		"ELEMENTDEMO_TEST_SERIES_ENTID": idmap,
		"ELEMENTDEMO_TEST_LIVE":      "FALSE",
		"ELEMENTDEMO_TEST_EXPLAIN":   "FALSE",
		"ELEMENTDEMO_APIKEY":         "",
		"ELEMENTDEMO_SERVER_ACCOUNT_ID": "",
	})

	idmapResolved := core.ToMapAny(env["ELEMENTDEMO_TEST_SERIES_ENTID"])
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
