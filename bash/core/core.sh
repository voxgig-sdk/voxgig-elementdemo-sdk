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
#   ELEMENTDEMO_SERVER_<NAME>
#                       value for a {name} placeholder in the base URL
#                       (OpenAPI server variables)
#   ELEMENTDEMO_APIKEY   the credential sent as Authorization
#   ELEMENTDEMO_REFRESH_TOKEN
#                       a refresh token, when the API issues short-lived
#                       access tokens (see ELEMENTDEMO_TOKEN_PATH)
#   ELEMENTDEMO_TOKEN_PATH
#                       token endpoint, relative to the base URL
#                       (default: auth/token)
#   ELEMENTDEMO_ENV_FILE the .env file the refresh token is read from when
#                       ELEMENTDEMO_REFRESH_TOKEN is unset (default: .env)
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
    local base
    base=$(_elementdemo_base) || return 1
    local url="${base}${REQ_PATH}"
    [ -n "$REQ_QUERY" ] && url="${url}?${REQ_QUERY}"

    local body_args=()
    [ -n "$REQ_BODY" ] && body_args=(--data "$REQ_BODY")

    # ONE retry, and only for a credential the API says is spent.
    #
    # An access token can expire between two calls — this API invalidates
    # one every four requests — so a 401 is not necessarily a failure, it
    # is often just "buy another and ask again". A second 401 on a token
    # bought moments ago IS a failure (a revoked refresh token, the wrong
    # account), so this happens once rather than in a loop.
    local attempt=0 header_args raw
    while : ; do
      _elementdemo_credential || return 1

      header_args=(-H 'content-type: application/json')
      if [ -n "${ELEMENTDEMO_SDK_CREDENTIAL}" ]; then
        if [ -n "${ELEMENTDEMO_SDK_AUTH_PREFIX:-}" ]; then
          header_args+=(-H "authorization: ${ELEMENTDEMO_SDK_AUTH_PREFIX} ${ELEMENTDEMO_SDK_CREDENTIAL}")
        else
          header_args+=(-H "authorization: ${ELEMENTDEMO_SDK_CREDENTIAL}")
        fi
      fi

      if [ -n "${ELEMENTDEMO_HEADERS:-}" ]; then
        local _line
        while IFS= read -r _line; do
          [ -n "$_line" ] && header_args+=(-H "$_line")
        done <<< "${ELEMENTDEMO_HEADERS}"
      fi

      raw=$(curl -sS -X "$REQ_METHOD" "${header_args[@]}" \
        ${CURL_ARGS[@]:+"${CURL_ARGS[@]}"} "${body_args[@]:+${body_args[@]}}" \
        -w '\n%{http_code}' "$url") || {
        _elementdemo_error "transport" "curl failed for $REQ_METHOD $url"
        return 1
      }

      RESULT_STATUS="${raw##*$'\n'}"
      RESULT_BODY="${raw%$'\n'*}"

      # Retry only when a fresh token could actually change the answer:
      # a 401, a first attempt, and no hard-coded ELEMENTDEMO_APIKEY (which
      # names the credential to use and leaves no room for another).
      if [ "$RESULT_STATUS" = "401" ] && [ 0 = "$attempt" ] &&
         [ -z "${ELEMENTDEMO_APIKEY:-}" ] &&
         _elementdemo_refresh_token >/dev/null 2>&1; then
        ELEMENTDEMO_SDK_ACCESS_TOKEN=""
        attempt=1
        continue
      fi

      break
    done

    if [ "$RESULT_STATUS" -ge 400 ] 2>/dev/null; then
      printf '%s\n' "$RESULT_BODY" >&2
      return 1
    fi
  fi

  _elementdemo_hooks PreResult

  [ -n "$RESULT_BODY" ] && printf '%s\n' "$RESULT_BODY"
  return 0
}

# THE BASE URL, with every server variable substituted.
#
# A spec may template its server URL — http://host/api/{account_id} — and
# the account is then a per-client value, not part of the SDK. Each
# placeholder is replaced with ELEMENTDEMO_SERVER_<NAME>.
#
# An unset placeholder is a hard ERROR rather than an empty string: a
# request to a URL with a literal `{account_id}` in it fails somewhere far
# from the cause, and an empty one silently addresses the wrong resource.
_elementdemo_base() {
  local base="${ELEMENTDEMO_BASE:-$ELEMENTDEMO_SDK_DEFAULT_BASE}"
  local name up value

  for name in "${ELEMENTDEMO_SDK_SERVER_VARS[@]:-}"; do
    [ -n "$name" ] || continue
    up=$(printf '%s' "$name" | tr '[:lower:]' '[:upper:]')
    value=$(eval "printf '%s' \"\${ELEMENTDEMO_SERVER_${up}:-}\"")

    if [ -z "$value" ]; then
      _elementdemo_error "server_var" \
        "the server variable '$name' is required: the API base URL is" \
        "'$base' — set ELEMENTDEMO_SERVER_${up}"
      return 1
    fi

    base="${base//\{$name\}/$value}"
  done

  printf '%s' "$base"
}


