# Isotope entity test

import json
import os
import time

import pytest

from elementdemo_sdk.utility.voxgig_struct import voxgig_struct as vs
from elementdemo_sdk import ElementdemoSDK
from elementdemo_sdk.core import helpers
from elementdemo_sdk.config import shared_config
from elementdemo_sdk.feature.base_feature import ElementdemoBaseFeature

_TEST_DIR = os.path.dirname(os.path.abspath(__file__))
from test import runner



# main.kit.test.live.strict is true (the default is true): a live
# request that fails, or a live test missing an input it needs,
# fails the test.
# An account with no record for a test to read skips it either way.
LIVE_STRICT = True


class TestIsotopeEntity:

    def test_should_create_instance(self):
        testsdk = ElementdemoSDK.test(None, None)
        ent = testsdk.Isotope(None)
        assert ent is not None

    def test_should_refuse_an_invalid_request(self):
        if "validate" not in (shared_config().get("feature") or {}):
            pytest.skip("feature not present in this SDK: validate")
        client = ElementdemoSDK.test(
            None, {"feature": {"validate": {"active": True}}})
        with pytest.raises(Exception) as err:
            client.Isotope(None).list({"element_id": 1}, None)
        assert "validate_failed" == getattr(err.value, "code", None)

    def test_should_run_basic_flow(self):
        setup = _isotope_basic_setup(None)
        # Per-op sdk-test-control.json skip — basic test exercises a flow with
        # multiple ops; skipping any one skips the whole flow (steps depend
        # on each other).
        _live = setup.get("live", False)
        for _op in ["create", "list", "update", "load", "remove"]:
            _skip, _reason = runner.is_control_skipped("entityOp", "isotope." + _op, "live" if _live else "unit")
            if _skip:
                pytest.skip(_reason or "skipped via sdk-test-control.json")
                return
        if setup["live"] and os.environ.get("VOXGIG_GETONLY_GUARD") == "TRUE":
            print("LIVE STEP {\"id\":\"isotope.create.0\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs POST /element/{element_id}/isotope/{isotope_id}/decay\"}")
            print("LIVE STEP {\"id\":\"isotope.update.2\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs PUT /element/{element_id}/isotope/{isotope_id}\"}")
            print("LIVE STEP {\"id\":\"isotope.remove.4\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: needs DELETE /element/{element_id}/isotope/{isotope_id}\"}")
            print("LIVE STEP {\"id\":\"isotope.list.5\",\"state\":\"excluded\",\"attempted\":false,\"reason\":\"GET-only live run: checks a removal this run does not make\"}")
            return self._run_get_only_flow(setup)

        if setup["live"]:
            for _live_key in ["element01"]:
                if setup.get("synthetic_only") or setup["idmap"].get(_live_key) is None:
                    runner.live_miss(LIVE_STRICT, f"Live entity test blocked: needs {_live_key} via ELEMENTDEMO_TEST_ISOTOPE_ENTID")
        client = setup["client"]

        if setup["live"]:
            runner.live_pace()
        # CREATE
        isotope_ref01_ent = client.Isotope(None)
        isotope_ref01_data = helpers.to_map(vs.getprop(
            vs.getpath(setup["data"], "new.isotope"), "isotope_ref01"))
        isotope_ref01_data["element_id"] = setup["idmap"]["element01"]

        isotope_ref01_data = helpers.to_map(runner.entity_data(isotope_ref01_ent.create(isotope_ref01_data, None)))
        assert isotope_ref01_data is not None
        assert isotope_ref01_data["id"] is not None

        if setup["live"]:
            runner.live_pace()
        # LIST
        isotope_ref01_match = {
            "element_id": setup["idmap"]["element01"],
        }

        isotope_ref01_list_result = isotope_ref01_ent.list(isotope_ref01_match, None)
        assert isinstance(isotope_ref01_list_result, list)

        found_item = vs.select(
            runner.entity_list_to_data(isotope_ref01_list_result),
            {"id": isotope_ref01_data["id"]})
        assert not vs.isempty(found_item)

        if setup["live"]:
            runner.live_pace()
        # UPDATE
        isotope_ref01_data_up0_up = {
            "id": isotope_ref01_data["id"],
            "element_id": setup["idmap"]["element_id"],
        }

        isotope_ref01_markdef_up0_name = "halflife"
        isotope_ref01_markdef_up0_value = "Mark01-isotope_ref01_" + str(setup["now"])
        isotope_ref01_data_up0_up[isotope_ref01_markdef_up0_name] = isotope_ref01_markdef_up0_value

        isotope_ref01_resdata_up0 = helpers.to_map(runner.entity_data(isotope_ref01_ent.update(isotope_ref01_data_up0_up, None)))
        assert isotope_ref01_resdata_up0 is not None
        assert runner.live_same_id(isotope_ref01_resdata_up0.get("id"), isotope_ref01_data_up0_up["id"])
        assert isotope_ref01_resdata_up0[isotope_ref01_markdef_up0_name] == isotope_ref01_markdef_up0_value

        if setup["live"]:
            runner.live_pace()
        # LOAD
        isotope_ref01_match_dt0 = {
            "id": isotope_ref01_data["id"],
        }
        isotope_ref01_match_dt0["element_id"] = isotope_ref01_data.get("element_id") if isinstance(isotope_ref01_data.get("element_id"), (str, int, float)) else setup["idmap"].get("element_id") or setup["idmap"].get("element01")
        isotope_ref01_data_dt0_loaded = isotope_ref01_ent.load(isotope_ref01_match_dt0, None)
        isotope_ref01_data_dt0_load_result = helpers.to_map(runner.entity_data(isotope_ref01_data_dt0_loaded))
        assert isotope_ref01_data_dt0_load_result is not None
        assert runner.live_same_id(isotope_ref01_data_dt0_load_result.get("id"), isotope_ref01_data["id"])

        if setup["live"]:
            runner.live_pace()
        # REMOVE
        isotope_ref01_match_rm0 = {
            "id": isotope_ref01_data["id"],
        }
        isotope_ref01_match_rm0["element_id"] = setup["idmap"].get("element_id") or setup["idmap"].get("element01")
        isotope_ref01_ent.remove(isotope_ref01_match_rm0, None)

        if setup["live"]:
            runner.live_pace()
        # LIST
        isotope_ref01_match_rt0 = {
            "element_id": setup["idmap"]["element01"],
        }

        isotope_ref01_list_rt0_result = isotope_ref01_ent.list(isotope_ref01_match_rt0, None)
        assert isinstance(isotope_ref01_list_rt0_result, list)

        not_found_item = vs.select(
            runner.entity_list_to_data(isotope_ref01_list_rt0_result),
            {"id": isotope_ref01_data["id"]})
        assert vs.isempty(not_found_item)


    def _run_get_only_flow(self, setup):
        if setup["live"]:
            for _live_key in ["element01"]:
                if setup.get("synthetic_only") or setup["idmap"].get(_live_key) is None:
                    runner.live_miss(LIVE_STRICT, f"Live entity test blocked: needs {_live_key} via ELEMENTDEMO_TEST_ISOTOPE_ENTID")
        client = setup["client"]
        if setup["live"]:
            _live_id = None if setup.get("synthetic_only") else setup["idmap"].get("isotope01")
            runner.live_pace()
            runner.live_existing(setup, LIVE_STRICT, "isotope",
                                 lambda: client.Isotope(None).list({"element_id": setup["idmap"].get("element01")}, None),
                                 "id", _live_id)

        # Bootstrap entity data from existing test data.
        isotope_ref01_data_raw = vs.items(helpers.to_map(
            vs.getpath(setup["data"], "existing.isotope")))
        isotope_ref01_data = None
        if len(isotope_ref01_data_raw) > 0:
            isotope_ref01_data = helpers.to_map(isotope_ref01_data_raw[0][1])

        if setup["live"]:
            runner.live_pace()
        # LIST
        isotope_ref01_ent = client.Isotope(None)
        isotope_ref01_match = {
            "element_id": setup["idmap"]["element01"],
        }

        isotope_ref01_list_result = isotope_ref01_ent.list(isotope_ref01_match, None)
        assert isinstance(isotope_ref01_list_result, list)

        if setup["live"]:
            runner.live_pace()
        # LOAD
        isotope_ref01_match_dt0 = {
            "id": isotope_ref01_data["id"],
        }
        isotope_ref01_match_dt0["element_id"] = isotope_ref01_data.get("element_id") if isinstance(isotope_ref01_data.get("element_id"), (str, int, float)) else setup["idmap"].get("element_id") or setup["idmap"].get("element01")
        isotope_ref01_data_dt0_loaded = isotope_ref01_ent.load(isotope_ref01_match_dt0, None)
        isotope_ref01_data_dt0_load_result = helpers.to_map(runner.entity_data(isotope_ref01_data_dt0_loaded))
        assert isotope_ref01_data_dt0_load_result is not None
        assert runner.live_same_id(isotope_ref01_data_dt0_load_result.get("id"), isotope_ref01_data["id"])



