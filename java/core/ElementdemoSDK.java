package voxgig.elementdemosdk.core;

import java.util.Map;

/**
 * Elementdemo SDK client. All transport and pipeline behaviour lives in
 * the SdkClient base (core/SdkClient.java); this class binds the
 * API-specific entity accessors and the test-mode constructor.
 */
public class ElementdemoSDK extends SdkClient {

  public ElementdemoSDK() {
    this(null);
  }

  public ElementdemoSDK(Map<String, Object> options) {
    super(options);
  }


  /**
   * Returns a element entity bound to this client.
   * Idiomatic usage: client.element(null).list(null, null) or
   * client.element(null).load(Map.of("id", ...), null).
   */
  public SdkEntity element(Map<String, Object> entopts) {
    return new voxgig.elementdemosdk.entity.ElementEntity(this, entopts);
  }

  /**
   * Returns a group entity bound to this client.
   * Idiomatic usage: client.group(null).list(null, null) or
   * client.group(null).load(Map.of("id", ...), null).
   */
  public SdkEntity group(Map<String, Object> entopts) {
    return new voxgig.elementdemosdk.entity.GroupEntity(this, entopts);
  }

  /**
   * Returns a isotope entity bound to this client.
   * Idiomatic usage: client.isotope(null).list(null, null) or
   * client.isotope(null).load(Map.of("id", ...), null).
   */
  public SdkEntity isotope(Map<String, Object> entopts) {
    return new voxgig.elementdemosdk.entity.IsotopeEntity(this, entopts);
  }

  /**
   * Returns a series entity bound to this client.
   * Idiomatic usage: client.series(null).list(null, null) or
   * client.series(null).load(Map.of("id", ...), null).
   */
  public SdkEntity series(Map<String, Object> entopts) {
    return new voxgig.elementdemosdk.entity.SeriesEntity(this, entopts);
  }


  // testSDK builds a client in test mode: the test feature is activated,
  // installing the in-memory mock transport (no network activity).
  public static ElementdemoSDK testSDK() {
    return testSDK(null, null);
  }

  public static ElementdemoSDK testSDK(
      Map<String, Object> testopts, Map<String, Object> sdkopts) {
    ElementdemoSDK sdk = new ElementdemoSDK(SdkClient.testOptions(testopts, sdkopts));
    sdk.mode = "test";
    return sdk;
  }
}
