package com.poslink.listeners.connection;

import com.facebook.react.bridge.ReactApplicationContext;
import com.poslink.ReactNativeConstants;
import com.poslink.listeners.RNListener;

public class RNStartReaderReconnectListener extends RNListener {

  public RNStartReaderReconnectListener(ReactApplicationContext reactContext) {
    super(reactContext);
    this.getEventEmitter().emit(ReactNativeConstants.START_READER_RECONNECT.listenerName, null);
  }
}
