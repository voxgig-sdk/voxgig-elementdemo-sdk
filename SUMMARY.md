# Periodic Table API

The Periodic Table API. Elements, isotopes, groups and series.

## Start here

This guide introduces the API, the client libraries, and the companion tools in this repository. Start with the API capabilities, choose a client for your application, and use the linked reference when you need exact request and response details.

The selected API surface contains 4 entities and 16 HTTP routes. There are 5 SDK targets.

An entity groups related API operations. An operation can have several routes with different inputs or authentication requirements. The SDK exposes the entity and its operations using the conventions of the selected language.

## What the API provides

### Element

Results: OK; Created; No Content.

SDK operations: `create`, `list`, `load`, `remove`, `update`.

Key fields to recognise:

- `block`: Orbital block, one of s, p, d, f.
- `discovered`: Year of discovery, absent for elements known since antiquity.
- `group`: Periodic table column, 1 to 18, absent for the f-block.
- `id`: Element identifier, the lowercase symbol.
- `mass`: Standard atomic weight in daltons.

### Group

Results: OK.

SDK operations: `list`, `load`.

Key fields to recognise:

- `cas`: CAS group designation.
- `id`: Group identifier, g1 to g18.
- `name`: Trivial name, where one exists.
- `number`: Group number, 1 to 18.

### Isotope

Results: OK; Created; No Content.

SDK operations: `create`, `list`, `load`, `remove`, `update`.

Key fields to recognise:

- `abundance`: Natural abundance as a fraction, absent for synthetic isotopes.
- `element_id`: Parent element identifier.
- `halflife`: Half-life, absent for stable isotopes.
- `id`: Isotope identifier, symbol dash mass number.
- `mass`: Isotopic mass in daltons.

### Series

Results: OK.

SDK operations: `list`, `load`.

Key fields to recognise:

- `color`: Display color used by the element card renderer.
- `description`: One-line description of the series.
- `id`: Series identifier.
- `name`: Series name.

### Route map

Use this map to locate a capability. Consult the entity reference before supplying request data; routes for the same operation can require different fields.

| Entity | SDK operation | HTTP route | Authentication |
| --- | --- | --- | --- |
| Element | `create` | `POST /element/{element_id}/ionize` | Required |
| Element | `create` | `POST /element` | Required |
| Element | `list` | `GET /element` | Required |
| Element | `load` | `GET /element/{element_id}` | Required |
| Element | `remove` | `DELETE /element/{element_id}` | Required |
| Element | `update` | `PUT /element/{element_id}` | Required |
| Group | `list` | `GET /group` | Required |
| Group | `load` | `GET /group/{group_id}` | Required |
| Isotope | `create` | `POST /element/{element_id}/isotope/{isotope_id}/decay` | Required |
| Isotope | `create` | `POST /element/{element_id}/isotope` | Required |
| Isotope | `list` | `GET /element/{element_id}/isotope` | Required |
| Isotope | `load` | `GET /element/{element_id}/isotope/{isotope_id}` | Required |
| Isotope | `remove` | `DELETE /element/{element_id}/isotope/{isotope_id}` | Required |
| Isotope | `update` | `PUT /element/{element_id}/isotope/{isotope_id}` | Required |
| Series | `list` | `GET /series` | Required |
| Series | `load` | `GET /series/{series_id}` | Required |

## Connect to the API

- API server: `http://localhost:8902/api/{account_id}`

The default credential is sent in the `Authorization` header with the `Bearer` prefix.

A short-lived access token, sent as `Authorization: Bearer &lt;token&gt;`. Obtain one from POST /auth/token, which every client must be able to call again: the token expires after a fixed number of REQUESTS rather than after an interval, so `expires_in_requests` on the token response, not a clock, says when the next exchange is due.

Check authentication for the route you plan to call. A route that declares no authentication can be used without credentials; this does not change the requirements of other routes. Keep credentials in environment variables or a configured secret provider, and keep them out of source control and logs.

## Make a first request

1. Choose the API server and an operation that matches your task.
2. Check the operation’s required input and authentication. Use values valid for your account and environment.
3. Send one request and inspect the returned data before adding retries, concurrency, or a larger batch.

For an SDK call, install or build the chosen client, create a client instance with its documented configuration, and call the required entity operation. Language references describe the argument shape, asynchronous behaviour, and returned values.

## Choose an SDK

Choose the language already used by your application or service. The clients represent the same API model, while package setup, naming, and return types follow each language. Check the selected client’s reference and tests before integrating it into an existing application.

| Client | Repository directory | Distribution |
| --- | --- | --- |
| Bash | `bash/` | Build from source |
| Golang | `go/` | Build from source |
| Java | `java/` | Build from source |
| Python | `py/` | Build from source |
| TypeScript | `ts/` | Build from source |

Build-from-source entries are not marked as published in the project model. Follow the build instructions in that target’s README, then consume the resulting package using your language’s local dependency mechanism. Published entries give the installation command recorded for that client.

## Operational features

Features supply behaviour around API calls, such as request handling, diagnostics, or local testing. Inclusion in this project does not mean a feature is enabled at runtime. Check the selected SDK’s supported features and configuration defaults, then enable the behaviour your application needs.

- `debug`: Request/response capture ring buffer for debugging
- `elementcard`: ASCII periodic-table tile for element-shaped results
- `idempotency`: Idempotency keys for safe retries of mutating operations
- `metrics`: Statistics capture: per-operation counters and latency
- `paging`: Pagination signals for list operations
- `ratelimit`: Client-side rate limiting via a token bucket
- `retry`: Automatic retry of transient failures with exponential backoff
- `secrets`: Secret access: resolve the API credential through a provider chain, and exchange a refresh token for short-lived access tokens
- `test`: In-memory mock transport for testing without a live server
- `timeout`: Per-request timeout with transport abort

Start with the default client configuration. Add request limits and diagnostics as needed, test error paths, and review retry behaviour before using operations that change data. A retry can repeat an operation unless the API provides a suitable guarantee.

## Continue with the documentation

- Follow the first-call guide for the setup sequence.
- Read the authentication guide before using protected routes.
- Use the API reference for request schemas, response formats, and status codes.
- Check the chosen SDK or companion tool reference for its configuration and supported operations.