def _isotope_basic_setup(extra):
    runner.load_env_local()

    entity_data_file = os.path.join(_TEST_DIR, "../../.sdk/test/entity/isotope/IsotopeTestData.json")
    with open(entity_data_file, "r", encoding="utf-8") as f:
        entity_data_source = f.read()

    entity_data = json.loads(entity_data_source)

    options = {}
    options["entity"] = entity_data.get("existing")

    client = ElementdemoSDK.test(options, extra)

    # Generate idmap via transform.
    idmap = vs.transform(
        ["isotope01", "isotope02", "isotope03", "element01", "element02", "element03"],
        {
            "`$PACK`": ["", {
                "`$KEY`": "`$COPY`",
                "`$VAL`": ["`$FORMAT`", "upper", "`$COPY`"],
            }],
        }
    )

    # Whether *_ENTID supplied the idmap, read before env_override consumes
    # it: without it, the ids a live flow binds are the fixture's synthetic ones.
    _entid_env_raw = os.environ.get(
        "ELEMENTDEMO_TEST_ISOTOPE_ENTID")
    _idmap_overridden = _entid_env_raw is not None and _entid_env_raw.strip().startswith("{")

    env = runner.env_override({
        "ELEMENTDEMO_TEST_ISOTOPE_ENTID": idmap,
        "ELEMENTDEMO_TEST_LIVE": "FALSE",
        "ELEMENTDEMO_TEST_EXPLAIN": "FALSE",
        "ELEMENTDEMO_APIKEY": "",
        "ELEMENTDEMO_SERVER_ACCOUNT_ID": "",
    })

    idmap_resolved = helpers.to_map(
        env.get("ELEMENTDEMO_TEST_ISOTOPE_ENTID"))
    if idmap_resolved is None:
        idmap_resolved = helpers.to_map(idmap)
    if idmap_resolved.get("element_id") is None:
        idmap_resolved["element_id"] = idmap_resolved.get("element01")

    if env.get("ELEMENTDEMO_TEST_LIVE") == "TRUE":
        merged_opts = vs.merge([
            # FIRST, so the generated fields below win: sdk-test-control.json's
            # test.client.options adds to the live client, it does not
            # redirect it.
            runner.live_client_options(),
            {
                "apikey": env.get("ELEMENTDEMO_APIKEY"),
                "server": {
                    "account_id": env.get("ELEMENTDEMO_SERVER_ACCOUNT_ID"),
                },
            },
            extra or {},
        ])
        client = ElementdemoSDK(helpers.to_map(merged_opts))

    _live = env.get("ELEMENTDEMO_TEST_LIVE") == "TRUE"
    return {
        "client": client,
        "data": entity_data,
        "idmap": idmap_resolved,
        "env": env,
        "explain": env.get("ELEMENTDEMO_TEST_EXPLAIN") == "TRUE",
        "live": _live,
        "synthetic_only": _live and not _idmap_overridden,
        "now": int(time.time() * 1000),
    }
