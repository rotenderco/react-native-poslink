package com.poslink.exceptions;

public class BluetoothScannerException extends POSLinkException {
  public BluetoothScannerException(int code) {
    super(code, "Bluetooth Scan Failed");
  }
}
