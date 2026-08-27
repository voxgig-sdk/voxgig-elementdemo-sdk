# ProjectName SDK — Bash

The ProjectName API as a sourceable Bash library. Entity operations are
generated from the same model as every other target; the transport is
curl, the data tool is jq, and there is nothing else to install.

Requires bash 4+, curl and jq.

## Use as a library

```bash
source bash/projectname.sh

# List and load return JSON on stdout.
projectname_element_list | jq length
projectname_element_load id=fe | jq -r .name

# Nested entities take their parent ids as named arguments.
projectname_isotope_list element_id=h
projectname_isotope_load element_id=h id=h-2

# Create and update read the record from stdin.
echo '{"id":"xx","name":"Example"}' | projectname_element_create
```

Errors are JSON on stderr with a non-zero return, so the usual shell
patterns compose:

```bash
if ! rec=$(projectname_element_load id=nope 2>/dev/null); then
  echo "no such element"
fi
```

## Use as a CLI

```bash
bash/bin/projectname element list
bash/bin/projectname element load id=fe
bash/bin/projectname element card id=fe     # the elementcard feature
echo '{"name":"X"}' | bash/bin/projectname element create
```

## Offline test mode

Point the SDK at a JSON store instead of the network — no server, no
credentials:

```bash
source bash/projectname.sh
export PROJECTENV_MODE=test
export PROJECTENV_STORE=$(mktemp)
projectname_test_seed '{"element":{"fe":{"id":"fe","name":"Iron"}}}'
projectname_element_load id=fe
```

The store shape is `{ "<entity>": { "<id>": record } }` — the same shape
the other targets' test mode seeds. Action operations (the model's
non-CRUD points) need the live API and fail in test mode by design.

## Configuration

Environment-first, like any shell tool:

| Variable | Meaning | Default |
| --- | --- | --- |
| `PROJECTENV_BASE` | API base URL | the model's server URL |
| `PROJECTENV_MODE` | `live` or `test` | `live` |
| `PROJECTENV_STORE` | test-mode JSON store file | — |
| `PROJECTENV_HEADERS` | extra headers, one `Name: value` per line | — |

## Features

Features hook the request pipeline by defining
`projectname_feature_<name>_<Hook>` functions; the core fires them for
every active feature. Switch one on with `PROJECTENV_<FEATURE>_ACTIVE=1`:

| Feature | Switch | What it does |
| --- | --- | --- |
| `test` | `PROJECTENV_MODE=test` | Offline transport from a JSON store |
| `retry` | `PROJECTENV_RETRY_ACTIVE=1` | curl's own retry engine (`--retry`) |
| `timeout` | `PROJECTENV_TIMEOUT_ACTIVE=1` | request deadline (`--max-time`) |
| `elementcard` | `PROJECTENV_ELEMENTCARD_ACTIVE=1` | ASCII tile for element-shaped results (`_PRINT=1` to print) |

```bash
export PROJECTENV_ELEMENTCARD_ACTIVE=1 PROJECTENV_ELEMENTCARD_PRINT=1
projectname_element_load id=fe >/dev/null
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
