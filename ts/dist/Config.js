"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_PLUGINS = exports.config = void 0;
const DebugFeature_1 = require("./feature/debug/DebugFeature");
const ElementcardFeature_1 = require("./feature/elementcard/ElementcardFeature");
const IdempotencyFeature_1 = require("./feature/idempotency/IdempotencyFeature");
const MetricsFeature_1 = require("./feature/metrics/MetricsFeature");
const PagingFeature_1 = require("./feature/paging/PagingFeature");
const RatelimitFeature_1 = require("./feature/ratelimit/RatelimitFeature");
const RetryFeature_1 = require("./feature/retry/RetryFeature");
const SecretsFeature_1 = require("./feature/secrets/SecretsFeature");
const TestFeature_1 = require("./feature/test/TestFeature");
const TimeoutFeature_1 = require("./feature/timeout/TimeoutFeature");
const FEATURE_CLASS = {
    debug: DebugFeature_1.DebugFeature,
    elementcard: ElementcardFeature_1.ElementcardFeature,
    idempotency: IdempotencyFeature_1.IdempotencyFeature,
    metrics: MetricsFeature_1.MetricsFeature,
    paging: PagingFeature_1.PagingFeature,
    ratelimit: RatelimitFeature_1.RatelimitFeature,
    retry: RetryFeature_1.RetryFeature,
    secrets: SecretsFeature_1.SecretsFeature,
    test: TestFeature_1.TestFeature,
    timeout: TimeoutFeature_1.TimeoutFeature,
};
const FEATURE_PLUGINS = {};
exports.FEATURE_PLUGINS = FEATURE_PLUGINS;
class Config {
    makeFeature(fn) {
        const fc = FEATURE_CLASS[fn];
        const fi = new fc();
        return fi;
    }
    // False for a feature added at runtime via options.extend (station's
    // adopt path) - the constructor uses this to skip makeFeature for names
    // no generated class backs.
    hasFeature(fn) {
        return null != FEATURE_CLASS[fn];
    }
    main = {
        name: 'Elementdemo',
        slug: "elementdemo",
        version: "0.1.0",
        target: "ts",
    };
    feature = {
        debug: {
            "options": {
                "active": false,
                "max": 100,
                "redact": [
                    "authorization",
                    "cookie",
                    "set-cookie",
                    "api-key",
                    "apikey",
                    "x-api-key",
                    "idempotency-key"
                ]
            },
            "optspec": {
                "now": "`$FUNCTION`",
                "onEntry": "`$FUNCTION`"
            },
            "strict": false,
            "transport": "none"
        },
        elementcard: {
            "options": {
                "active": false,
                "print": false
            },
            "optspec": {},
            "strict": false,
            "transport": "none"
        },
        idempotency: {
            "options": {
                "active": false,
                "header": "Idempotency-Key",
                "methods": [
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE"
                ],
                "ops": [
                    "create",
                    "update",
                    "remove"
                ]
            },
            "optspec": {
                "keygen": "`$FUNCTION`"
            },
            "strict": false,
            "transport": "none"
        },
        metrics: {
            "options": {
                "active": false
            },
            "optspec": {
                "now": "`$FUNCTION`"
            },
            "strict": false,
            "transport": "none"
        },
        paging: {
            "options": {
                "active": false,
                "afterVar": "after",
                "cursorParam": "cursor",
                "firstVar": "first",
                "limitParam": "limit",
                "pageParam": "page",
                "startPage": 1
            },
            "optspec": {
                "limit": "`$NUMBER`",
                "ops": "`$LIST`"
            },
            "strict": false,
            "transport": "none"
        },
        ratelimit: {
            "options": {
                "active": false,
                "burst": 5,
                "rate": 5
            },
            "optspec": {
                "now": "`$FUNCTION`",
                "sleep": "`$FUNCTION`"
            },
            "strict": false,
            "transport": "wrap"
        },
        retry: {
            "options": {
                "active": false,
                "factor": 2,
                "maxDelay": 2000,
                "minDelay": 50,
                "retries": 2,
                "statuses": [
                    408,
                    425,
                    429,
                    500,
                    502,
                    503,
                    504
                ]
            },
            "optspec": {
                "jitter": "`$BOOLEAN`",
                "sleep": "`$FUNCTION`"
            },
            "strict": false,
            "transport": "wrap"
        },
        secrets: {
            "options": {
                "active": false,
                "cache": true,
                "exchange": {
                    "active": false,
                    "method": "POST",
                    "path": "auth/token",
                    "refresh": "",
                    "request": "refresh_token",
                    "response": "access_token",
                    "retries": 1,
                    "statuses": [
                        401
                    ]
                },
                "name": "apikey",
                "providers": []
            },
            "optspec": {},
            "strict": false,
            "transport": "wrap"
        },
        test: {
            "options": {
                "active": false
            },
            "optspec": {
                "entity": "`$MAP`",
                "net": "`$MAP`"
            },
            "strict": false,
            "transport": "base"
        },
        timeout: {
            "options": {
                "active": false,
                "ms": 30000
            },
            "optspec": {
                "clearTimer": "`$FUNCTION`",
                "now": "`$FUNCTION`",
                "setTimer": "`$FUNCTION`"
            },
            "strict": false,
            "transport": "wrap"
        },
    };
    options = {
        base: "http://localhost:8902/api/{account_id}",
        server: {
            "account_id": "",
        },
        auth: {
            prefix: 'Bearer',
        },
        headers: {
            "content-type": "application/json"
        },
        entity: {
            element: {},
            group: {},
            isotope: {},
            series: {},
        }
    };
    entity = {
        "element": {
            "fields": [
                {
                    "name": "block",
                    "title": "Block",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Orbital block, one of s, p, d, f."
                },
                {
                    "name": "discovered",
                    "title": "Discovered",
                    "type": "`$INTEGER`",
                    "short": "Year of discovery, absent for elements known since antiquity."
                },
                {
                    "name": "group",
                    "title": "Group",
                    "type": "`$INTEGER`",
                    "short": "Periodic table column, 1 to 18, absent for the f-block."
                },
                {
                    "name": "id",
                    "title": "Id",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Element identifier, the lowercase symbol."
                },
                {
                    "name": "mass",
                    "title": "Mass",
                    "type": "`$NUMBER`",
                    "req": true,
                    "short": "Standard atomic weight in daltons.",
                    "format": "float"
                },
                {
                    "name": "name",
                    "title": "Name",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Element name."
                },
                {
                    "name": "number",
                    "title": "Number",
                    "type": "`$INTEGER`",
                    "req": true,
                    "short": "Atomic number."
                },
                {
                    "name": "period",
                    "title": "Period",
                    "type": "`$INTEGER`",
                    "req": true,
                    "short": "Periodic table row, 1 to 7."
                },
                {
                    "name": "phase",
                    "title": "Phase",
                    "type": "`$STRING`",
                    "short": "Phase at standard temperature and pressure."
                },
                {
                    "name": "series_id",
                    "title": "Series Id",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Chemical series this element belongs to."
                },
                {
                    "name": "symbol",
                    "title": "Symbol",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Chemical symbol."
                }
            ],
            "id": {
                "field": "id",
                "name": "id"
            },
            "name": "element",
            "op": {
                "create": {
                    "input": "data",
                    "name": "create",
                    "points": [
                        {
                            "kind": "http",
                            "method": "POST",
                            "orig": "/element/{element_id}/ionize",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "id"
                                },
                                {
                                    "lit": "ionize"
                                }
                            ],
                            "parts": [
                                "element",
                                "{id}",
                                "ionize"
                            ],
                            "rename": {
                                "param": {
                                    "element_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "$action": "ionize",
                                "exist": [
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        },
                        {
                            "kind": "http",
                            "method": "POST",
                            "orig": "/element",
                            "segments": [
                                {
                                    "lit": "element"
                                }
                            ],
                            "parts": [
                                "element"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                },
                "list": {
                    "input": "data",
                    "name": "list",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/element",
                            "segments": [
                                {
                                    "lit": "element"
                                }
                            ],
                            "parts": [
                                "element"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                },
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/element/{element_id}",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "element",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "element_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                },
                "remove": {
                    "input": "data",
                    "name": "remove",
                    "points": [
                        {
                            "kind": "http",
                            "method": "DELETE",
                            "orig": "/element/{element_id}",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "element",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "element_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "id"
                                ]
                            }
                        }
                    ]
                },
                "update": {
                    "input": "data",
                    "name": "update",
                    "points": [
                        {
                            "kind": "http",
                            "method": "PUT",
                            "orig": "/element/{element_id}",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "element",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "element_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "group": {
            "fields": [
                {
                    "name": "cas",
                    "title": "Cas",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "CAS group designation."
                },
                {
                    "name": "id",
                    "title": "Id",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Group identifier, g1 to g18."
                },
                {
                    "name": "name",
                    "title": "Name",
                    "type": "`$STRING`",
                    "short": "Trivial name, where one exists."
                },
                {
                    "name": "number",
                    "title": "Number",
                    "type": "`$INTEGER`",
                    "req": true,
                    "short": "Group number, 1 to 18."
                }
            ],
            "id": {
                "field": "id",
                "name": "id"
            },
            "name": "group",
            "op": {
                "list": {
                    "input": "data",
                    "name": "list",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/group",
                            "segments": [
                                {
                                    "lit": "group"
                                }
                            ],
                            "parts": [
                                "group"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                },
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/group/{group_id}",
                            "segments": [
                                {
                                    "lit": "group"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "group",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "group_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "id",
                                        "orig": "group_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "isotope": {
            "fields": [
                {
                    "name": "abundance",
                    "title": "Abundance",
                    "type": "`$NUMBER`",
                    "short": "Natural abundance as a fraction, absent for synthetic isotopes.",
                    "format": "float"
                },
                {
                    "name": "element_id",
                    "title": "Element Id",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Parent element identifier."
                },
                {
                    "name": "halflife",
                    "title": "Halflife",
                    "type": "`$STRING`",
                    "short": "Half-life, absent for stable isotopes."
                },
                {
                    "name": "id",
                    "title": "Id",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Isotope identifier, symbol dash mass number."
                },
                {
                    "name": "mass",
                    "title": "Mass",
                    "type": "`$NUMBER`",
                    "req": true,
                    "short": "Isotopic mass in daltons.",
                    "format": "float"
                },
                {
                    "name": "mass_number",
                    "title": "Mass Number",
                    "type": "`$INTEGER`",
                    "req": true,
                    "short": "Total protons and neutrons."
                },
                {
                    "name": "mode",
                    "title": "Mode",
                    "type": "`$STRING`",
                    "short": "Primary decay mode, absent for stable isotopes."
                },
                {
                    "name": "name",
                    "title": "Name",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Isotope name."
                },
                {
                    "name": "product",
                    "title": "Product",
                    "type": "`$STRING`",
                    "short": "Primary decay product isotope, absent for stable isotopes."
                },
                {
                    "name": "stable",
                    "title": "Stable",
                    "type": "`$BOOLEAN`",
                    "req": true,
                    "short": "True if the isotope is stable."
                }
            ],
            "id": {
                "field": "id",
                "name": "id"
            },
            "name": "isotope",
            "op": {
                "create": {
                    "input": "data",
                    "name": "create",
                    "points": [
                        {
                            "kind": "http",
                            "method": "POST",
                            "orig": "/element/{element_id}/isotope/{isotope_id}/decay",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "element_id"
                                },
                                {
                                    "lit": "isotope"
                                },
                                {
                                    "var": "id"
                                },
                                {
                                    "lit": "decay"
                                }
                            ],
                            "parts": [
                                "element",
                                "{element_id}",
                                "isotope",
                                "{id}",
                                "decay"
                            ],
                            "rename": {
                                "param": {
                                    "isotope_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "element_id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    },
                                    {
                                        "name": "id",
                                        "orig": "isotope_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "$action": "decay",
                                "exist": [
                                    "element_id",
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        },
                        {
                            "kind": "http",
                            "method": "POST",
                            "orig": "/element/{element_id}/isotope",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "element_id"
                                },
                                {
                                    "lit": "isotope"
                                }
                            ],
                            "parts": [
                                "element",
                                "{element_id}",
                                "isotope"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "element_id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "element_id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                },
                "list": {
                    "input": "data",
                    "name": "list",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/element/{element_id}/isotope",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "element_id"
                                },
                                {
                                    "lit": "isotope"
                                }
                            ],
                            "parts": [
                                "element",
                                "{element_id}",
                                "isotope"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "element_id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "element_id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                },
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/element/{element_id}/isotope/{isotope_id}",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "element_id"
                                },
                                {
                                    "lit": "isotope"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "element",
                                "{element_id}",
                                "isotope",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "isotope_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "element_id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    },
                                    {
                                        "name": "id",
                                        "orig": "isotope_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "element_id",
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                },
                "remove": {
                    "input": "data",
                    "name": "remove",
                    "points": [
                        {
                            "kind": "http",
                            "method": "DELETE",
                            "orig": "/element/{element_id}/isotope/{isotope_id}",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "element_id"
                                },
                                {
                                    "lit": "isotope"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "element",
                                "{element_id}",
                                "isotope",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "isotope_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "element_id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    },
                                    {
                                        "name": "id",
                                        "orig": "isotope_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "element_id",
                                    "id"
                                ]
                            }
                        }
                    ]
                },
                "update": {
                    "input": "data",
                    "name": "update",
                    "points": [
                        {
                            "kind": "http",
                            "method": "PUT",
                            "orig": "/element/{element_id}/isotope/{isotope_id}",
                            "segments": [
                                {
                                    "lit": "element"
                                },
                                {
                                    "var": "element_id"
                                },
                                {
                                    "lit": "isotope"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "element",
                                "{element_id}",
                                "isotope",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "isotope_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "element_id",
                                        "orig": "element_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    },
                                    {
                                        "name": "id",
                                        "orig": "isotope_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "element_id",
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": [
                    [
                        "$.main.kit.entity.element"
                    ]
                ]
            }
        },
        "series": {
            "fields": [
                {
                    "name": "color",
                    "title": "Color",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Display color used by the element card renderer."
                },
                {
                    "name": "description",
                    "title": "Description",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "One-line description of the series."
                },
                {
                    "name": "id",
                    "title": "Id",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Series identifier."
                },
                {
                    "name": "name",
                    "title": "Name",
                    "type": "`$STRING`",
                    "req": true,
                    "short": "Series name."
                }
            ],
            "id": {
                "field": "id",
                "name": "id"
            },
            "name": "series",
            "op": {
                "list": {
                    "input": "data",
                    "name": "list",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/series",
                            "segments": [
                                {
                                    "lit": "series"
                                }
                            ],
                            "parts": [
                                "series"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                },
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/series/{series_id}",
                            "segments": [
                                {
                                    "lit": "series"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "series",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "series_id": "id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "id",
                                        "orig": "series_id",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        }
    };
}
const config = new Config();
exports.config = config;
//# sourceMappingURL=Config.js.map