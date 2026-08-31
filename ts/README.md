# Elementdemo TypeScript SDK



The TypeScript SDK for the Elementdemo API — a type-safe, entity-oriented client with full async/await support.

The API is exposed as capitalised, semantic **Entities** — e.g.
`client.Element()` — each with a small set of operations (`list`, `load`, `create`, `update`, `remove`)
instead of raw URL paths and query parameters. This keeps the surface
predictable and low-friction for both humans and AI agents.

> Also generated from this model: `bash`, `go`, `java`, `py` — see
> the [top-level README](../README.md).


## Install
This package is not yet published to npm. Install it from the GitHub
release tag (`ts/vX.Y.Z`):

- Releases: [https://github.com/voxgig-sdk/voxgig-elementdemo-sdk/releases](https://github.com/voxgig-sdk/voxgig-elementdemo-sdk/releases)


## Tutorial: your first API call

This tutorial walks through creating a client, listing entities, and
loading a specific record.

### 1. Create a client

```ts
import { ElementdemoSDK } from '@voxgig-sdk/elementdemo'

const client = new ElementdemoSDK({
  apikey: process.env.ELEMENTDEMO_APIKEY,
  // Required: this API's server URL is templated on these.
  server: {
    account_id: '<account_id>',
  },
})
```

### 2. List element records

`list()` resolves to an array of Element ENTITIES — every operation
resolves to entities, not raw records. Iterate them directly, and call
`.data()` on one for the record it holds:

```ts
const elements = await client.Element().list()

for (const element of elements) {
  console.log(element)
}
```

### 3. Load an isotope

Isotope is nested under element, so provide the `element_id`.
`load()` returns the entity directly and throws on failure:

```ts
try {
  const isotope = await client.Isotope().load({
    element_id: 'example_element_id',
    id: 'example_id',
  })
  console.log(isotope)
} catch (err) {
  console.error('load failed:', err)
}
```

### 4. Create, update, and remove

```ts
// Create — returns the created Element ENTITY (.data() for the record)
const created = await client.Element().create({
  block: 'example_block',
  id: 'example_id',
  mass: 1,
  name: 'example_name',
  number: 1,
  period: 1,
  series_id: 'example_series_id',
  symbol: 'example_symbol',
})

// Update — the id comes off the returned entity's data()
const updated = await client.Element().update({
  id: created.data().id!,
  block: 'example_block',
  charge: 1,
})

// Remove
await client.Element().remove({
  id: created.data().id!,
})
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

```ts
const result = await client.direct({
  path: '/api/resource/{id}',
  method: 'GET',
  params: { id: 'example' },
})

if (result instanceof Error) {
  throw result
}
if (result.ok) {
  console.log(result.status)  // 200
  console.log(result.data)    // response body
}
```

### Prepare a request without sending it

```ts
const fetchdef = await client.prepare({
  path: '/api/resource/{id}',
  method: 'DELETE',
  params: { id: 'example' },
})

// Inspect before sending
console.log(fetchdef.url)
console.log(fetchdef.method)
console.log(fetchdef.headers)
```

### Use test mode

Create a mock client for unit testing — no server required:

```ts
const client = ElementdemoSDK.test()

const isotope = await client.Isotope().list()
// isotope is the entity, populated with mock response data
// — call isotope.data() for the record itself
console.log(isotope)
```

You can also use the instance method:

```ts
const client = new ElementdemoSDK({ apikey: '...' })
const testClient = client.tester()
```

### Retain entity state across calls

Entity instances remember their last match and data:

```ts
const entity = client.Isotope()

// First call runs the operation and stores its result
await entity.list()

// Subsequent calls reuse the stored state
const data = entity.data()
console.log(data.id)
```

### Add custom middleware

Pass features via the `extend` option:

```ts
const logger = {
  hooks: {
    PreRequest: (ctx: any) => {
      console.log('Requesting:', ctx.spec.method, ctx.spec.path)
    },
    PreResponse: (ctx: any) => {
      console.log('Status:', ctx.out.request?.status)
    },
  },
}

const client = new ElementdemoSDK({
  apikey: '...',
  extend: [logger],
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
cd ts && npm test
```


## Reference

### ElementdemoSDK

#### Constructor

```ts
new ElementdemoSDK(options?: {
  apikey?: string
  server?: { account_id: string }
  base?: string
  prefix?: string
  suffix?: string
  feature?: Record<string, { active: boolean }>
  extend?: Feature[]
})
```

| Option | Type | Description |
| --- | --- | --- |
| `server` | `object` | **Required.** Values for the server-URL variables: `account_id`. The API base URL is a template over them. |
| `apikey` | `string` | API key for authentication. |
| `base` | `string` | Base URL of the API server. |
| `prefix` | `string` | URL path prefix prepended to all requests. |
| `suffix` | `string` | URL path suffix appended to all requests. |
| `feature` | `object` | Feature activation flags (e.g. `{ test: { active: true } }`). |
| `extend` | `Feature[]` | Additional feature instances to load. |

#### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `options()` | `object` | Deep copy of current SDK options. |
| `utility()` | `Utility` | Deep copy of the SDK utility object. |
| `prepare(fetchargs?)` | `Promise<FetchDef>` | Build an HTTP request definition without sending it. |
| `direct(fetchargs?)` | `Promise<DirectResult>` | Build and send an HTTP request. |
| `Element(data?)` | `ElementEntity` | Create an Element entity instance. |
| `Group(data?)` | `GroupEntity` | Create a Group entity instance. |
| `Isotope(data?)` | `IsotopeEntity` | Create an Isotope entity instance. |
| `Series(data?)` | `SeriesEntity` | Create a Series entity instance. |
| `tester(testopts?, sdkopts?)` | `ElementdemoSDK` | Create a test-mode client instance. |

#### Static methods

| Method | Returns | Description |
| --- | --- | --- |
| `ElementdemoSDK.test(testopts?, sdkopts?)` | `ElementdemoSDK` | Create a test-mode client. |

### Entity interface

All entities share the same interface.

#### Methods

| Method | Signature | Description |
| --- | --- | --- |
| `load` | `load(reqmatch?, ctrl?): Promise<Entity>` | Load a single entity by match criteria. |
| `list` | `list(reqmatch?, ctrl?): Promise<Entity[]>` | List entities matching the criteria. |
| `create` | `create(reqdata?, ctrl?): Promise<Entity>` | Create a new entity. |
| `update` | `update(reqdata?, ctrl?): Promise<Entity>` | Update an existing entity. |
| `remove` | `remove(reqmatch?, ctrl?): Promise<void>` | Remove an entity. |
| `data` | `data(data?: Partial<Entity>): Entity` | Get or set entity data. |
| `match` | `match(match?: Partial<Entity>): Partial<Entity>` | Get or set entity match criteria. |
| `make` | `make(): Entity` | Create a new instance with the same options. |
| `client` | `client(): ElementdemoSDK` | Return the parent SDK client. |
| `entopts` | `entopts(): object` | Return a copy of the entity options. |

#### Return values

Entity operations resolve to the entity data directly — there is no
result envelope:

- `load`, `create` and `update` resolve to a single entity object.
- `list` resolves to an **array** of entity objects (iterate it directly;
  there is no `.data` and no `.ok`).
- `remove` resolves to `void`.

On a failed request these methods **throw**, so wrap calls in
`try`/`catch` to handle errors. Only `direct()` returns the result
envelope described below.

### DirectResult shape

The `direct()` method returns:

```ts
{
  ok: boolean
  status: number
  headers: object
  data: any
}
```

On error, `ok` is `false` and an `err` property contains the error.

### FetchDef shape

The `prepare()` method returns:

```ts
{
  url: string
  method: string
  headers: Record<string, string>
  body?: any
}
```

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

API path: `/element/{element_id}/ionize`

#### Group

| Field | Description |
| --- | --- |
| `cas` | CAS group designation. |
| `id` | Group identifier, g1 to g18. |
| `name` | Trivial name, where one exists. |
| `number` | Group number, 1 to 18. |

Operations: list, load.

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
| `ok` |  |
| `product` | Primary decay product isotope, absent for stable isotopes. |
| `stable` | True if the isotope is stable. |
| `steps` |  |

Operations: create, list, load, remove, update.

API path: `/element/{element_id}/isotope/{isotope_id}/decay`

#### Series

| Field | Description |
| --- | --- |
| `color` | Display color used by the element card renderer. |
| `description` | One-line description of the series. |
| `id` | Series identifier. |
| `name` | Series name. |

Operations: list, load.

API path: `/series`



## Entities


### Element

Create an instance: `const element = client.Element()`

#### Operations

| Method | Description |
| --- | --- |
| `create(data)` | Create a new entity with the given data. |
| `list(match)` | List entities matching the criteria. |
| `load(match)` | Load a single entity by match criteria. |
| `remove(match)` | Remove the matching entity. |
| `update(data)` | Update an existing entity. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `block` | `string` | Orbital block, one of s, p, d, f. |
| `charge` | `number` |  |
| `discovered` | `number` | Year of discovery, absent for elements known since antiquity. |
| `group` | `number` | Periodic table column, 1 to 18, absent for the f-block. |
| `id` | `string` | Element identifier, the lowercase symbol. |
| `ion` | `string` |  |
| `mass` | `number` | Standard atomic weight in daltons. |
| `name` | `string` | Element name. |
| `number` | `number` | Atomic number. |
| `ok` | `boolean` |  |
| `period` | `number` | Periodic table row, 1 to 7. |
| `phase` | `string` | Phase at standard temperature and pressure. |
| `series_id` | `string` | Chemical series this element belongs to. |
| `symbol` | `string` | Chemical symbol. |

#### Example: Load

```ts
const element = await client.Element().load({ id: 'element_id' })
```

#### Example: List

```ts
const elements = await client.Element().list()
```

#### Example: Create

```ts
const element = await client.Element().create({
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


### Group

Create an instance: `const group = client.Group()`

#### Operations

| Method | Description |
| --- | --- |
| `list(match)` | List entities matching the criteria. |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `cas` | `string` | CAS group designation. |
| `id` | `string` | Group identifier, g1 to g18. |
| `name` | `string` | Trivial name, where one exists. |
| `number` | `number` | Group number, 1 to 18. |

#### Example: Load

```ts
const group = await client.Group().load({ id: 'group_id' })
```

#### Example: List

```ts
const groups = await client.Group().list()
```


### Isotope

Create an instance: `const isotope = client.Isotope()`

#### Operations

| Method | Description |
| --- | --- |
| `create(data)` | Create a new entity with the given data. |
| `list(match)` | List entities matching the criteria. |
| `load(match)` | Load a single entity by match criteria. |
| `remove(match)` | Remove the matching entity. |
| `update(data)` | Update an existing entity. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `abundance` | `number` | Natural abundance as a fraction, absent for synthetic isotopes. |
| `element_id` | `string` | Parent element identifier. |
| `halflife` | `string` | Half-life, absent for stable isotopes. |
| `id` | `string` | Isotope identifier, symbol dash mass number. |
| `mass` | `number` | Isotopic mass in daltons. |
| `mass_number` | `number` | Total protons and neutrons. |
| `mode` | `string` | Primary decay mode, absent for stable isotopes. |
| `name` | `string` | Isotope name. |
| `ok` | `boolean` |  |
| `product` | `string` | Primary decay product isotope, absent for stable isotopes. |
| `stable` | `boolean` | True if the isotope is stable. |
| `steps` | `number` |  |

#### Example: Load

```ts
const isotope = await client.Isotope().load({ id: 'isotope_id', element_id: 'element_id' })
```

#### Example: List

```ts
const isotopes = await client.Isotope().list({ element_id: "example" })
```

#### Example: Create

```ts
const isotope = await client.Isotope().create({
  element_id: 'example_element_id',
  id: 'example_id',
  mass: 1,
  mass_number: 1,
  name: 'example_name',
  stable: true,
})
```


### Series

Create an instance: `const series = client.Series()`

#### Operations

| Method | Description |
| --- | --- |
| `list(match)` | List entities matching the criteria. |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `color` | `string` | Display color used by the element card renderer. |
| `description` | `string` | One-line description of the series. |
| `id` | `string` | Series identifier. |
| `name` | `string` | Series name. |

#### Example: Load

```ts
const series = await client.Series().load({ id: 'series_id' })
```

#### Example: List

```ts
const seriess = await client.Series().list()
```

## Features

This SDK ships 5 optional features. Each is **inactive until you
switch it on**, so an SDK you have not configured behaves exactly as if none of
them existed — no retries, no cache, no logging, no measurable overhead.

Activate a feature by name in the client options, alongside the options shown
above:

| Feature | What it does |
|---|---|
| [`elementcard`](#elementcard) | ASCII periodic-table tile for element-shaped results |
| [`retry`](#retry) | Automatic retry of transient failures with exponential backoff |
| [`secrets`](#secrets) | Secret access: resolve the API credential through a provider chain, and exchange a refresh token for short-lived access tokens |
| [`test`](#test) | In-memory mock transport for testing without a live server |
| [`timeout`](#timeout) | Per-request timeout with transport abort |

> **Order matters for `retry`, `secrets`, `timeout`.** These wrap the
> transport, so each one wraps whatever is already installed: the order you
> activate them in IS the nesting order. Activating them as an ordered list
> rather than a map is what fixes that order.

### elementcard

ASCII periodic-table tile for element-shaped results.

| Option | Default |
|---|---|
| `active` | `false` |
| `print` | `false` |

Set `feature.elementcard.active` to enable it, then override any of the options above.

### retry

Automatic retry of transient failures with exponential backoff.

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

Secret access: resolve the API credential through a provider chain, and exchange a refresh token for short-lived access tokens.

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

In-memory mock transport for testing without a live server.

| Option | Default |
|---|---|
| `active` | `false` |

Set `feature.test.active` to enable it, then override any of the options above.

### timeout

Per-request timeout with transport abort.

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

Features are the extension mechanism. A feature is an object with a
`hooks` map. Each hook key is a pipeline stage name, and the value is
a function that receives the context.

The SDK ships with built-in features:

- **ElementcardFeature**: ASCII periodic-table tile for element-shaped results
- **RetryFeature**: Automatic retry of transient failures with exponential backoff
- **SecretsFeature**: Secret access: resolve the API credential through a provider chain, and exchange a refresh token for short-lived access tokens
- **TestFeature**: In-memory mock transport for testing without a live server
- **TimeoutFeature**: Per-request timeout with transport abort

Features are initialized in order. Hooks fire in the order features
were added, so later features can override earlier ones.

### Module structure

```
elementdemo/
├── src/
│   ├── ElementdemoSDK.ts        # Main SDK class
│   ├── entity/             # Entity implementations
│   ├── feature/            # Built-in features (Base, Test, Log)
│   └── utility/            # Utility functions
├── test/                   # Test suites
└── dist/                   # Compiled output
```

Import the SDK from the package root:

```ts
import { ElementdemoSDK } from '@voxgig-sdk/elementdemo'
```

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
