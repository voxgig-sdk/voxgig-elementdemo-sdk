# Elementdemo Golang SDK Reference

Complete API reference for the Elementdemo Golang SDK.


## ElementdemoSDK

### Constructor

```go
func NewElementdemoSDK(options map[string]any) *ElementdemoSDK
```

Create a new SDK client instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `options` | `map[string]any` | SDK configuration options. |
| `options["apikey"]` | `string` | API key for authentication. |
| `options["base"]` | `string` | Base URL for API requests. |
| `options["prefix"]` | `string` | URL prefix appended after base. |
| `options["suffix"]` | `string` | URL suffix appended after path. |
| `options["headers"]` | `map[string]any` | Custom headers for all requests. |
| `options["feature"]` | `map[string]any` | Feature configuration. |
| `options["system"]` | `map[string]any` | System overrides (e.g. custom fetch). |


### Static Methods

#### `Test() *ElementdemoSDK`

No-arg convenience constructor for the common no-options test case.

```go
client := sdk.Test()
```

#### `TestSDK(testopts, sdkopts map[string]any) *ElementdemoSDK`

Test client with options. Both arguments may be `nil`.

```go
client := sdk.TestSDK(testopts, sdkopts)
```


### Instance Methods

#### `Element(data map[string]any) ElementdemoEntity`

Create a new `Element` entity instance. Pass `nil` for no initial data.

#### `Group(data map[string]any) ElementdemoEntity`

Create a new `Group` entity instance. Pass `nil` for no initial data.

#### `Isotope(data map[string]any) ElementdemoEntity`

Create a new `Isotope` entity instance. Pass `nil` for no initial data.

#### `Series(data map[string]any) ElementdemoEntity`

Create a new `Series` entity instance. Pass `nil` for no initial data.

#### `OptionsMap() map[string]any`

Return a deep copy of the current SDK options.

#### `GetUtility() *Utility`

Return a copy of the SDK utility object.

#### `Direct(fetchargs map[string]any) (map[string]any, error)`

Make a direct HTTP request to any API endpoint.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `fetchargs["path"]` | `string` | URL path with optional `{param}` placeholders. |
| `fetchargs["method"]` | `string` | HTTP method (default: `"GET"`). |
| `fetchargs["params"]` | `map[string]any` | Path parameter values for `{param}` substitution. |
| `fetchargs["query"]` | `map[string]any` | Query string parameters. |
| `fetchargs["headers"]` | `map[string]any` | Request headers (merged with defaults). |
| `fetchargs["body"]` | `any` | Request body (maps are JSON-serialized). |
| `fetchargs["ctrl"]` | `map[string]any` | Control options (e.g. `map[string]any{"explain": true}`). |

**Returns:** `(map[string]any, error)`

#### `Prepare(fetchargs map[string]any) (map[string]any, error)`

Prepare a fetch definition without sending the request. Accepts the
same parameters as `Direct()`.

**Returns:** `(map[string]any, error)`


---

## ElementEntity

