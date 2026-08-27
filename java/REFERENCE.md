# Elementdemo Java SDK Reference

Complete API reference for the Elementdemo Java SDK.


## ElementdemoSDK

### Constructor

```java
ElementdemoSDK client = new ElementdemoSDK(options);
```

Create a new SDK client instance. `options` is a `Map<String, Object>`.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `options` | `Map` | SDK configuration options. |
| `options["base"]` | `String` | Base URL for API requests. |
| `options["prefix"]` | `String` | URL prefix appended after base. |
| `options["suffix"]` | `String` | URL suffix appended after path. |
| `options["headers"]` | `Map` | Custom headers for all requests. |
| `options["feature"]` | `Map` | Feature configuration. |
| `options["system"]` | `Map` | System overrides (e.g. custom fetch). |


### Static Methods

#### `ElementdemoSDK.testSDK(testopts, sdkopts)`

Create a test client with mock features active. Both arguments may be `null`.

```java
ElementdemoSDK client = ElementdemoSDK.testSDK(null, null);
```


### Instance Methods

#### `element(entopts)`

Create a new `Element` entity instance (returns `SdkEntity`). Pass
`null` for no initial options.

#### `group(entopts)`

Create a new `Group` entity instance (returns `SdkEntity`). Pass
`null` for no initial options.

#### `isotope(entopts)`

Create a new `Isotope` entity instance (returns `SdkEntity`). Pass
`null` for no initial options.

#### `series(entopts)`

Create a new `Series` entity instance (returns `SdkEntity`). Pass
`null` for no initial options.

#### `optionsMap() -> Map`

Return a deep copy of the current SDK options.

#### `getUtility() -> Utility`

Return a copy of the SDK utility object.

#### `direct(fetchargs) -> Map`

Make a direct HTTP request to any API endpoint. Returns a result
`Map<String, Object>` with `ok`, `status`, `headers`, and `data` (or
`err` on failure). This escape hatch never raises — branch on
`result.get("ok")`.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `fetchargs["path"]` | `String` | URL path with optional `{param}` placeholders. |
| `fetchargs["method"]` | `String` | HTTP method (default: `"GET"`). |
| `fetchargs["params"]` | `Map` | Path parameter values. |
| `fetchargs["query"]` | `Map` | Query string parameters. |
| `fetchargs["headers"]` | `Map` | Request headers (merged with defaults). |
| `fetchargs["body"]` | `Object` | Request body (maps are JSON-serialized). |

**Returns:** `Map<String, Object>`

#### `prepare(fetchargs) -> Map`

Prepare a fetch definition without sending. Returns the `fetchdef` and raises on error.


---

## Element

