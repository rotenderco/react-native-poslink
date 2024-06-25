package com.poslink.bluetoothscan;

import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothDevice;

import androidx.annotation.NonNull;

public class Reader {

  private String name;
  private String serialNumber;
  private String address;
  public Reader(String name, String serialNumber, String address) {
    this.name = name;
    this.serialNumber = serialNumber;
    this.address = address;
  }

  public String getName() {
    return name;
  }

  public String getSerialNumber() {
    return serialNumber;
  }

  public String getAddress() {
    return address;
  }

  @NonNull
  @Override
  public String toString() {
    return "Reader{" +
      "name='" + name + '\'' +
      ", serialNumber='" + serialNumber + '\'' +
      ", address='" + address + '\'' +
      '}';
  }
}
