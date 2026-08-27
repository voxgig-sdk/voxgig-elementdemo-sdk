
import { BaseFeature } from './feature/base/BaseFeature'
import { ElementcardFeature } from './feature/elementcard/ElementcardFeature'
import { RetryFeature } from './feature/retry/RetryFeature'
import { TestFeature } from './feature/test/TestFeature'
import { TimeoutFeature } from './feature/timeout/TimeoutFeature'



const FEATURE_CLASS: Record<string, typeof BaseFeature> = {
   elementcard: ElementcardFeature,
 retry: RetryFeature,
 test: TestFeature,
 timeout: TimeoutFeature,

}


class Config {

  makeFeature(this: any, fn: string) {
    const fc = FEATURE_CLASS[fn]
    const fi = new fc()
    // TODO: errors etc
    return fi
  }

  // False for a feature added at runtime via options.extend (station's
  // adopt path) - the constructor uses this to skip makeFeature for names
  // no generated class backs.
  hasFeature(this: any, fn: string) {
    return null != FEATURE_CLASS[fn]
  }


  main = {
    name: 'Elementdemo',
        slug: "elementdemo",
    version: "0.1.0",
    target: "ts",

  }


  feature = {
     elementcard:     {
      "options": {
        "active": false,
        "print": false
      },
      "transport": "none"
    },
 retry:     {
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
      "transport": "wrap"
    },
 test:     {
      "options": {
        "active": false
      },
      "transport": "base"
    },
 timeout:     {
      "options": {
        "active": false,
        "ms": 30000
      },
      "transport": "wrap"
    },

  }


  options = {
    base: "http://localhost:8902",

    headers: {
      "content-type": "application/json"
    },

    entity: {
      
      element: {
      },

      group: {
      },

      isotope: {
      },

      series: {
      },

    }
  }


