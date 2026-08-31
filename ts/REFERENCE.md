# Elementdemo TypeScript SDK Reference

Complete API reference for the Elementdemo TypeScript SDK.


## ElementdemoSDK

### Constructor

```ts
new ElementdemoSDK(options?: object)
```

Create a new SDK client instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `options` | `object` | SDK configuration options. |
| `options.apikey` | `string` | API key for authentication. |
| `options.base` | `string` | Base URL for API requests. |
| `options.prefix` | `string` | URL prefix appended after base. |
| `options.suffix` | `string` | URL suffix appended after path. |
| `options.headers` | `object` | Custom headers for all requests. |
| `options.feature` | `object` | Feature configuration. |
| `options.system` | `object` | System overrides (e.g. custom fetch). |


### Static Methods

#### `ElementdemoSDK.test(testopts?, sdkopts?)`

Create a test client with mock features active.

```ts
const client = ElementdemoSDK.test()
```

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `testopts` | `object` | Test feature options. |
| `sdkopts` | `object` | Additional SDK options merged with test defaults. |

**Returns:** `ElementdemoSDK` instance in test mode.


### Instance Methods

#### `Element(data?: object)`

Create a new `Element` entity instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `data` | `object` | Initial entity data. |

**Returns:** `ElementEntity` instance.

#### `Group(data?: object)`

Create a new `Group` entity instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `data` | `object` | Initial entity data. |

**Returns:** `GroupEntity` instance.

#### `Isotope(data?: object)`

Create a new `Isotope` entity instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `data` | `object` | Initial entity data. |

**Returns:** `IsotopeEntity` instance.

#### `Series(data?: object)`

Create a new `Series` entity instance.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `data` | `object` | Initial entity data. |

**Returns:** `SeriesEntity` instance.

#### `options()`

Return a deep copy of the current SDK options.

**Returns:** `object`

#### `utility()`

Return a copy of the SDK utility object.

**Returns:** `object`

#### `direct(fetchargs?: object)`

Make a direct HTTP request to any API endpoint.

**Parameters:**

| Name | Type | Description |
| --- | --- | --- |
| `fetchargs.path` | `string` | URL path with optional `{param}` placeholders. |
| `fetchargs.method` | `string` | HTTP method (default: `GET`). |
| `fetchargs.params` | `object` | Path parameter values for `{param}` substitution. |
| `fetchargs.query` | `object` | Query string parameters. |
| `fetchargs.headers` | `object` | Request headers (merged with defaults). |
| `fetchargs.body` | `any` | Request body (objects are JSON-serialized). |
| `fetchargs.ctrl` | `object` | Control options (e.g. `{ explain: true }`). |

**Returns:** `Promise<{ ok, status, headers, data } | Error>`

#### `prepare(fetchargs?: object)`

Prepare a fetch definition without sending the request. Accepts the
same parameters as `direct()`.

**Returns:** `Promise<{ url, method, headers, body } | Error>`

#### `tester(testopts?, sdkopts?)`

Alias for `ElementdemoSDK.test()`.

**Returns:** `ElementdemoSDK` instance in test mode.


---

## ElementEntity

```ts
const element = client.Element()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `block` | `string` | Yes | Orbital block, one of s, p, d, f. |
| `charge` | `number` | No |  |
| `discovered` | `number` | No | Year of discovery, absent for elements known since antiquity. |
| `group` | `number` | No | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `string` | Yes | Element identifier, the lowercase symbol. |
| `ion` | `string` | No |  |
| `mass` | `number` | Yes | Standard atomic weight in daltons. |
| `name` | `string` | Yes | Element name. |
| `number` | `number` | Yes | Atomic number. |
| `ok` | `boolean` | No |  |
| `period` | `number` | Yes | Periodic table row, 1 to 7. |
| `phase` | `string` | No | Phase at standard temperature and pressure. |
| `series_id` | `string` | Yes | Chemical series this element belongs to. |
| `symbol` | `string` | Yes | Chemical symbol. |

### Actions

This entity exposes custom API actions in addition to the standard
operations. Select one with `$action` in the call's argument; the
remaining keys are sent as that action's payload.

| Action | Route | Call |
| --- | --- | --- |
| `ionize` | `/element/{element_id}/ionize` | `client.Element().create({ $action: 'ionize', ... })` |

An action returns that action's OWN response, which is not necessarily a
Element record — check the API definition for its shape.

```ts
const result = await client.Element().create({
  $action: 'ionize',
  /* ...the action's own arguments */
})
```

### Operations

#### `create(data: object, ctrl?: object)`

Create a new entity with the given data.

```ts
const result = await client.Element().create({
  block: 'example_block',
  id: 'example_id',
  mass: 1,
  name: 'example_name',
  number: 1,
  period: 1,
  series_id: 'example_series_id',
  symbol: 'example_symbol',
})
```

#### `list(match: object, ctrl?: object)`

List entities matching the given criteria. Returns an array.

```ts
const results = await client.Element().list()
```

#### `load(match: object, ctrl?: object)`

Load a single entity matching the given criteria.

```ts
const result = await client.Element().load({ id: 'element_id' })
```

#### `remove(match: object, ctrl?: object)`

Remove the entity matching the given criteria.

```ts
const result = await client.Element().remove({ id: 'element_id' })
```

#### `update(data: object, ctrl?: object)`

Update an existing entity. The data must include the entity `id`.

```ts
const result = await client.Element().update({
  id: 'element_id',
  // Fields to update
})
```

### Common Methods

#### `data(data?: object)`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `match(match?: object)`

Get or set the entity match criteria. Works the same as `data()`.

#### `make()`

Create a new `ElementEntity` instance with the same client and
options.

#### `client()`

Return the parent `ElementdemoSDK` instance.

#### `entopts()`

Return a copy of the entity options.


---

## GroupEntity

```ts
const group = client.Group()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cas` | `string` | Yes | CAS group designation. |
| `id` | `string` | Yes | Group identifier, g1 to g18. |
| `name` | `string` | No | Trivial name, where one exists. |
| `number` | `number` | Yes | Group number, 1 to 18. |

### Operations

#### `list(match: object, ctrl?: object)`

List entities matching the given criteria. Returns an array.

```ts
const results = await client.Group().list()
```

#### `load(match: object, ctrl?: object)`

Load a single entity matching the given criteria.

```ts
const result = await client.Group().load({ id: 'group_id' })
```

### Common Methods

#### `data(data?: object)`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `match(match?: object)`

Get or set the entity match criteria. Works the same as `data()`.

#### `make()`

Create a new `GroupEntity` instance with the same client and
options.

#### `client()`

Return the parent `ElementdemoSDK` instance.

#### `entopts()`

Return a copy of the entity options.


---

## IsotopeEntity

```ts
const isotope = client.Isotope()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `abundance` | `number` | No | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | `string` | Yes | Parent element identifier. |
| `halflife` | `string` | No | Half-life, absent for stable isotopes. |
| `id` | `string` | Yes | Isotope identifier, symbol dash mass number. |
| `mass` | `number` | Yes | Isotopic mass in daltons. |
| `mass_number` | `number` | Yes | Total protons and neutrons. |
| `mode` | `string` | No | Primary decay mode, absent for stable isotopes. |
| `name` | `string` | Yes | Isotope name. |
| `ok` | `boolean` | No |  |
| `product` | `string` | No | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `boolean` | Yes | True if the isotope is stable. |
| `steps` | `number` | No |  |

