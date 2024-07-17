package com.poslink.listeners.connection;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.poslink.ReactNativeConstants;
import com.poslink.exceptions.POSLinkException;
import com.poslink.listeners.RNListener;

public class RNReportUnexpectedReaderDisconnectListener extends RNListener {
  public RNReportUnexpectedReaderDisconnectListener(ReactApplicationContext reactContext, @Nullable POSLinkException exception) {
    super(reactContext);
    this.getEventEmitter().emit(ReactNativeConstants.REPORT_UNEXPECTED_READER_DISCONNECT.listenerName, exception == null ? null : exception.toWritableMap());
  }
}
