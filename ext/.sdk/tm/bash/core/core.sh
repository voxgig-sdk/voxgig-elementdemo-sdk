# ProjectName SDK — bash core.
#
# Sourced, never executed: this file defines functions and sets nothing
# global beyond the PROJECTENV_* defaults below. Requires bash 4+, curl
# and jq on PATH. Entity operations (entity/*.sh) and features
# (feature/*.sh) are generated around this core and call into it.
#
# Configuration is environment-first, like any shell tool:
#
#   PROJECTENV_BASE     API base URL (default: the model's server URL,
#                       set in the generated entry script)
#   PROJECTENV_MODE     live (default) or test
#   PROJECTENV_STORE    test mode's JSON store file
#   PROJECTENV_HEADERS  extra headers, one 'Name: value' per line
#
# Features register themselves when sourced and are switched on per
# feature: PROJECTENV_<FEATURE>_ACTIVE=1 (test mode instead follows
# PROJECTENV_MODE, since it replaces the transport rather than wrapping
# it).

PROJECTNAME_SDK_NAME="projectname"
PROJECTNAME_SDK_VERSION="PROJECTVERSION"

# Features present in this generated SDK, in source order. Each
# feature/*.sh appends its own name as it is sourced.
PROJECTNAME_SDK_FEATURES=()

_projectname_register_feature() {
  PROJECTNAME_SDK_FEATURES+=("$1")
}

# True when the named feature is present AND switched on. The test
# feature is the exception — it is the offline transport, so it follows
# the mode rather than an _ACTIVE flag.
_projectname_feature_active() {
  local name="$1" up flag
  local present=1
  local f
  for f in "${PROJECTNAME_SDK_FEATURES[@]:-}"; do
    [ "$f" = "$name" ] && present=0
  done
  [ 0 = "$present" ] || return 1

  if [ "test" = "$name" ]; then
    [ "test" = "${PROJECTENV_MODE:-live}" ]
    return
  fi

  up=$(printf '%s' "$name" | tr '[:lower:]' '[:upper:]')
  flag=$(eval "printf '%s' \"\${PROJECTENV_${up}_ACTIVE:-}\"")
  [ "1" = "$flag" ] || [ "true" = "$flag" ]
}

# Fire one hook across the active features, in registration order. Hook
# functions run in the CALLER's scope, so they can read and amend the
# request being built (CURL_ARGS, REQ_*) or the result (RESULT_BODY).
_projectname_hooks() {
  local _hook="$1" _f
  for _f in "${PROJECTNAME_SDK_FEATURES[@]:-}"; do
    [ -n "$_f" ] || continue
    _projectname_feature_active "$_f" || continue
    if declare -F "projectname_feature_${_f}_${_hook}" >/dev/null 2>&1; then
      "projectname_feature_${_f}_${_hook}"
    fi
  done
}

# Emit a JSON error to stderr and fail. Every entity function surfaces
# failure this way: JSON on stderr, non-zero return, nothing on stdout.
_projectname_error() {
  jq -n --arg code "$1" --arg msg "$2" '{error: $code, message: $msg}' >&2
  return 1
}

# The one transport. Entity functions build the request and hand it here:
#
#   projectname_request METHOD PATH BODY QUERY ENTITY OP ARGS_JSON
#
# BODY may be empty; QUERY is a pre-encoded 'a=1&b=2' string or empty;
# ARGS_JSON carries the named arguments as a JSON object for the offline
# store. Result body goes to stdout; errors go to stderr with a non-zero
# return.
projectname_request() {
  local REQ_METHOD="$1" REQ_PATH="$2" REQ_BODY="$3" REQ_QUERY="$4"
  local REQ_ENTITY="$5" REQ_OP="$6" REQ_ARGS="${7:-{\}}"
  local RESULT_BODY="" RESULT_STATUS=""

  local CURL_ARGS=()
  _projectname_hooks PreRequest

  if [ "test" = "${PROJECTENV_MODE:-live}" ]; then
    if declare -F _projectname_feature_test_request >/dev/null 2>&1; then
      RESULT_BODY=$(_projectname_feature_test_request \
        "$REQ_METHOD" "$REQ_PATH" "$REQ_BODY" "$REQ_ENTITY" "$REQ_OP" "$REQ_ARGS") \
        || return $?
    else
      _projectname_error "no_test_feature" \
        "PROJECTENV_MODE=test but this SDK was generated without the test feature"
      return 1
    fi
  else
    local base="${PROJECTENV_BASE:-$PROJECTNAME_SDK_DEFAULT_BASE}"
    local url="${base}${REQ_PATH}"
    [ -n "$REQ_QUERY" ] && url="${url}?${REQ_QUERY}"

    local header_args=(-H 'content-type: application/json')
    if [ -n "${PROJECTENV_HEADERS:-}" ]; then
      local _line
      while IFS= read -r _line; do
        [ -n "$_line" ] && header_args+=(-H "$_line")
      done <<< "${PROJECTENV_HEADERS}"
    fi

    local body_args=()
    [ -n "$REQ_BODY" ] && body_args=(--data "$REQ_BODY")

    local raw
    raw=$(curl -sS -X "$REQ_METHOD" "${header_args[@]}" \
      ${CURL_ARGS[@]:+"${CURL_ARGS[@]}"} "${body_args[@]:+${body_args[@]}}" \
      -w '\n%{http_code}' "$url") || {
      _projectname_error "transport" "curl failed for $REQ_METHOD $url"
      return 1
    }

    RESULT_STATUS="${raw##*$'\n'}"
    RESULT_BODY="${raw%$'\n'*}"

    if [ "$RESULT_STATUS" -ge 400 ] 2>/dev/null; then
      printf '%s\n' "$RESULT_BODY" >&2
      return 1
    fi
  fi

  _projectname_hooks PreResult

  [ -n "$RESULT_BODY" ] && printf '%s\n' "$RESULT_BODY"
  return 0
}

# URL-encode one value (jq does the escaping).
_projectname_encode() {
  jq -rn --arg v "$1" '$v | @uri'
}
