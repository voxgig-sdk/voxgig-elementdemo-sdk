package voxgig.elementdemosdk.sdktest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

import voxgig.elementdemosdk.core.ElementdemoSDK;

public class ExistsTest {

  @Test
  public void testMode() {
    ElementdemoSDK testsdk = ElementdemoSDK.testSDK();
    assertNotNull(testsdk, "expected non-nil SDK");
  }
}
