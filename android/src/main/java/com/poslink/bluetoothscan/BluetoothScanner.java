package com.poslink.bluetoothscan;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;

import com.facebook.react.bridge.ReactApplicationContext;
import com.poslink.exceptions.BluetoothScannerException;
import com.poslink.listeners.RNDiscoveryListener;

import android.bluetooth.le.ScanSettings;
import android.os.Handler;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class BluetoothScanner {

  public static final String NAME = "BluetoothScanner";

  private final BluetoothLeScanner bluetoothLeScanner;
  private boolean scanning = false;
  private final Handler handler = new Handler();
  // Stops scanning after 10 seconds.
  private static final long SCAN_PERIOD = 10000;

  private final RNDiscoveryListener listener;

  private final List<Reader> readers = new ArrayList<>();

  // Device scan callback.
  private final ScanCallback leScanCallback = new ScanCallback() {

    @SuppressLint("MissingPermission")
    @Override
    public void onBatchScanResults(List<ScanResult> results) {
      super.onBatchScanResults(results);
      for (ScanResult result : results) {
        BluetoothDevice device = result.getDevice();
        readers.add(new Reader(device.getName(), device.getName(), device.getAddress()));
      }
      listener.onUpdateDiscoveredReaders(readers);
    }

    @Override
    public void onScanFailed(int errorCode) {
      try {
        throw new BluetoothScannerException(errorCode);
      } catch (BluetoothScannerException e) {
        listener.onFailure(e);
      }
    }
  };

  public BluetoothScanner(ReactApplicationContext reactContext, RNDiscoveryListener listener) {
    this.listener = listener;
    BluetoothManager bluetoothManager = reactContext.getSystemService(BluetoothManager.class);
    BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();
    this.bluetoothLeScanner = bluetoothAdapter.getBluetoothLeScanner();
    Log.d(NAME, "Init the bluetooth scanner");
  }

  @SuppressLint("MissingPermission")
  public void scanLeDevice() {
    if (!scanning) {
      // Stops scanning after a predefined scan period.
      this.handler.postDelayed(new Runnable() {
        @Override
        public void run() {
          scanning = false;
          Log.d(NAME, "Stop scanning");
          bluetoothLeScanner.stopScan(leScanCallback);
          listener.onSuccess();
        }
      }, SCAN_PERIOD);

      scanning = true;
      bluetoothLeScanner.startScan(null, new ScanSettings.Builder().setReportDelay(100).build(), leScanCallback);
    } else {
      scanning = false;
      Log.d(NAME, "Stop scanning");
      bluetoothLeScanner.stopScan(leScanCallback);
    }
  }

  @SuppressLint("MissingPermission")
  public boolean stopScanning() {
    if (scanning) {
      scanning = false;
      this.bluetoothLeScanner.stopScan(leScanCallback);
      return true;
    }
    return false;
  }
}
