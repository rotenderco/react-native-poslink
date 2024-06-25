package com.poslink.exceptions;

public class PaymentException extends POSLinkException {
  public PaymentException(int code, String message) {
    super(code, "Payment Failed: " + message);
  }
}
