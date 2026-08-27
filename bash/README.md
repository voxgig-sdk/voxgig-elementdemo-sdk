# Elementdemo SDK — Bash

The Elementdemo API as a sourceable Bash library. Entity operations are
generated from the same model as every other target; the transport is
curl, the data tool is jq, and there is nothing else to install.

Requires bash 4+, curl and jq.

## Use as a library

```bash
source bash/elementdemo.sh

# List and load return JSON on stdout.
elementdemo_element_list | jq length
elementdemo_element_load id=fe | jq -r .name

# Nested entities take their parent ids as named arguments.
elementdemo_isotope_list element_id=h
elementdemo_isotope_load element_id=h id=h-2

# Create and update read the record from stdin.
echo '{"id":"xx","name":"Example"}' | elementdemo_element_create
```

Errors are JSON on stderr with a non-zero return, so the usual shell
patterns compose:

```bash
if ! rec=$(elementdemo_element_load id=nope 2>/dev/null); then
  echo "no such element"
fi
```

## Use as a CLI

```bash
bash/bin/elementdemo element list
bash/bin/elementdemo element load id=fe
bash/bin/elementdemo element card id=fe     # the elementcard feature
echo '{"name":"X"}' | bash/bin/elementdemo element create
```

## Offline test mode

Point the SDK at a JSON store instead of the network — no server, no
credentials:

```bash
source bash/elementdemo.sh
export ELEMENTDEMO_MODE=test
export ELEMENTDEMO_STORE=$(mktemp)
elementdemo_test_seed '{"element":{"fe":{"id":"fe","name":"Iron"}}}'
elementdemo_element_load id=fe
```

The store shape is `{ "<entity>": { "<id>": record } }` — the same shape
the other targets' test mode seeds. Action operations (the model's
non-CRUD points) need the live API and fail in test mode by design.

## Configuration

Environment-first, like any shell tool:

| Variable | Meaning | Default |
| --- | --- | --- |
| `ELEMENTDEMO_BASE` | API base URL | the model's server URL |
| `ELEMENTDEMO_MODE` | `live` or `test` | `live` |
| `ELEMENTDEMO_STORE` | test-mode JSON store file | — |
| `ELEMENTDEMO_HEADERS` | extra headers, one `Name: value` per line | — |

## Features

Features hook the request pipeline by defining
`elementdemo_feature_<name>_<Hook>` functions; the core fires them for
every active feature. Switch one on with `ELEMENTDEMO_<FEATURE>_ACTIVE=1`:

| Feature | Switch | What it does |
| --- | --- | --- |
| `test` | `ELEMENTDEMO_MODE=test` | Offline transport from a JSON store |
| `retry` | `ELEMENTDEMO_RETRY_ACTIVE=1` | curl's own retry engine (`--retry`) |
| `timeout` | `ELEMENTDEMO_TIMEOUT_ACTIVE=1` | request deadline (`--max-time`) |
| `elementcard` | `ELEMENTDEMO_ELEMENTCARD_ACTIVE=1` | ASCII tile for element-shaped results (`_PRINT=1` to print) |

```bash
export ELEMENTDEMO_ELEMENTCARD_ACTIVE=1 ELEMENTDEMO_ELEMENTCARD_PRINT=1
elementdemo_element_load id=fe >/dev/null
# +---------+
# |26     Fe|
# |  Iron   |
# | 55.845  |
# +---------+
```

## Tests

```bash
bash bash/test/run.sh
```

The runner seeds the offline store from the shared fixtures in
`.sdk/test/entity/` and drives every generated entity operation, plus the
elementcard render, against it.

## Regeneration

This directory is generated output. Do not edit it — change the model or
the `bash` target's templates and components (in `ext/`) and regenerate:

```bash
cd .sdk && npm run build && npm run generate
```
