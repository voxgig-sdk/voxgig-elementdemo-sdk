# Elementdemo Python SDK



The Python SDK for the Elementdemo API — an entity-oriented client following Pythonic conventions.

The SDK exposes the API as capitalised, semantic **Entities** — for example `client.Element()` — each
carrying a small, uniform set of operations (`list`, `load`, `create`, `update`, `remove`) instead of raw URL
paths and query strings. You work with named resources and verbs, which
keeps the cognitive load low.

> Other languages live alongside this one — see
> the [top-level README](../README.md).


## Install
This package is not yet published to PyPI. Install it from the GitHub
release tag (`py/vX.Y.Z`, see [Tags](https://github.com/voxgig-sdk/voxgig-elementdemo-sdk/tags)) or
from a source checkout:

```bash
pip install -e .
```


## Tutorial: your first API call

This tutorial walks through creating a client, listing entities, and
loading a specific record.

### 1. Create a client

```python
import os
from elementdemo_sdk import ElementdemoSDK

client = ElementdemoSDK({
    "apikey": os.environ.get("ELEMENTDEMO_APIKEY"),
    "server": {
        "account_id": "<account_id>",
    },
})
```

### 2. List element records

`list()` returns a `list` of entities, one per record, and raises on
error; an entity's `data_get()` reads its record (a `dict`).

```python
try:
    elements = client.Element().list()
    for element in elements:
        print(element.data_get())
except Exception as err:
    print(f"list failed: {err}")
```

### 3. Load an isotope

Isotope is nested under element, so provide the `element_id`.
`load()` returns the ENTITY — call data_get() for the record — and raises on error.

```python
try:
    isotope = client.Isotope().load({"element_id": "example_element_id", "id": "example_id"})
    print(isotope.data_get())
except Exception as err:
    print(f"load failed: {err}")
```

### 4. Create, update, and remove

```python
# Create — returns the ENTITY (call data_get() for the record)
created = client.Element().create({"block": "example_block", "id": "example_id", "mass": 1, "name": "example_name", "number": 1, "period": 1, "series_id": "example_series_id", "symbol": "example_symbol"})

# Update — the created entity's record holds its id
client.Element().update({"id": created.data_get()["id"], "block": "example_block", "discovered": 1})

# Remove
client.Element().remove({"id": created.data_get()["id"]})
```


## Error handling

Entity operations raise on failure, so wrap them in `try` / `except`:

```python
try:
    seriess = client.Series().list()
    print([item.data_get() for item in seriess])
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

# Entity ops return the entity, and list one per record; they raise on error.
series = client.Series().list()
# data_get() on an entity reads its mock response record
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
ELEMENTDEMO_APIKEY=<your-key>
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
| `apikey` | `str` | API key for authentication. |
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
| `load` | `(reqmatch, ctrl) -> any` | Load a single entity by match criteria, and return it. Raises on error. |
| `list` | `(reqmatch, ctrl) -> list` | List entities matching the criteria, one per record. Raises on error. |
| `create` | `(reqdata, ctrl) -> any` | Create a new entity, and return it. Raises on error. |
| `update` | `(reqdata, ctrl) -> any` | Update an existing entity, and return it. Raises on error. |
| `remove` | `(reqmatch, ctrl) -> any` | Remove an entity, and return it marked as deleted. Raises on error. |
| `data_get` | `() -> dict` | Get entity data. |
| `data_set` | `(data)` | Set entity data. |
| `match_get` | `() -> dict` | Get entity match criteria. |
| `match_set` | `(match)` | Set entity match criteria. |
| `make` | `() -> Entity` | Create a new instance with the same options. |
| `get_name` | `() -> str` | Return the entity name. |

### Result shape

Entity operations return the entity, and `list` a `list` of entities, one
per record; an entity's `data_get()` reads its record (a `dict`). They raise
on error, so wrap calls in `try`/`except` to handle failures.

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
| `discovered` | Year of discovery, absent for elements known since antiquity. |
| `group` | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | Element identifier, the lowercase symbol. |
| `mass` | Standard atomic weight in daltons. |
| `name` | Element name. |
| `number` | Atomic number. |
| `period` | Periodic table row, 1 to 7. |
| `phase` | Phase at standard temperature and pressure. |
| `series_id` | Chemical series this element belongs to. |
| `symbol` | Chemical symbol. |

Operations: Create, List, Load, Remove, Update.

API path: `/element/{element_id}/ionize`

#### Group

| Field | Description |
| --- | --- |
| `cas` | CAS group designation. |
| `id` | Group identifier, g1 to g18. |
| `name` | Trivial name, where one exists. |
| `number` | Group number, 1 to 18. |

Operations: List, Load.

API path: `/group`

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
| `product` | Primary decay product isotope, absent for stable isotopes. |
| `stable` | True if the isotope is stable. |

Operations: Create, List, Load, Remove, Update.

API path: `/element/{element_id}/isotope/{isotope_id}/decay`

#### Series

| Field | Description |
| --- | --- |
| `color` | Display color used by the element card renderer. |
| `description` | One-line description of the series. |
| `id` | Series identifier. |
| `name` | Series name. |

Operations: List, Load.

API path: `/series`



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
| `discovered` | `int` | Year of discovery, absent for elements known since antiquity. |
| `group` | `int` | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `str` | Element identifier, the lowercase symbol. |
| `mass` | `float` | Standard atomic weight in daltons. |
| `name` | `str` | Element name. |
| `number` | `int` | Atomic number. |
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
| `product` | `str` | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `bool` | True if the isotope is stable. |

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

## Features

This SDK ships 10 optional features. Each is **inactive until you
switch it on**, so an SDK you have not configured behaves exactly as if none of
them existed — no retries, no cache, no logging, no measurable overhead.

Activate a feature by name in the client options, alongside the options shown
above:

| Feature | What it does |
|---|---|
| [`debug`](#debug) | Debug capture |
| [`elementcard`](#elementcard) | ASCII periodic-table tile for element-shaped results |
| [`idempotency`](#idempotency) | Idempotency |
| [`metrics`](#metrics) | Metrics |
| [`paging`](#paging) | Paging |
| [`ratelimit`](#ratelimit) | Rate limiting |
| [`retry`](#retry) | Retry |
| [`secrets`](#secrets) | Secrets |
| [`test`](#test) | Test transport |
| [`timeout`](#timeout) | Timeout |

> **Order matters for `ratelimit`, `retry`, `secrets`, `timeout`.** These wrap the
> transport, so each one wraps whatever is already installed: the order you
> activate them in IS the nesting order. Activating them as an ordered list
> rather than a map is what fixes that order.

### debug

Debug capture.

| Option | Default |
|---|---|
| `active` | `false` |
| `max` | `100` |
| `redact` | `['authorization', 'cookie', 'set-cookie', 'api-key', 'apikey', 'x-api-key', 'idempotency-key']` |

Set `feature.debug.active` to enable it, then override any of the options above.

### elementcard

ASCII periodic-table tile for element-shaped results.

| Option | Default |
|---|---|
| `active` | `false` |
| `print` | `false` |

Set `feature.elementcard.active` to enable it, then override any of the options above.

### idempotency

Idempotency.

| Option | Default |
|---|---|
| `active` | `false` |
| `header` | `'Idempotency-Key'` |
| `methods` | `['POST', 'PUT', 'PATCH', 'DELETE']` |
| `ops` | `['create', 'update', 'remove']` |

Set `feature.idempotency.active` to enable it, then override any of the options above.

### metrics

Metrics.

| Option | Default |
|---|---|
| `active` | `false` |

Set `feature.metrics.active` to enable it, then override any of the options above.

### paging

Paging.

| Option | Default |
|---|---|
| `active` | `false` |
| `afterVar` | `'after'` |
| `cursorParam` | `'cursor'` |
| `firstVar` | `'first'` |
| `limitParam` | `'limit'` |
| `pageParam` | `'page'` |
| `startPage` | `1` |

Set `feature.paging.active` to enable it, then override any of the options above.

### ratelimit

Rate limiting.

| Option | Default |
|---|---|
| `active` | `false` |
| `burst` | `5` |
| `rate` | `5` |

Set `feature.ratelimit.active` to enable it, then override any of the options above.

`ratelimit` wraps the transport, so its position among the other
transport features decides what it sees. A feature activated later wraps one
activated earlier.

### retry

Retry.

| Option | Default |
|---|---|
| `active` | `false` |
| `factor` | `2` |
| `maxDelay` | `2000` |
| `minDelay` | `50` |
| `retries` | `2` |
| `statuses` | `[408, 425, 429, 500, 502, 503, 504]` |

Set `feature.retry.active` to enable it, then override any of the options above.

`retry` wraps the transport, so its position among the other
transport features decides what it sees. A feature activated later wraps one
activated earlier.

### secrets

Secrets.

| Option | Default |
|---|---|
| `active` | `false` |
| `cache` | `true` |
| `exchange` | `{active: false, method: 'POST', path: 'auth/token', refresh: '', request: 'refresh_token', response: 'access_token', retries: 1, statuses: [401]}` |
| `name` | `'apikey'` |
| `providers` | `[]` |

Set `feature.secrets.active` to enable it, then override any of the options above.

`secrets` wraps the transport, so its position among the other
transport features decides what it sees. A feature activated later wraps one
activated earlier.

### test

Test transport.

| Option | Default |
|---|---|
| `active` | `false` |

Set `feature.test.active` to enable it, then override any of the options above.

### timeout

Timeout.

| Option | Default |
|---|---|
| `active` | `false` |
| `ms` | `30000` |

Set `feature.timeout.active` to enable it, then override any of the options above.

`timeout` wraps the transport, so its position among the other
transport features decides what it sees. A feature activated later wraps one
activated earlier.


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

- **DebugFeature**: Debug capture
- **ElementcardFeature**: ASCII periodic-table tile for element-shaped results
- **IdempotencyFeature**: Idempotency
- **MetricsFeature**: Metrics
- **PagingFeature**: Paging
- **RatelimitFeature**: Rate limiting
- **RetryFeature**: Retry
- **SecretsFeature**: Secrets
- **TestFeature**: Test transport
- **TimeoutFeature**: Timeout

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
├── schema.py                    -- Generated option + entity specs
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
series = client.Series()
series.list()

# series.data_get() now returns the series data from the last list
# series.match_get() returns the last match criteria
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
