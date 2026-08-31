# AGENTS.md — Elementdemo test/reference server

A standalone REST server implementing the Elementdemo (Periodic Table) API.
Use it as a local target when developing or validating the SDKs.

It is **independent of the SDKs** and not required to use them — the SDK
clients have no knowledge of this server.

## Run

Prerequisites: Node.js >= 24.

```bash
cd app
npm install
npm run build
npm start          # serves http://localhost:8902 by default
```

## Accounts and access tokens

Every API path is account-scoped and needs a bearer access token:

```
/api/<account-id>/element/fe        Authorization: Bearer <access-token>
```

An access token is bought with a long-lived refresh token, and **expires
after four requests** — the fifth answers 401, and the client must buy
another. Defaults: account `acc01`, refresh token
`rt-elementdemo-dev-refresh-token` (dev credentials to a public-data server;
`ACCOUNTS`, `ACCOUNT_ID`, `REFRESH_TOKEN` and `ACCESS_TOKEN_USES` override).

```bash
curl -X POST http://localhost:8902/api/acc01/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"refresh_token":"rt-elementdemo-dev-refresh-token"}'
```

The token endpoint is deliberately absent from the OpenAPI definition — it is
credential plumbing, not a resource to generate an entity class for. The
account id IS in the definition, as the `account_id` OpenAPI **server
variable** in `http://localhost:8902/api/{account_id}`, which is what lets a
generated SDK take it as a construction option.

Test suites do not hand-roll any of this: `test/setup.ts`'s `apiClient`
prefixes the account and refreshes on 401. Only
`test/integration/auth.integration.test.ts` drives `app.inject` directly —
it is the suite whose subject is the credential.

See [`README.md`](README.md) for the full endpoint list, data model and test
commands.

## Using it with an SDK (local end-to-end)

Point an SDK client at this server to exercise it against a real
implementation. Two options are needed, not one:

```ts
const sdk = new ElementdemoSDK({
  base: 'http://localhost:8902/api/{account_id}',
  server: { account_id: 'acc01' },
  feature: { tokenauth: { active: true } },   // refresh-token flow
})
```

`base` carries the account template (the OpenAPI server URL), `server`
supplies the account, and the `tokenauth` feature buys and re-buys access
tokens. Without the last of those an SDK gets four requests in and then
starts failing 401.
