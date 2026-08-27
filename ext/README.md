# @voxgig-sdk/sdkgen-elementdemo-ext

This project's own **sdkgen package**: everything the Elementdemo SDK adds
on top of stock [`@voxgig/sdkgen`](https://github.com/voxgig/sdkgen),
kept OUT of the files `target add` owns so a resync can never revert it.

It provides:

| Kind | Name | What it is |
| --- | --- | --- |
| target | `bash` | An entirely custom target: the SDK as a sourceable Bash library (curl + jq), with a thin CLI, offline test mode, and generated per-entity functions. |
| feature | `elementcard` | A custom feature: renders any result record shaped like an element (`number`, `symbol`, `name`, `mass`) as an ASCII periodic-table tile, in every target including `bash`. |

## Layout

```
ext/
├── sdkgen-package.json          # the manifest sdkgen reads
└── .sdk/
    ├── model/
    │   ├── target/bash.aon      # the bash target's model definition
    │   └── feature/elementcard.aon
    ├── src/cmp/bash/            # the bash target's generator components
    │   ├── Main_bash.ts         # static tree + entry script + CLI
    │   ├── Entity_bash.ts       # per-entity functions from the model's ops
    │   ├── Test_bash.ts         # offline test runner from the shared fixtures
    │   └── fragment/            # bash source fragments the components emit
    └── tm/
        ├── bash/                # the bash target's template masters
        │   ├── core/core.sh     # transport, hooks, test-mode dispatch
        │   └── feature/         # per-feature bash sources (test, retry,
        │                        #   timeout, elementcard)
        ├── ts/src/feature/elementcard/   # elementcard for the stock targets,
        ├── go/feature/                   #   at each target's own feature
        ├── py/pkg/feature/               #   layout — overlays, copied in by
        └── java/feature/                 #   `feature add`
```

The feature's language-neutral behaviour cases are NOT in this package:
they live in `.sdk/test/feature/elementcard.aon`, because `.sdk/test/` is
project-owned test data (the same place the shared corpus lives).

## How it is wired into the project

From `.sdk/`:

```bash
npx voxgig-sdkgen package add ../ext
npm run build && npm run generate
```

`package add` installs everything the manifest `provides`: the `bash`
target (model + components + templates) and the `elementcard` feature
(model + a source overlay for each target in `targetsSupported`). Both
record their provenance, so a later `target add bash` or
`feature add elementcard` resolves back to this folder and resyncs from
it — edit HERE, then re-add, never edit the copies under `.sdk/`.

Validate the package itself with:

```bash
npx voxgig-sdkgen package check ext
```

## The elementcard corpus cases

`elementcard`'s behaviour cases live in `.sdk/test/feature/elementcard.aon`
(project-owned, like all of `.sdk/test/`) and compile into
`.sdk/test/test.json`. Every generated SDK's feature-corpus runner reads
the roster from the corpus itself, so the same cases drive the ts, go, py
and java implementations — the assertion is the exact card string.
