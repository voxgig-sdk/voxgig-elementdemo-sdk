package feature

import (
	"fmt"
	"strconv"
	"strings"

	"GOMODULE/core"
)

// elementcard's OVERLAY for the bundled `go` target.
//
// The bundled go target's own template tree knows nothing about this
// feature and must not be edited to learn — this package ships the source
// at the layout `go` uses (`feature/<name>_feature.go`) under its own
// `tm/go`, and the fan-out copies it across at `feature add` time.
//
// Renders a result record shaped like an element (number, symbol, name,
// mass) as an ASCII periodic-table tile. Shape-triggered, not entity-bound:
// any single-record result with those four fields gets a card. The card,
// exactly (inner width 9; number left, symbol right; name and mass centred
// with the left bias; integral numbers without a decimal point; names
// truncate at 9):
//
//	+---------+
//	|26     Fe|
//	|  Iron   |
//	| 55.845  |
//	+---------+
//
// The aggregates live on the feature value (Count, Last) — go's home for
// the record ts keeps at `client._elementcard`, the same split the retry
// and timeout features make. `print: true` writes each card to stdout.
type ElementcardFeature struct {
	BaseFeature
	client  *core.ElementdemoSDK
	options map[string]any

	// Activity tracking (mirrors the ts client._elementcard record).
	Count int
	Last  string
}

const elementcardWidth = 9

var elementcardEdge = "+" + strings.Repeat("-", elementcardWidth) + "+"

func NewElementcardFeature() *ElementcardFeature {
	return &ElementcardFeature{
		BaseFeature: BaseFeature{
			Version: "0.1.0",
			Name:    "elementcard",
			Active:  true,
		},
	}
}

func (f *ElementcardFeature) Init(ctx *core.Context, options map[string]any) {
	f.client = ctx.Client
	f.options = options
	f.Active = foptBool(options, "active", false)
}

// Render exposes the card for one element-shaped record (mirrors the ts
// feature's `render` method).
func (f *ElementcardFeature) Render(rec map[string]any) string {
	return elementcardRender(rec)
}

func (f *ElementcardFeature) PreResult(ctx *core.Context) {
	if !f.Active {
		return
	}

	result := ctx.Result
	if result == nil {
		return
	}

	// PreResult fires between makeResponse and makeResult, so the parsed
	// body is on the result and resdata is usually still unset; prefer
	// resdata when a feature or transform has already supplied it.
	data := result.Resdata
	if data == nil {
		data = result.Body
	}

	rec, ok := elementcardShaped(data)
	if !ok {
		return
	}

	card := elementcardRender(rec)
	f.Count++
	f.Last = card

	if foptBool(f.options, "print", false) {
		fmt.Println(card)
	}
}

// elementcardShaped reports whether the record is a single element-shaped
// result. Booleans are their own type in go, so the numeric cases below
// cannot admit one — the check the dynamic targets must make explicitly.
func elementcardShaped(data any) (map[string]any, bool) {
	rec, isMap := data.(map[string]any)
	if !isMap || rec == nil {
		return nil, false
	}
	if _, ok := elementcardNumstr(rec["number"]); !ok {
		return nil, false
	}
	if _, ok := rec["symbol"].(string); !ok {
		return nil, false
	}
	if _, ok := rec["name"].(string); !ok {
		return nil, false
	}
	if _, ok := elementcardNumstr(rec["mass"]); !ok {
		return nil, false
	}
	return rec, true
}

// elementcardNumstr renders a numeric value the way every target must:
// integral values with NO decimal point ('247', '26'), anything else in
// its shortest natural form ('55.845', '196.97'). FormatFloat's -1
// precision is exactly that rule. Non-numbers report ok=false, which is
// what the shape check keys off.
func elementcardNumstr(v any) (string, bool) {
	switch n := v.(type) {
	case int:
		return strconv.Itoa(n), true
	case int64:
		return strconv.FormatInt(n, 10), true
	case float64:
		return strconv.FormatFloat(n, 'f', -1, 64), true
	case float32:
		return strconv.FormatFloat(float64(n), 'f', -1, 32), true
	}
	return "", false
}

func elementcardPad(n int) string {
	if n <= 0 {
		return ""
	}
	return strings.Repeat(" ", n)
}

// elementcardCenter centres s in w with the LEFT bias (left pad =
// floor((w-len)/2)), truncating at w. Byte-based like the ts feature's
// char-based slice — element fields are ASCII.
func elementcardCenter(s string, w int) string {
	if len(s) >= w {
		return s[:w]
	}
	p := w - len(s)
	left := p / 2
	return elementcardPad(left) + s + elementcardPad(p-left)
}

// elementcardRender draws the card for one element-shaped record.
func elementcardRender(rec map[string]any) string {
	num, _ := elementcardNumstr(rec["number"])
	sym, _ := rec["symbol"].(string)
	name, _ := rec["name"].(string)
	mass, _ := elementcardNumstr(rec["mass"])

	line2 := "|" + num +
		elementcardPad(elementcardWidth-len(num)-len(sym)) + sym + "|"

	return elementcardEdge + "\n" +
		line2 + "\n" +
		"|" + elementcardCenter(name, elementcardWidth) + "|\n" +
		"|" + elementcardCenter(mass, elementcardWidth) + "|\n" +
		elementcardEdge
}
