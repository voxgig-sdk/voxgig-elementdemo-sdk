# Elementdemo Python SDK



The Python SDK for the Elementdemo API — an entity-oriented client following Pythonic conventions.

The SDK exposes the API as capitalised, semantic **Entities** — for example `client.Element()` — each
carrying a small, uniform set of operations (`list`, `load`, `create`, `update`, `remove`) instead of raw URL
paths and query strings. You work with named resources and verbs, which
keeps the cognitive load low.

> Other languages, the CLI, and MCP server live alongside this one — see
> the [top-level README](../README.md).


## Install
This package is not yet published to PyPI. Install it from the GitHub
release tag (`py/vX.Y.Z`, see [Releases](https://github.com/voxgig-sdk/voxgig-elementdemo-sdk/releases)) or
from a source checkout:

```bash
pip install -e .
```


## Tutorial: your first API call

This tutorial walks through creating a client, listing entities, and
loading a specific record.

### 1. Create a client

```python
from elementdemo_sdk import ElementdemoSDK

client = ElementdemoSDK()
```

### 2. List element records

`list()` returns a `list` of records (each a `dict`) and raises on
error — iterate it directly.

```python
try:
    elements = client.Element().list()
    for element in elements:
        print(element)
except Exception as err:
    print(f"list failed: {err}")
```

### 3. Load an isotope

Isotope is nested under element, so provide the `element_id`.
`load()` returns the ENTITY — call data_get() for the record — and raises on error.

```python
try:
    isotope = client.Isotope().load({"element_id": "example_element_id", "id": "example_id"})
    print(isotope)
except Exception as err:
    print(f"load failed: {err}")
```

### 4. Create, update, and remove

```python
# Create — returns the ENTITY (call data_get() for the record)
created = client.Element().create({"block": "example_block", "id": "example_id", "mass": 1, "name": "example_name", "number": 1, "period": 1, "series_id": "example_series_id", "symbol": "example_symbol"})

# Update — the created record's id is a plain dict key
client.Element().update({"id": created.data_get()["id"], "block": "example_block", "charge": 1})

# Remove
client.Element().remove({"id": created.data_get()["id"]})
```


## Error handling

Entity operations raise on failure, so wrap them in `try` / `except`:

```python
try:
    isotopes = client.Isotope().list()
    print(isotopes)
except Exception as err:
    print(f"list failed: {err}")
```

`direct()` does **not** raise — it returns the result envelope. Branch
on `ok`; on failure `status` holds the HTTP status (for error responses)
and `err` holds a transport error, so read both defensively:

```python
result = client.direct({
    "path": "/api/resource/{id}",
    "method": "GET",
    "params": {"id": "example_id"},
})

if not result["ok"]:
    print("request failed:", result.get("status"), result.get("err"))
```


## How-to guides

### Make a direct HTTP request

For endpoints not covered by entity methods:

```python
result = client.direct({
    "path": "/api/resource/{id}",
    "method": "GET",
    "params": {"id": "example"},
})

if result["ok"]:
    print(result["status"])  # 200
    print(result["data"])    # response body
else:
    # A non-2xx response carries status + data (the error body); a
    # transport-level failure carries err instead. Only one is present, so
    # read both with .get() rather than indexing a key that may be absent.
    print(result.get("status"), result.get("err"))
```

### Prepare a request without sending it

```python
# prepare() returns the fetch definition and raises on error.
fetchdef = client.prepare({
    "path": "/api/resource/{id}",
    "method": "DELETE",
    "params": {"id": "example"},
})

print(fetchdef["url"])
print(fetchdef["method"])
print(fetchdef["headers"])
```

### Use test mode

Create a mock client for unit testing — no server required:

```python
client = ElementdemoSDK.test()

# Entity ops return the ENTITY and raises on error;
# call data_get() for the record.
isotope = client.Isotope().list()
# isotope contains the mock response record
```

### Use a custom fetch function

Replace the HTTP transport with your own function:

```python
def mock_fetch(url, init):
    return {
        "status": 200,
        "statusText": "OK",
        "headers": {},
        "json": lambda: {"id": "mock01"},
    }, None

client = ElementdemoSDK({
    "base": "http://localhost:8080",
    "system": {
        "fetch": mock_fetch,
    },
})
```

### Run live tests

Create a `.env.local` file at the project root:

```
ELEMENTDEMO_TEST_LIVE=TRUE
```

Then run:

```bash
cd py && pytest test/
```


## Reference

### ElementdemoSDK

```python
from elementdemo_sdk import ElementdemoSDK

client = ElementdemoSDK(options)
```

Creates a new SDK client.

| Option | Type | Description |
| --- | --- | --- |
| `base` | `str` | Base URL of the API server. |
| `prefix` | `str` | URL path prefix prepended to all requests. |
| `suffix` | `str` | URL path suffix appended to all requests. |
| `feature` | `dict` | Feature activation flags. |
| `extend` | `list` | Additional Feature instances to load. |
| `system` | `dict` | System overrides (e.g. custom `fetch` function). |

### test

```python
client = ElementdemoSDK.test(testopts, sdkopts)
```

Creates a test-mode client with mock transport. Both arguments may be `None`.

### ElementdemoSDK methods

| Method | Signature | Description |
| --- | --- | --- |
| `options_map` | `() -> dict` | Deep copy of current SDK options. |
| `get_utility` | `() -> Utility` | Copy of the SDK utility object. |
| `prepare` | `(fetchargs) -> dict` | Build an HTTP request definition without sending. Raises on error. |
| `direct` | `(fetchargs) -> dict` | Build and send an HTTP request. Returns a result dict (branch on `ok`). |
| `Element` | `(data) -> ElementEntity` | Create an Element entity instance. |
| `Group` | `(data) -> GroupEntity` | Create a Group entity instance. |
| `Isotope` | `(data) -> IsotopeEntity` | Create an Isotope entity instance. |
| `Series` | `(data) -> SeriesEntity` | Create a Series entity instance. |

### Entity interface

All entities share the same interface.

| Method | Signature | Description |
| --- | --- | --- |
| `load` | `(reqmatch, ctrl) -> any` | Load a single entity by match criteria. Raises on error. |
| `list` | `(reqmatch, ctrl) -> list` | List entities matching the criteria. Raises on error. |
| `create` | `(reqdata, ctrl) -> any` | Create a new entity. Raises on error. |
| `update` | `(reqdata, ctrl) -> any` | Update an existing entity. Raises on error. |
| `remove` | `(reqmatch, ctrl) -> any` | Remove an entity. Raises on error. |
| `data_get` | `() -> dict` | Get entity data. |
| `data_set` | `(data)` | Set entity data. |
| `match_get` | `() -> dict` | Get entity match criteria. |
| `match_set` | `(match)` | Set entity match criteria. |
| `make` | `() -> Entity` | Create a new instance with the same options. |
| `get_name` | `() -> str` | Return the entity name. |

### Result shape

Entity operations return the ENTITY (call data_get() for the record) (a `dict` for single-entity
ops, a `list` for `list`) and raise on error. Wrap calls in
`try`/`except` to handle failures.

The `direct()` escape hatch never raises — it returns a result `dict`
you branch on via `result["ok"]`:

| Key | Type | Description |
| --- | --- | --- |
| `ok` | `bool` | `True` if the HTTP status is 2xx. |
| `status` | `int` | HTTP status code. |
| `headers` | `dict` | Response headers. |
| `data` | `any` | Parsed JSON response body. |

On error, `ok` is `False` and `err` contains the error value.

### Entities

#### Element

| Field | Description |
| --- | --- |
| `block` | Orbital block, one of s, p, d, f. |
| `charge` |  |
| `discovered` | Year of discovery, absent for elements known since antiquity. |
| `group` | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | Element identifier, the lowercase symbol. |
| `ion` |  |
| `mass` | Standard atomic weight in daltons. |
| `name` | Element name. |
| `number` | Atomic number. |
| `ok` |  |
| `period` | Periodic table row, 1 to 7. |
| `phase` | Phase at standard temperature and pressure. |
| `series_id` | Chemical series this element belongs to. |
| `symbol` | Chemical symbol. |

Operations: Create, List, Load, Remove, Update.

API path: `/api/element/{element_id}/ionize`

#### Group

| Field | Description |
| --- | --- |
| `cas` | CAS group designation. |
| `id` | Group identifier, g1 to g18. |
| `name` | Trivial name, where one exists. |
| `number` | Group number, 1 to 18. |

Operations: List, Load.

API path: `/api/group`

#### Isotope

| Field | Description |
| --- | --- |
| `abundance` | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | Parent element identifier. |
| `halflife` | Half-life, absent for stable isotopes. |
| `id` | Isotope identifier, symbol dash mass number. |
| `mass` | Isotopic mass in daltons. |
| `mass_number` | Total protons and neutrons. |
| `mode` | Primary decay mode, absent for stable isotopes. |
| `name` | Isotope name. |
| `ok` |  |
| `product` | Primary decay product isotope, absent for stable isotopes. |
| `stable` | True if the isotope is stable. |
| `steps` |  |

Operations: Create, List, Load, Remove, Update.

API path: `/api/element/{element_id}/isotope/{isotope_id}/decay`

#### Series

| Field | Description |
| --- | --- |
| `color` | Display color used by the element card renderer. |
| `description` | One-line description of the series. |
| `id` | Series identifier. |
| `name` | Series name. |

Operations: List, Load.

API path: `/api/series`



## Entities


### Element

Create an instance: `element = client.Element()`

#### Operations

| Method | Description |
| --- | --- |
| `create(data)` | Create a new entity with the given data. |
| `list()` | List entities, optionally matching the given criteria. |
| `load(match)` | Load a single entity by match criteria. |
| `remove(match)` | Remove the matching entity. |
| `update(data)` | Update an existing entity. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `block` | `str` | Orbital block, one of s, p, d, f. |
| `charge` | `int` |  |
| `discovered` | `int` | Year of discovery, absent for elements known since antiquity. |
| `group` | `int` | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `str` | Element identifier, the lowercase symbol. |
| `ion` | `str` |  |
| `mass` | `float` | Standard atomic weight in daltons. |
| `name` | `str` | Element name. |
| `number` | `int` | Atomic number. |
| `ok` | `bool` |  |
| `period` | `int` | Periodic table row, 1 to 7. |
| `phase` | `str` | Phase at standard temperature and pressure. |
| `series_id` | `str` | Chemical series this element belongs to. |
| `symbol` | `str` | Chemical symbol. |

#### Example: Load

```python
element = client.Element().load({"id": "element_id"})
```

#### Example: List

```python
elements = client.Element().list()
```

#### Example: Create

```python
element = client.Element().create({
    "block": "example_block",  # str
    "id": "example_id",  # str
    "mass": 1,  # float
    "name": "example_name",  # str
    "number": 1,  # int
    "period": 1,  # int
    "series_id": "example_series_id",  # str
    "symbol": "example_symbol",  # str
})
```


### Group

Create an instance: `group = client.Group()`

#### Operations

| Method | Description |
| --- | --- |
| `list()` | List entities, optionally matching the given criteria. |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `cas` | `str` | CAS group designation. |
| `id` | `str` | Group identifier, g1 to g18. |
| `name` | `str` | Trivial name, where one exists. |
| `number` | `int` | Group number, 1 to 18. |

#### Example: Load

```python
group = client.Group().load({"id": "group_id"})
```

#### Example: List

```python
groups = client.Group().list()
```


### Isotope

Create an instance: `isotope = client.Isotope()`

#### Operations

| Method | Description |
| --- | --- |
| `create(data)` | Create a new entity with the given data. |
| `list()` | List entities, optionally matching the given criteria. |
| `load(match)` | Load a single entity by match criteria. |
| `remove(match)` | Remove the matching entity. |
| `update(data)` | Update an existing entity. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `abundance` | `float` | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | `str` | Parent element identifier. |
| `halflife` | `str` | Half-life, absent for stable isotopes. |
| `id` | `str` | Isotope identifier, symbol dash mass number. |
| `mass` | `float` | Isotopic mass in daltons. |
| `mass_number` | `int` | Total protons and neutrons. |
| `mode` | `str` | Primary decay mode, absent for stable isotopes. |
| `name` | `str` | Isotope name. |
| `ok` | `bool` |  |
| `product` | `str` | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `bool` | True if the isotope is stable. |
| `steps` | `int` |  |

#### Example: Load

```python
isotope = client.Isotope().load({"id": "isotope_id", "element_id": "element_id"})
```

#### Example: List

```python
isotopes = client.Isotope().list({"element_id": "example"})
```

#### Example: Create

```python
isotope = client.Isotope().create({
    "element_id": "example_element_id",  # str
    "id": "example_id",  # str
    "mass": 1,  # float
    "mass_number": 1,  # int
    "name": "example_name",  # str
    "stable": True,  # bool
})
```


### Series

Create an instance: `series = client.Series()`

#### Operations

| Method | Description |
| --- | --- |
| `list()` | List entities, optionally matching the given criteria. |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `color` | `str` | Display color used by the element card renderer. |
| `description` | `str` | One-line description of the series. |
| `id` | `str` | Series identifier. |
| `name` | `str` | Series name. |

#### Example: Load

```python
series = client.Series().load({"id": "series_id"})
```

#### Example: List

```python
seriess = client.Series().list()
```


## Advanced

> The sections above cover everyday use. The material below explains the
> SDK's internals — useful when extending it with custom features, but not
> needed for normal use.

### The operation pipeline

Every entity operation follows a six-stage pipeline. Each stage fires a
feature hook before executing:

```
PrePoint → PreSpec → PreRequest → PreResponse → PreResult → PreDone
```

- **PrePoint**: Resolves which API endpoint to call based on the
  operation name and entity configuration.
- **PreSpec**: Builds the HTTP spec — URL, method, headers, body —
  from the resolved point and the caller's parameters.
- **PreRequest**: Sends the HTTP request. Features can intercept here
  to replace the transport (as TestFeature does with mocks).
- **PreResponse**: Parses the raw HTTP response.
- **PreResult**: Extracts the business data from the parsed response.
- **PreDone**: Final stage before returning to the caller. Entity
  state (match, data) is updated here.

If any stage errors, the pipeline short-circuits and the error surfaces
to the caller — see [Error handling](#error-handling) for how that looks
in this language.

### Features and hooks

Features are the extension mechanism. A feature is a Python class
with hook methods named after pipeline stages (e.g. `PrePoint`,
`PreSpec`). Each method receives the context.

The SDK ships with built-in features:

- **ElementcardFeature**: ASCII periodic-table tile for element-shaped results
- **RetryFeature**: Automatic retry of transient failures with exponential backoff
- **TestFeature**: In-memory mock transport for testing without a live server
- **TimeoutFeature**: Per-request timeout with transport abort

Features are initialized in order. Hooks fire in the order features
were added, so later features can override earlier ones.

### Data as dicts

The Python SDK uses plain dicts throughout rather than typed
objects. This mirrors the dynamic nature of the API and keeps the
SDK flexible — no code generation is needed when the API schema
changes.

Use `helpers.to_map()` to safely validate that a value is a dict.

### Module structure

```
py/
├── elementdemo_sdk.py         -- Main SDK module
├── config.py                    -- Configuration
├── features.py                  -- Feature factory
├── core/                        -- Core types and context
├── entity/                      -- Entity implementations
├── feature/                     -- Built-in features (Base, Test, Log)
├── utility/                     -- Utility functions and struct library
└── test/                        -- Test suites
```

The main module (`elementdemo_sdk`) exports the SDK class.
Import entity or utility modules directly only when needed.

### Entity state

Entity instances are stateful. After a successful `list`, the entity
stores the returned data and match criteria internally.

```python
isotope = client.Isotope()
isotope.list()

# isotope.data_get() now returns the isotope data from the last list
# isotope.match_get() returns the last match criteria
```

Call `make()` to create a fresh instance with the same configuration
but no stored state.

### Direct vs entity access

The entity interface handles URL construction, parameter placement,
and response parsing automatically. Use it for standard CRUD operations.

`direct()` gives full control over the HTTP request. Use it for
non-standard endpoints, bulk operations, or any path not modelled as
an entity. `prepare()` builds the request without sending it — useful
for debugging or custom transport.


## Full Reference

See [REFERENCE.md](REFERENCE.md) for complete API reference
documentation including all method signatures, entity field schemas,
and detailed usage examples.
