# Elementdemo SDK elementcard feature
#
# elementcard's OVERLAY for the bundled `py` target.
#
# The bundled py target's own template tree knows nothing about this
# feature and must not be edited to learn — this package ships the source
# at the layout `py` uses (`pkg/feature/<name>_feature.py`) under its own
# `tm/py`, and the fan-out copies it across at `feature add` time.
#
# Renders a result record shaped like an element (number, symbol, name,
# mass) as an ASCII periodic-table tile. Shape-triggered, not entity-bound:
# any single-record result with those four fields gets a card. The card,
# exactly (inner width 9; number left, symbol right; name and mass centred
# with the left bias; integral numbers without a decimal point; names
# truncate at 9):
#
#   +---------+
#   |26     Fe|
#   |  Iron   |
#   | 55.845  |
#   +---------+
#
# State lands on the client as `_elementcard: {count, last}` — the record
# the shared feature corpus asserts on. `print: true` writes each card to
# stdout.

from __future__ import annotations

from elementdemo_sdk.feature.base_feature import ElementdemoBaseFeature


CARD_WIDTH = 9
CARD_EDGE = "+" + ("-" * CARD_WIDTH) + "+"


def _numeric(value):
    # bool is a subclass of int in python, so True would otherwise pass as
    # a number — exclude it explicitly, as the ts `typeof` check does by
    # construction.
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _numstr(value):
    # Integral values render with NO decimal point ('247', '26');
    # anything else in its shortest natural form ('55.845', '196.97').
    if isinstance(value, int):
        return str(value)
    if float(value).is_integer():
        return str(int(value))
    return str(value)


def _pad(n):
    return " " * max(0, n)


def _center(s, w):
    # Centred with the LEFT bias (left pad = floor((w-len)/2)),
    # truncated at w.
    if len(s) >= w:
        return s[:w]
    p = w - len(s)
    left = p // 2
    return _pad(left) + s + _pad(p - left)


def _shaped(data):
    # True when the record is a single element-shaped result (a dict, so
    # a list of records never matches).
    return (
        isinstance(data, dict)
        and _numeric(data.get("number"))
        and isinstance(data.get("symbol"), str)
        and isinstance(data.get("name"), str)
        and _numeric(data.get("mass"))
    )


def render_element_card(rec):
    # The card for one element-shaped record. Lines joined with \n, no
    # trailing newline.
    num = _numstr(rec.get("number"))
    sym = str(rec.get("symbol"))
    line2 = "|" + num + _pad(CARD_WIDTH - len(num) - len(sym)) + sym + "|"
    return "\n".join([
        CARD_EDGE,
        line2,
        "|" + _center(str(rec.get("name")), CARD_WIDTH) + "|",
        "|" + _center(_numstr(rec.get("mass")), CARD_WIDTH) + "|",
        CARD_EDGE,
    ])


class ElementdemoElementcardFeature(ElementdemoBaseFeature):
    def __init__(self):
        super().__init__()
        self.version = "0.1.0"
        self.name = "elementcard"
        self.active = True
        self.client = None
        self.options = {}

    def init(self, ctx, options):
        self.client = ctx.client
        self.options = options if isinstance(options, dict) else {}
        self.active = self.options.get("active") is True

        # The record exists from init, so "never fired" is a well-defined
        # {count: 0} rather than an absent attribute.
        client = ctx.client
        if client is not None and getattr(client, "_elementcard", None) is None:
            client._elementcard = {"count": 0, "last": ""}

    def render(self, rec):
        return render_element_card(rec)

    def PreResult(self, ctx):
        if not self.active:
            return

        result = ctx.result
        if result is None:
            return

        # PreResult fires between make_response and make_result, so the
        # parsed body is on the result and resdata is usually still unset;
        # prefer resdata when a feature or transform has already supplied it.
        data = result.body if result.resdata is None else result.resdata

        if not _shaped(data):
            return

        card = render_element_card(data)

        client = self.client if self.client is not None else ctx.client
        record = getattr(client, "_elementcard", None)
        if record is None:
            record = {"count": 0, "last": ""}
            client._elementcard = record
        record["count"] += 1
        record["last"] = card

        if self.options.get("print") is True:
            print(card)
