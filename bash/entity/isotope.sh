# Elementdemo SDK — isotope operations. GENERATED, do not edit.
#
# Arguments are name=value pairs; unknown names become query parameters.
# Body-carrying operations read the JSON record from stdin. Results are
# JSON on stdout; errors are JSON on stderr with a non-zero return.

# isotope create
elementdemo_isotope_create() {
  local element_id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      element_id=*) element_id="${_kv#element_id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "isotope create: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$element_id" ] || { _elementdemo_error "required" "isotope create: element_id is required"; return 2; }
  _args=$(jq -n --arg element_id "$element_id" \
    '{element_id: $element_id} | with_entries(select(.value != ""))')
  local _body=""
  if [ ! -t 0 ]; then
    _body=$(cat)
  fi
  [ -n "$_body" ] || _body='{}'
  elementdemo_request POST "/api/element/$(_elementdemo_encode "$element_id")/isotope" "$_body" "$_query" "isotope" "create" "$_args"
}

# isotope decay (action)
elementdemo_isotope_decay() {
  local element_id=""
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      element_id=*) element_id="${_kv#element_id=}" ;;
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "isotope decay (action): arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$element_id" ] || { _elementdemo_error "required" "isotope decay (action): element_id is required"; return 2; }
  [ -n "$id" ] || { _elementdemo_error "required" "isotope decay (action): id is required"; return 2; }
  _args=$(jq -n --arg element_id "$element_id" --arg id "$id" \
    '{element_id: $element_id, id: $id} | with_entries(select(.value != ""))')
  local _body=""
  if [ ! -t 0 ]; then
    _body=$(cat)
  fi
  [ -n "$_body" ] || _body='{}'
  elementdemo_request POST "/api/element/$(_elementdemo_encode "$element_id")/isotope/$(_elementdemo_encode "$id")/decay" "$_body" "$_query" "isotope" "decay" "$_args"
}

# isotope list
elementdemo_isotope_list() {
  local element_id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      element_id=*) element_id="${_kv#element_id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "isotope list: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$element_id" ] || { _elementdemo_error "required" "isotope list: element_id is required"; return 2; }
  _args=$(jq -n --arg element_id "$element_id" \
    '{element_id: $element_id} | with_entries(select(.value != ""))')
  elementdemo_request GET "/api/element/$(_elementdemo_encode "$element_id")/isotope" "" "$_query" "isotope" "list" "$_args"
}

# isotope load
elementdemo_isotope_load() {
  local element_id=""
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      element_id=*) element_id="${_kv#element_id=}" ;;
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "isotope load: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$element_id" ] || { _elementdemo_error "required" "isotope load: element_id is required"; return 2; }
  [ -n "$id" ] || { _elementdemo_error "required" "isotope load: id is required"; return 2; }
  _args=$(jq -n --arg element_id "$element_id" --arg id "$id" \
    '{element_id: $element_id, id: $id} | with_entries(select(.value != ""))')
  elementdemo_request GET "/api/element/$(_elementdemo_encode "$element_id")/isotope/$(_elementdemo_encode "$id")" "" "$_query" "isotope" "load" "$_args"
}

# isotope remove
elementdemo_isotope_remove() {
  local element_id=""
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      element_id=*) element_id="${_kv#element_id=}" ;;
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "isotope remove: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$element_id" ] || { _elementdemo_error "required" "isotope remove: element_id is required"; return 2; }
  [ -n "$id" ] || { _elementdemo_error "required" "isotope remove: id is required"; return 2; }
  _args=$(jq -n --arg element_id "$element_id" --arg id "$id" \
    '{element_id: $element_id, id: $id} | with_entries(select(.value != ""))')
  elementdemo_request DELETE "/api/element/$(_elementdemo_encode "$element_id")/isotope/$(_elementdemo_encode "$id")" "" "$_query" "isotope" "remove" "$_args"
}

# isotope update
elementdemo_isotope_update() {
  local element_id=""
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      element_id=*) element_id="${_kv#element_id=}" ;;
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "isotope update: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$element_id" ] || { _elementdemo_error "required" "isotope update: element_id is required"; return 2; }
  [ -n "$id" ] || { _elementdemo_error "required" "isotope update: id is required"; return 2; }
  _args=$(jq -n --arg element_id "$element_id" --arg id "$id" \
    '{element_id: $element_id, id: $id} | with_entries(select(.value != ""))')
  local _body=""
  if [ ! -t 0 ]; then
    _body=$(cat)
  fi
  [ -n "$_body" ] || _body='{}'
  elementdemo_request PUT "/api/element/$(_elementdemo_encode "$element_id")/isotope/$(_elementdemo_encode "$id")" "$_body" "$_query" "isotope" "update" "$_args"
}
