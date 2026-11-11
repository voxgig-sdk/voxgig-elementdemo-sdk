# Elementdemo SDK configuration


# The sekreto plugin DEFINITIONS the model selected per feature, imported
# above by name from the modules the catalogue's active `plugin.def`
# entries declare. Handed to each feature (secrets builds its Sekreto
# with them): a provider kind not listed here is unknown to that SDK.
FEATURE_PLUGINS = {
}


_shared_config = None


def shared_config():
    """Return the process-wide config, built once on first use.

    The SDK reads the config on every request and never writes to it, so one
    instance is shared by every client rather than rebuilt per client.

    The returned dict is shared: treat it as read-only. Callers that need to
    mutate should use make_config, which always returns a fresh copy.
    """
    global _shared_config
    if _shared_config is None:
        _shared_config = make_config()
    return _shared_config


def make_config():
    """Build a fresh, fully materialised config dict.

    Every call rebuilds the whole structure, so prefer shared_config unless
    you need a private copy you intend to mutate.
    """
    return {
        "main": {
            "name": "Elementdemo",
            "slug": "elementdemo",
            "version": "0.1.0",
            "target": "py",
        },
        "feature": {
            "debug": {
        "options": {
          "active": False,
          "max": 100,
          "redact": [
            "authorization",
            "cookie",
            "set-cookie",
            "api-key",
            "apikey",
            "x-api-key",
            "idempotency-key",
          ],
        },
        "optspec": {
          "now": "`$FUNCTION`",
          "onEntry": "`$FUNCTION`",
        },
        "strict": False,
        "transport": "none",
      },
            "elementcard": {
        "options": {
          "active": False,
          "print": False,
        },
        "optspec": {},
        "strict": False,
        "transport": "none",
      },
            "idempotency": {
        "options": {
          "active": False,
          "header": "Idempotency-Key",
          "methods": [
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
          ],
          "ops": [
            "create",
            "update",
            "remove",
          ],
        },
        "optspec": {
          "keygen": "`$FUNCTION`",
        },
        "strict": False,
        "transport": "none",
      },
            "metrics": {
        "options": {
          "active": False,
        },
        "optspec": {
          "now": "`$FUNCTION`",
        },
        "strict": False,
        "transport": "none",
      },
            "paging": {
        "options": {
          "active": False,
          "afterVar": "after",
          "cursorParam": "cursor",
          "firstVar": "first",
          "limitParam": "limit",
          "pageParam": "page",
          "startPage": 1,
        },
        "optspec": {
          "limit": "`$NUMBER`",
          "ops": "`$LIST`",
        },
        "strict": False,
        "transport": "none",
      },
            "ratelimit": {
        "options": {
          "active": False,
          "burst": 5,
          "rate": 5,
        },
        "optspec": {
          "now": "`$FUNCTION`",
          "sleep": "`$FUNCTION`",
        },
        "strict": False,
        "transport": "wrap",
      },
            "retry": {
        "options": {
          "active": False,
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
            504,
          ],
        },
        "optspec": {
          "jitter": "`$BOOLEAN`",
          "sleep": "`$FUNCTION`",
        },
        "strict": False,
        "transport": "wrap",
      },
            "secrets": {
        "options": {
          "active": False,
          "cache": True,
          "exchange": {
            "active": False,
            "method": "POST",
            "path": "auth/token",
            "refresh": "",
            "request": "refresh_token",
            "response": "access_token",
            "retries": 1,
            "statuses": [
              401,
            ],
          },
          "name": "apikey",
          "providers": [],
        },
        "optspec": {},
        "strict": False,
        "transport": "wrap",
      },
            "test": {
        "options": {
          "active": False,
        },
        "optspec": {
          "entity": "`$MAP`",
          "net": "`$MAP`",
        },
        "strict": False,
        "transport": "base",
      },
            "timeout": {
        "options": {
          "active": False,
          "ms": 30000,
        },
        "optspec": {
          "clearTimer": "`$FUNCTION`",
          "now": "`$FUNCTION`",
          "setTimer": "`$FUNCTION`",
        },
        "strict": False,
        "transport": "wrap",
      },
        },
        "options": {
            "base": "http://localhost:8902/api/{account_id}",
            "server": {
                "account_id": "",
            },
            "auth": {
                "prefix": "Bearer",
            },
            "headers": {
        "content-type": "application/json",
      },
            "entity": {
                "element": {},
                "group": {},
                "isotope": {},
                "series": {},
            },
        },
        "entity": {
      "element": {
        "fields": [
          {
            "name": "block",
            "title": "Block",
            "type": "`$STRING`",
            "req": True,
            "short": "Orbital block, one of s, p, d, f.",
          },
          {
            "name": "discovered",
            "title": "Discovered",
            "type": "`$INTEGER`",
            "short": "Year of discovery, absent for elements known since antiquity.",
          },
          {
            "name": "group",
            "title": "Group",
            "type": "`$INTEGER`",
            "short": "Periodic table column, 1 to 18, absent for the f-block.",
          },
          {
            "name": "id",
            "title": "Id",
            "type": "`$STRING`",
            "req": True,
            "short": "Element identifier, the lowercase symbol.",
          },
          {
            "name": "mass",
            "title": "Mass",
            "type": "`$NUMBER`",
            "req": True,
            "short": "Standard atomic weight in daltons.",
            "format": "float",
          },
          {
            "name": "name",
            "title": "Name",
            "type": "`$STRING`",
            "req": True,
            "short": "Element name.",
          },
          {
            "name": "number",
            "title": "Number",
            "type": "`$INTEGER`",
            "req": True,
            "short": "Atomic number.",
          },
          {
            "name": "period",
            "title": "Period",
            "type": "`$INTEGER`",
            "req": True,
            "short": "Periodic table row, 1 to 7.",
          },
          {
            "name": "phase",
            "title": "Phase",
            "type": "`$STRING`",
            "short": "Phase at standard temperature and pressure.",
          },
          {
            "name": "series_id",
            "title": "Series Id",
            "type": "`$STRING`",
            "req": True,
            "short": "Chemical series this element belongs to.",
          },
          {
            "name": "symbol",
            "title": "Symbol",
            "type": "`$STRING`",
            "req": True,
            "short": "Chemical symbol.",
          },
        ],
        "id": {
          "field": "id",
          "name": "id",
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
                    "lit": "element",
                  },
                  {
                    "var": "id",
                  },
                  {
                    "lit": "ionize",
                  },
                ],
                "parts": [
                  "element",
                  "{id}",
                  "ionize",
                ],
                "rename": {
                  "param": {
                    "element_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "$action": "ionize",
                  "exist": [
                    "id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
              {
                "kind": "http",
                "method": "POST",
                "orig": "/element",
                "segments": [
                  {
                    "lit": "element",
                  },
                ],
                "parts": [
                  "element",
                ],
                "rename": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {},
                "select": {},
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
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
                    "lit": "element",
                  },
                ],
                "parts": [
                  "element",
                ],
                "rename": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {},
                "select": {},
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
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
                    "lit": "element",
                  },
                  {
                    "var": "id",
                  },
                ],
                "parts": [
                  "element",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "element_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
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
                    "lit": "element",
                  },
                  {
                    "var": "id",
                  },
                ],
                "parts": [
                  "element",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "element_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "id",
                  ],
                },
              },
            ],
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
                    "lit": "element",
                  },
                  {
                    "var": "id",
                  },
                ],
                "parts": [
                  "element",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "element_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
          },
        },
        "relations": {
          "ancestors": [],
        },
      },
      "group": {
        "fields": [
          {
            "name": "cas",
            "title": "Cas",
            "type": "`$STRING`",
            "req": True,
            "short": "CAS group designation.",
          },
          {
            "name": "id",
            "title": "Id",
            "type": "`$STRING`",
            "req": True,
            "short": "Group identifier, g1 to g18.",
          },
          {
            "name": "name",
            "title": "Name",
            "type": "`$STRING`",
            "short": "Trivial name, where one exists.",
          },
          {
            "name": "number",
            "title": "Number",
            "type": "`$INTEGER`",
            "req": True,
            "short": "Group number, 1 to 18.",
          },
        ],
        "id": {
          "field": "id",
          "name": "id",
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
                    "lit": "group",
                  },
                ],
                "parts": [
                  "group",
                ],
                "rename": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {},
                "select": {},
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
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
                    "lit": "group",
                  },
                  {
                    "var": "id",
                  },
                ],
                "parts": [
                  "group",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "group_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "id",
                      "orig": "group_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
          },
        },
        "relations": {
          "ancestors": [],
        },
      },
      "isotope": {
        "fields": [
          {
            "name": "abundance",
            "title": "Abundance",
            "type": "`$NUMBER`",
            "short": "Natural abundance as a fraction, absent for synthetic isotopes.",
            "format": "float",
          },
          {
            "name": "element_id",
            "title": "Element Id",
            "type": "`$STRING`",
            "req": True,
            "short": "Parent element identifier.",
          },
          {
            "name": "halflife",
            "title": "Halflife",
            "type": "`$STRING`",
            "short": "Half-life, absent for stable isotopes.",
          },
          {
            "name": "id",
            "title": "Id",
            "type": "`$STRING`",
            "req": True,
            "short": "Isotope identifier, symbol dash mass number.",
          },
          {
            "name": "mass",
            "title": "Mass",
            "type": "`$NUMBER`",
            "req": True,
            "short": "Isotopic mass in daltons.",
            "format": "float",
          },
          {
            "name": "mass_number",
            "title": "Mass Number",
            "type": "`$INTEGER`",
            "req": True,
            "short": "Total protons and neutrons.",
          },
          {
            "name": "mode",
            "title": "Mode",
            "type": "`$STRING`",
            "short": "Primary decay mode, absent for stable isotopes.",
          },
          {
            "name": "name",
            "title": "Name",
            "type": "`$STRING`",
            "req": True,
            "short": "Isotope name.",
          },
          {
            "name": "product",
            "title": "Product",
            "type": "`$STRING`",
            "short": "Primary decay product isotope, absent for stable isotopes.",
          },
          {
            "name": "stable",
            "title": "Stable",
            "type": "`$BOOLEAN`",
            "req": True,
            "short": "True if the isotope is stable.",
          },
        ],
        "id": {
          "field": "id",
          "name": "id",
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
                    "lit": "element",
                  },
                  {
                    "var": "element_id",
                  },
                  {
                    "lit": "isotope",
                  },
                  {
                    "var": "id",
                  },
                  {
                    "lit": "decay",
                  },
                ],
                "parts": [
                  "element",
                  "{element_id}",
                  "isotope",
                  "{id}",
                  "decay",
                ],
                "rename": {
                  "param": {
                    "isotope_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "element_id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                    {
                      "name": "id",
                      "orig": "isotope_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "$action": "decay",
                  "exist": [
                    "element_id",
                    "id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
              {
                "kind": "http",
                "method": "POST",
                "orig": "/element/{element_id}/isotope",
                "segments": [
                  {
                    "lit": "element",
                  },
                  {
                    "var": "element_id",
                  },
                  {
                    "lit": "isotope",
                  },
                ],
                "parts": [
                  "element",
                  "{element_id}",
                  "isotope",
                ],
                "rename": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "element_id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "element_id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
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
                    "lit": "element",
                  },
                  {
                    "var": "element_id",
                  },
                  {
                    "lit": "isotope",
                  },
                ],
                "parts": [
                  "element",
                  "{element_id}",
                  "isotope",
                ],
                "rename": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "element_id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "element_id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
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
                    "lit": "element",
                  },
                  {
                    "var": "element_id",
                  },
                  {
                    "lit": "isotope",
                  },
                  {
                    "var": "id",
                  },
                ],
                "parts": [
                  "element",
                  "{element_id}",
                  "isotope",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "isotope_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "element_id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                    {
                      "name": "id",
                      "orig": "isotope_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "element_id",
                    "id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
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
                    "lit": "element",
                  },
                  {
                    "var": "element_id",
                  },
                  {
                    "lit": "isotope",
                  },
                  {
                    "var": "id",
                  },
                ],
                "parts": [
                  "element",
                  "{element_id}",
                  "isotope",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "isotope_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "element_id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                    {
                      "name": "id",
                      "orig": "isotope_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "element_id",
                    "id",
                  ],
                },
              },
            ],
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
                    "lit": "element",
                  },
                  {
                    "var": "element_id",
                  },
                  {
                    "lit": "isotope",
                  },
                  {
                    "var": "id",
                  },
                ],
                "parts": [
                  "element",
                  "{element_id}",
                  "isotope",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "isotope_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "element_id",
                      "orig": "element_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                    {
                      "name": "id",
                      "orig": "isotope_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "element_id",
                    "id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
          },
        },
        "relations": {
          "ancestors": [
            [
              "$.main.kit.entity.element",
            ],
          ],
        },
      },
      "series": {
        "fields": [
          {
            "name": "color",
            "title": "Color",
            "type": "`$STRING`",
            "req": True,
            "short": "Display color used by the element card renderer.",
          },
          {
            "name": "description",
            "title": "Description",
            "type": "`$STRING`",
            "req": True,
            "short": "One-line description of the series.",
          },
          {
            "name": "id",
            "title": "Id",
            "type": "`$STRING`",
            "req": True,
            "short": "Series identifier.",
          },
          {
            "name": "name",
            "title": "Name",
            "type": "`$STRING`",
            "req": True,
            "short": "Series name.",
          },
        ],
        "id": {
          "field": "id",
          "name": "id",
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
                    "lit": "series",
                  },
                ],
                "parts": [
                  "series",
                ],
                "rename": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {},
                "select": {},
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
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
                    "lit": "series",
                  },
                  {
                    "var": "id",
                  },
                ],
                "parts": [
                  "series",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "series_id": "id",
                  },
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
                "args": {
                  "params": [
                    {
                      "name": "id",
                      "orig": "series_id",
                      "type": "`$STRING`",
                      "kind": "param",
                      "reqd": True,
                    },
                  ],
                },
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "response": {
                  "kind": "json",
                  "media": "application/json",
                },
              },
            ],
          },
        },
        "relations": {
          "ancestors": [],
        },
      },
    },
    }
