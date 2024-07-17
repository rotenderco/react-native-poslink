package com.poslink.listeners.connection;

import com.facebook.react.bridge.ReactApplicationContext;
import com.poslink.ReactNativeConstants;
import com.poslink.listeners.RNListener;

public class RNSucceedReaderReconnectListener extends RNListener {
  public RNSucceedReaderReconnectListener(ReactApplicationContext reactContext) {
    super(reactContext);
    this.getEventEmitter().emit(ReactNativeConstants.READER_RECONNECT_SUCCEED.listenerName, null);
  }
}
