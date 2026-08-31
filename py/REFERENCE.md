# Elementdemo Python SDK Reference

Complete API reference for the Elementdemo Python SDK.


## ElementdemoSDK

### Constructor

```python
from elementdemo_sdk import ElementdemoSDK

client = ElementdemoSDK(options)
```

Create a new SDK client instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `options` | `dict` | SDK configuration options. |
| `options["apikey"]` | `str` | API key for authentication. |
| `options["base"]` | `str` | Base URL for API requests. |
| `options["prefix"]` | `str` | URL prefix appended after base. |
| `options["suffix"]` | `str` | URL suffix appended after path. |
| `options["headers"]` | `dict` | Custom headers for all requests. |
| `options["feature"]` | `dict` | Feature configuration. |
| `options["system"]` | `dict` | System overrides (e.g. custom fetch). |


### Static Methods

#### `ElementdemoSDK.test(testopts=None, sdkopts=None)`

Create a test client with mock features active. Both arguments may be `None`.

```python
client = ElementdemoSDK.test()
```


### Instance Methods

#### `Element(data=None)`

Create a new `ElementEntity` instance. Pass `None` for no initial data.

#### `Group(data=None)`

Create a new `GroupEntity` instance. Pass `None` for no initial data.

#### `Isotope(data=None)`

Create a new `IsotopeEntity` instance. Pass `None` for no initial data.

#### `Series(data=None)`

Create a new `SeriesEntity` instance. Pass `None` for no initial data.

#### `options_map() -> dict`

Return a deep copy of the current SDK options.

#### `get_utility() -> Utility`

Return a copy of the SDK utility object.

#### `direct(fetchargs=None) -> dict`

Make a direct HTTP request to any API endpoint. Returns a result `dict` with `ok`, `status`, `headers`, and `data` (or `err` on failure). This escape hatch never raises — branch on `result["ok"]`.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `fetchargs["path"]` | `str` | URL path with optional `{param}` placeholders. |
| `fetchargs["method"]` | `str` | HTTP method (default: `"GET"`). |
| `fetchargs["params"]` | `dict` | Path parameter values. |
| `fetchargs["query"]` | `dict` | Query string parameters. |
| `fetchargs["headers"]` | `dict` | Request headers (merged with defaults). |
| `fetchargs["body"]` | `any` | Request body (dicts are JSON-serialized). |

**Returns:** `result_dict`

#### `prepare(fetchargs=None) -> dict`

Prepare a fetch definition without sending. Returns the `fetchdef` and raises on error.


---

## ElementEntity

