package com.poslink.listeners.connection;

import com.facebook.react.bridge.ReactApplicationContext;
import com.poslink.ConnectionStatus;
import com.poslink.ReactNativeConstants;
import com.poslink.listeners.RNListener;

public class RNChangeConnectionStatusListener extends RNListener {
  public static final String NAME = "RNChangeConnectionListener";

  private ConnectionStatus status = ConnectionStatus.NOT_CONNECTED;

  public RNChangeConnectionStatusListener(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  public void emit(ConnectionStatus status) {
    if (!this.status.equals(status)) {
      this.status = status;
      this.getEventEmitter().emit(ReactNativeConstants.CHANGE_CONNECTION_STATUS.listenerName, status.status);
    }
  }
}
