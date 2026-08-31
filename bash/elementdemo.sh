# Elementdemo SDK — bash entry point. GENERATED, do not edit.
#
#   source bash/elementdemo.sh
#
# Loads the core, every generated entity, and every generated feature.

ELEMENTDEMO_SDK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The model's server URL — override per environment with ELEMENTDEMO_BASE.
ELEMENTDEMO_SDK_DEFAULT_BASE="http://localhost:8902/api/{account_id}"

# Server variables in that URL. Each {name} is replaced with
# ELEMENTDEMO_SERVER_<NAME>; a placeholder with no value is a hard error, because
# the request would otherwise go to a URL with a literal brace in it.
ELEMENTDEMO_SDK_SERVER_VARS=("account_id")

# The Authorization value prefix, from the spec's security scheme. Empty
# means this API declares no auth and no credential is ever sent.
ELEMENTDEMO_SDK_AUTH_PREFIX="Bearer"

source "${ELEMENTDEMO_SDK_DIR}/core/core.sh"

for _elementdemo_part in "${ELEMENTDEMO_SDK_DIR}"/entity/*.sh; do
  [ -e "$_elementdemo_part" ] && source "$_elementdemo_part"
done

for _elementdemo_part in "${ELEMENTDEMO_SDK_DIR}"/feature/*.sh; do
  [ -e "$_elementdemo_part" ] && source "$_elementdemo_part"
done
unset _elementdemo_part
