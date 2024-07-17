package com.poslink;

public enum ConnectionStatus {
  CONNECTED("connected"),
  CONNECTING("connecting"),
  NOT_CONNECTED("notConnected");


  public final String status;

  private ConnectionStatus(String status) {
    this.status = status;
  }
}
