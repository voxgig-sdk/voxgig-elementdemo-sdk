# Elementdemo SDK — element operations. GENERATED, do not edit.
#
# Arguments are name=value pairs; unknown names become query parameters.
# Body-carrying operations read the JSON record from stdin. Results are
# JSON on stdout; errors are JSON on stderr with a non-zero return.

# element create
elementdemo_element_create() {
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "element create: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  _args='{}'
  local _body=""
  if [ ! -t 0 ]; then
    _body=$(cat)
  fi
  [ -n "$_body" ] || _body='{}'
  elementdemo_request POST "/element" "$_body" "$_query" "element" "create" "$_args"
}

# element ionize (action)
elementdemo_element_ionize() {
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "element ionize (action): arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$id" ] || { _elementdemo_error "required" "element ionize (action): id is required"; return 2; }
  _args=$(jq -n --arg id "$id" \
    '{id: $id} | with_entries(select(.value != ""))')
  local _body=""
  if [ ! -t 0 ]; then
    _body=$(cat)
  fi
  [ -n "$_body" ] || _body='{}'
  elementdemo_request POST "/element/$(_elementdemo_encode "$id")/ionize" "$_body" "$_query" "element" "ionize" "$_args"
}

# element list
elementdemo_element_list() {
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "element list: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  _args='{}'
  elementdemo_request GET "/element" "" "$_query" "element" "list" "$_args"
}

# element load
elementdemo_element_load() {
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "element load: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$id" ] || { _elementdemo_error "required" "element load: id is required"; return 2; }
  _args=$(jq -n --arg id "$id" \
    '{id: $id} | with_entries(select(.value != ""))')
  elementdemo_request GET "/element/$(_elementdemo_encode "$id")" "" "$_query" "element" "load" "$_args"
}

# element remove
elementdemo_element_remove() {
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "element remove: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$id" ] || { _elementdemo_error "required" "element remove: id is required"; return 2; }
  _args=$(jq -n --arg id "$id" \
    '{id: $id} | with_entries(select(.value != ""))')
  elementdemo_request DELETE "/element/$(_elementdemo_encode "$id")" "" "$_query" "element" "remove" "$_args"
}

# element update
elementdemo_element_update() {
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "element update: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$id" ] || { _elementdemo_error "required" "element update: id is required"; return 2; }
  _args=$(jq -n --arg id "$id" \
    '{id: $id} | with_entries(select(.value != ""))')
  local _body=""
  if [ ! -t 0 ]; then
    _body=$(cat)
  fi
  [ -n "$_body" ] || _body='{}'
  elementdemo_request PUT "/element/$(_elementdemo_encode "$id")" "$_body" "$_query" "element" "update" "$_args"
}
