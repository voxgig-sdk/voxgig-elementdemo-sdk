#!/usr/bin/env bash
# Elementdemo SDK — offline test runner. GENERATED, do not edit.
#
# Seeds the offline store from the shared fixtures in .sdk/test/entity/
# (the same records every other target's basic tests use) and drives every
# generated entity operation against it, plus the elementcard render when
# that feature is present. Pure test mode: no server, no network.

set -u

_run_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${_run_dir}/../elementdemo.sh"

export ELEMENTDEMO_MODE=test
ELEMENTDEMO_STORE=$(mktemp)
export ELEMENTDEMO_STORE
SEED0=$(mktemp)
NEW0=$(mktemp)
trap 'rm -f "$ELEMENTDEMO_STORE" "$SEED0" "$NEW0"' EXIT

FIXDIR="${_run_dir}/../../.sdk/test/entity"

# Merge every entity's fixtures: `existing` seeds the store, `new` feeds
# the create checks. SEED0 keeps the pristine seed for expected counts.
jq -s 'map(.existing) | add // {}' "$FIXDIR"/*/*TestData.json > "$SEED0"
jq -s 'map(.new) | add // {}' "$FIXDIR"/*/*TestData.json > "$NEW0"
cp "$SEED0" "$ELEMENTDEMO_STORE"

PASS=0
FAIL=0

t() { # description actual expected
  if [ "$2" = "$3" ]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "FAIL: $1: got [$2] want [$3]" >&2
  fi
}

t_fails() { # description rc-of-last-command (must be non-zero)
  if [ "$2" != "0" ]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "FAIL: $1: expected failure, got success" >&2
  fi
}

# Drive one entity's generated operations against the store. Arguments:
# the entity name, its operations (space-separated), and its parent id
# fields (space-separated, may be empty). Parent values come from the
# first seeded record, ids from the fixtures — nothing here is entity-
# specific.
test_entity() {
  local e="$1" ops=" $2 " parents="$3"
  local first pargs="" p v rec cnt exp cid
  local want='{}'

  first=$(jq -r --arg e "$e" '(.[$e] // {}) | keys[0] // empty' "$SEED0")

  for p in $parents; do
    v=$(jq -r --arg e "$e" --arg p "$p" \
      '(.[$e] // {}) | .[keys[0]][$p] // empty' "$SEED0")
    pargs="$pargs $p=$v"
    want=$(jq -c --arg k "$p" --arg v "$v" '. + {($k): $v}' <<< "$want")
  done

  if [[ "$ops" == *" list "* ]]; then
    cnt=$(elementdemo_${e}_list $pargs | jq 'length')
    exp=$(jq -r --arg e "$e" --argjson w "$want" \
      '[(.[$e] // {})[] | . as $r
        | select([$w | to_entries[] | $r[.key] == .value] | all)] | length' \
      "$SEED0")
    t "$e list count" "$cnt" "$exp"
  fi

  if [[ "$ops" == *" load "* ]] && [ -n "$first" ]; then
    rec=$(elementdemo_${e}_load $pargs id="$first")
    t "$e load id" "$(jq -r '.id' <<< "$rec")" "$first"
  fi

  if [[ "$ops" == *" create "* ]]; then
    local newrec
    newrec=$(jq -c --arg e "$e" '(.[$e] // {}) | .[keys[0]] // empty' "$NEW0")
    if [ -n "$newrec" ]; then
      cid=$(printf '%s' "$newrec" | elementdemo_${e}_create $pargs | jq -r '.id')
      t "$e create returns an id" "$([ -n "$cid" ] && [ "null" != "$cid" ] && echo ok)" "ok"
      rec=$(elementdemo_${e}_load $pargs id="$cid")
      t "$e create then load" "$(jq -r '.id' <<< "$rec")" "$cid"
    fi
  fi

  if [[ "$ops" == *" update "* ]] && [ -n "$first" ]; then
    rec=$(printf '%s' '{"name":"updated-by-run-sh"}' \
      | elementdemo_${e}_update $pargs id="$first")
    t "$e update applies" "$(jq -r '.name' <<< "$rec")" "updated-by-run-sh"
  fi

  if [[ "$ops" == *" remove "* ]] && [ -n "$first" ]; then
    elementdemo_${e}_remove $pargs id="$first" > /dev/null
    elementdemo_${e}_load $pargs id="$first" > /dev/null 2>&1
    t_fails "$e load after remove" "$?"
  fi
}

test_entity element "create list load remove update" ""
test_entity group "list load" ""
test_entity isotope "create list load remove update" "element_id"
test_entity series "list load" ""


# The elementcard feature, when generated in: the render itself, and the
# PreResult hook firing through a real (offline) operation.
if declare -F elementdemo_elementcard_render > /dev/null 2>&1; then

  expected_card='+---------+
|26     Fe|
|  Iron   |
| 55.845  |
+---------+'

  card=$(elementdemo_elementcard_render \
    '{"number":26,"symbol":"Fe","name":"Iron","mass":55.845}')
  t "elementcard render" "$card" "$expected_card"

  card=$(elementdemo_elementcard_render \
    '{"number":97,"symbol":"Bk","name":"Berkelium","mass":247}')
  t "elementcard render integral mass" "$card" '+---------+
