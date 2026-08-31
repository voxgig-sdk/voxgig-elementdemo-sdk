# Elementdemo SDK — group operations. GENERATED, do not edit.
#
# Arguments are name=value pairs; unknown names become query parameters.
# Body-carrying operations read the JSON record from stdin. Results are
# JSON on stdout; errors are JSON on stderr with a non-zero return.

# group list
elementdemo_group_list() {
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "group list: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  _args='{}'
  elementdemo_request GET "/group" "" "$_query" "group" "list" "$_args"
}

# group load
elementdemo_group_load() {
  local id=""
  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
      id=*) id="${_kv#id=}" ;;
      *=*) _query="${_query:+${_query}&}${_kv%%=*}=$(_elementdemo_encode "${_kv#*=}")" ;;
      *) _elementdemo_error "bad_arg" "group load: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
  [ -n "$id" ] || { _elementdemo_error "required" "group load: id is required"; return 2; }
  _args=$(jq -n --arg id "$id" \
    '{id: $id} | with_entries(select(.value != ""))')
  elementdemo_request GET "/group/$(_elementdemo_encode "$id")" "" "$_query" "group" "load" "$_args"
}
