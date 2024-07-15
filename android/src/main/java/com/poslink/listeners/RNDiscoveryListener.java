package com.poslink.listeners;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import com.poslink.ReactNativeConstants;
import com.poslink.exceptions.BluetoothScannerException;
import com.poslink.bluetoothscan.Reader;

import java.util.List;

public class RNDiscoveryListener extends RNListener {

  public static final String NAME = "RNDiscoveryListener";

  public RNDiscoveryListener(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  public void onUpdateDiscoveredReaders(List<Reader> readers) {
    if (readers.isEmpty()) {
      return;
    }
    WritableArray writableReaders = Arguments.createArray();
    for (Reader reader : readers) {
      WritableMap readerMap = Arguments.createMap();
      readerMap.putString("name", reader.getName());
      readerMap.putString("serialNumber", reader.getSerialNumber());
      readerMap.putString("address", reader.getAddress());
      writableReaders.pushMap(readerMap);
      Log.d(NAME, reader.toString());
    }
    this.getEventEmitter().emit(ReactNativeConstants.UPDATE_DISCOVERED_READERS.listenerName, writableReaders);
  }

  public void onSuccess() {
    Log.d(NAME, "Success");
    this.getEventEmitter().emit(ReactNativeConstants.FINISH_DISCOVERING_READERS.listenerName, null);
  }

  public void onFailure(BluetoothScannerException e) {
    Log.d(NAME, "Failure");
    this.getEventEmitter().emit(ReactNativeConstants.FINISH_DISCOVERING_READERS.listenerName, e.toWritableMap());
  }

}
