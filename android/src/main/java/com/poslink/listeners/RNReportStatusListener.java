package com.poslink.listeners;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.pax.poslinkadmin.ReportStatusListener;
import com.poslink.ReactNativeConstants;

public class RNReportStatusListener extends RNListener implements ReportStatusListener {

  public static final String NAME = "RNReportStatusListener";

  public RNReportStatusListener(ReactApplicationContext reactContext) {
    super(reactContext);
    Log.d(NAME, "init");
  }

  @Override
  public void onReportStatus(int status) {
    Log.d(NAME, "status: " + status);
    this.getEventEmitter().emit(ReactNativeConstants.CHANGE_PAYMENT_STATUS.listenerName, status);
  }
}
