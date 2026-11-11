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
			"debug": map[string]any{
				"options": map[string]any{
					"active": false,
					"max": 100,
					"redact": []any{
						"authorization",
						"cookie",
						"set-cookie",
						"api-key",
						"apikey",
						"x-api-key",
						"idempotency-key",
					},
				},
				"optspec": map[string]any{
					"now": "`$FUNCTION`",
					"onEntry": "`$FUNCTION`",
				},
				"strict": false,
				"transport": "none",
			},
			"elementcard": map[string]any{
				"options": map[string]any{
					"active": false,
					"print": false,
				},
				"optspec": map[string]any{},
				"strict": false,
				"transport": "none",
			},
			"idempotency": map[string]any{
				"options": map[string]any{
					"active": false,
					"header": "Idempotency-Key",
					"methods": []any{
						"POST",
						"PUT",
						"PATCH",
						"DELETE",
					},
					"ops": []any{
						"create",
						"update",
						"remove",
					},
				},
				"optspec": map[string]any{
					"keygen": "`$FUNCTION`",
				},
				"strict": false,
				"transport": "none",
			},
			"metrics": map[string]any{
				"options": map[string]any{
					"active": false,
				},
				"optspec": map[string]any{
					"now": "`$FUNCTION`",
				},
				"strict": false,
				"transport": "none",
			},
			"paging": map[string]any{
				"options": map[string]any{
					"active": false,
					"afterVar": "after",
					"cursorParam": "cursor",
					"firstVar": "first",
					"limitParam": "limit",
					"pageParam": "page",
					"startPage": 1,
				},
				"optspec": map[string]any{
					"limit": "`$NUMBER`",
					"ops": "`$LIST`",
				},
				"strict": false,
				"transport": "none",
			},
			"ratelimit": map[string]any{
				"options": map[string]any{
					"active": false,
					"burst": 5,
					"rate": 5,
				},
				"optspec": map[string]any{
					"now": "`$FUNCTION`",
					"sleep": "`$FUNCTION`",
				},
				"strict": false,
				"transport": "wrap",
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
				"optspec": map[string]any{
					"jitter": "`$BOOLEAN`",
					"sleep": "`$FUNCTION`",
				},
				"strict": false,
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
				"optspec": map[string]any{},
				"strict": false,
				"transport": "wrap",
			},
			"test": map[string]any{
				"options": map[string]any{
					"active": false,
				},
				"optspec": map[string]any{
					"entity": "`$MAP`",
					"net": "`$MAP`",
				},
				"strict": false,
				"transport": "base",
			},
			"timeout": map[string]any{
				"options": map[string]any{
					"active": false,
					"ms": 30000,
				},
				"optspec": map[string]any{
					"clearTimer": "`$FUNCTION`",
					"now": "`$FUNCTION`",
					"setTimer": "`$FUNCTION`",
				},
				"strict": false,
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
						"title": "Block",
						"type": "`$STRING`",
						"req": true,
						"short": "Orbital block, one of s, p, d, f.",
					},
					map[string]any{
						"name": "discovered",
						"title": "Discovered",
						"type": "`$INTEGER`",
						"short": "Year of discovery, absent for elements known since antiquity.",
					},
					map[string]any{
						"name": "group",
						"title": "Group",
						"type": "`$INTEGER`",
						"short": "Periodic table column, 1 to 18, absent for the f-block.",
					},
					map[string]any{
						"name": "id",
						"title": "Id",
						"type": "`$STRING`",
						"req": true,
						"short": "Element identifier, the lowercase symbol.",
					},
					map[string]any{
						"name": "mass",
						"title": "Mass",
						"type": "`$NUMBER`",
						"req": true,
						"short": "Standard atomic weight in daltons.",
						"format": "float",
					},
					map[string]any{
						"name": "name",
						"title": "Name",
						"type": "`$STRING`",
						"req": true,
						"short": "Element name.",
					},
					map[string]any{
						"name": "number",
						"title": "Number",
						"type": "`$INTEGER`",
						"req": true,
						"short": "Atomic number.",
					},
					map[string]any{
						"name": "period",
						"title": "Period",
						"type": "`$INTEGER`",
						"req": true,
						"short": "Periodic table row, 1 to 7.",
					},
					map[string]any{
						"name": "phase",
						"title": "Phase",
						"type": "`$STRING`",
						"short": "Phase at standard temperature and pressure.",
					},
					map[string]any{
						"name": "series_id",
						"title": "Series Id",
						"type": "`$STRING`",
						"req": true,
						"short": "Chemical series this element belongs to.",
					},
					map[string]any{
						"name": "symbol",
						"title": "Symbol",
						"type": "`$STRING`",
						"req": true,
						"short": "Chemical symbol.",
					},
				},
				"id": map[string]any{
					"field": "id",
					"name": "id",
				},
				"name": "element",
				"op": map[string]any{
					"create": map[string]any{
						"input": "data",
						"name": "create",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "POST",
								"orig": "/element/{element_id}/ionize",
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
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"$action": "ionize",
									"exist": []any{
										"id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
							map[string]any{
								"kind": "http",
								"method": "POST",
								"orig": "/element",
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
								},
								"parts": []any{
									"element",
								},
								"rename": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{},
								"select": map[string]any{},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
					"list": map[string]any{
						"input": "data",
						"name": "list",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "GET",
								"orig": "/element",
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
								},
								"parts": []any{
									"element",
								},
								"rename": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{},
								"select": map[string]any{},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
					"load": map[string]any{
						"input": "data",
						"name": "load",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "GET",
								"orig": "/element/{element_id}",
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "id",
									},
								},
								"parts": []any{
									"element",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"element_id": "id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
					"remove": map[string]any{
						"input": "data",
						"name": "remove",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "DELETE",
								"orig": "/element/{element_id}",
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "id",
									},
								},
								"parts": []any{
									"element",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"element_id": "id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
							},
						},
					},
					"update": map[string]any{
						"input": "data",
						"name": "update",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "PUT",
								"orig": "/element/{element_id}",
								"segments": []any{
									map[string]any{
										"lit": "element",
									},
									map[string]any{
										"var": "id",
									},
								},
								"parts": []any{
									"element",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"element_id": "id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
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
						"title": "Cas",
						"type": "`$STRING`",
						"req": true,
						"short": "CAS group designation.",
					},
					map[string]any{
						"name": "id",
						"title": "Id",
						"type": "`$STRING`",
						"req": true,
						"short": "Group identifier, g1 to g18.",
					},
					map[string]any{
						"name": "name",
						"title": "Name",
						"type": "`$STRING`",
						"short": "Trivial name, where one exists.",
					},
					map[string]any{
						"name": "number",
						"title": "Number",
						"type": "`$INTEGER`",
						"req": true,
						"short": "Group number, 1 to 18.",
					},
				},
				"id": map[string]any{
					"field": "id",
					"name": "id",
				},
				"name": "group",
				"op": map[string]any{
					"list": map[string]any{
						"input": "data",
						"name": "list",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "GET",
								"orig": "/group",
								"segments": []any{
									map[string]any{
										"lit": "group",
									},
								},
								"parts": []any{
									"group",
								},
								"rename": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{},
								"select": map[string]any{},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
					"load": map[string]any{
						"input": "data",
						"name": "load",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "GET",
								"orig": "/group/{group_id}",
								"segments": []any{
									map[string]any{
										"lit": "group",
									},
									map[string]any{
										"var": "id",
									},
								},
								"parts": []any{
									"group",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"group_id": "id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "id",
											"orig": "group_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
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
						"title": "Abundance",
						"type": "`$NUMBER`",
						"short": "Natural abundance as a fraction, absent for synthetic isotopes.",
						"format": "float",
					},
					map[string]any{
						"name": "element_id",
						"title": "Element Id",
						"type": "`$STRING`",
						"req": true,
						"short": "Parent element identifier.",
					},
					map[string]any{
						"name": "halflife",
						"title": "Halflife",
						"type": "`$STRING`",
						"short": "Half-life, absent for stable isotopes.",
					},
					map[string]any{
						"name": "id",
						"title": "Id",
						"type": "`$STRING`",
						"req": true,
						"short": "Isotope identifier, symbol dash mass number.",
					},
					map[string]any{
						"name": "mass",
						"title": "Mass",
						"type": "`$NUMBER`",
						"req": true,
						"short": "Isotopic mass in daltons.",
						"format": "float",
					},
					map[string]any{
						"name": "mass_number",
						"title": "Mass Number",
						"type": "`$INTEGER`",
						"req": true,
						"short": "Total protons and neutrons.",
					},
					map[string]any{
						"name": "mode",
						"title": "Mode",
						"type": "`$STRING`",
						"short": "Primary decay mode, absent for stable isotopes.",
					},
					map[string]any{
						"name": "name",
						"title": "Name",
						"type": "`$STRING`",
						"req": true,
						"short": "Isotope name.",
					},
					map[string]any{
						"name": "product",
						"title": "Product",
						"type": "`$STRING`",
						"short": "Primary decay product isotope, absent for stable isotopes.",
					},
					map[string]any{
						"name": "stable",
						"title": "Stable",
						"type": "`$BOOLEAN`",
						"req": true,
						"short": "True if the isotope is stable.",
					},
				},
				"id": map[string]any{
					"field": "id",
					"name": "id",
				},
				"name": "isotope",
				"op": map[string]any{
					"create": map[string]any{
						"input": "data",
						"name": "create",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "POST",
								"orig": "/element/{element_id}/isotope/{isotope_id}/decay",
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
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "element_id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
										map[string]any{
											"name": "id",
											"orig": "isotope_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"$action": "decay",
									"exist": []any{
										"element_id",
										"id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
							map[string]any{
								"kind": "http",
								"method": "POST",
								"orig": "/element/{element_id}/isotope",
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
								"parts": []any{
									"element",
									"{element_id}",
									"isotope",
								},
								"rename": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "element_id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
					"list": map[string]any{
						"input": "data",
						"name": "list",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "GET",
								"orig": "/element/{element_id}/isotope",
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
								"parts": []any{
									"element",
									"{element_id}",
									"isotope",
								},
								"rename": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "element_id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
					"load": map[string]any{
						"input": "data",
						"name": "load",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "GET",
								"orig": "/element/{element_id}/isotope/{isotope_id}",
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
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "element_id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
										map[string]any{
											"name": "id",
											"orig": "isotope_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
										"id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
					"remove": map[string]any{
						"input": "data",
						"name": "remove",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "DELETE",
								"orig": "/element/{element_id}/isotope/{isotope_id}",
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
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "element_id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
										map[string]any{
											"name": "id",
											"orig": "isotope_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
										"id",
									},
								},
							},
						},
					},
					"update": map[string]any{
						"input": "data",
						"name": "update",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "PUT",
								"orig": "/element/{element_id}/isotope/{isotope_id}",
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
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "element_id",
											"orig": "element_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
										map[string]any{
											"name": "id",
											"orig": "isotope_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"element_id",
										"id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
				},
				"relations": map[string]any{
					"ancestors": []any{
						[]any{
							"$.main.kit.entity.element",
						},
					},
				},
			},
			"series": map[string]any{
				"fields": []any{
					map[string]any{
						"name": "color",
						"title": "Color",
						"type": "`$STRING`",
						"req": true,
						"short": "Display color used by the element card renderer.",
					},
					map[string]any{
						"name": "description",
						"title": "Description",
						"type": "`$STRING`",
						"req": true,
						"short": "One-line description of the series.",
					},
					map[string]any{
						"name": "id",
						"title": "Id",
						"type": "`$STRING`",
						"req": true,
						"short": "Series identifier.",
					},
					map[string]any{
						"name": "name",
						"title": "Name",
						"type": "`$STRING`",
						"req": true,
						"short": "Series name.",
					},
				},
				"id": map[string]any{
					"field": "id",
					"name": "id",
				},
				"name": "series",
				"op": map[string]any{
					"list": map[string]any{
						"input": "data",
						"name": "list",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "GET",
								"orig": "/series",
								"segments": []any{
									map[string]any{
										"lit": "series",
									},
								},
								"parts": []any{
									"series",
								},
								"rename": map[string]any{},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{},
								"select": map[string]any{},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
								},
							},
						},
					},
					"load": map[string]any{
						"input": "data",
						"name": "load",
						"points": []any{
							map[string]any{
								"kind": "http",
								"method": "GET",
								"orig": "/series/{series_id}",
								"segments": []any{
									map[string]any{
										"lit": "series",
									},
									map[string]any{
										"var": "id",
									},
								},
								"parts": []any{
									"series",
									"{id}",
								},
								"rename": map[string]any{
									"param": map[string]any{
										"series_id": "id",
									},
								},
								"transform": map[string]any{
									"req": "`reqdata`",
									"res": "`body`",
								},
								"args": map[string]any{
									"params": []any{
										map[string]any{
											"name": "id",
											"orig": "series_id",
											"type": "`$STRING`",
											"kind": "param",
											"reqd": true,
										},
									},
								},
								"select": map[string]any{
									"exist": []any{
										"id",
									},
								},
								"response": map[string]any{
									"kind": "json",
									"media": "application/json",
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
	case "debug":
		if NewDebugFeatureFunc != nil {
			return NewDebugFeatureFunc()
		}
	case "elementcard":
		if NewElementcardFeatureFunc != nil {
			return NewElementcardFeatureFunc()
		}
	case "idempotency":
		if NewIdempotencyFeatureFunc != nil {
			return NewIdempotencyFeatureFunc()
		}
	case "metrics":
		if NewMetricsFeatureFunc != nil {
			return NewMetricsFeatureFunc()
		}
	case "paging":
		if NewPagingFeatureFunc != nil {
			return NewPagingFeatureFunc()
		}
	case "ratelimit":
		if NewRatelimitFeatureFunc != nil {
			return NewRatelimitFeatureFunc()
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