# The refresh token, from the environment or a .env file.
#
# The file is read only when the environment does not already carry one, so
# an export always wins — the same first-hit rule the other ports get from
# their provider chain. Parsing is deliberately minimal: KEY=value lines,
# optional surrounding quotes, `#` comments and blanks ignored.
_elementdemo_refresh_token() {
  if [ -n "${ELEMENTDEMO_REFRESH_TOKEN:-}" ]; then
    printf '%s' "${ELEMENTDEMO_REFRESH_TOKEN}"
    return 0
  fi

  local file="${ELEMENTDEMO_ENV_FILE:-.env}"
  [ -f "$file" ] || return 1

  local line value
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      REFRESH_TOKEN=*)
        value="${line#REFRESH_TOKEN=}"
        value="${value%\"}"; value="${value#\"}"
        value="${value%\'}"; value="${value#\'}"
        printf '%s' "$value"
        return 0
        ;;
    esac
  done < "$file"

  return 1
}


# Buy an access token with the refresh token, and cache it for this shell.
#
# Some APIs issue only short-lived access tokens: the long-lived credential
# is a REFRESH token, exchanged at a token endpoint for the value every
# request carries. Sets ELEMENTDEMO_SDK_ACCESS_TOKEN on success.
_elementdemo_buy_token() {
  local refresh base url raw status body
  refresh=$(_elementdemo_refresh_token) || {
    _elementdemo_error "no_refresh_token" \
      "no refresh token: set ELEMENTDEMO_REFRESH_TOKEN, or put" \
      "REFRESH_TOKEN=... in ${ELEMENTDEMO_ENV_FILE:-.env}"
    return 1
  }

  base=$(_elementdemo_base) || return 1
  url="${base%/}/${ELEMENTDEMO_TOKEN_PATH:-auth/token}"

  raw=$(curl -sS -X POST -H 'content-type: application/json' \
    --data "$(jq -rn --arg t "$refresh" '{refresh_token: $t}')" \
    -w '\n%{http_code}' "$url") || {
    _elementdemo_error "transport" "curl failed for the token exchange"
    return 1
  }

  status="${raw##*$'\n'}"
  body="${raw%$'\n'*}"

  if [ "$status" != "200" ]; then
    _elementdemo_error "token_exchange" \
      "token exchange failed: $status from $url"
    return 1
  fi

  ELEMENTDEMO_SDK_ACCESS_TOKEN=$(printf '%s' "$body" | jq -r '.access_token // empty')

  if [ -z "$ELEMENTDEMO_SDK_ACCESS_TOKEN" ]; then
    _elementdemo_error "token_exchange" \
      "token exchange returned no access_token from $url"
    return 1
  fi

  return 0
}


# Resolve the credential this request should carry into
# ELEMENTDEMO_SDK_CREDENTIAL (empty for none).
#
# ELEMENTDEMO_APIKEY is an access token given directly. Otherwise, when a
# refresh token is reachable, one is bought and reused until the API
# refuses it. An API that declares no auth reaches neither, so the
# credential stays empty and no header is sent.
#
# Sets a variable rather than printing one, because buying a token has to
# CACHE it: `$(...)` runs in a subshell, so a token bought there would be
# discarded and the next request would buy another — one exchange per call,
# forever, with nothing failing to show it.
_elementdemo_credential() {
  ELEMENTDEMO_SDK_CREDENTIAL=""

  if [ -n "${ELEMENTDEMO_APIKEY:-}" ]; then
    ELEMENTDEMO_SDK_CREDENTIAL="${ELEMENTDEMO_APIKEY}"
    return 0
  fi

  if [ -z "${ELEMENTDEMO_SDK_ACCESS_TOKEN:-}" ]; then
    _elementdemo_refresh_token >/dev/null 2>&1 || return 0
    _elementdemo_buy_token || return 1
  fi

  ELEMENTDEMO_SDK_CREDENTIAL="${ELEMENTDEMO_SDK_ACCESS_TOKEN}"
}


# URL-encode one value (jq does the escaping).
_elementdemo_encode() {
  jq -rn --arg v "$1" '$v | @uri'
}
