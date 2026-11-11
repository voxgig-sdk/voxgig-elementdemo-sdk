"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const __1 = require("..");
const definition_runner_1 = require("./definition-runner");
const utility_1 = require("./utility");
// Generated from the API definition, not from the model this SDK was built
// from: the route, the declared query parameters, the credential the security
// scheme names, and the definition's own response example.
const PLAN = [
    {
        "entity": "element",
        "accessor": "Element",
        "op": "create",
        "method": "POST",
        "path": "/element/{element_id}/ionize",
        "action": "ionize",
        "args": [
            {
                "name": "id",
                "wire": "element_id",
                "value": "p1"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": {
            "ok": true,
            "ion": "x"
        },
        "idField": "id"
    },
    {
        "entity": "element",
        "accessor": "Element",
        "op": "create",
        "method": "POST",
        "path": "/element",
        "args": [],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 201,
        "sample": {
            "id": "x",
            "name": "x",
            "symbol": "x",
            "number": 1,
            "period": 1,
            "block": "x",
            "series_id": "x",
            "mass": 1,
            "group": 1,
            "phase": "x",
            "discovered": 1
        },
        "idField": "id"
    },
    {
        "entity": "element",
        "accessor": "Element",
        "op": "list",
        "method": "GET",
        "path": "/element",
        "args": [],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": [
            {
                "id": "x",
                "name": "x",
                "symbol": "x",
                "number": 1,
                "period": 1,
                "block": "x",
                "series_id": "x",
                "mass": 1,
                "group": 1,
                "phase": "x",
                "discovered": 1
            }
        ],
        "idField": "id"
    },
    {
        "entity": "element",
        "accessor": "Element",
        "op": "load",
        "method": "GET",
        "path": "/element/{element_id}",
        "args": [
            {
                "name": "id",
                "wire": "element_id",
                "value": "p1"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": {
            "id": "x",
            "name": "x",
            "symbol": "x",
            "number": 1,
            "period": 1,
            "block": "x",
            "series_id": "x",
            "mass": 1,
            "group": 1,
            "phase": "x",
            "discovered": 1
        },
        "idField": "id"
    },
    {
        "entity": "element",
        "accessor": "Element",
        "op": "remove",
        "method": "DELETE",
        "path": "/element/{element_id}",
        "args": [
            {
                "name": "id",
                "wire": "element_id",
                "value": "p1"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 204,
        "sample": null,
        "idField": "id"
    },
    {
        "entity": "element",
        "accessor": "Element",
        "op": "update",
        "method": "PUT",
        "path": "/element/{element_id}",
        "args": [
            {
                "name": "id",
                "wire": "element_id",
                "value": "p1"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": {
            "id": "x",
            "name": "x",
            "symbol": "x",
            "number": 1,
            "period": 1,
            "block": "x",
            "series_id": "x",
            "mass": 1,
            "group": 1,
            "phase": "x",
            "discovered": 1
        },
        "idField": "id"
    },
    {
        "entity": "group",
        "accessor": "Group",
        "op": "list",
        "method": "GET",
        "path": "/group",
        "args": [],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": [
            {
                "id": "x",
                "number": 1,
                "cas": "x",
                "name": "x"
            }
        ],
        "idField": "id"
    },
    {
        "entity": "group",
        "accessor": "Group",
        "op": "load",
        "method": "GET",
        "path": "/group/{group_id}",
        "args": [
            {
                "name": "id",
                "wire": "group_id",
                "value": "p1"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": {
            "id": "x",
            "number": 1,
            "cas": "x",
            "name": "x"
        },
        "idField": "id"
    },
    {
        "entity": "isotope",
        "accessor": "Isotope",
        "op": "create",
        "method": "POST",
        "path": "/element/{element_id}/isotope/{isotope_id}/decay",
        "action": "decay",
        "args": [
            {
                "name": "element_id",
                "wire": "element_id",
                "value": "p1"
            },
            {
                "name": "id",
                "wire": "isotope_id",
                "value": "p2"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": {
            "ok": true,
            "mode": "x",
            "product": "x"
        },
        "idField": "id"
    },
    {
        "entity": "isotope",
        "accessor": "Isotope",
        "op": "create",
        "method": "POST",
        "path": "/element/{element_id}/isotope",
        "args": [
            {
                "name": "element_id",
                "wire": "element_id",
                "value": "p1"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 201,
        "sample": {
            "id": "x",
            "element_id": "x",
            "name": "x",
            "mass_number": 1,
            "mass": 1,
            "stable": true,
            "abundance": 1,
            "halflife": "x",
            "mode": "x",
            "product": "x"
        },
        "idField": "id"
    },
    {
        "entity": "isotope",
        "accessor": "Isotope",
        "op": "list",
        "method": "GET",
        "path": "/element/{element_id}/isotope",
        "args": [
            {
                "name": "element_id",
                "wire": "element_id",
                "value": "p1"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": [
            {
                "id": "x",
                "element_id": "x",
                "name": "x",
                "mass_number": 1,
                "mass": 1,
                "stable": true,
                "abundance": 1,
                "halflife": "x",
                "mode": "x",
                "product": "x"
            }
        ],
        "idField": "id"
    },
    {
        "entity": "isotope",
        "accessor": "Isotope",
        "op": "load",
        "method": "GET",
        "path": "/element/{element_id}/isotope/{isotope_id}",
        "args": [
            {
                "name": "element_id",
                "wire": "element_id",
                "value": "p1"
            },
            {
                "name": "id",
                "wire": "isotope_id",
                "value": "p2"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": {
            "id": "x",
            "element_id": "x",
            "name": "x",
            "mass_number": 1,
            "mass": 1,
            "stable": true,
            "abundance": 1,
            "halflife": "x",
            "mode": "x",
            "product": "x"
        },
        "idField": "id"
    },
    {
        "entity": "isotope",
        "accessor": "Isotope",
        "op": "remove",
        "method": "DELETE",
        "path": "/element/{element_id}/isotope/{isotope_id}",
        "args": [
            {
                "name": "element_id",
                "wire": "element_id",
                "value": "p1"
            },
            {
                "name": "id",
                "wire": "isotope_id",
                "value": "p2"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 204,
        "sample": null,
        "idField": "id"
    },
    {
        "entity": "isotope",
        "accessor": "Isotope",
        "op": "update",
        "method": "PUT",
        "path": "/element/{element_id}/isotope/{isotope_id}",
        "args": [
            {
                "name": "element_id",
                "wire": "element_id",
                "value": "p1"
            },
            {
                "name": "id",
                "wire": "isotope_id",
                "value": "p2"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": {
            "id": "x",
            "element_id": "x",
            "name": "x",
            "mass_number": 1,
            "mass": 1,
            "stable": true,
            "abundance": 1,
            "halflife": "x",
            "mode": "x",
            "product": "x"
        },
        "idField": "id"
    },
    {
        "entity": "series",
        "accessor": "Series",
        "op": "list",
        "method": "GET",
        "path": "/series",
        "args": [],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": [
            {
                "id": "x",
                "name": "x",
                "color": "x",
                "description": "x"
            }
        ],
        "idField": "id"
    },
    {
        "entity": "series",
        "accessor": "Series",
        "op": "load",
        "method": "GET",
        "path": "/series/{series_id}",
        "args": [
            {
                "name": "id",
                "wire": "series_id",
                "value": "p1"
            }
        ],
        "select": {},
        "headers": [],
        "cookies": [],
        "responseMedia": [
            "application/json"
        ],
        "query": [],
        "queryArgs": [],
        "auth": [
            [
                {
                    "in": "header",
                    "name": "authorization",
                    "scheme": "bearer"
                }
            ]
        ],
        "status": 200,
        "sample": {
            "id": "x",
            "name": "x",
            "color": "x",
            "description": "x"
        },
        "idField": "id"
    }
];
(0, node_test_1.describe)('definition', () => {
    for (const point of PLAN) {
        (0, node_test_1.test)(point.entity + '.' + point.op + ' ' + point.method + ' ' + point.path, async (t) => {
            const control = (0, utility_1.isControlSkipped)('entityOp', point.entity + '.' + point.op, 'definition');
            if (control.skip) {
                t.skip(control.reason || 'skipped via sdk-test-control.json');
                return;
            }
            await (0, definition_runner_1.runDefinitionPoint)(__1.SDK, point);
        });
    }
});
//# sourceMappingURL=definition.test.js.map