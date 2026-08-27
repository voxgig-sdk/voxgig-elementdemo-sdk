# Elementdemo Golang SDK



The Golang SDK for the Elementdemo API — an entity-oriented client using standard Go conventions. No generics required; data flows as `map[string]any`.

It exposes the API as capitalised, semantic **Entities** — e.g. `client.Element(nil)` — each with the same small set of operations (`List`, `Load`, `Create`, `Update`, `Remove`) instead of raw URL paths and query strings. You call meaning, not endpoints, which keeps the cognitive load low.

> Also generated from this model: `bash`, `java`, `py`, `ts` — see
> the [top-level README](../README.md).


## Install
```bash
go get github.com/voxgig-sdk/voxgig-elementdemo-sdk/go@latest
```

The Go module proxy resolves the version from the `go/vX.Y.Z` GitHub
release tag — see [Releases](https://github.com/voxgig-sdk/voxgig-elementdemo-sdk/releases) for the available versions.

To vendor from a local checkout instead, clone this repo alongside your
project and add a `replace` directive pointing at the checked-out
`go/` directory:

```bash
go mod edit -replace github.com/voxgig-sdk/voxgig-elementdemo-sdk/go=../voxgig-elementdemo-sdk/go
```


## Tutorial: your first API call

This tutorial walks through creating a client, listing entities, and
loading a specific record.

### Quickstart

A complete program: create a client, then call the entity operations.
Each operation returns `(value, error)` — the value is the data itself
(there is no `{ok, data}` wrapper), so check `err` and use the value
directly.

```go
package main

import (
    "fmt"
    sdk "github.com/voxgig-sdk/voxgig-elementdemo-sdk/go"
)

func main() {
    client := sdk.New()

    // List element records — the value is the array of records itself.
    elements, err := client.Element(nil).List(nil, nil)
    if err != nil {
        panic(err)
    }
    for _, item := range elements.([]any) {
        fmt.Println(item)
    }

    // Load a single element — the value is the loaded record.
    element, err := client.Element(nil).Load(map[string]any{"id": "example_id"}, nil)
    if err != nil {
        panic(err)
    }
    fmt.Println(element)

    // Create a element.
    created, err := client.Element(nil).Create(map[string]any{"block": "example_block", "id": "example_id", "mass": 1, "name": "example_name", "number": 1, "period": 1, "series_id": "example_series_id", "symbol": "example_symbol"}, nil)
    if err != nil {
        panic(err)
    }
    fmt.Println(created)

    // Update a element.
    updated, err := client.Element(nil).Update(map[string]any{"id": "example_id", "block": "example_block", "charge": 1}, nil)
    if err != nil {
        panic(err)
    }
    fmt.Println(updated)

    // Remove a element.
    removed, err := client.Element(nil).Remove(map[string]any{"id": "example_id"}, nil)
    if err != nil {
        panic(err)
    }
    fmt.Println(removed)
}
```


## Error handling

Every entity operation returns `(value, error)`. Check `err` before
using the value — there is no exception to catch:

```go
isotopes, err := client.Isotope(nil).List(nil, nil)
if err != nil {
    // handle err
    return
}
_ = isotopes
```

`Direct` follows the same `(value, error)` convention:

```go
result, err := client.Direct(map[string]any{
    "path":   "/api/resource/{id}",
    "method": "GET",
    "params": map[string]any{"id": "example_id"},
})
if err != nil {
    // handle err
}
_ = result
```


## How-to guides

### Make a direct HTTP request

For endpoints not covered by entity methods:

```go
result, err := client.Direct(map[string]any{
    "path":   "/api/resource/{id}",
    "method": "GET",
    "params": map[string]any{"id": "example"},
})
if err != nil {
    panic(err)
}

if result["ok"] == true {
    fmt.Println(result["status"]) // 200
    fmt.Println(result["data"])   // response body
}
```

### Prepare a request without sending it

```go
fetchdef, err := client.Prepare(map[string]any{
    "path":   "/api/resource/{id}",
    "method": "DELETE",
    "params": map[string]any{"id": "example"},
})
if err != nil {
    panic(err)
}

fmt.Println(fetchdef["url"])
fmt.Println(fetchdef["method"])
fmt.Println(fetchdef["headers"])
```

### Use test mode

Create a mock client for unit testing — no server required:

```go
client := sdk.Test()

isotope, err := client.Isotope(nil).List(
    nil, nil,
)
if err != nil {
    panic(err)
}
fmt.Println(isotope) // the returned mock data
```

### Use a custom fetch function

Replace the HTTP transport with your own function:

```go
mockFetch := func(url string, init map[string]any) (map[string]any, error) {
    return map[string]any{
        "status":     200,
        "statusText": "OK",
        "headers":    map[string]any{},
        "json": (func() any)(func() any {
            return map[string]any{"id": "mock01"}
        }),
    }, nil
}

client := sdk.NewElementdemoSDK(map[string]any{
    "base": "http://localhost:8080",
    "system": map[string]any{
        "fetch": (func(string, map[string]any) (map[string]any, error))(mockFetch),
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
cd go && go test ./test/...
```


## Reference

### NewElementdemoSDK

```go
func NewElementdemoSDK(options map[string]any) *ElementdemoSDK
```

Creates a new SDK client.

| Option | Type | Description |
| --- | --- | --- |
| `"base"` | `string` | Base URL of the API server. |
| `"prefix"` | `string` | URL path prefix prepended to all requests. |
| `"suffix"` | `string` | URL path suffix appended to all requests. |
| `"feature"` | `map[string]any` | Feature activation flags. |
| `"extend"` | `[]any` | Additional Feature instances to load. |
| `"system"` | `map[string]any` | System overrides (e.g. custom `"fetch"` function). |

### TestSDK

```go
func TestSDK(testopts map[string]any, sdkopts map[string]any) *ElementdemoSDK
```

Creates a test-mode client with mock transport. Both arguments may be `nil`.

### ElementdemoSDK methods

| Method | Signature | Description |
| --- | --- | --- |
| `OptionsMap` | `() map[string]any` | Deep copy of current SDK options. |
| `GetUtility` | `() *Utility` | Copy of the SDK utility object. |
| `Prepare` | `(fetchargs map[string]any) (map[string]any, error)` | Build an HTTP request definition without sending. |
| `Direct` | `(fetchargs map[string]any) (map[string]any, error)` | Build and send an HTTP request. |
| `Element` | `(data map[string]any) ElementdemoEntity` | Create an Element entity instance. |
| `Group` | `(data map[string]any) ElementdemoEntity` | Create a Group entity instance. |
| `Isotope` | `(data map[string]any) ElementdemoEntity` | Create an Isotope entity instance. |
| `Series` | `(data map[string]any) ElementdemoEntity` | Create a Series entity instance. |

### Entity interface (ElementdemoEntity)

All entities implement the `ElementdemoEntity` interface.

| Method | Signature | Description |
| --- | --- | --- |
| `Load` | `(reqmatch, ctrl map[string]any) (any, error)` | Load a single entity by match criteria. |
| `List` | `(reqmatch, ctrl map[string]any) (any, error)` | List entities matching the criteria. |
| `Create` | `(reqdata, ctrl map[string]any) (any, error)` | Create a new entity. |
| `Update` | `(reqdata, ctrl map[string]any) (any, error)` | Update an existing entity. |
| `Remove` | `(reqmatch, ctrl map[string]any) (any, error)` | Remove an entity. |
| `Data` | `(args ...any) any` | Get or set entity data. |
| `Match` | `(args ...any) any` | Get or set entity match criteria. |
| `Make` | `() Entity` | Create a new instance with the same options. |
| `GetName` | `() string` | Return the entity name. |

### Result shape

Entity operations return `(value, error)`. The `value` is the
operation's data **directly** — there is no wrapper:

| Operation | `value` |
| --- | --- |
| `Load` / `Create` / `Update` / `Remove` | the entity record (`map[string]any`) |
| `List` | a `[]any` of entity records |

Check `err` first, then use the value directly (or the typed
`...Typed` variants, which return the entity's model struct and a typed
slice):

    element, err := client.Element(nil).List(map[string]any{/* fields */}, nil)
    if err != nil { /* handle */ }
    // element is the returned record

Only `Direct()` returns a response envelope — a `map[string]any` with
`"ok"`, `"status"`, `"headers"`, and `"data"` keys.

### Entities

#### Element

| Field | Description |
| --- | --- |
| `"block"` | Orbital block, one of s, p, d, f. |
| `"charge"` |  |
| `"discovered"` | Year of discovery, absent for elements known since antiquity. |
| `"group"` | Periodic table column, 1 to 18, absent for the f-block. |
| `"id"` | Element identifier, the lowercase symbol. |
| `"ion"` |  |
| `"mass"` | Standard atomic weight in daltons. |
| `"name"` | Element name. |
| `"number"` | Atomic number. |
| `"ok"` |  |
| `"period"` | Periodic table row, 1 to 7. |
| `"phase"` | Phase at standard temperature and pressure. |
| `"series_id"` | Chemical series this element belongs to. |
| `"symbol"` | Chemical symbol. |

Operations: Create, List, Load, Remove, Update.

API path: `/api/element/{element_id}/ionize`

#### Group

| Field | Description |
| --- | --- |
| `"cas"` | CAS group designation. |
| `"id"` | Group identifier, g1 to g18. |
| `"name"` | Trivial name, where one exists. |
| `"number"` | Group number, 1 to 18. |

Operations: List, Load.

API path: `/api/group`

#### Isotope

| Field | Description |
| --- | --- |
| `"abundance"` | Natural abundance as a fraction, absent for synthetic isotopes. |
| `"element_id"` | Parent element identifier. |
| `"halflife"` | Half-life, absent for stable isotopes. |
| `"id"` | Isotope identifier, symbol dash mass number. |
| `"mass"` | Isotopic mass in daltons. |
| `"mass_number"` | Total protons and neutrons. |
| `"mode"` | Primary decay mode, absent for stable isotopes. |
| `"name"` | Isotope name. |
| `"ok"` |  |
| `"product"` | Primary decay product isotope, absent for stable isotopes. |
| `"stable"` | True if the isotope is stable. |
| `"steps"` |  |

Operations: Create, List, Load, Remove, Update.

API path: `/api/element/{element_id}/isotope/{isotope_id}/decay`

#### Series

| Field | Description |
| --- | --- |
| `"color"` | Display color used by the element card renderer. |
| `"description"` | One-line description of the series. |
| `"id"` | Series identifier. |
| `"name"` | Series name. |

Operations: List, Load.

API path: `/api/series`



## Entities


### Element

Create an instance: `element := client.Element(nil)`

#### Operations

| Method | Description |
| --- | --- |
| `List(match, ctrl)` | List entities matching the criteria. |
| `Load(match, ctrl)` | Load a single entity by match criteria. |
| `Create(data, ctrl)` | Create a new entity with the given data. |
| `Update(data, ctrl)` | Update an existing entity. |
| `Remove(match, ctrl)` | Remove the matching entity. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `block` | `string` | Orbital block, one of s, p, d, f. |
| `charge` | `int` |  |
| `discovered` | `int` | Year of discovery, absent for elements known since antiquity. |
| `group` | `int` | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `string` | Element identifier, the lowercase symbol. |
| `ion` | `string` |  |
| `mass` | `float64` | Standard atomic weight in daltons. |
| `name` | `string` | Element name. |
| `number` | `int` | Atomic number. |
| `ok` | `bool` |  |
| `period` | `int` | Periodic table row, 1 to 7. |
| `phase` | `string` | Phase at standard temperature and pressure. |
| `series_id` | `string` | Chemical series this element belongs to. |
| `symbol` | `string` | Chemical symbol. |

#### Example: Load

```go
element, err := client.Element(nil).Load(map[string]any{"id": "element_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(element) // the loaded record
```

#### Example: List

```go
elements, err := client.Element(nil).List(nil, nil)
if err != nil {
    panic(err)
}
fmt.Println(elements) // the array of records
```

#### Example: Create

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


### Group

Create an instance: `group := client.Group(nil)`

#### Operations

| Method | Description |
| --- | --- |
| `List(match, ctrl)` | List entities matching the criteria. |
| `Load(match, ctrl)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `cas` | `string` | CAS group designation. |
| `id` | `string` | Group identifier, g1 to g18. |
| `name` | `string` | Trivial name, where one exists. |
| `number` | `int` | Group number, 1 to 18. |

#### Example: Load

```go
group, err := client.Group(nil).Load(map[string]any{"id": "group_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(group) // the loaded record
```

#### Example: List

```go
groups, err := client.Group(nil).List(nil, nil)
if err != nil {
    panic(err)
}
fmt.Println(groups) // the array of records
```


### Isotope

Create an instance: `isotope := client.Isotope(nil)`

#### Operations

| Method | Description |
| --- | --- |
| `List(match, ctrl)` | List entities matching the criteria. |
| `Load(match, ctrl)` | Load a single entity by match criteria. |
| `Create(data, ctrl)` | Create a new entity with the given data. |
| `Update(data, ctrl)` | Update an existing entity. |
| `Remove(match, ctrl)` | Remove the matching entity. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `abundance` | `float64` | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | `string` | Parent element identifier. |
| `halflife` | `string` | Half-life, absent for stable isotopes. |
| `id` | `string` | Isotope identifier, symbol dash mass number. |
| `mass` | `float64` | Isotopic mass in daltons. |
| `mass_number` | `int` | Total protons and neutrons. |
| `mode` | `string` | Primary decay mode, absent for stable isotopes. |
| `name` | `string` | Isotope name. |
| `ok` | `bool` |  |
| `product` | `string` | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `bool` | True if the isotope is stable. |
| `steps` | `int` |  |

#### Example: Load

```go
isotope, err := client.Isotope(nil).Load(map[string]any{"id": "isotope_id", "element_id": "element_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(isotope) // the loaded record
```

#### Example: List

```go
isotopes, err := client.Isotope(nil).List(nil, nil)
if err != nil {
    panic(err)
}
fmt.Println(isotopes) // the array of records
```

#### Example: Create

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


### Series

Create an instance: `series := client.Series(nil)`

#### Operations

| Method | Description |
| --- | --- |
| `List(match, ctrl)` | List entities matching the criteria. |
| `Load(match, ctrl)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `color` | `string` | Display color used by the element card renderer. |
| `description` | `string` | One-line description of the series. |
| `id` | `string` | Series identifier. |
| `name` | `string` | Series name. |

#### Example: Load

```go
series, err := client.Series(nil).Load(map[string]any{"id": "series_id"}, nil)
if err != nil {
    panic(err)
}
fmt.Println(series) // the loaded record
```

#### Example: List

```go
seriess, err := client.Series(nil).List(nil, nil)
if err != nil {
    panic(err)
}
fmt.Println(seriess) // the array of records
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

Features are the extension mechanism. A feature implements the
`Feature` interface and provides hooks — functions keyed by pipeline
stage names.

The SDK ships with built-in features:

- **ElementcardFeature**: ASCII periodic-table tile for element-shaped results
- **RetryFeature**: Automatic retry of transient failures with exponential backoff
- **TestFeature**: In-memory mock transport for testing without a live server
- **TimeoutFeature**: Per-request timeout with transport abort

Features are initialized in order. Hooks fire in the order features
were added, so later features can override earlier ones.

### Data as maps

The Go SDK uses `map[string]any` throughout rather than typed structs.
This mirrors the dynamic nature of the API and keeps the SDK
flexible — no code generation is needed when the API schema changes.

Use `core.ToMapAny()` to safely cast results and nested data.

### Package structure

```
github.com/voxgig-sdk/voxgig-elementdemo-sdk/go/
├── elementdemo.go        # Root package — type aliases and constructors
├── core/               # SDK core — client, types, pipeline
├── entity/             # Entity implementations
├── feature/            # Built-in features (Base, Test, Log)
├── utility/            # Utility functions and struct library
└── test/               # Test suites
```

The root package (`github.com/voxgig-sdk/voxgig-elementdemo-sdk/go`) re-exports everything needed
for normal use. Import sub-packages only when you need specific types
like `core.ToMapAny`.

### Entity state

Entity instances are stateful. After a successful `List`, the entity
stores the returned data and match criteria internally.

```go
isotope := client.Isotope(nil)
isotope.List(nil, nil)

// isotope.Data() now returns the isotope data from the last list
// isotope.Match() returns the last match criteria
```

Call `Make()` to create a fresh instance with the same configuration
but no stored state.

### Direct vs entity access

The entity interface handles URL construction, parameter placement,
and response parsing automatically. Use it for standard CRUD operations.

`Direct()` gives full control over the HTTP request. Use it for
non-standard endpoints, bulk operations, or any path not modelled as
an entity. `Prepare()` builds the request without sending it — useful
for debugging or custom transport.


## Full Reference

See [REFERENCE.md](REFERENCE.md) for complete API reference
documentation including all method signatures, entity field schemas,
and detailed usage examples.