```go
element := client.Element(nil)
fmt.Println(element.GetName()) // "element"
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `block` | `string` | Yes | Orbital block, one of s, p, d, f. |
| `charge` | `int` | No |  |
| `discovered` | `int` | No | Year of discovery, absent for elements known since antiquity. |
| `group` | `int` | No | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `string` | Yes | Element identifier, the lowercase symbol. |
| `ion` | `string` | No |  |
| `mass` | `float64` | Yes | Standard atomic weight in daltons. |
| `name` | `string` | Yes | Element name. |
| `number` | `int` | Yes | Atomic number. |
| `ok` | `bool` | No |  |
| `period` | `int` | Yes | Periodic table row, 1 to 7. |
| `phase` | `string` | No | Phase at standard temperature and pressure. |
| `series_id` | `string` | Yes | Chemical series this element belongs to. |
| `symbol` | `string` | Yes | Chemical symbol. |

### Operations

#### `List(reqmatch, ctrl map[string]any) (any, error)`

List entities matching the given criteria. Returns an array.

```go
results, err := client.Element(nil).List(nil, nil)
if err != nil {
    panic(err)
}
fmt.Println(results)
```

#### `Load(reqmatch, ctrl map[string]any) (any, error)`

Load a single entity matching the given criteria.

```go
result, err := client.Element(nil).Load(map[string]any{"id": "element_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

#### `Create(reqdata, ctrl map[string]any) (any, error)`

Create a new entity with the given data.

```go
result, err := client.Element(nil).Create(map[string]any{
    "block": "example_block",
    "id": "example_id",
    "mass": 1,
    "name": "example_name",
    "number": 1,
    "period": 1,
    "series_id": "example_series_id",
    "symbol": "example_symbol",
}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

#### `Update(reqdata, ctrl map[string]any) (any, error)`

Update an existing entity. The data must include the entity `id`.

```go
result, err := client.Element(nil).Update(map[string]any{
    "id": "element_id",
    // Fields to update
}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

#### `Remove(reqmatch, ctrl map[string]any) (any, error)`

Remove the entity matching the given criteria.

```go
result, err := client.Element(nil).Remove(map[string]any{"id": "element_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

### Common Methods

#### `Data(args ...any) any`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `Match(args ...any) any`

Get or set the entity match criteria. Works the same as `Data()`.

#### `Make() Entity`

Create a new `ElementEntity` instance with the same client and
options.

#### `GetName() string`

Return the entity name.


---

## GroupEntity

```go
group := client.Group(nil)
fmt.Println(group.GetName()) // "group"
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cas` | `string` | Yes | CAS group designation. |
| `id` | `string` | Yes | Group identifier, g1 to g18. |
| `name` | `string` | No | Trivial name, where one exists. |
| `number` | `int` | Yes | Group number, 1 to 18. |

### Operations

#### `List(reqmatch, ctrl map[string]any) (any, error)`

List entities matching the given criteria. Returns an array.

```go
results, err := client.Group(nil).List(nil, nil)
if err != nil {
    panic(err)
}
fmt.Println(results)
```

#### `Load(reqmatch, ctrl map[string]any) (any, error)`

Load a single entity matching the given criteria.

```go
result, err := client.Group(nil).Load(map[string]any{"id": "group_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

### Common Methods

#### `Data(args ...any) any`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `Match(args ...any) any`

Get or set the entity match criteria. Works the same as `Data()`.

#### `Make() Entity`

Create a new `GroupEntity` instance with the same client and
options.

#### `GetName() string`

Return the entity name.


---

## IsotopeEntity

```go
isotope := client.Isotope(nil)
fmt.Println(isotope.GetName()) // "isotope"
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `abundance` | `float64` | No | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | `string` | Yes | Parent element identifier. |
| `halflife` | `string` | No | Half-life, absent for stable isotopes. |
| `id` | `string` | Yes | Isotope identifier, symbol dash mass number. |
| `mass` | `float64` | Yes | Isotopic mass in daltons. |
| `mass_number` | `int` | Yes | Total protons and neutrons. |
| `mode` | `string` | No | Primary decay mode, absent for stable isotopes. |
| `name` | `string` | Yes | Isotope name. |
| `ok` | `bool` | No |  |
| `product` | `string` | No | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `bool` | Yes | True if the isotope is stable. |
| `steps` | `int` | No |  |

### Operations

#### `List(reqmatch, ctrl map[string]any) (any, error)`

List entities matching the given criteria. Returns an array.

```go
results, err := client.Isotope(nil).List(nil, nil)
if err != nil {
    panic(err)
}
fmt.Println(results)
```

#### `Load(reqmatch, ctrl map[string]any) (any, error)`

Load a single entity matching the given criteria.

```go
result, err := client.Isotope(nil).Load(map[string]any{"id": "isotope_id", "element_id": "element_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

#### `Create(reqdata, ctrl map[string]any) (any, error)`

Create a new entity with the given data.

```go
result, err := client.Isotope(nil).Create(map[string]any{
    "element_id": "example_element_id",
    "id": "example_id",
    "mass": 1,
    "mass_number": 1,
    "name": "example_name",
    "stable": true,
}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

#### `Update(reqdata, ctrl map[string]any) (any, error)`

Update an existing entity. The data must include the entity `id`.

```go
result, err := client.Isotope(nil).Update(map[string]any{
    "id": "isotope_id",
    "element_id": "element_id",
    // Fields to update
}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

#### `Remove(reqmatch, ctrl map[string]any) (any, error)`

Remove the entity matching the given criteria.

```go
result, err := client.Isotope(nil).Remove(map[string]any{"id": "isotope_id", "element_id": "element_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

### Common Methods

#### `Data(args ...any) any`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `Match(args ...any) any`

Get or set the entity match criteria. Works the same as `Data()`.

#### `Make() Entity`

Create a new `IsotopeEntity` instance with the same client and
options.

#### `GetName() string`

Return the entity name.


---

## SeriesEntity

```go
series := client.Series(nil)
fmt.Println(series.GetName()) // "series"
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `color` | `string` | Yes | Display color used by the element card renderer. |
| `description` | `string` | Yes | One-line description of the series. |
| `id` | `string` | Yes | Series identifier. |
| `name` | `string` | Yes | Series name. |

### Operations

#### `List(reqmatch, ctrl map[string]any) (any, error)`

List entities matching the given criteria. Returns an array.

```go
results, err := client.Series(nil).List(nil, nil)
if err != nil {
    panic(err)
}
fmt.Println(results)
```

#### `Load(reqmatch, ctrl map[string]any) (any, error)`

Load a single entity matching the given criteria.

```go
result, err := client.Series(nil).Load(map[string]any{"id": "series_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(result)
```

### Common Methods

#### `Data(args ...any) any`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `Match(args ...any) any`

Get or set the entity match criteria. Works the same as `Data()`.

#### `Make() Entity`

Create a new `SeriesEntity` instance with the same client and
options.

#### `GetName() string`

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

```go
client := sdk.NewElementdemoSDK(map[string]any{
    "feature": map[string]any{
        "elementcard": map[string]any{"active": true},
        "retry": map[string]any{"active": true},
        "secrets": map[string]any{"active": true},
        "test": map[string]any{"active": true},
        "timeout": map[string]any{"active": true},
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

`retry`, `secrets`, `timeout` wrap the transport. Each
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

#### `secrets`

Secret access: resolve the API credential through a provider chain, and exchange a refresh token for short-lived access tokens.

**Configuration**

| Option | Default |
|---|---|
| `active` | `false` |
| `cache` | `true` |
| `exchange` | `{active: false, method: 'POST', path: 'auth/token', refresh: '', request: 'refresh_token', response: 'access_token', retries: 1, statuses: [401]}` |
| `name` | `'apikey'` |
| `providers` | `[]` |

Options above are those the model carries a default for. A feature may
also accept callback options — a `sink` to receive each record, for
instance — which have no default and are covered in the full feature
reference.

**Usage**

Set `feature.secrets.active` to true in the client options, and override any option above in the same entry. Every option keeps
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

