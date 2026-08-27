# Elementdemo SDK — bash entry point. GENERATED, do not edit.
#
#   source bash/elementdemo.sh
#
# Loads the core, every generated entity, and every generated feature.

ELEMENTDEMO_SDK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The model's server URL — override per environment with ELEMENTDEMO_BASE.
ELEMENTDEMO_SDK_DEFAULT_BASE="http://localhost:8902"

source "${ELEMENTDEMO_SDK_DIR}/core/core.sh"

for _elementdemo_part in "${ELEMENTDEMO_SDK_DIR}"/entity/*.sh; do
  [ -e "$_elementdemo_part" ] && source "$_elementdemo_part"
done

for _elementdemo_part in "${ELEMENTDEMO_SDK_DIR}"/feature/*.sh; do
  [ -e "$_elementdemo_part" ] && source "$_elementdemo_part"
done
unset _elementdemo_part