### Actions

This entity exposes custom API actions in addition to the standard
operations. Select one with `$action` in the call's argument; the
remaining keys are sent as that action's payload.

| Action | Route | Call |
| --- | --- | --- |
| `decay` | `/element/{element_id}/isotope/{isotope_id}/decay` | `client.Isotope().create({ $action: 'decay', ... })` |

An action returns that action's OWN response, which is not necessarily a
Isotope record — check the API definition for its shape.

```ts
const result = await client.Isotope().create({
  $action: 'decay',
  /* ...the action's own arguments */
})
```

### Operations

#### `create(data: object, ctrl?: object)`

Create a new entity with the given data.

```ts
const result = await client.Isotope().create({
  element_id: 'example_element_id',
  id: 'example_id',
  mass: 1,
  mass_number: 1,
  name: 'example_name',
  stable: true,
})
```

#### `list(match: object, ctrl?: object)`

List entities matching the given criteria. Returns an array.

```ts
const results = await client.Isotope().list({ element_id: "example" })
```

#### `load(match: object, ctrl?: object)`

Load a single entity matching the given criteria.

```ts
const result = await client.Isotope().load({ id: 'isotope_id', element_id: 'element_id' })
```

#### `remove(match: object, ctrl?: object)`

Remove the entity matching the given criteria.

```ts
const result = await client.Isotope().remove({ id: 'isotope_id', element_id: 'element_id' })
```

#### `update(data: object, ctrl?: object)`

Update an existing entity. The data must include the entity `id`.

```ts
const result = await client.Isotope().update({
  id: 'isotope_id',
  element_id: 'element_id',
  // Fields to update
})
```

### Common Methods

#### `data(data?: object)`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `match(match?: object)`

Get or set the entity match criteria. Works the same as `data()`.

#### `make()`

Create a new `IsotopeEntity` instance with the same client and
options.

#### `client()`

Return the parent `ElementdemoSDK` instance.

#### `entopts()`

Return a copy of the entity options.


---

## SeriesEntity

```ts
const series = client.Series()
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `color` | `string` | Yes | Display color used by the element card renderer. |
| `description` | `string` | Yes | One-line description of the series. |
| `id` | `string` | Yes | Series identifier. |
| `name` | `string` | Yes | Series name. |

### Operations

#### `list(match: object, ctrl?: object)`

List entities matching the given criteria. Returns an array.

```ts
const results = await client.Series().list()
```

#### `load(match: object, ctrl?: object)`

Load a single entity matching the given criteria.

```ts
const result = await client.Series().load({ id: 'series_id' })
```

### Common Methods

#### `data(data?: object)`

Get or set the entity data. When called with data, sets the entity's
internal data and returns the current data. When called without
arguments, returns a copy of the current data.

#### `match(match?: object)`

Get or set the entity match criteria. Works the same as `data()`.

#### `make()`

Create a new `SeriesEntity` instance with the same client and
options.

#### `client()`

Return the parent `ElementdemoSDK` instance.

#### `entopts()`

Return a copy of the entity options.


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

```ts
const client = new ElementdemoSDK({
  feature: {
    elementcard: { active: true },
    retry: { active: true },
    secrets: { active: true },
    test: { active: true },
    timeout: { active: true },
  }
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

