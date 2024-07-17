package com.poslink.listeners.connection;

import com.facebook.react.bridge.ReactApplicationContext;
import com.poslink.DisconnectReason;
import com.poslink.ReactNativeConstants;
import com.poslink.listeners.RNListener;

public class RNDisconnectListener extends RNListener {
  public RNDisconnectListener(ReactApplicationContext reactContext, DisconnectReason disconnectReason) {
    super(reactContext);
    this.getEventEmitter().emit(ReactNativeConstants.DISCONNECT.listenerName, disconnectReason.reason);
  }
}
