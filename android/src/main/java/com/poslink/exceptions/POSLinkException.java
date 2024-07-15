package com.poslink.exceptions;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class POSLinkException extends RuntimeException {

  private final String code;
  private final String message;
  public POSLinkException(int code, String message) {
    this.code = String.valueOf(code);
    this.message = message;
  }

  public POSLinkException(String code, String message) {
    this.code = code;
    this.message = message;
  }

  public String getCode() {
    return code;
  }

  @Nullable
  @Override
  public String getMessage() {
    return message;
  }

  public String getStack() {
    StringBuilder stack = new StringBuilder();
    for (StackTraceElement stackTrace : this.getStackTrace()) {
      stack.append("\n").append(stackTrace.toString());
    }
    return stack.toString();
  }

  public WritableMap toWritableMap() {
    WritableMap errorMap = Arguments.createMap();
    errorMap.putString("message", this.getMessage());
    errorMap.putString("stack", this.getStack());
    errorMap.putString("code", this.code);
    return errorMap;
  }
}
