package sdktest

import (
	"encoding/json"
	"os"
	"strings"
	"testing"

	sdk "github.com/voxgig-sdk/voxgig-elementdemo-sdk/go"
	"github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/core"
)

func TestIsotopeDirect(t *testing.T) {
	t.Run("direct-list-isotope", func(t *testing.T) {
		setup := isotopeDirectSetup([]any{
			map[string]any{"id": "direct01"},
			map[string]any{"id": "direct02"},
		})
		_mode := "unit"
		if setup.live {
			_mode = "live"
		}
		if _shouldSkip, _reason := isControlSkipped("direct", "direct-list-isotope", _mode); _shouldSkip {
			if _reason == "" {
				_reason = "skipped via sdk-test-control.json"
			}
			t.Skip(_reason)
			return
		}
		if setup.live {
			for _, _liveKey := range []string{"element01"} {
				if v := setup.idmap[_liveKey]; v == nil {
					t.Skipf("live test needs %s via *_ENTID env var (synthetic IDs only)", _liveKey)
					return
				}
			}
		}
		client := setup.client

		params := map[string]any{}
		if setup.live {
			params["element_id"] = setup.idmap["element01"]
		} else {
			params["element_id"] = "direct01"
		}

		result, err := client.Direct(map[string]any{
			"path":   "api/element/{element_id}/isotope",
			"method": "GET",
			"params": params,
		})
		if setup.live {
			// Live-mode leniency is a model decision
			// (main.kit.test.live.strict): synthetic IDs 4xx constantly
			// against an arbitrary public API, so the default SKIPS here.
			// A project that owns its test server sets strict and FAILS.
			if err != nil {
				t.Fatalf("list call failed (likely synthetic IDs against live API): %v", err)
			}
			if result["ok"] != true {
				t.Fatalf("list call not ok (likely synthetic IDs against live API): %v", result)
			}
			status := core.ToInt(result["status"])
			if status < 200 || status >= 300 {
				t.Fatalf("expected 2xx status, got %v", result["status"])
			}
		} else {
			if err != nil {
				t.Fatalf("direct failed: %v", err)
			}
			if result["ok"] != true {
				t.Fatalf("expected ok to be true, got %v", result["ok"])
			}
			if core.ToInt(result["status"]) != 200 {
				t.Fatalf("expected status 200, got %v", result["status"])
			}
		}

		if !setup.live {
			if dataList, ok := result["data"].([]any); ok {
				if len(dataList) != 2 {
					t.Fatalf("expected 2 items, got %d", len(dataList))
				}
			} else {
				t.Fatalf("expected data to be an array, got %T", result["data"])
			}

			if len(*setup.calls) != 1 {
				t.Fatalf("expected 1 call, got %d", len(*setup.calls))
			}
			call := (*setup.calls)[0]
			if initMap, ok := call["init"].(map[string]any); ok {
				if initMap["method"] != "GET" {
					t.Fatalf("expected method GET, got %v", initMap["method"])
				}
			}
			if url, ok := call["url"].(string); ok {
				if !strings.Contains(url, "direct01") {
					t.Fatalf("expected url to contain direct01, got %v", url)
				}
			}
		}
	})

	t.Run("direct-load-isotope", func(t *testing.T) {
		setup := isotopeDirectSetup(map[string]any{"id": "direct01"})
		_mode := "unit"
		if setup.live {
			_mode = "live"
		}
		if _shouldSkip, _reason := isControlSkipped("direct", "direct-load-isotope", _mode); _shouldSkip {
			if _reason == "" {
				_reason = "skipped via sdk-test-control.json"
			}
			t.Skip(_reason)
			return
		}
		if setup.live {
			for _, _liveKey := range []string{"element01"} {
				if v := setup.idmap[_liveKey]; v == nil {
					t.Skipf("live test needs %s via *_ENTID env var (synthetic IDs only)", _liveKey)
					return
				}
			}
		}
		client := setup.client

		params := map[string]any{}
		query := map[string]any{}
		if setup.live {
			listParams := map[string]any{}
			listParams["element_id"] = setup.idmap["element01"]
			listResult, listErr := client.Direct(map[string]any{
				"path":   "api/element/{element_id}/isotope",
				"method": "GET",
				"params": listParams,
			})
			if listErr != nil {
				t.Fatalf("list call failed (likely synthetic IDs against live API): %v", listErr)
			}
			if listResult["ok"] != true {
				t.Fatalf("list call not ok (likely synthetic IDs against live API): %v", listResult)
			}

			// Get first entity ID from list
			listData, _ := listResult["data"].([]any)
			if len(listData) == 0 {
				t.Skip("no entities to load in live mode")
			}
			firstEnt := core.ToMapAny(listData[0])
			params["id"] = firstEnt["id"]
			params["element_id"] = setup.idmap["element01"]
		} else {
			params["element_id"] = "direct01"
			params["id"] = "direct02"
		}

		result, err := client.Direct(map[string]any{
			"path":   "api/element/{element_id}/isotope/{id}",
			"method": "GET",
			"params": params,
			"query":  query,
		})
		if setup.live {
			// Live mode is lenient: synthetic IDs frequently 4xx. Skip
			// rather than fail when the load endpoint isn't reachable with
			// the IDs we can construct from setup.idmap — unless the model
			// sets main.kit.test.live.strict.
			if err != nil {
				t.Fatalf("load call failed (likely synthetic IDs against live API): %v", err)
			}
			if result["ok"] != true {
				t.Fatalf("load call not ok (likely synthetic IDs against live API): %v", result)
			}
			status := core.ToInt(result["status"])
			if status < 200 || status >= 300 {
				t.Fatalf("expected 2xx status, got %v", result["status"])
			}
		} else {
			if err != nil {
				t.Fatalf("direct failed: %v", err)
			}
			if result["ok"] != true {
				t.Fatalf("expected ok to be true, got %v", result["ok"])
			}
			if core.ToInt(result["status"]) != 200 {
				t.Fatalf("expected status 200, got %v", result["status"])
			}
			if result["data"] == nil {
				t.Fatal("expected data to be non-nil")
			}
		}

		if !setup.live {
			if dataMap, ok := result["data"].(map[string]any); ok {
				if dataMap["id"] != "direct01" {
					t.Fatalf("expected data.id to be direct01, got %v", dataMap["id"])
				}
			}

			if len(*setup.calls) != 1 {
				t.Fatalf("expected 1 call, got %d", len(*setup.calls))
			}
			call := (*setup.calls)[0]
			if initMap, ok := call["init"].(map[string]any); ok {
				if initMap["method"] != "GET" {
					t.Fatalf("expected method GET, got %v", initMap["method"])
				}
			}
			if url, ok := call["url"].(string); ok {
				if !strings.Contains(url, "direct01") {
					t.Fatalf("expected url to contain direct01, got %v", url)
				}
				if !strings.Contains(url, "direct02") {
					t.Fatalf("expected url to contain direct02, got %v", url)
				}
			}
		}
	})

}

