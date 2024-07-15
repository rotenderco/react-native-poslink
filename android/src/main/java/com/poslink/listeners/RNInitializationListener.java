package com.poslink.listeners;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.pax.poslinkadmin.constant.AppActivated;
import com.pax.poslinkadmin.manage.InitResponse;
import com.poslink.ReactNativeConstants;
import com.poslink.exceptions.POSLinkException;

public class RNInitializationListener extends RNListener {

  public static final String NAME = "RNInitializationListener";

  public RNInitializationListener(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  public void onSuccess(InitResponse initResponse) {
    WritableMap retValueMap = Arguments.createMap();
    retValueMap.putString("sn", initResponse.sn());
    retValueMap.putString("appName", initResponse.appName());
    retValueMap.putString("appVersion", initResponse.appVersion());
    retValueMap.putString("appActivated", initResponse.appActivated().getIndex());
    retValueMap.putString("licenseExpiry", initResponse.licenseExpiry());
    retValueMap.putString("modelName", initResponse.modelName());
    retValueMap.putString("wifiMac", initResponse.wifiMac());
    retValueMap.putString("osVersion", initResponse.osVersion());
    this.getEventEmitter().emit(ReactNativeConstants.INITIALIZATION.listenerName, retValueMap);
  }

  public void onFailure(POSLinkException e) {
    Log.d(NAME, "Failure");
    this.getEventEmitter().emit(ReactNativeConstants.INITIALIZATION_FAIL.listenerName, e.toWritableMap());
  }
}