```python
element = client.Element()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `block` | `str` | Yes | Orbital block, one of s, p, d, f. |
| `charge` | `int` | No |  |
| `discovered` | `int` | No | Year of discovery, absent for elements known since antiquity. |
| `group` | `int` | No | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `str` | Yes | Element identifier, the lowercase symbol. |
| `ion` | `str` | No |  |
| `mass` | `float` | Yes | Standard atomic weight in daltons. |
| `name` | `str` | Yes | Element name. |
| `number` | `int` | Yes | Atomic number. |
| `ok` | `bool` | No |  |
| `period` | `int` | Yes | Periodic table row, 1 to 7. |
| `phase` | `str` | No | Phase at standard temperature and pressure. |
| `series_id` | `str` | Yes | Chemical series this element belongs to. |
| `symbol` | `str` | Yes | Chemical symbol. |

### Operations

#### `create(reqdata, ctrl=None) -> dict`

Create a new entity with the given data. Returns the created entity data and raises on error.

```python
result = client.Element().create({
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

#### `list(reqmatch=None, ctrl=None) -> list`

List entities matching the given criteria. The match is optional — call `list()` with no argument to list all records. Returns a list and raises on error.

```python
results = client.Element().list()
for element in results:
    print(element)
```

#### `load(reqmatch, ctrl=None) -> dict`

Load a single entity matching the given criteria. Returns the entity data and raises on error.

```python
result = client.Element().load({"id": "element_id"})
```

#### `remove(reqmatch, ctrl=None) -> dict`

Remove the entity matching the given criteria. Raises on error.

```python
result = client.Element().remove({"id": "element_id"})
```

#### `update(reqdata, ctrl=None) -> dict`

Update an existing entity. The data must include the entity `id`. Returns the updated entity data and raises on error.

```python
result = client.Element().update({
    "id": "element_id",
    # Fields to update
})
```

### Common Methods

#### `data_get() -> dict`

Get the entity data.

#### `data_set(data)`

Set the entity data.

#### `match_get() -> dict`

Get the entity match criteria.

#### `match_set(match)`

Set the entity match criteria.

#### `make() -> Entity`

Create a new `ElementEntity` instance with the same options.

#### `get_name() -> str`

Return the entity name.


---

## GroupEntity

```python
group = client.Group()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cas` | `str` | Yes | CAS group designation. |
| `id` | `str` | Yes | Group identifier, g1 to g18. |
| `name` | `str` | No | Trivial name, where one exists. |
| `number` | `int` | Yes | Group number, 1 to 18. |

### Operations

#### `list(reqmatch=None, ctrl=None) -> list`

List entities matching the given criteria. The match is optional — call `list()` with no argument to list all records. Returns a list and raises on error.

```python
results = client.Group().list()
for group in results:
    print(group)
```

#### `load(reqmatch, ctrl=None) -> dict`

Load a single entity matching the given criteria. Returns the entity data and raises on error.

```python
result = client.Group().load({"id": "group_id"})
```

### Common Methods

#### `data_get() -> dict`

Get the entity data.

#### `data_set(data)`

Set the entity data.

#### `match_get() -> dict`

Get the entity match criteria.

#### `match_set(match)`

Set the entity match criteria.

#### `make() -> Entity`

Create a new `GroupEntity` instance with the same options.

#### `get_name() -> str`

Return the entity name.


---

## IsotopeEntity

```python
isotope = client.Isotope()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `abundance` | `float` | No | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | `str` | Yes | Parent element identifier. |
| `halflife` | `str` | No | Half-life, absent for stable isotopes. |
| `id` | `str` | Yes | Isotope identifier, symbol dash mass number. |
| `mass` | `float` | Yes | Isotopic mass in daltons. |
| `mass_number` | `int` | Yes | Total protons and neutrons. |
| `mode` | `str` | No | Primary decay mode, absent for stable isotopes. |
| `name` | `str` | Yes | Isotope name. |
| `ok` | `bool` | No |  |
| `product` | `str` | No | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `bool` | Yes | True if the isotope is stable. |
| `steps` | `int` | No |  |

### Operations

#### `create(reqdata, ctrl=None) -> dict`

Create a new entity with the given data. Returns the created entity data and raises on error.

```python
result = client.Isotope().create({
    "element_id": "example_element_id",  # str
    "id": "example_id",  # str
    "mass": 1,  # float
    "mass_number": 1,  # int
    "name": "example_name",  # str
    "stable": True,  # bool
})
```

#### `list(reqmatch=None, ctrl=None) -> list`

List entities matching the given criteria. The match is optional — call `list()` with no argument to list all records. Returns a list and raises on error.

```python
results = client.Isotope().list({"element_id": "example"})
for isotope in results:
    print(isotope)
```

#### `load(reqmatch, ctrl=None) -> dict`

Load a single entity matching the given criteria. Returns the entity data and raises on error.

```python
result = client.Isotope().load({"id": "isotope_id", "element_id": "element_id"})
```

#### `remove(reqmatch, ctrl=None) -> dict`

Remove the entity matching the given criteria. Raises on error.

```python
result = client.Isotope().remove({"id": "isotope_id", "element_id": "element_id"})
```

#### `update(reqdata, ctrl=None) -> dict`

Update an existing entity. The data must include the entity `id`. Returns the updated entity data and raises on error.

```python
result = client.Isotope().update({
    "id": "isotope_id",
    "element_id": "element_id",
    # Fields to update
})
```

### Common Methods

#### `data_get() -> dict`

Get the entity data.

#### `data_set(data)`

Set the entity data.

#### `match_get() -> dict`

Get the entity match criteria.

#### `match_set(match)`

Set the entity match criteria.

#### `make() -> Entity`

Create a new `IsotopeEntity` instance with the same options.

#### `get_name() -> str`

Return the entity name.


---

## SeriesEntity

```python
series = client.Series()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `color` | `str` | Yes | Display color used by the element card renderer. |
| `description` | `str` | Yes | One-line description of the series. |
| `id` | `str` | Yes | Series identifier. |
| `name` | `str` | Yes | Series name. |

### Operations

#### `list(reqmatch=None, ctrl=None) -> list`

List entities matching the given criteria. The match is optional — call `list()` with no argument to list all records. Returns a list and raises on error.

```python
results = client.Series().list()
for series in results:
    print(series)
```

#### `load(reqmatch, ctrl=None) -> dict`

Load a single entity matching the given criteria. Returns the entity data and raises on error.

```python
result = client.Series().load({"id": "series_id"})
```

### Common Methods

#### `data_get() -> dict`

Get the entity data.

#### `data_set(data)`

Set the entity data.

#### `match_get() -> dict`

Get the entity match criteria.

#### `match_set(match)`

Set the entity match criteria.

#### `make() -> Entity`

Create a new `SeriesEntity` instance with the same options.

#### `get_name() -> str`

Return the entity name.


---

## Features

| Feature | Version | Description |
| --- | --- | --- |
| `elementcard` | 0.1.0 | ASCII periodic-table tile for element-shaped results |
| `retry` | 0.0.1 | Automatic retry of transient failures with exponential backoff |
| `secrets` | 0.1.0 | Secret access: resolve the API credential through a provider chain, and exchange a refresh token for short-lived access tokens |
| `test` | 0.0.1 | In-memory mock transport for testing without a live server |
| `timeout` | 0.0.1 | Per-request timeout with transport abort |


Features are activated via the `feature` option:

```python
client = ElementdemoSDK({
    "feature": {
        "elementcard": {"active": True},
        "retry": {"active": True},
        "secrets": {"active": True},
        "test": {"active": True},
        "timeout": {"active": True},
    },
})
```


### Configuring features

Each feature is inactive until switched on, and an SDK with no feature
configured does no feature work at all. Every option below keeps its default
unless you name it.

The array form of \`feature\` is significant: several features wrap the
transport, and the order you list them in is the order they nest.

#### Ordering

`retry`, `timeout` wrap the transport. Each
wraps whatever is already installed, so **activation order is nesting order**:
a feature activated later sits OUTSIDE one activated earlier, and sees the call
first.

That decides behaviour, not just sequence: a feature that short-circuits the
call, such as a cache serving a hit, stops every feature nested inside it from
ever seeing that call.

`elementcard`, `test` attach to pipeline hooks
rather than the transport, so their order does not affect what they observe.

#### `elementcard`

ASCII periodic-table tile for element-shaped results.

**Configuration**

| Option | Default |
|---|---|
| `active` | `false` |
| `print` | `false` |

Options above are those the model carries a default for. A feature may
also accept callback options — a `sink` to receive each record, for
instance — which have no default and are covered in the full feature
reference.

**Usage**

Set `feature.elementcard.active` to true in the client options, and override any option above in the same entry. Every option keeps
its default unless you name it.

**Considerations**

- Attaches to pipeline hooks, not the transport, so activation order does
  not change what it observes.
- Inactive by default: leaving it out costs nothing at runtime.

#### `retry`

Automatic retry of transient failures with exponential backoff.

**Configuration**

| Option | Default |
|---|---|
| `active` | `false` |
| `factor` | `2` |
| `maxDelay` | `2000` |
| `minDelay` | `50` |
| `retries` | `2` |
| `statuses` | `[408, 425, 429, 500, 502, 503, 504]` |

Options above are those the model carries a default for. A feature may
also accept callback options — a `sink` to receive each record, for
instance — which have no default and are covered in the full feature
reference.

**Usage**

Set `feature.retry.active` to true in the client options, and override any option above in the same entry. Every option keeps
its default unless you name it.

**Considerations**

- Wraps the transport: its place in the activation order decides what it
  sees. See [Ordering](#ordering) above.
- Inactive by default: leaving it out costs nothing at runtime.

#### `test`

In-memory mock transport for testing without a live server.

**Configuration**

| Option | Default |
|---|---|
| `active` | `false` |

Options above are those the model carries a default for. A feature may
also accept callback options — a `sink` to receive each record, for
instance — which have no default and are covered in the full feature
reference.

**Usage**

Set `feature.test.active` to true in the client options, and override any option above in the same entry. Every option keeps
its default unless you name it.

**Considerations**

- Attaches to pipeline hooks, not the transport, so activation order does
  not change what it observes.
- Installs the BASE transport that the wrapping features wrap, so it must be
  activated before them.
- Inactive by default: leaving it out costs nothing at runtime.

#### `timeout`

Per-request timeout with transport abort.

**Configuration**

| Option | Default |
|---|---|
| `active` | `false` |
| `ms` | `30000` |

Options above are those the model carries a default for. A feature may
also accept callback options — a `sink` to receive each record, for
instance — which have no default and are covered in the full feature
reference.

**Usage**

Set `feature.timeout.active` to true in the client options, and override any option above in the same entry. Every option keeps
its default unless you name it.

**Considerations**

- Wraps the transport: its place in the activation order decides what it
  sees. See [Ordering](#ordering) above.
- Inactive by default: leaving it out costs nothing at runtime.

