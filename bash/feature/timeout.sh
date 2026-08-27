# Elementdemo SDK — timeout feature (bash).
#
# Bounds each request with a deadline, which in bash is curl's own
# --max-time. The PreRequest hook contributes it to the transport.
#
#   ELEMENTDEMO_TIMEOUT_ACTIVE=1    switch on
#   ELEMENTDEMO_TIMEOUT_MS=5000     deadline in milliseconds (default 5000)

_elementdemo_register_feature "timeout"

elementdemo_feature_timeout_PreRequest() {
  local ms="${ELEMENTDEMO_TIMEOUT_MS:-5000}"
  # curl takes seconds; fractional values are allowed.
  local secs
  secs=$(awk -v ms="$ms" 'BEGIN { printf "%.3f", ms / 1000 }')
  CURL_ARGS+=(--max-time "$secs")
}
