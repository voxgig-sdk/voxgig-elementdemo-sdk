package voxgig.elementdemosdk.core;

// Typed reference models for the Elementdemo SDK.
//
// GENERATED from the API model: main.kit.entity.<e>.fields[] and per-op
// params (op.<name>.points[].args.params[]). Field/param types come from the
// canonical type sentinels (source of truth: @voxgig/apidef VALID_CANON). Do
// not edit by hand.
//
// These records are documentation/DX reference shapes ONLY. The SDK ops take
// and return the loose object model (Map<String, Object> / Object) at runtime,
// so these types are not wired into the op signatures — use them to describe a
// payload before converting it to a map. Every component is a boxed (nullable)
// type, so an optional (req:false) key needs no distinct rendering.

import java.util.List;
import java.util.Map;

public final class ElementdemoTypes {

  private ElementdemoTypes() {}

  public record Element(String block, Long charge, Long discovered, Long group, String id, String ion, Double mass, String name, Long number, Boolean ok, Long period, String phase, String series_id, String symbol) {}

  public record ElementLoadMatch(String id) {}

  public record ElementListMatch(String block, Long charge, Long discovered, Long group, String id, String ion, Double mass, String name, Long number, Boolean ok, Long period, String phase, String series_id, String symbol) {}

  public record ElementCreateData(String block, Long charge, Long discovered, Long group, String id, String ion, Double mass, String name, Long number, Boolean ok, Long period, String phase, String series_id, String symbol) {}

  public record ElementUpdateData(String id, String block, Long charge, Long discovered, Long group, String ion, Double mass, String name, Long number, Boolean ok, Long period, String phase, String series_id, String symbol) {}

  public record ElementRemoveMatch(String id) {}

  public record Group(String cas, String id, String name, Long number) {}

  public record GroupLoadMatch(String id) {}

  public record GroupListMatch(String cas, String id, String name, Long number) {}

  public record Isotope(Double abundance, String element_id, String halflife, String id, Double mass, Long mass_number, String mode, String name, Boolean ok, String product, Boolean stable, Long steps) {}

  public record IsotopeLoadMatch(String element_id, String id) {}

  public record IsotopeListMatch(String element_id) {}

  public record IsotopeCreateData(String element_id, Double abundance, String halflife, String id, Double mass, Long mass_number, String mode, String name, Boolean ok, String product, Boolean stable, Long steps) {}

  public record IsotopeUpdateData(String element_id, String id, Double abundance, String halflife, Double mass, Long mass_number, String mode, String name, Boolean ok, String product, Boolean stable, Long steps) {}

  public record IsotopeRemoveMatch(String element_id, String id) {}

  public record Series(String color, String description, String id, String name) {}

  public record SeriesLoadMatch(String id) {}

  public record SeriesListMatch(String color, String description, String id, String name) {}

}
