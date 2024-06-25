package com.poslink.exceptions;

public class TcpConnectionException extends POSLinkException {
  public TcpConnectionException(int code) {
    super(code, "Tcp Connection Failed");
  }
}