type isotopeDirectSetupResult struct {
	client *sdk.ElementdemoSDK
	calls  *[]map[string]any
	live   bool
	idmap  map[string]any
}

func isotopeDirectSetup(mockres any) *isotopeDirectSetupResult {
	loadEnvLocal()

	calls := &[]map[string]any{}

	env := envOverride(map[string]any{
		"ELEMENTDEMO_TEST_ISOTOPE_ENTID": map[string]any{},
		"ELEMENTDEMO_TEST_LIVE":    "FALSE",
	})

	live := env["ELEMENTDEMO_TEST_LIVE"] == "TRUE"

	if live {
		mergedOpts := map[string]any{
		}
		client := sdk.NewElementdemoSDK(mergedOpts)

		idmap := map[string]any{}
		if entidRaw, ok := env["ELEMENTDEMO_TEST_ISOTOPE_ENTID"]; ok {
			if entidStr, ok := entidRaw.(string); ok && strings.HasPrefix(entidStr, "{") {
				json.Unmarshal([]byte(entidStr), &idmap)
			} else if entidMap, ok := entidRaw.(map[string]any); ok {
				idmap = entidMap
			}
		}

		return &isotopeDirectSetupResult{client: client, calls: calls, live: true, idmap: idmap}
	}

	mockFetch := func(url string, init map[string]any) (map[string]any, error) {
		*calls = append(*calls, map[string]any{"url": url, "init": init})
		return map[string]any{
			"status":     200,
			"statusText": "OK",
			"headers":    map[string]any{},
			"json": (func() any)(func() any {
				if mockres != nil {
					return mockres
				}
				return map[string]any{"id": "direct01"}
			}),
		}, nil
	}

	client := sdk.NewElementdemoSDK(map[string]any{
		"base": "http://localhost:8080",
		"system": map[string]any{
			"fetch": (func(string, map[string]any) (map[string]any, error))(mockFetch),
		},
	})

	return &isotopeDirectSetupResult{client: client, calls: calls, live: false, idmap: map[string]any{}}
}

var _ = os.Getenv
var _ = json.Unmarshal
