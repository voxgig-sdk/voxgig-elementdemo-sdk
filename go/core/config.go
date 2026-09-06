package core

import (
	"sync"
)

// MakeConfig builds a fresh, fully materialised config map. Every call
// rebuilds the whole structure, so prefer SharedConfig unless you need a
// private copy you intend to mutate.
func MakeConfig() map[string]any {
	return map[string]any{
		"main": map[string]any{
			"name": "Elementdemo",
			"slug": "elementdemo",
			"version": "0.1.0",
			"target": "go",
		},
		"feature": map[string]any{
			"elementcard": map[string]any{
				"options": map[string]any{
					"active": false,
					"print": false,
				},
				"transport": "none",
			},
			"retry": map[string]any{
				"options": map[string]any{
					"active": false,
					"factor": 2,
					"maxDelay": 2000,
					"minDelay": 50,
					"retries": 2,
					"statuses": []any{
						408,
						425,
						429,
						500,
						502,
						503,
						504,
					},
				},
				"transport": "wrap",
			},
			"secrets": map[string]any{
				"options": map[string]any{
					"active": false,
					"cache": true,
					"exchange": map[string]any{
						"active": false,
						"method": "POST",
						"path": "auth/token",
						"refresh": "",
						"request": "refresh_token",
						"response": "access_token",
						"retries": 1,
						"statuses": []any{
							401,
						},
					},
					"name": "apikey",
					"providers": []any{},
				},
				"transport": "wrap",
			},
			"test": map[string]any{
				"options": map[string]any{
					"active": false,
				},
				"transport": "base",
			},
			"timeout": map[string]any{
				"options": map[string]any{
					"active": false,
					"ms": 30000,
				},
				"transport": "wrap",
			},
		},
		"options": map[string]any{
			"base": "http://localhost:8902/api/{account_id}",
			"server": map[string]any{
				"account_id": "",
			},
			"auth": map[string]any{
				"prefix": "Bearer",
			},
			"headers": map[string]any{
				"content-type": "application/json",
			},
			"entity": map[string]any{
				"element": map[string]any{},
				"group": map[string]any{},
				"isotope": map[string]any{},
				"series": map[string]any{},
			},
		},
		"entity": map[string]any{
			"element": map[string]any{
				"fields": []any{
					map[string]any{
						"name": "block",
						"req": true,
						"short": "Orbital block, one of s, p, d, f.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "charge",
						"type": "`$INTEGER`",
					},
					map[string]any{
						"name": "discovered",
						"short": "Year of discovery, absent for elements known since antiquity.",
						"type": "`$INTEGER`",
					},
					map[string]any{
						"name": "group",
						"short": "Periodic table column, 1 to 18, absent for the f-block.",
						"type": "`$INTEGER`",
					},
					map[string]any{
						"name": "id",
						"req": true,
						"short": "Element identifier, the lowercase symbol.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "ion",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "mass",
						"req": true,
						"short": "Standard atomic weight in daltons.",
						"type": "`$NUMBER`",
					},
					map[string]any{
						"name": "name",
						"req": true,
						"short": "Element name.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "number",
						"req": true,
						"short": "Atomic number.",
						"type": "`$INTEGER`",
					},
					map[string]any{
						"name": "ok",
						"type": "`$BOOLEAN`",
					},
					map[string]any{
						"name": "period",
						"req": true,
						"short": "Periodic table row, 1 to 7.",
						"type": "`$INTEGER`",
					},
					map[string]any{
						"name": "phase",
						"short": "Phase at standard temperature and pressure.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "series_id",
						"req": true,
						"short": "Chemical series this element belongs to.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "symbol",
						"req": true,
						"short": "Chemical symbol.",
						"type": "`$STRING`",
					},
				},
				"name": "element",
				"op": map[string]any{
					"create": map[string]any{
						"input": "data",
						"name": "create",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "POST",
								"orig": "/element/{element_id}/ionize",
								"parts": []any{
									"element",
									"{id}",
									"ionize",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"element_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "id",
									},
									map[string]any{
										"lit": "ionize",
									},
								},
								"select": map[string]any{
									"$action": "ionize",
									"exist": []any{
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
							map[string]any{
								"args": map[string]any{},
								"kind": "http",
								"method": "POST",
								"orig": "/element",
								"parts": []any{
									"element",
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
								},
								"select": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"list": map[string]any{
						"input": "data",
						"name": "list",
						"points": []any{
							map[string]any{
								"args": map[string]any{},
								"kind": "http",
								"method": "GET",
								"orig": "/element",
								"parts": []any{
									"element",
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
								},
								"select": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"load": map[string]any{
						"input": "data",
						"name": "load",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "GET",
								"orig": "/element/{element_id}",
								"parts": []any{
									"element",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"element_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "id",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"remove": map[string]any{
						"input": "data",
						"name": "remove",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "DELETE",
								"orig": "/element/{element_id}",
								"parts": []any{
									"element",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"element_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "id",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"update": map[string]any{
						"input": "data",
						"name": "update",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "PUT",
								"orig": "/element/{element_id}",
								"parts": []any{
									"element",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"element_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "id",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
				},
				"relations": map[string]any{
					"ancestors": []any{},
				},
			},
			"group": map[string]any{
				"fields": []any{
					map[string]any{
						"name": "cas",
						"req": true,
						"short": "CAS group designation.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "id",
						"req": true,
						"short": "Group identifier, g1 to g18.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "name",
						"short": "Trivial name, where one exists.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "number",
						"req": true,
						"short": "Group number, 1 to 18.",
						"type": "`$INTEGER`",
					},
				},
				"name": "group",
				"op": map[string]any{
					"list": map[string]any{
						"input": "data",
						"name": "list",
						"points": []any{
							map[string]any{
								"args": map[string]any{},
								"kind": "http",
								"method": "GET",
								"orig": "/group",
								"parts": []any{
									"group",
								},
								"segments": []any{
									map[string]any{
										"lit": "group",
									},
								},
								"select": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"load": map[string]any{
						"input": "data",
						"name": "load",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "group_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "GET",
								"orig": "/group/{group_id}",
								"parts": []any{
									"group",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"group_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "group",
									},
									map[string]any{
										"var": "id",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
				},
				"relations": map[string]any{
					"ancestors": []any{},
				},
			},
			"isotope": map[string]any{
				"fields": []any{
					map[string]any{
						"name": "abundance",
						"short": "Natural abundance as a fraction, absent for synthetic isotopes.",
						"type": "`$NUMBER`",
					},
					map[string]any{
						"name": "element_id",
						"req": true,
						"short": "Parent element identifier.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "halflife",
						"short": "Half-life, absent for stable isotopes.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "id",
						"req": true,
						"short": "Isotope identifier, symbol dash mass number.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "mass",
						"req": true,
						"short": "Isotopic mass in daltons.",
						"type": "`$NUMBER`",
					},
					map[string]any{
						"name": "mass_number",
						"req": true,
						"short": "Total protons and neutrons.",
						"type": "`$INTEGER`",
					},
					map[string]any{
						"name": "mode",
						"short": "Primary decay mode, absent for stable isotopes.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "name",
						"req": true,
						"short": "Isotope name.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "ok",
						"type": "`$BOOLEAN`",
					},
					map[string]any{
						"name": "product",
						"short": "Primary decay product isotope, absent for stable isotopes.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "stable",
						"req": true,
						"short": "True if the isotope is stable.",
						"type": "`$BOOLEAN`",
					},
					map[string]any{
						"name": "steps",
						"type": "`$INTEGER`",
					},
				},
				"name": "isotope",
				"op": map[string]any{
					"create": map[string]any{
						"input": "data",
						"name": "create",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "element_id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "isotope_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "POST",
								"orig": "/element/{element_id}/isotope/{isotope_id}/decay",
								"parts": []any{
									"element",
									"{element_id}",
									"isotope",
									"{id}",
									"decay",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"isotope_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "element_id",
									},
									map[string]any{
										"lit": "isotope",
									},
									map[string]any{
										"var": "id",
									},
									map[string]any{
										"lit": "decay",
									},
								},
								"select": map[string]any{
									"$action": "decay",
									"exist": []any{
										"element_id",
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "element_id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "POST",
								"orig": "/element/{element_id}/isotope",
								"parts": []any{
									"element",
									"{element_id}",
									"isotope",
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "element_id",
									},
									map[string]any{
										"lit": "isotope",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"list": map[string]any{
						"input": "data",
						"name": "list",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "element_id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "GET",
								"orig": "/element/{element_id}/isotope",
								"parts": []any{
									"element",
									"{element_id}",
									"isotope",
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "element_id",
									},
									map[string]any{
										"lit": "isotope",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"load": map[string]any{
						"input": "data",
						"name": "load",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "element_id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "isotope_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "GET",
								"orig": "/element/{element_id}/isotope/{isotope_id}",
								"parts": []any{
									"element",
									"{element_id}",
									"isotope",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"isotope_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "element_id",
									},
									map[string]any{
										"lit": "isotope",
									},
									map[string]any{
										"var": "id",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"remove": map[string]any{
						"input": "data",
						"name": "remove",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "element_id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "isotope_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "DELETE",
								"orig": "/element/{element_id}/isotope/{isotope_id}",
								"parts": []any{
									"element",
									"{element_id}",
									"isotope",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"isotope_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "element_id",
									},
									map[string]any{
										"lit": "isotope",
									},
									map[string]any{
										"var": "id",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"update": map[string]any{
						"input": "data",
						"name": "update",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "element_id",
											"orig": "element_id",
											"reqd": true,
											"type": "`$STRING`",
										},
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "isotope_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "PUT",
								"orig": "/element/{element_id}/isotope/{isotope_id}",
								"parts": []any{
									"element",
									"{element_id}",
									"isotope",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"isotope_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "element_id",
									},
									map[string]any{
										"lit": "isotope",
									},
									map[string]any{
										"var": "id",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
				},
				"relations": map[string]any{
					"ancestors": []any{
						[]any{
							"element",
						},
					},
				},
			},
			"series": map[string]any{
				"fields": []any{
					map[string]any{
						"name": "color",
						"req": true,
						"short": "Display color used by the element card renderer.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "description",
						"req": true,
						"short": "One-line description of the series.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "id",
						"req": true,
						"short": "Series identifier.",
						"type": "`$STRING`",
					},
					map[string]any{
						"name": "name",
						"req": true,
						"short": "Series name.",
						"type": "`$STRING`",
					},
				},
				"name": "series",
				"op": map[string]any{
					"list": map[string]any{
						"input": "data",
						"name": "list",
						"points": []any{
							map[string]any{
								"args": map[string]any{},
								"kind": "http",
								"method": "GET",
								"orig": "/series",
								"parts": []any{
									"series",
								},
								"segments": []any{
									map[string]any{
										"lit": "series",
									},
								},
								"select": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
					"load": map[string]any{
						"input": "data",
						"name": "load",
						"points": []any{
							map[string]any{
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"kind": "param",
											"name": "id",
											"orig": "series_id",
											"reqd": true,
											"type": "`$STRING`",
										},
									},
								},
								"kind": "http",
								"method": "GET",
								"orig": "/series/{series_id}",
								"parts": []any{
									"series",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"series_id": "id",
									},
								},
								"segments": []any{
									map[string]any{
										"lit": "series",
									},
									map[string]any{
										"var": "id",
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
							},
						},
					},
				},
				"relations": map[string]any{
					"ancestors": []any{},
				},
			},
		},
	}
}

// The plugin definitions the model selected per feature, as []any so a
// feature package can consume them without core naming its types. Empty
// when no active feature declares active plugin groups for this target.
var featurePlugins = map[string][]any{
}

// FeaturePlugins is the definitions list for one feature's chain.
func FeaturePlugins(name string) []any {
	return featurePlugins[name]
}

var (
	sharedConfigOnce sync.Once
	sharedConfigVal  map[string]any
)

// SharedConfig returns the process-wide config, built once on first use.
// The SDK reads the config on every request and never writes to it, so one
// instance is shared by every client rather than rebuilt per client.
//
// The returned map is shared: treat it as read-only. Callers that need to
// mutate should use MakeConfig, which always returns a fresh copy.
func SharedConfig() map[string]any {
	sharedConfigOnce.Do(func() {
		sharedConfigVal = MakeConfig()
	})
	return sharedConfigVal
}

func makeFeature(name string) Feature {
	switch name {
	case "elementcard":
		if NewElementcardFeatureFunc != nil {
			return NewElementcardFeatureFunc()
		}
	case "retry":
		if NewRetryFeatureFunc != nil {
			return NewRetryFeatureFunc()
		}
	case "secrets":
		if NewSecretsFeatureFunc != nil {
			return NewSecretsFeatureFunc()
		}
	case "test":
		if NewTestFeatureFunc != nil {
			return NewTestFeatureFunc()
		}
	case "timeout":
		if NewTimeoutFeatureFunc != nil {
			return NewTimeoutFeatureFunc()
		}
	default:
		if NewBaseFeatureFunc != nil {
			return NewBaseFeatureFunc()
		}
	}
	return nil
}
