# AGENTS.md — Elementdemo SDK (Bash)

Generated output. Do not edit anything in this directory: change the model
or the `bash` target's templates and components (in the project's own
sdkgen package, `ext/`) and regenerate from `.sdk/`.

> This file orients an AI coding agent. Start here.

## What this is

The Elementdemo API as a sourceable Bash library plus a thin CLI. Same
model as the other targets, Bash idiom: curl for transport, jq for data,
one generated function per entity operation.

## Layout

| Path | What it is |
| --- | --- |
| `elementdemo.sh` | Entry point: `source` it and the SDK is in scope. |
| `core/core.sh` | Transport, hook dispatch, error surface. |
| `entity/*.sh` | Generated per-entity operation functions. |
| `feature/*.sh` | Generated feature hooks (test, retry, timeout, ...). |
| `bin/elementdemo` | CLI dispatcher over the library. |
| `test/run.sh` | Offline test runner, seeded from `.sdk/test/entity/`. |

## Use

```bash
source bash/elementdemo.sh
elementdemo_<entity>_list | jq length      # one function per entity operation
```

Errors are JSON on stderr with a non-zero return. Configuration is
environment-first: `ELEMENTDEMO_BASE`, `ELEMENTDEMO_MODE` (live or test),
`ELEMENTDEMO_STORE`, and `ELEMENTDEMO_<FEATURE>_ACTIVE=1` per feature. The
README documents all of it.

## Test

```bash
bash bash/test/run.sh
```

Runs fully offline against the shared fixtures. Requires bash 4+, curl, jq.