```java
SdkEntity element = client.element(null);
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `block` | `String` | Yes | Orbital block, one of s, p, d, f. |
| `charge` | `Long` | No |  |
| `discovered` | `Long` | No | Year of discovery, absent for elements known since antiquity. |
| `group` | `Long` | No | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `String` | Yes | Element identifier, the lowercase symbol. |
| `ion` | `String` | No |  |
| `mass` | `Double` | Yes | Standard atomic weight in daltons. |
| `name` | `String` | Yes | Element name. |
| `number` | `Long` | Yes | Atomic number. |
| `ok` | `Boolean` | No |  |
| `period` | `Long` | Yes | Periodic table row, 1 to 7. |
| `phase` | `String` | No | Phase at standard temperature and pressure. |
| `series_id` | `String` | Yes | Chemical series this element belongs to. |
| `symbol` | `String` | Yes | Chemical symbol. |

### Operations

#### `create(reqdata, ctrl) -> Object`

Create a new entity with the given data. Returns the created entity data and raises on error.

```java
Object result = client.element(null).create(Map.of(
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

#### `list(reqmatch, ctrl) -> Object`

List entities matching the given criteria. The match is optional — call `list(null, null)` to list all records. Returns an aggregate list and raises on error.

```java
Object results = client.element(null).list(null, null);
System.out.println(results);
```

#### `load(reqmatch, ctrl) -> Object`

Load a single entity matching the given criteria. Returns the entity data and raises on error.

```java
Object result = client.element(null).load(Map.of("id", "element_id"), null);
```

#### `remove(reqmatch, ctrl) -> Object`

Remove the entity matching the given criteria. Raises on error.

```java
Object result = client.element(null).remove(Map.of("id", "element_id"), null);
```

#### `update(reqdata, ctrl) -> Object`

Update an existing entity. The data must include the entity `id`. Returns the updated entity data and raises on error.

```java
Object result = client.element(null).update(Map.of(
    "id", "element_id"
), null);
```

### Common Methods

#### `data(newdata...) -> Object`

Get or set the entity data.

#### `match(newmatch...) -> Object`

Get or set the entity match criteria.

#### `make() -> Entity`

Create a new `Element` entity instance with the same options.

#### `getName() -> String`

Return the entity name.


---

## Group

```java
SdkEntity group = client.group(null);
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cas` | `String` | Yes | CAS group designation. |
| `id` | `String` | Yes | Group identifier, g1 to g18. |
| `name` | `String` | No | Trivial name, where one exists. |
| `number` | `Long` | Yes | Group number, 1 to 18. |

### Operations

#### `list(reqmatch, ctrl) -> Object`

List entities matching the given criteria. The match is optional — call `list(null, null)` to list all records. Returns an aggregate list and raises on error.

```java
Object results = client.group(null).list(null, null);
System.out.println(results);
```

#### `load(reqmatch, ctrl) -> Object`

Load a single entity matching the given criteria. Returns the entity data and raises on error.

```java
Object result = client.group(null).load(Map.of("id", "group_id"), null);
```

### Common Methods

#### `data(newdata...) -> Object`

Get or set the entity data.

#### `match(newmatch...) -> Object`

Get or set the entity match criteria.

#### `make() -> Entity`

Create a new `Group` entity instance with the same options.

#### `getName() -> String`

Return the entity name.


---

## Isotope

```java
SdkEntity isotope = client.isotope(null);
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `abundance` | `Double` | No | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | `String` | Yes | Parent element identifier. |
| `halflife` | `String` | No | Half-life, absent for stable isotopes. |
| `id` | `String` | Yes | Isotope identifier, symbol dash mass number. |
| `mass` | `Double` | Yes | Isotopic mass in daltons. |
| `mass_number` | `Long` | Yes | Total protons and neutrons. |
| `mode` | `String` | No | Primary decay mode, absent for stable isotopes. |
| `name` | `String` | Yes | Isotope name. |
| `ok` | `Boolean` | No |  |
| `product` | `String` | No | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `Boolean` | Yes | True if the isotope is stable. |
| `steps` | `Long` | No |  |

### Operations

#### `create(reqdata, ctrl) -> Object`

Create a new entity with the given data. Returns the created entity data and raises on error.

```java
Object result = client.isotope(null).create(Map.of(
    "element_id", "example_element_id",  // String
    "id", "example_id",  // String
    "mass", 1.0,  // Double
    "mass_number", 1L,  // Long
    "name", "example_name",  // String
    "stable", true  // Boolean
), null);
```

#### `list(reqmatch, ctrl) -> Object`

List entities matching the given criteria. The match is optional — call `list(null, null)` to list all records. Returns an aggregate list and raises on error.

```java
Object results = client.isotope(null).list(null, null);
System.out.println(results);
```

#### `load(reqmatch, ctrl) -> Object`

Load a single entity matching the given criteria. Returns the entity data and raises on error.

```java
Object result = client.isotope(null).load(Map.of("id", "isotope_id", "element_id", "element_id"), null);
```

#### `remove(reqmatch, ctrl) -> Object`

Remove the entity matching the given criteria. Raises on error.

```java
Object result = client.isotope(null).remove(Map.of("id", "isotope_id", "element_id", "element_id"), null);
```

#### `update(reqdata, ctrl) -> Object`

Update an existing entity. The data must include the entity `id`. Returns the updated entity data and raises on error.

```java
Object result = client.isotope(null).update(Map.of(
    "id", "isotope_id",
    "element_id", "element_id"
), null);
```

### Common Methods

#### `data(newdata...) -> Object`

Get or set the entity data.

#### `match(newmatch...) -> Object`

Get or set the entity match criteria.

#### `make() -> Entity`

Create a new `Isotope` entity instance with the same options.

#### `getName() -> String`

Return the entity name.


---

## Series

```java
SdkEntity series = client.series(null);
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `color` | `String` | Yes | Display color used by the element card renderer. |
| `description` | `String` | Yes | One-line description of the series. |
| `id` | `String` | Yes | Series identifier. |
| `name` | `String` | Yes | Series name. |

### Operations

#### `list(reqmatch, ctrl) -> Object`

List entities matching the given criteria. The match is optional — call `list(null, null)` to list all records. Returns an aggregate list and raises on error.

```java
Object results = client.series(null).list(null, null);
System.out.println(results);
```

#### `load(reqmatch, ctrl) -> Object`

Load a single entity matching the given criteria. Returns the entity data and raises on error.

```java
Object result = client.series(null).load(Map.of("id", "series_id"), null);
```

### Common Methods

#### `data(newdata...) -> Object`

Get or set the entity data.

#### `match(newmatch...) -> Object`

Get or set the entity match criteria.

#### `make() -> Entity`

Create a new `Series` entity instance with the same options.

#### `getName() -> String`

Return the entity name.


---

## Features

| Feature | Version | Description |
| --- | --- | --- |
| `elementcard` | 0.1.0 | ASCII periodic-table tile for element-shaped results |
| `retry` | 0.0.1 | Automatic retry of transient failures with exponential backoff |
| `test` | 0.0.1 | In-memory mock transport for testing without a live server |
| `timeout` | 0.0.1 | Per-request timeout with transport abort |


Features are activated via the `feature` option:

```java
Map<String, Object> feature = new java.util.LinkedHashMap<>();
feature.put("elementcard", Map.of("active", true));
feature.put("retry", Map.of("active", true));
feature.put("test", Map.of("active", true));
feature.put("timeout", Map.of("active", true));
Map<String, Object> options = new java.util.LinkedHashMap<>();
options.put("feature", feature);
ElementdemoSDK client = new ElementdemoSDK(options);
```

