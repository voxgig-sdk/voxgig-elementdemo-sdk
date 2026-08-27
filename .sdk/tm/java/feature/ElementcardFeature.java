package JAVAPACKAGE.feature;

import java.util.Map;

import JAVAPACKAGE.core.Context;
import JAVAPACKAGE.core.Result;
import JAVAPACKAGE.core.SdkClient;

// elementcard's OVERLAY for the bundled `java` target.
//
// The bundled java target's own template tree knows nothing about this
// feature and must not be edited to learn — this package ships the source
// at the layout `java` uses (`feature/<Name>Feature.java`) under its own
// `tm/java`, and the fan-out copies it across at `feature add` time.
//
// Renders a result record shaped like an element (number, symbol, name,
// mass) as an ASCII periodic-table tile. Shape-triggered, not entity-bound:
// any single-record result with those four fields gets a card. The card,
// exactly (inner width 9; number left, symbol right; name and mass centred
// with the left bias; integral numbers without a decimal point; names
// truncate at 9):
//
//   +---------+
//   |26     Fe|
//   |  Iron   |
//   | 55.845  |
//   +---------+
//
// The aggregates live on the feature as public fields (count, last) —
// java's home for the record ts keeps at `client._elementcard`, the same
// split the retry and timeout features make. `print: true` writes each
// card to stdout.
@SuppressWarnings({"unchecked"})
public class ElementcardFeature extends BaseFeature {

  private static final int CARD_WIDTH = 9;
  private static final String CARD_EDGE = "+" + "-".repeat(CARD_WIDTH) + "+";

  private SdkClient client;
  private Map<String, Object> options;

  // Activity tracking (mirrors the ts client._elementcard record).
  public int count = 0;
  public String last = "";

  public ElementcardFeature() {
    super("elementcard", "0.1.0", true);
  }

  @Override
  public void init(Context ctx, Map<String, Object> options) {
    this.client = ctx.client;
    this.options = options;
    this.active = FeatureOptions.foptBool(options, "active", false);
  }

  /** The card for one element-shaped record (mirrors the ts `render`). */
  public String render(Map<String, Object> rec) {
    return renderCard(rec);
  }

  @Override
  public void preResult(Context ctx) {
    if (!this.active) {
      return;
    }

    Result result = ctx.result;
    if (result == null) {
      return;
    }

    // preResult fires between makeResponse and makeResult, so the parsed
    // body is on the result and resdata is usually still unset; prefer
    // resdata when a feature or transform has already supplied it.
    Object data = result.resdata != null ? result.resdata : result.body;

    if (!shaped(data)) {
      return;
    }

    String card = renderCard((Map<String, Object>) data);
    this.count++;
    this.last = card;

    if (FeatureOptions.foptBool(this.options, "print", false)) {
      System.out.println(card);
    }
  }

  // True when the record is a single element-shaped result. A JSON array
  // parses to a List, never a Map, so the Map check excludes it; Boolean
  // is not a Number in java, so the numeric checks cannot admit one.
  private static boolean shaped(Object data) {
    if (!(data instanceof Map)) {
      return false;
    }
    Map<String, Object> rec = (Map<String, Object>) data;
    return rec.get("number") instanceof Number
        && rec.get("symbol") instanceof String
        && rec.get("name") instanceof String
        && rec.get("mass") instanceof Number;
  }

  // Renders a numeric value the way every target must: integral values
  // with NO decimal point ('247', '26'), anything else in its shortest
  // natural form ('55.845', '196.97'). JSON numbers arrive as Integer,
  // Long or Double depending on the parser, so normalise: integral
  // renders as long, the rest as Double.toString.
  private static String numstr(Object v) {
    Number n = (Number) v;
    if (n instanceof Double || n instanceof Float) {
      double d = n.doubleValue();
      if (!Double.isNaN(d) && !Double.isInfinite(d) && d == Math.rint(d)) {
        return Long.toString((long) d);
      }
      return Double.toString(d);
    }
    return Long.toString(n.longValue());
  }

  private static String pad(int n) {
    return n <= 0 ? "" : " ".repeat(n);
  }

  // Centres s in w with the LEFT bias (left pad = floor((w-len)/2)),
  // truncated at w.
  private static String center(String s, int w) {
    if (s.length() >= w) {
      return s.substring(0, w);
    }
    int p = w - s.length();
    int left = p / 2;
    return pad(left) + s + pad(p - left);
  }

  // The card for one element-shaped record. Lines joined with \n, no
  // trailing newline.
  private static String renderCard(Map<String, Object> rec) {
    String num = numstr(rec.get("number"));
    String sym = String.valueOf(rec.get("symbol"));
    String line2 =
        "|" + num + pad(CARD_WIDTH - num.length() - sym.length()) + sym + "|";
    return CARD_EDGE + "\n"
        + line2 + "\n"
        + "|" + center(String.valueOf(rec.get("name")), CARD_WIDTH) + "|\n"
        + "|" + center(numstr(rec.get("mass")), CARD_WIDTH) + "|\n"
        + CARD_EDGE;
  }
}
