# Elementdemo SDK — bash core.
#
# Sourced, never executed: this file defines functions and sets nothing
# global beyond the ELEMENTDEMO_* defaults below. Requires bash 4+, curl
# and jq on PATH. Entity operations (entity/*.sh) and features
# (feature/*.sh) are generated around this core and call into it.
#
# Configuration is environment-first, like any shell tool:
#
#   ELEMENTDEMO_BASE     API base URL (default: the model's server URL,
#                       set in the generated entry script)
#   ELEMENTDEMO_MODE     live (default) or test
#   ELEMENTDEMO_STORE    test mode's JSON store file
#   ELEMENTDEMO_HEADERS  extra headers, one 'Name: value' per line
#
# Features register themselves when sourced and are switched on per
# feature: ELEMENTDEMO_<FEATURE>_ACTIVE=1 (test mode instead follows
# ELEMENTDEMO_MODE, since it replaces the transport rather than wrapping
# it).

ELEMENTDEMO_SDK_NAME="elementdemo"
ELEMENTDEMO_SDK_VERSION="0.1.0"

# Features present in this generated SDK, in source order. Each
# feature/*.sh appends its own name as it is sourced.
ELEMENTDEMO_SDK_FEATURES=()

_elementdemo_register_feature() {
  ELEMENTDEMO_SDK_FEATURES+=("$1")
}

# True when the named feature is present AND switched on. The test
# feature is the exception — it is the offline transport, so it follows
# the mode rather than an _ACTIVE flag.
_elementdemo_feature_active() {
  local name="$1" up flag
  local present=1
  local f
  for f in "${ELEMENTDEMO_SDK_FEATURES[@]:-}"; do
    [ "$f" = "$name" ] && present=0
  done
  [ 0 = "$present" ] || return 1

  if [ "test" = "$name" ]; then
    [ "test" = "${ELEMENTDEMO_MODE:-live}" ]
    return
  fi

  up=$(printf '%s' "$name" | tr '[:lower:]' '[:upper:]')
  flag=$(eval "printf '%s' \"\${ELEMENTDEMO_${up}_ACTIVE:-}\"")
  [ "1" = "$flag" ] || [ "true" = "$flag" ]
}

# Fire one hook across the active features, in registration order. Hook
# functions run in the CALLER's scope, so they can read and amend the
# request being built (CURL_ARGS, REQ_*) or the result (RESULT_BODY).
_elementdemo_hooks() {
  local _hook="$1" _f
  for _f in "${ELEMENTDEMO_SDK_FEATURES[@]:-}"; do
    [ -n "$_f" ] || continue
    _elementdemo_feature_active "$_f" || continue
    if declare -F "elementdemo_feature_${_f}_${_hook}" >/dev/null 2>&1; then
      "elementdemo_feature_${_f}_${_hook}"
    fi
  done
}

# Emit a JSON error to stderr and fail. Every entity function surfaces
# failure this way: JSON on stderr, non-zero return, nothing on stdout.
_elementdemo_error() {
  jq -n --arg code "$1" --arg msg "$2" '{error: $code, message: $msg}' >&2
  return 1
}

# The one transport. Entity functions build the request and hand it here:
#
#   elementdemo_request METHOD PATH BODY QUERY ENTITY OP ARGS_JSON
#
# BODY may be empty; QUERY is a pre-encoded 'a=1&b=2' string or empty;
# ARGS_JSON carries the named arguments as a JSON object for the offline
# store. Result body goes to stdout; errors go to stderr with a non-zero
# return.
elementdemo_request() {
  local REQ_METHOD="$1" REQ_PATH="$2" REQ_BODY="$3" REQ_QUERY="$4"
  local REQ_ENTITY="$5" REQ_OP="$6" REQ_ARGS="${7:-{\}}"
  local RESULT_BODY="" RESULT_STATUS=""

  local CURL_ARGS=()
  _elementdemo_hooks PreRequest

  if [ "test" = "${ELEMENTDEMO_MODE:-live}" ]; then
    if declare -F _elementdemo_feature_test_request >/dev/null 2>&1; then
      RESULT_BODY=$(_elementdemo_feature_test_request \
        "$REQ_METHOD" "$REQ_PATH" "$REQ_BODY" "$REQ_ENTITY" "$REQ_OP" "$REQ_ARGS") \
        || return $?
    else
      _elementdemo_error "no_test_feature" \
        "ELEMENTDEMO_MODE=test but this SDK was generated without the test feature"
      return 1
    fi
  else
    local base="${ELEMENTDEMO_BASE:-$ELEMENTDEMO_SDK_DEFAULT_BASE}"
    local url="${base}${REQ_PATH}"
    [ -n "$REQ_QUERY" ] && url="${url}?${REQ_QUERY}"

    local header_args=(-H 'content-type: application/json')
    if [ -n "${ELEMENTDEMO_HEADERS:-}" ]; then
      local _line
      while IFS= read -r _line; do
        [ -n "$_line" ] && header_args+=(-H "$_line")
      done <<< "${ELEMENTDEMO_HEADERS}"
    fi

    local body_args=()
    [ -n "$REQ_BODY" ] && body_args=(--data "$REQ_BODY")

    local raw
    raw=$(curl -sS -X "$REQ_METHOD" "${header_args[@]}" \
      ${CURL_ARGS[@]:+"${CURL_ARGS[@]}"} "${body_args[@]:+${body_args[@]}}" \
      -w '\n%{http_code}' "$url") || {
      _elementdemo_error "transport" "curl failed for $REQ_METHOD $url"
      return 1
    }

    RESULT_STATUS="${raw##*$'\n'}"
    RESULT_BODY="${raw%$'\n'*}"

    if [ "$RESULT_STATUS" -ge 400 ] 2>/dev/null; then
      printf '%s\n' "$RESULT_BODY" >&2
      return 1
    fi
  fi

  _elementdemo_hooks PreResult

  [ -n "$RESULT_BODY" ] && printf '%s\n' "$RESULT_BODY"
  return 0
}

# URL-encode one value (jq does the escaping).
_elementdemo_encode() {
  jq -rn --arg v "$1" '$v | @uri'
}
