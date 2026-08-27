# ProjectName SDK — timeout feature (bash).
#
# Bounds each request with a deadline, which in bash is curl's own
# --max-time. The PreRequest hook contributes it to the transport.
#
#   PROJECTENV_TIMEOUT_ACTIVE=1    switch on
#   PROJECTENV_TIMEOUT_MS=5000     deadline in milliseconds (default 5000)

_projectname_register_feature "timeout"

projectname_feature_timeout_PreRequest() {
  local ms="${PROJECTENV_TIMEOUT_MS:-5000}"
  # curl takes seconds; fractional values are allowed.
  local secs
  secs=$(awk -v ms="$ms" 'BEGIN { printf "%.3f", ms / 1000 }')
  CURL_ARGS+=(--max-time "$secs")
}
