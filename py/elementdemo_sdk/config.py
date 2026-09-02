# Elementdemo SDK configuration


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
            "elementcard": {
        "options": {
          "active": False,
          "print": False,
        },
        "transport": "none",
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
        "transport": "wrap",
      },
            "test": {
        "options": {
          "active": False,
        },
        "transport": "base",
      },
            "timeout": {
        "options": {
          "active": False,
          "ms": 30000,
        },
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
            "req": True,
            "short": "Orbital block, one of s, p, d, f.",
            "type": "`$STRING`",
          },
          {
            "name": "charge",
            "type": "`$INTEGER`",
          },
          {
            "name": "discovered",
            "short": "Year of discovery, absent for elements known since antiquity.",
            "type": "`$INTEGER`",
          },
          {
            "name": "group",
            "short": "Periodic table column, 1 to 18, absent for the f-block.",
            "type": "`$INTEGER`",
          },
          {
            "name": "id",
            "req": True,
            "short": "Element identifier, the lowercase symbol.",
            "type": "`$STRING`",
          },
          {
            "name": "ion",
            "type": "`$STRING`",
          },
          {
            "name": "mass",
            "req": True,
            "short": "Standard atomic weight in daltons.",
            "type": "`$NUMBER`",
          },
          {
            "name": "name",
            "req": True,
            "short": "Element name.",
            "type": "`$STRING`",
          },
          {
            "name": "number",
            "req": True,
            "short": "Atomic number.",
            "type": "`$INTEGER`",
          },
          {
            "name": "ok",
            "type": "`$BOOLEAN`",
          },
          {
            "name": "period",
            "req": True,
            "short": "Periodic table row, 1 to 7.",
            "type": "`$INTEGER`",
          },
          {
            "name": "phase",
            "short": "Phase at standard temperature and pressure.",
            "type": "`$STRING`",
          },
          {
            "name": "series_id",
            "req": True,
            "short": "Chemical series this element belongs to.",
            "type": "`$STRING`",
          },
          {
            "name": "symbol",
            "req": True,
            "short": "Chemical symbol.",
            "type": "`$STRING`",
          },
        ],
        "name": "element",
        "op": {
          "create": {
            "input": "data",
            "name": "create",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "POST",
                "orig": "/element/{element_id}/ionize",
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
                "select": {
                  "$action": "ionize",
                  "exist": [
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
              {
                "args": {},
                "kind": "http",
                "method": "POST",
                "orig": "/element",
                "parts": [
                  "element",
                ],
                "segments": [
                  {
                    "lit": "element",
                  },
                ],
                "select": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "list": {
            "input": "data",
            "name": "list",
            "points": [
              {
                "args": {},
                "kind": "http",
                "method": "GET",
                "orig": "/element",
                "parts": [
                  "element",
                ],
                "segments": [
                  {
                    "lit": "element",
                  },
                ],
                "select": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "load": {
            "input": "data",
            "name": "load",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "GET",
                "orig": "/element/{element_id}",
                "parts": [
                  "element",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "element_id": "id",
                  },
                },
                "segments": [
                  {
                    "lit": "element",
                  },
                  {
                    "var": "id",
                  },
                ],
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "remove": {
            "input": "data",
            "name": "remove",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "DELETE",
                "orig": "/element/{element_id}",
                "parts": [
                  "element",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "element_id": "id",
                  },
                },
                "segments": [
                  {
                    "lit": "element",
                  },
                  {
                    "var": "id",
                  },
                ],
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "update": {
            "input": "data",
            "name": "update",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "PUT",
                "orig": "/element/{element_id}",
                "parts": [
                  "element",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "element_id": "id",
                  },
                },
                "segments": [
                  {
                    "lit": "element",
                  },
                  {
                    "var": "id",
                  },
                ],
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
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
            "req": True,
            "short": "CAS group designation.",
            "type": "`$STRING`",
          },
          {
            "name": "id",
            "req": True,
            "short": "Group identifier, g1 to g18.",
            "type": "`$STRING`",
          },
          {
            "name": "name",
            "short": "Trivial name, where one exists.",
            "type": "`$STRING`",
          },
          {
            "name": "number",
            "req": True,
            "short": "Group number, 1 to 18.",
            "type": "`$INTEGER`",
          },
        ],
        "name": "group",
        "op": {
          "list": {
            "input": "data",
            "name": "list",
            "points": [
              {
                "args": {},
                "kind": "http",
                "method": "GET",
                "orig": "/group",
                "parts": [
                  "group",
                ],
                "segments": [
                  {
                    "lit": "group",
                  },
                ],
                "select": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "load": {
            "input": "data",
            "name": "load",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "group_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "GET",
                "orig": "/group/{group_id}",
                "parts": [
                  "group",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "group_id": "id",
                  },
                },
                "segments": [
                  {
                    "lit": "group",
                  },
                  {
                    "var": "id",
                  },
                ],
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
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
            "short": "Natural abundance as a fraction, absent for synthetic isotopes.",
            "type": "`$NUMBER`",
          },
          {
            "name": "element_id",
            "req": True,
            "short": "Parent element identifier.",
            "type": "`$STRING`",
          },
          {
            "name": "halflife",
            "short": "Half-life, absent for stable isotopes.",
            "type": "`$STRING`",
          },
          {
            "name": "id",
            "req": True,
            "short": "Isotope identifier, symbol dash mass number.",
            "type": "`$STRING`",
          },
          {
            "name": "mass",
            "req": True,
            "short": "Isotopic mass in daltons.",
            "type": "`$NUMBER`",
          },
          {
            "name": "mass_number",
            "req": True,
            "short": "Total protons and neutrons.",
            "type": "`$INTEGER`",
          },
          {
            "name": "mode",
            "short": "Primary decay mode, absent for stable isotopes.",
            "type": "`$STRING`",
          },
          {
            "name": "name",
            "req": True,
            "short": "Isotope name.",
            "type": "`$STRING`",
          },
          {
            "name": "ok",
            "type": "`$BOOLEAN`",
          },
          {
            "name": "product",
            "short": "Primary decay product isotope, absent for stable isotopes.",
            "type": "`$STRING`",
          },
          {
            "name": "stable",
            "req": True,
            "short": "True if the isotope is stable.",
            "type": "`$BOOLEAN`",
          },
          {
            "name": "steps",
            "type": "`$INTEGER`",
          },
        ],
        "name": "isotope",
        "op": {
          "create": {
            "input": "data",
            "name": "create",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "element_id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "isotope_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "POST",
                "orig": "/element/{element_id}/isotope/{isotope_id}/decay",
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
                "select": {
                  "$action": "decay",
                  "exist": [
                    "element_id",
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "element_id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "POST",
                "orig": "/element/{element_id}/isotope",
                "parts": [
                  "element",
                  "{element_id}",
                  "isotope",
                ],
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
                "select": {
                  "exist": [
                    "element_id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "list": {
            "input": "data",
            "name": "list",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "element_id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "GET",
                "orig": "/element/{element_id}/isotope",
                "parts": [
                  "element",
                  "{element_id}",
                  "isotope",
                ],
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
                "select": {
                  "exist": [
                    "element_id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "load": {
            "input": "data",
            "name": "load",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "element_id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "isotope_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "GET",
                "orig": "/element/{element_id}/isotope/{isotope_id}",
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
                "select": {
                  "exist": [
                    "element_id",
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "remove": {
            "input": "data",
            "name": "remove",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "element_id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "isotope_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "DELETE",
                "orig": "/element/{element_id}/isotope/{isotope_id}",
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
                "select": {
                  "exist": [
                    "element_id",
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "update": {
            "input": "data",
            "name": "update",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "element_id",
                      "orig": "element_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "isotope_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "PUT",
                "orig": "/element/{element_id}/isotope/{isotope_id}",
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
                "select": {
                  "exist": [
                    "element_id",
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
        },
        "relations": {
          "ancestors": [
            [
              "element",
            ],
          ],
        },
      },
      "series": {
        "fields": [
          {
            "name": "color",
            "req": True,
            "short": "Display color used by the element card renderer.",
            "type": "`$STRING`",
          },
          {
            "name": "description",
            "req": True,
            "short": "One-line description of the series.",
            "type": "`$STRING`",
          },
          {
            "name": "id",
            "req": True,
            "short": "Series identifier.",
            "type": "`$STRING`",
          },
          {
            "name": "name",
            "req": True,
            "short": "Series name.",
            "type": "`$STRING`",
          },
        ],
        "name": "series",
        "op": {
          "list": {
            "input": "data",
            "name": "list",
            "points": [
              {
                "args": {},
                "kind": "http",
                "method": "GET",
                "orig": "/series",
                "parts": [
                  "series",
                ],
                "segments": [
                  {
                    "lit": "series",
                  },
                ],
                "select": {},
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
                },
              },
            ],
          },
          "load": {
            "input": "data",
            "name": "load",
            "points": [
              {
                "args": {
                  "params": [
                    {
                      "kind": "param",
                      "name": "id",
                      "orig": "series_id",
                      "reqd": True,
                      "type": "`$STRING`",
                    },
                  ],
                },
                "kind": "http",
                "method": "GET",
                "orig": "/series/{series_id}",
                "parts": [
                  "series",
                  "{id}",
                ],
                "rename": {
                  "param": {
                    "series_id": "id",
                  },
                },
                "segments": [
                  {
                    "lit": "series",
                  },
                  {
                    "var": "id",
                  },
                ],
                "select": {
                  "exist": [
                    "id",
                  ],
                },
                "transform": {
                  "req": "`reqdata`",
                  "res": "`body`",
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