  entity = {
    "element": {
      "fields": [
        {
          "name": "block",
          "req": true,
          "short": "Orbital block, one of s, p, d, f.",
          "type": "`$STRING`"
        },
        {
          "name": "charge",
          "type": "`$INTEGER`"
        },
        {
          "name": "discovered",
          "short": "Year of discovery, absent for elements known since antiquity.",
          "type": "`$INTEGER`"
        },
        {
          "name": "group",
          "short": "Periodic table column, 1 to 18, absent for the f-block.",
          "type": "`$INTEGER`"
        },
        {
          "name": "id",
          "req": true,
          "short": "Element identifier, the lowercase symbol.",
          "type": "`$STRING`"
        },
        {
          "name": "ion",
          "type": "`$STRING`"
        },
        {
          "name": "mass",
          "req": true,
          "short": "Standard atomic weight in daltons.",
          "type": "`$NUMBER`"
        },
        {
          "name": "name",
          "req": true,
          "short": "Element name.",
          "type": "`$STRING`"
        },
        {
          "name": "number",
          "req": true,
          "short": "Atomic number.",
          "type": "`$INTEGER`"
        },
        {
          "name": "ok",
          "type": "`$BOOLEAN`"
        },
        {
          "name": "period",
          "req": true,
          "short": "Periodic table row, 1 to 7.",
          "type": "`$INTEGER`"
        },
        {
          "name": "phase",
          "short": "Phase at standard temperature and pressure.",
          "type": "`$STRING`"
        },
        {
          "name": "series_id",
          "req": true,
          "short": "Chemical series this element belongs to.",
          "type": "`$STRING`"
        },
        {
          "name": "symbol",
          "req": true,
          "short": "Chemical symbol.",
          "type": "`$STRING`"
        }
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
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "POST",
              "orig": "/api/element/{element_id}/ionize",
              "parts": [
                "api",
                "element",
                "{id}",
                "ionize"
              ],
              "rename": {
                "param": {
                  "element_id": "id"
                }
              },
              "select": {
                "$action": "ionize",
                "exist": [
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            },
            {
              "args": {},
              "kind": "http",
              "method": "POST",
              "orig": "/api/element",
              "parts": [
                "api",
                "element"
              ],
              "select": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
        },
        "list": {
          "input": "data",
          "name": "list",
          "points": [
            {
              "args": {},
              "kind": "http",
              "method": "GET",
              "orig": "/api/element",
              "parts": [
                "api",
                "element"
              ],
              "select": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "GET",
              "orig": "/api/element/{element_id}",
              "parts": [
                "api",
                "element",
                "{id}"
              ],
              "rename": {
                "param": {
                  "element_id": "id"
                }
              },
              "select": {
                "exist": [
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "DELETE",
              "orig": "/api/element/{element_id}",
              "parts": [
                "api",
                "element",
                "{id}"
              ],
              "rename": {
                "param": {
                  "element_id": "id"
                }
              },
              "select": {
                "exist": [
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "PUT",
              "orig": "/api/element/{element_id}",
              "parts": [
                "api",
                "element",
                "{id}"
              ],
              "rename": {
                "param": {
                  "element_id": "id"
                }
              },
              "select": {
                "exist": [
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
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
          "req": true,
          "short": "CAS group designation.",
          "type": "`$STRING`"
        },
        {
          "name": "id",
          "req": true,
          "short": "Group identifier, g1 to g18.",
          "type": "`$STRING`"
        },
        {
          "name": "name",
          "short": "Trivial name, where one exists.",
          "type": "`$STRING`"
        },
        {
          "name": "number",
          "req": true,
          "short": "Group number, 1 to 18.",
          "type": "`$INTEGER`"
        }
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
              "orig": "/api/group",
              "parts": [
                "api",
                "group"
              ],
              "select": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "GET",
              "orig": "/api/group/{group_id}",
              "parts": [
                "api",
                "group",
                "{id}"
              ],
              "rename": {
                "param": {
                  "group_id": "id"
                }
              },
              "select": {
                "exist": [
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
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
          "short": "Natural abundance as a fraction, absent for synthetic isotopes.",
          "type": "`$NUMBER`"
        },
        {
          "name": "element_id",
          "req": true,
          "short": "Parent element identifier.",
          "type": "`$STRING`"
        },
        {
          "name": "halflife",
          "short": "Half-life, absent for stable isotopes.",
          "type": "`$STRING`"
        },
        {
          "name": "id",
          "req": true,
          "short": "Isotope identifier, symbol dash mass number.",
          "type": "`$STRING`"
        },
        {
          "name": "mass",
          "req": true,
          "short": "Isotopic mass in daltons.",
          "type": "`$NUMBER`"
        },
        {
          "name": "mass_number",
          "req": true,
          "short": "Total protons and neutrons.",
          "type": "`$INTEGER`"
        },
        {
          "name": "mode",
          "short": "Primary decay mode, absent for stable isotopes.",
          "type": "`$STRING`"
        },
        {
          "name": "name",
          "req": true,
          "short": "Isotope name.",
          "type": "`$STRING`"
        },
        {
          "name": "ok",
          "type": "`$BOOLEAN`"
        },
        {
          "name": "product",
          "short": "Primary decay product isotope, absent for stable isotopes.",
          "type": "`$STRING`"
        },
        {
          "name": "stable",
          "req": true,
          "short": "True if the isotope is stable.",
          "type": "`$BOOLEAN`"
        },
        {
          "name": "steps",
          "type": "`$INTEGER`"
        }
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
                    "reqd": true,
                    "type": "`$STRING`"
                  },
                  {
                    "kind": "param",
                    "name": "id",
                    "orig": "isotope_id",
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "POST",
              "orig": "/api/element/{element_id}/isotope/{isotope_id}/decay",
              "parts": [
                "api",
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
              "select": {
                "$action": "decay",
                "exist": [
                  "element_id",
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            },
            {
              "args": {
                "params": [
                  {
                    "kind": "param",
                    "name": "element_id",
                    "orig": "element_id",
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "POST",
              "orig": "/api/element/{element_id}/isotope",
              "parts": [
                "api",
                "element",
                "{element_id}",
                "isotope"
              ],
              "select": {
                "exist": [
                  "element_id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "GET",
              "orig": "/api/element/{element_id}/isotope",
              "parts": [
                "api",
                "element",
                "{element_id}",
                "isotope"
              ],
              "select": {
                "exist": [
                  "element_id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  },
                  {
                    "kind": "param",
                    "name": "id",
                    "orig": "isotope_id",
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "GET",
              "orig": "/api/element/{element_id}/isotope/{isotope_id}",
              "parts": [
                "api",
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
              "select": {
                "exist": [
                  "element_id",
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  },
                  {
                    "kind": "param",
                    "name": "id",
                    "orig": "isotope_id",
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "DELETE",
              "orig": "/api/element/{element_id}/isotope/{isotope_id}",
              "parts": [
                "api",
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
              "select": {
                "exist": [
                  "element_id",
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  },
                  {
                    "kind": "param",
                    "name": "id",
                    "orig": "isotope_id",
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "PUT",
              "orig": "/api/element/{element_id}/isotope/{isotope_id}",
              "parts": [
                "api",
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
              "select": {
                "exist": [
                  "element_id",
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": [
          [
            "element"
          ]
        ]
      }
    },
    "series": {
      "fields": [
        {
          "name": "color",
          "req": true,
          "short": "Display color used by the element card renderer.",
          "type": "`$STRING`"
        },
        {
          "name": "description",
          "req": true,
          "short": "One-line description of the series.",
          "type": "`$STRING`"
        },
        {
          "name": "id",
          "req": true,
          "short": "Series identifier.",
          "type": "`$STRING`"
        },
        {
          "name": "name",
          "req": true,
          "short": "Series name.",
          "type": "`$STRING`"
        }
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
              "orig": "/api/series",
              "parts": [
                "api",
                "series"
              ],
              "select": {},
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
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
                    "reqd": true,
                    "type": "`$STRING`"
                  }
                ]
              },
              "kind": "http",
              "method": "GET",
              "orig": "/api/series/{series_id}",
              "parts": [
                "api",
                "series",
                "{id}"
              ],
              "rename": {
                "param": {
                  "series_id": "id"
                }
              },
              "select": {
                "exist": [
                  "id"
                ]
              },
              "transform": {
                "req": "`reqdata`",
                "res": "`body`"
              }
            }
          ]
        }
      },
      "relations": {
        "ancestors": []
      }
    }
  }
}


const config = new Config()

export {
  config
}

