# Development notes

- The generator lives in `.sdk/`; the customization content (the `bash`
  target and the `elementcard` feature) lives in `ext/`, this repo's own
  sdkgen package. Edit `ext/`, then `cd .sdk && npx voxgig-sdkgen package
  add ../ext && npm run build && npm run generate`.
- `ts/ go/ py/ java/ bash/` are generated output. Never edit them.
- `app/` is the standalone reference server (port 8902), independent of
  the SDKs. `cd app && npm run build && npm start`, then
  `npm run validate` for the live check.

## Accounts, tokens and the .env file

The API is account-scoped and takes short-lived access tokens — see
[`app/README.md`](app/README.md). Two consequences for SDK work:

- **The account id is an SDK option.** It is the `account_id` OpenAPI server
  variable in `http://localhost:8902/api/{account_id}`, so every client must
  pass `server: { account_id: '...' }` (or `ELEMENTDEMO_SERVER_ACCOUNT_ID`
  for a live test run). A client constructed without it REFUSES to construct
  rather than request a URL with a literal brace in it.
- **The refresh token comes from `.env`.** `.env` is gitignored; copy
  [`.env.example`](.env.example) to `.env` (or `ts/.env`) for a live run. The
  TypeScript SDK reads it through the vendored sekreto dotenv provider —
  the `secrets` feature's exchange buys access tokens with it and re-buys
  one whenever the API says the current one is spent, which it does every
  four requests.

Live runs:

```bash
cd app && npm run build && npm start          # in one shell

cd app && npm run validate                    # the server's own live check
cp .env.example ts/.env
cd ts && ELEMENTDEMO_TEST_LIVE=TRUE ELEMENTDEMO_SERVER_ACCOUNT_ID=acc01 npm test
```

The `bash` target does the same round trip in shell:

```bash
source bash/elementdemo.sh
export ELEMENTDEMO_SERVER_ACCOUNT_ID=acc01 ELEMENTDEMO_ENV_FILE=.env
elementdemo_element_load id=fe
```

`go`, `py` and `java` carry the account id and send a bearer credential, but
have no automatic refresh: the `secrets` feature is gated on the vendored
sekreto port (`needs: { sekreto: true }`), which only `ts` has today. They
take an access token through the `apikey` option and must refresh it
themselves.

## Before committing

```bash
cd .sdk && npx voxgig-sdkgen doctor
npx voxgig-sdkgen package check ../ext
```

`package check` expects no findings.

`doctor` expects **1 additive** and exits zero:

- `src/cmp/ts/Examples_ts.ts` — additive, project-owned, not drift.

There is no longer a hand-edited template master to re-apply. This project
used to carry its live-client options as a DELIBERATE edit to
`tm/ts/test/sdk-test-control.json`, because the copy under `ts/test/` was
regenerated on every `npm run generate`. Two changes removed the need:

- the access-token exchange now arrives as a SPEC FACT (`@voxgig/apidef`
  >= 8.1 records it; `@voxgig/sdkgen` >= 4.7 overlays it onto the feature's
  config), so the exchange is not configured by hand at all; and
- `sdk-test-control.json` is now WRITE-ONCE — `generate` leaves an existing
  one alone — so anything a project does put there belongs in
  `ts/test/sdk-test-control.json`, not in the template master.

See `@voxgig/sdkgen`'s `docs/how-to/run-a-live-suite.md`.