|97     Bk|
|Berkelium|
|   247   |
+---------+'

  if [ -n "element" ]; then
    export ELEMENTDEMO_ELEMENTCARD_ACTIVE=1
    tmpstore=$(mktemp)
    cp "$ELEMENTDEMO_STORE" "$tmpstore"
    jq '.element = ((.element // {}) + {cardtest01: {id: "cardtest01",
      number: 26, symbol: "Fe", name: "Iron", mass: 55.845}})' \
      "$tmpstore" > "$ELEMENTDEMO_STORE"
    rm -f "$tmpstore"

    elementdemo_element_load id=cardtest01 > /dev/null
    t "elementcard hook fires on load" "$ELEMENTDEMO_ELEMENTCARD_COUNT" "1"
    t "elementcard hook renders the record" "$ELEMENTDEMO_ELEMENTCARD_LAST" "$expected_card"
    unset ELEMENTDEMO_ELEMENTCARD_ACTIVE
  fi
fi


# ---------------------------------------------------------------------------
# Account + credential plumbing.
#
# Pure functions over the environment: no server, no network. The request
# path that uses them is exercised live, not here — what these pin is the
# part that is easy to get quietly wrong, and whose failure mode is a URL
# with a literal brace in it or a credential that is silently re-bought on
# every call.

if declare -F _elementdemo_base > /dev/null 2>&1; then

  # A templated server URL resolves from ELEMENTDEMO_SERVER_<NAME>.
  if [ 0 -lt "${#ELEMENTDEMO_SDK_SERVER_VARS[@]}" ]; then
    _svar="${ELEMENTDEMO_SDK_SERVER_VARS[0]}"
    _svar_up=$(printf '%s' "$_svar" | tr '[:lower:]' '[:upper:]')

    # Unset: a hard error, not an empty substitution. An empty one would
    # address the wrong resource and answer 404 far from the cause.
    eval "unset ELEMENTDEMO_SERVER_${_svar_up}"
    _elementdemo_base > /dev/null 2>&1
    t_fails "base rejects a missing server variable" "$?"

    eval "export ELEMENTDEMO_SERVER_${_svar_up}=acct01"
    _base=$(_elementdemo_base)
    t "base substitutes the server variable" \
      "$_base" "${ELEMENTDEMO_SDK_DEFAULT_BASE//\{$_svar\}/acct01}"

    case "$_base" in
      *"{"*) t "base leaves no placeholder" "placeholder: $_base" "none" ;;
      *)     t "base leaves no placeholder" "none" "none" ;;
    esac

    # ELEMENTDEMO_BASE still overrides the whole URL, placeholders and all.
    ELEMENTDEMO_BASE="http://example.test/v9/{$_svar}" \
      t "explicit base is still substituted" \
      "$(ELEMENTDEMO_BASE="http://example.test/v9/{$_svar}" _elementdemo_base)" \
      "http://example.test/v9/acct01"
  fi

  # The refresh token: environment first, then a .env file. A file is only
  # consulted when the environment is silent, so an export always wins.
  _envfile=$(mktemp)
  printf '# a comment\nOTHER=x\nREFRESH_TOKEN="rt-from-file"\n' > "$_envfile"

  unset ELEMENTDEMO_REFRESH_TOKEN
  t "refresh token read from a .env file" \
    "$(ELEMENTDEMO_ENV_FILE="$_envfile" _elementdemo_refresh_token)" "rt-from-file"

  t "an exported refresh token wins over the file" \
    "$(ELEMENTDEMO_REFRESH_TOKEN=rt-from-env ELEMENTDEMO_ENV_FILE="$_envfile" \
       _elementdemo_refresh_token)" "rt-from-env"

  ELEMENTDEMO_ENV_FILE=/nonexistent/.env _elementdemo_refresh_token > /dev/null 2>&1
  t_fails "no refresh token anywhere fails rather than returning empty" "$?"

  rm -f "$_envfile"

  # The credential: an explicit apikey is used as-is and buys nothing.
  unset ELEMENTDEMO_SDK_ACCESS_TOKEN
  ELEMENTDEMO_APIKEY=ak-explicit _elementdemo_credential
  t "an explicit apikey is the credential" "$ELEMENTDEMO_SDK_CREDENTIAL" "ak-explicit"

  # With neither an apikey nor a reachable refresh token, the credential is
  # empty and no Authorization header is sent — an API that declares no
  # auth reaches exactly this.
  unset ELEMENTDEMO_APIKEY
  unset ELEMENTDEMO_SDK_ACCESS_TOKEN
  ELEMENTDEMO_ENV_FILE=/nonexistent/.env _elementdemo_credential
  t "no credential available leaves it empty" "$ELEMENTDEMO_SDK_CREDENTIAL" ""
fi

echo "pass $PASS fail $FAIL total $((PASS + FAIL))"
[ 0 = "$FAIL" ]
