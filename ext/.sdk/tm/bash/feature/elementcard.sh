# ProjectName SDK — elementcard feature (bash).
#
# Renders a result record shaped like an element (number, symbol, name,
# mass) as an ASCII periodic-table tile. Shape-triggered, not entity-bound:
# any single-record result with those four fields gets a card.
#
#   PROJECTENV_ELEMENTCARD_ACTIVE=1   switch on
#   PROJECTENV_ELEMENTCARD_PRINT=1    also print each card (stderr, so
#                                     stdout stays clean JSON)
#
# State mirrors the other targets' client._elementcard record:
# PROJECTNAME_ELEMENTCARD_COUNT and PROJECTNAME_ELEMENTCARD_LAST.

_projectname_register_feature "elementcard"

PROJECTNAME_ELEMENTCARD_COUNT=0
PROJECTNAME_ELEMENTCARD_LAST=""

# Render one element-shaped JSON record (argument or stdin) as the card.
# The layout, exactly: inner width 9; atomic number left, symbol right;
# name and mass centred with the left bias; integral numbers render
# without a decimal point; names truncate at 9.
projectname_elementcard_render() {
  local rec="${1:-$(cat)}"
  jq -r '
    def num: if type == "number" and . == floor then floor else . end | tostring;
    def sp(n): if n > 0 then (" " * n) else "" end;
    def center(w): tostring as $s | ($s | length) as $l
      | if $l >= w then $s[0:w]
        else ((w - $l) as $p
          | sp(($p / 2) | floor) + $s + sp($p - (($p / 2) | floor)))
        end;
    . as $r
    | (($r.number | num)) as $n
    | ($r.symbol | tostring) as $s
    | "+---------+\n"
      + "|" + $n + sp(9 - ($n | length) - ($s | length)) + $s + "|\n"
      + "|" + ($r.name | center(9)) + "|\n"
      + "|" + ($r.mass | center(9)) + "|\n"
      + "+---------+"
  ' <<< "$rec"
}

# True when the JSON in $1 is a single element-shaped record.
_projectname_elementcard_shaped() {
  jq -e '
    type == "object"
    and (.number | type) == "number"
    and (.symbol | type) == "string"
    and (.name | type) == "string"
    and (.mass | type) == "number"
  ' <<< "$1" >/dev/null 2>&1
}

projectname_feature_elementcard_PreResult() {
  [ -n "${RESULT_BODY:-}" ] || return 0
  _projectname_elementcard_shaped "$RESULT_BODY" || return 0

  PROJECTNAME_ELEMENTCARD_LAST=$(projectname_elementcard_render "$RESULT_BODY")
  PROJECTNAME_ELEMENTCARD_COUNT=$((PROJECTNAME_ELEMENTCARD_COUNT + 1))

  if [ "1" = "${PROJECTENV_ELEMENTCARD_PRINT:-}" ] \
    || [ "true" = "${PROJECTENV_ELEMENTCARD_PRINT:-}" ]; then
    printf '%s\n' "$PROJECTNAME_ELEMENTCARD_LAST" >&2
  fi
}
