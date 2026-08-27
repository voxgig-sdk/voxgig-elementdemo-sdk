# ProjectName SDK — test feature (bash).
#
# The offline transport: with PROJECTENV_MODE=test every request is served
# from a JSON store file instead of the network, so scripts and CI run with
# no server and no credentials. The store is the same shape the other
# targets' test mode seeds:
#
#   { "<entity>": { "<id>": { ...record... } } }
#
# Point PROJECTENV_STORE at a writable copy — creates, updates and removes
# rewrite the file. Seed it from a fixture first:
#
#   export PROJECTENV_MODE=test
#   export PROJECTENV_STORE=$(mktemp)
#   projectname_test_seed '{"element":{"fe":{"id":"fe","name":"Iron"}}}'
#
# Action operations (the model's non-CRUD points) need the real API's
# semantics and fail in test mode by design.

_projectname_register_feature "test"

projectname_test_seed() {
  : "${PROJECTENV_STORE:?projectname_test_seed: set PROJECTENV_STORE first}"
  printf '%s' "$1" | jq '.' > "$PROJECTENV_STORE"
}

_projectname_feature_test_request() {
  local method="$1" path="$2" body="$3" entity="$4" op="$5" args="$6"
  local store="${PROJECTENV_STORE:?test mode: set PROJECTENV_STORE}"

  [ -s "$store" ] || printf '{}' > "$store"

  case "$op" in

    list)
      # Any named argument that is a field (a parent id like element_id)
      # filters the collection, mirroring the nested routes.
      jq -c --arg e "$entity" --argjson a "$args" '
        [(.[$e] // {})[]
          | . as $rec
          | select(($a | to_entries | map(.key) | map(select(. != "id")))
              | all(. as $k | ($a[$k] == null) or ($rec[$k] == $a[$k])))]
      ' "$store"
      ;;

    load)
      local rec
      rec=$(jq -c --arg e "$entity" --argjson a "$args" \
        '(.[$e] // {})[$a.id] // empty' "$store")
      if [ -z "$rec" ]; then
        _projectname_error "not_found" "$entity not found: $(jq -r '.id' <<< "$args")"
        return 1
      fi
      printf '%s\n' "$rec"
      ;;

    create)
      local id
      id=$(jq -r '.id // empty' <<< "$body")
      [ -n "$id" ] || id="${entity}$(printf '%04x%04x' "$RANDOM" "$RANDOM")"
      local rec
      rec=$(jq -c --arg id "$id" --argjson a "$args" \
        '. + $a + {id: $id}' <<< "$body")
      local tmp="${store}.tmp"
      jq --arg e "$entity" --arg id "$id" --argjson r "$rec" \
        '.[$e] = ((.[$e] // {}) + {($id): $r})' "$store" > "$tmp" \
        && mv "$tmp" "$store"
      printf '%s\n' "$rec"
      ;;

    update)
      local id
      id=$(jq -r '.id' <<< "$args")
      local prev
      prev=$(jq -c --arg e "$entity" --arg id "$id" \
        '(.[$e] // {})[$id] // empty' "$store")
      if [ -z "$prev" ]; then
        _projectname_error "not_found" "$entity not found: $id"
        return 1
      fi
      local rec
      rec=$(jq -c --argjson b "$body" --arg id "$id" \
        '. + $b + {id: $id}' <<< "$prev")
      local tmp="${store}.tmp"
      jq --arg e "$entity" --arg id "$id" --argjson r "$rec" \
        '.[$e][$id] = $r' "$store" > "$tmp" && mv "$tmp" "$store"
      printf '%s\n' "$rec"
      ;;

    remove)
      local id
      id=$(jq -r '.id' <<< "$args")
      local prev
      prev=$(jq -c --arg e "$entity" --arg id "$id" \
        '(.[$e] // {})[$id] // empty' "$store")
      if [ -z "$prev" ]; then
        _projectname_error "not_found" "$entity not found: $id"
        return 1
      fi
      local tmp="${store}.tmp"
      jq --arg e "$entity" --arg id "$id" 'del(.[$e][$id])' "$store" > "$tmp" \
        && mv "$tmp" "$store"
      printf '%s\n' "$prev"
      ;;

    *)
      _projectname_error "test_mode" \
        "operation $op needs the live API (PROJECTENV_MODE=live)"
      return 1
      ;;
  esac
}
