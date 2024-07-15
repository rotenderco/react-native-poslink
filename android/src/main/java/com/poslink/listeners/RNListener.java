package com.poslink.listeners;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

public abstract class RNListener {

  private final RCTDeviceEventEmitter eventEmitter;
  public RNListener(ReactApplicationContext reactContext) {
    this.eventEmitter = reactContext.getJSModule(RCTDeviceEventEmitter.class);
  }

  public RCTDeviceEventEmitter getEventEmitter() {
    return eventEmitter;
  }
}
