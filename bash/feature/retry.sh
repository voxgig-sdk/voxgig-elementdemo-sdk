# Elementdemo SDK — retry feature (bash).
#
# In bash the retry policy maps straight onto curl's own retry engine:
# the PreRequest hook contributes --retry flags to the transport. curl
# retries transient failures (connection errors, 408/429/5xx with
# --retry-all-errors) with its built-in backoff, and honours Retry-After.
#
#   ELEMENTDEMO_RETRY_ACTIVE=1     switch on
#   ELEMENTDEMO_RETRY_RETRIES=2    attempts after the first (default 2)
#   ELEMENTDEMO_RETRY_MAXTIME=30   total retry budget, seconds (default 30)

_elementdemo_register_feature "retry"

elementdemo_feature_retry_PreRequest() {
  local retries="${ELEMENTDEMO_RETRY_RETRIES:-2}"
  local maxtime="${ELEMENTDEMO_RETRY_MAXTIME:-30}"
  CURL_ARGS+=(--retry "$retries" --retry-all-errors --retry-max-time "$maxtime")
}
