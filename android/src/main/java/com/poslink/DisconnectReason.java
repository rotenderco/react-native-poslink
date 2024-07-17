package com.poslink;

public enum DisconnectReason {
  DISCONNECT_REQUESTED("disconnectRequested"),
  REBOOT_REQUESTED("rebootRequested"),
  SECURITY_REQUESTED("securityReboot"),
  CRITICALLY_LOW_BATTERY("criticallyLowBattery"),
  POWERED_OFF("poweredOff"),
  BLUETOOTH_DISABLED("bluetoothDisabled"),
  UNKNOWN("unknown");

  public final String reason;

  private DisconnectReason(String reason) {
    this.reason = reason;
  }
}
