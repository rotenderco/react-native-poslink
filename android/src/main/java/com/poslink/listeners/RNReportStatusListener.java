package com.poslink.listeners;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.pax.poslinkadmin.ReportStatusListener;
import com.poslink.ReactNativeConstants;

public class RNReportStatusListener implements ReportStatusListener {

  public static final String NAME = "RNReportStatusListener";
  private final RCTDeviceEventEmitter eventEmitter;

  public RNReportStatusListener(ReactApplicationContext reactContext) {
    this.eventEmitter = reactContext.getJSModule(RCTDeviceEventEmitter.class);
    Log.d(NAME, "init");
  }

  @Override
  public void onReportStatus(int status) {
    Log.d(NAME, "status: " + status);
    this.eventEmitter.emit(ReactNativeConstants.REQUEST_READER_STATUS.listenerName, status);
  }
}
