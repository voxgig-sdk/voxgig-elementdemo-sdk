#!/usr/bin/env bash
# ProjectName SDK — thin CLI over the bash library. GENERATED, do not edit.
#
#   usage: <cli> <entity> <op> [k=v ...]         JSON result on stdout
#          <cli> <entity> card [k=v ...]         render the elementcard
#          echo '{...}' | <cli> <entity> create  body on stdin
#
# Dispatches into the sourced library: <entity> <op> becomes the generated
# projectname_<entity>_<op> function. Configuration is the library's own
# (PROJECTENV_BASE, PROJECTENV_MODE, PROJECTENV_STORE, and the per-feature
# switches) — see the README.

set -euo pipefail

_cli_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${_cli_dir}/../SDKENTRY"

usage() {
  echo "usage: $(basename "$0") <entity> <op> [k=v ...]" >&2
  echo "       ops are the generated projectname_<entity>_<op> functions" >&2
  exit 2
}

[ $# -ge 2 ] || usage

entity="$1"
op="$2"
shift 2

if [ "card" = "$op" ]; then
  if ! declare -F projectname_elementcard_render >/dev/null 2>&1; then
    echo "card: this SDK was generated without the elementcard feature" >&2
    exit 1
  fi
  rec=$(projectname_"${entity}"_load "$@") || exit $?
  projectname_elementcard_render "$rec"
  exit 0
fi

fn="projectname_${entity}_${op}"
if ! declare -F "$fn" >/dev/null 2>&1; then
  echo "unknown operation: $entity $op" >&2
  usage
fi

"$fn" "$@"
