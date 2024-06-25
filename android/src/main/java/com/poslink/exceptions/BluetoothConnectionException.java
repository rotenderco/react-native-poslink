package com.poslink.exceptions;

public class BluetoothConnectionException extends POSLinkException {
  public BluetoothConnectionException(int code) {
    super(code, "Bluetooth Connection Failed");
  }
}
