# Elementdemo Java SDK



The Java SDK for the Elementdemo API — an entity-oriented client following idiomatic Java conventions.

The SDK exposes the API as capitalised, semantic **Entities** — for example `client.element(null)` — each
carrying a small, uniform set of operations (`list`, `load`, `create`, `update`, `remove`) instead of raw URL
paths and query strings. You work with named resources and verbs, which
keeps the cognitive load low.

> Other languages, the CLI, and MCP server live alongside this one — see
> the [top-level README](../README.md).


## Install
This package is not yet published to Maven Central. Install it from the GitHub
release tag (`java/vX.Y.Z`, see [Releases](https://github.com/voxgig-sdk/voxgig-elementdemo-sdk/releases)) or
from a source checkout — build the library with Maven:

```bash
cd java && mvn install
```


## Tutorial: your first API call

This tutorial walks through creating a client, listing entities, and
loading a specific record.

### 1. Create a client

```java
import voxgig.elementdemosdk.core.ElementdemoSDK;

ElementdemoSDK client = new ElementdemoSDK();
```

### 2. List element records

`list(null, null)` returns an aggregate list of records (as `Object`, an
aggregate list) and raises on error.

```java
try {
    Object elementList = client.element(null).list(null, null);
    System.out.println(elementList);
}
catch (RuntimeException err) {
    System.out.println("list failed: " + err.getMessage());
}
```

### 3. Load an isotope

Isotope is nested under element, so provide the `element_id`.
`load()` returns the ENTITY — call data() for the record — and raises on error.

```java
try {
    Object isotope = client.isotope(null).load(Map.of("element_id", "example_element_id", "id", "example_id"), null);
    System.out.println(isotope);
}
catch (RuntimeException err) {
    System.out.println("load failed: " + err.getMessage());
}
```

### 4. Create, update, and remove

```java
// Create — returns the ENTITY (call data() for the record)
Object created = client.element(null).create(Map.of("block", "example_block", "id", "example_id", "mass", 1.0, "name", "example_name", "number", 1L, "period", 1L, "series_id", "example_series_id", "symbol", "example_symbol"), null);

// Update — supply the id in the match/data
client.element(null).update(Map.of("id", "example_id", "block", "example_block", "charge", 1L), null);

// Remove
client.element(null).remove(Map.of("id", "example_id"), null);
```


## Error handling

Entity operations reject on failure, so wrap them in `try` / `catch`:

```ts
try {
  const isotopes = await client.Isotope().list()
  console.log(isotopes)
} catch (err) {
  console.error('list failed:', err)
}
```

The low-level `direct()` method does **not** throw — it returns the
value or an `Error`, so check the result before using it:

```ts
const result = await client.direct({
  path: '/api/resource/{id}',
  method: 'GET',
  params: { id: 'example_id' },
})

if (result instanceof Error) {
  throw result
}
```


## How-to guides

### Make a direct HTTP request

For endpoints not covered by entity methods:

```java
Map<String, Object> result = client.direct(Map.of(
    "path", "/api/resource/{id}",
    "method", "GET",
    "params", Map.of("id", "example")));

if (Boolean.TRUE.equals(result.get("ok"))) {
    System.out.println(result.get("status"));  // 200
    System.out.println(result.get("data"));    // response body
}
else {
    // A non-2xx response carries status + data (the error body); a
    // transport-level failure carries err instead. Only one is present, so
    // read both — an absent key simply reads as null.
    System.out.println(result.get("status") + " " + result.get("err"));
}
```

### Prepare a request without sending it

```java
// prepare() returns the fetch definition and raises on error.
Map<String, Object> fetchdef = client.prepare(Map.of(
    "path", "/api/resource/{id}",
    "method", "DELETE",
    "params", Map.of("id", "example")));

System.out.println(fetchdef.get("url"));
System.out.println(fetchdef.get("method"));
System.out.println(fetchdef.get("headers"));
```

### Use test mode

Create a mock client for unit testing — no server required:

```java
ElementdemoSDK client = ElementdemoSDK.testSDK(null, null);

// Entity ops return the ENTITY and raises on error;
// call data() for the record.
Object isotope = client.isotope(null).list(null, null);
// isotope holds the mock response record
System.out.println(isotope);
```

### Use a custom fetch function

Replace the HTTP transport with your own `BiFunction`:

```java
java.util.function.BiFunction<String, Map<String, Object>, Object> mockFetch =
    (url, init) -> {
        Map<String, Object> res = new java.util.LinkedHashMap<>();
        res.put("status", 200);
        res.put("statusText", "OK");
        res.put("headers", new java.util.LinkedHashMap<String, Object>());
        res.put("json", (java.util.function.Supplier<Object>) () ->
            Map.of("id", "mock01"));
        return res;
    };

Map<String, Object> options = new java.util.LinkedHashMap<>();
options.put("base", "http://localhost:8080");
options.put("system", Map.of("fetch", mockFetch));
ElementdemoSDK client = new ElementdemoSDK(options);
```

### Run live tests

Create a `.env.local` file at the project root:

```
ELEMENTDEMO_TEST_LIVE=TRUE
```

Then run:

```bash
cd java && mvn test
```


## Reference

### ElementdemoSDK

```java
ElementdemoSDK client = new ElementdemoSDK(options);
```

Creates a new SDK client. `options` is a `Map<String, Object>`.

| Option | Type | Description |
| --- | --- | --- |
| `base` | `String` | Base URL of the API server. |
| `prefix` | `String` | URL path prefix prepended to all requests. |
| `suffix` | `String` | URL path suffix appended to all requests. |
| `feature` | `Map` | Feature activation flags. |
| `extend` | `List` | Additional Feature instances to load. |
| `system` | `Map` | System overrides (e.g. custom `fetch` function). |

### testSDK

```java
ElementdemoSDK client = ElementdemoSDK.testSDK(testopts, sdkopts);
```

Creates a test-mode client with mock transport. Both arguments may be `null`.

### ElementdemoSDK methods

| Method | Signature | Description |
| --- | --- | --- |
| `optionsMap` | `() -> Map` | Deep copy of current SDK options. |
| `getUtility` | `() -> Utility` | Copy of the SDK utility object. |
| `prepare` | `(fetchargs) -> Map` | Build an HTTP request definition without sending. Raises on error. |
| `direct` | `(fetchargs) -> Map` | Build and send an HTTP request. Returns a result map (branch on `ok`). |
| `element` | `(entopts) -> SdkEntity` | Create an Element entity instance. |
| `group` | `(entopts) -> SdkEntity` | Create a Group entity instance. |
| `isotope` | `(entopts) -> SdkEntity` | Create an Isotope entity instance. |
| `series` | `(entopts) -> SdkEntity` | Create a Series entity instance. |

### Entity interface

All entities share the same interface.

| Method | Signature | Description |
| --- | --- | --- |
| `load` | `(reqmatch, ctrl) -> Object` | Load a single entity by match criteria. Raises on error. |
| `list` | `(reqmatch, ctrl) -> Object` | List entities matching the criteria (an aggregate list). Raises on error. |
| `create` | `(reqdata, ctrl) -> Object` | Create a new entity. Raises on error. |
| `update` | `(reqdata, ctrl) -> Object` | Update an existing entity. Raises on error. |
| `remove` | `(reqmatch, ctrl) -> Object` | Remove an entity. Raises on error. |
| `data` | `(newdata...) -> Object` | Get or set entity data. |
| `match` | `(newmatch...) -> Object` | Get or set entity match criteria. |
| `make` | `() -> Entity` | Create a new instance with the same options. |
| `getName` | `() -> String` | Return the entity name. |

### Result shape

Entity operations return the ENTITY (call data() for the record) (a `Map` for single-entity
ops, an aggregate `List` for `list`) as `Object` and raise on error. Wrap
calls in `try`/`catch` to handle failures.

The `direct()` escape hatch never raises — it returns a result
`Map<String, Object>` you branch on via `result.get("ok")`:

| Key | Type | Description |
| --- | --- | --- |
| `ok` | `Boolean` | `true` if the HTTP status is 2xx. |
| `status` | `int` | HTTP status code. |
| `headers` | `Map` | Response headers. |
| `data` | `Object` | Parsed JSON response body. |

On error, `ok` is `false` and `err` contains the error value.

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

Operations: create, list, load, remove, update.

API path: `/api/element/{element_id}/ionize`

#### Group

| Field | Description |
| --- | --- |
| `cas` | CAS group designation. |
| `id` | Group identifier, g1 to g18. |
| `name` | Trivial name, where one exists. |
| `number` | Group number, 1 to 18. |

Operations: list, load.

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

Operations: create, list, load, remove, update.

API path: `/api/element/{element_id}/isotope/{isotope_id}/decay`

#### Series

| Field | Description |
| --- | --- |
| `color` | Display color used by the element card renderer. |
| `description` | One-line description of the series. |
| `id` | Series identifier. |
| `name` | Series name. |

Operations: list, load.

API path: `/api/series`



## Entities


### Element

Create an instance: `SdkEntity element = client.element(null);`

#### Operations

| Method | Description |
| --- | --- |
| `create(data, null)` | Create a new entity with the given data. |
| `list(null, null)` | List entities, optionally matching the given criteria. |
| `load(match, null)` | Load a single entity by match criteria. |
| `remove(match, null)` | Remove the matching entity. |
| `update(data, null)` | Update an existing entity. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `block` | `String` | Orbital block, one of s, p, d, f. |
| `charge` | `Long` |  |
| `discovered` | `Long` | Year of discovery, absent for elements known since antiquity. |
| `group` | `Long` | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `String` | Element identifier, the lowercase symbol. |
| `ion` | `String` |  |
| `mass` | `Double` | Standard atomic weight in daltons. |
| `name` | `String` | Element name. |
| `number` | `Long` | Atomic number. |
| `ok` | `Boolean` |  |
| `period` | `Long` | Periodic table row, 1 to 7. |
| `phase` | `String` | Phase at standard temperature and pressure. |
| `series_id` | `String` | Chemical series this element belongs to. |
| `symbol` | `String` | Chemical symbol. |

#### Example: Load

```java
Object element = client.element(null).load(Map.of("id", "element_id"), null);
```

#### Example: List

```java
Object elementList = client.element(null).list(null, null);
```

#### Example: Create

```java
Object element = client.element(null).create(Map.of(
    "block", "example_block",  // String
    "id", "example_id",  // String
    "mass", 1.0,  // Double
    "name", "example_name",  // String
    "number", 1L,  // Long
    "period", 1L,  // Long
    "series_id", "example_series_id",  // String
    "symbol", "example_symbol"  // String
), null);
```


### Group

Create an instance: `SdkEntity group = client.group(null);`

#### Operations

| Method | Description |
| --- | --- |
| `list(null, null)` | List entities, optionally matching the given criteria. |
| `load(match, null)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `cas` | `String` | CAS group designation. |
| `id` | `String` | Group identifier, g1 to g18. |
| `name` | `String` | Trivial name, where one exists. |
| `number` | `Long` | Group number, 1 to 18. |

#### Example: Load

```java
Object group = client.group(null).load(Map.of("id", "group_id"), null);
```

#### Example: List

```java
Object groupList = client.group(null).list(null, null);
```


### Isotope

Create an instance: `SdkEntity isotope = client.isotope(null);`

#### Operations

| Method | Description |
| --- | --- |
| `create(data, null)` | Create a new entity with the given data. |
| `list(null, null)` | List entities, optionally matching the given criteria. |
| `load(match, null)` | Load a single entity by match criteria. |
| `remove(match, null)` | Remove the matching entity. |
| `update(data, null)` | Update an existing entity. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `abundance` | `Double` | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | `String` | Parent element identifier. |
| `halflife` | `String` | Half-life, absent for stable isotopes. |
| `id` | `String` | Isotope identifier, symbol dash mass number. |
| `mass` | `Double` | Isotopic mass in daltons. |
| `mass_number` | `Long` | Total protons and neutrons. |
| `mode` | `String` | Primary decay mode, absent for stable isotopes. |
| `name` | `String` | Isotope name. |
| `ok` | `Boolean` |  |
| `product` | `String` | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `Boolean` | True if the isotope is stable. |
| `steps` | `Long` |  |

#### Example: Load

```java
Object isotope = client.isotope(null).load(Map.of("id", "isotope_id", "element_id", "element_id"), null);
```

#### Example: List

```java
Object isotopeList = client.isotope(null).list(null, null);
```

#### Example: Create

```java
Object isotope = client.isotope(null).create(Map.of(
    "element_id", "example_element_id",  // String
    "id", "example_id",  // String
    "mass", 1.0,  // Double
    "mass_number", 1L,  // Long
    "name", "example_name",  // String
    "stable", true  // Boolean
), null);
```


### Series

Create an instance: `SdkEntity series = client.series(null);`

#### Operations

| Method | Description |
| --- | --- |
| `list(null, null)` | List entities, optionally matching the given criteria. |
| `load(match, null)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `color` | `String` | Display color used by the element card renderer. |
| `description` | `String` | One-line description of the series. |
| `id` | `String` | Series identifier. |
| `name` | `String` | Series name. |

#### Example: Load

```java
Object series = client.series(null).load(Map.of("id", "series_id"), null);
```

#### Example: List

```java
Object seriesList = client.series(null).list(null, null);
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

Features are the extension mechanism. A feature is an object with a
`hooks` map. Each hook key is a pipeline stage name, and the value is
a function that receives the context.

The SDK ships with built-in features:

- **ElementcardFeature**: ASCII periodic-table tile for element-shaped results
- **RetryFeature**: Automatic retry of transient failures with exponential backoff
- **TestFeature**: In-memory mock transport for testing without a live server
- **TimeoutFeature**: Per-request timeout with transport abort

Features are initialized in order. Hooks fire in the order features
were added, so later features can override earlier ones.

### Data as maps

The Java SDK uses a loose object model — `Map<String, Object>` throughout —
rather than a bespoke typed class per endpoint. This mirrors the dynamic
nature of the API and keeps the SDK flexible: no regeneration is needed when
the API schema changes.

Use `Helpers.toMapAny(value)` to safely coerce a value to a
`Map<String, Object>`. A `ElementdemoTypes.java` module of reference
`record` types is also generated for editor documentation.

### Project structure

```
java/
├── pom.xml                     -- Maven project (compiles core/, utility/, feature/, entity/)
├── core/                       -- Main SDK client, config, entity base, error type
├── entity/                     -- Entity implementations
├── feature/                    -- Built-in features (Base, Test, Log, ...)
├── utility/                    -- Utility functions and the vendored struct library
└── test/                       -- JUnit test suites
```

The main client class (`ElementdemoSDK`, package `voxgig.elementdemosdk.core`)
exposes the entity accessors. Reference entity or utility types directly only
when needed.

### Entity state

Entity instances are stateful. After a successful `list`, the entity
stores the returned data and match criteria internally. Subsequent
calls on the same instance can rely on this state.

```ts
const isotope = client.Isotope()
await isotope.list()

// isotope.data() now returns the isotope data from the last `list`
// isotope.match() returns the last match criteria
```

Call `make()` to create a fresh instance with the same configuration
but no stored state.

### Direct vs entity access

The entity interface handles URL construction, parameter placement,
and response parsing automatically. Use it for standard CRUD operations.

The `direct` method gives full control over the HTTP request. Use it
for non-standard endpoints, bulk operations, or any path not modelled
as an entity. The `prepare` method is useful for debugging — it
shows exactly what `direct` would send.


## Full Reference

See [REFERENCE.md](REFERENCE.md) for complete API reference
documentation including all method signatures, entity field schemas,
and detailed usage examples.
