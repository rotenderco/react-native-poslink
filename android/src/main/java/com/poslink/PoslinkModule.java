package com.poslink;

import android.annotation.SuppressLint;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.pax.poscore.commsetting.AidlSetting;
import com.pax.poscore.commsetting.BluetoothSetting;
import com.pax.poscore.commsetting.CommunicationSetting;
import com.pax.poscore.commsetting.TcpSetting;
import com.pax.poslinkadmin.ExecutionResult;
import com.pax.poslinkadmin.ResponseCode;
import com.pax.poslinkadmin.constant.TransactionType;
import com.pax.poslinkadmin.util.AmountRequest;
import com.pax.poslinksemiintegration.POSLinkSemi;
import com.pax.poslinksemiintegration.Terminal;
import com.pax.poslinksemiintegration.transaction.DoCreditRequest;
import com.pax.poslinksemiintegration.transaction.DoCreditResponse;
import com.pax.poslinksemiintegration.util.TraceRequest;
import com.poslink.bluetoothscan.BluetoothScanner;
import com.poslink.bluetoothscan.Reader;
import com.poslink.exceptions.BluetoothConnectionException;
import com.poslink.exceptions.POSLinkException;
import com.poslink.exceptions.PaymentException;
import com.poslink.exceptions.TcpConnectionException;
import com.poslink.listeners.RNDiscoveryListener;

import java.util.Objects;

@ReactModule(name = PoslinkModule.NAME)
public class PoslinkModule extends ReactContextBaseJavaModule {
  public static final String NAME = "POSLinkModule";

  private boolean isInitialized = false;
  private Terminal terminal;
  private BluetoothScanner bluetoothScanner;
  private CommunicationSetting commSetting;
  private DoCreditRequest doCreditRequest;

  public PoslinkModule(ReactApplicationContext reactContext) {
    super(reactContext);
    commSetting = new AidlSetting();

  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
//  @ReactMethod
//  public void multiply(double a, double b, Promise promise) {
//    promise.resolve(a * b);
//  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void doInit() {
//    this.setBluetoothSetting();
    // Setting logs
//    logSetting.setEnable(sharedPreferences.getBoolean("LOG_ENABLE", true));
//    logSetting.setLevel(LogSetting.LogLevel.values()[sharedPreferences.getInt("LOG_LEVEL", 1)]);
//    logSetting.setDays(sharedPreferences.getInt("LOG_DAYS", 30));
//    logSetting.setFileName(sharedPreferences.getString("LOG_FILE_NAME", "POSLog"));
//    logSetting.setFilePath(sharedPreferences.getString("LOG_FILE_PATH", ""));
//    LogSetting logSetting = new LogSetting();
//    logSetting.setLevel(LogSetting.LogLevel.values()[1]);
//    logSetting.setDays(30);
//    logSetting.setEnable(false);
//    logSetting.setFilePath("");
//    logSetting.setFileName("POSLog");
//    POSLinkSemi.getInstance().setLogSetting(logSetting);

//    this.setBluetoothSetting();

    this.isInitialized = true;
    Log.d(NAME, "init POSLink");
//    POSLinkAndroid.init(getReactApplicationContext());
//    Log.d(NAME, "init POSLink");

//    CommSetting commSetting = new CommSetting();
//    commSetting.setType(CommSetting.TCP);
//    commSetting.setDestIP("192.168.1.46");
//    commSetting.setDestPort("10009");
//    commSetting.setTimeOut("20000");
//
//    PosLink poslink = new PosLink();
//    poslink.SetCommSetting(commSetting);
//
//    Log.d(NAME, "init POSLink");
//
//    ManageRequest manageReq = new ManageRequest();
//    manageReq.TransType = manageReq.ParseTransType("INIT");
//    poslink.ManageRequest = manageReq;
//
//    ProcessTransResult transResult = poslink.ProcessTrans();
//    Log.d(NAME, transResult.Code + ":" + transResult.Msg);
//
//    ManageResponse manageRes = poslink.ManageResponse;
//    Log.d(NAME, manageRes.ResultCode + " - " + manageRes.ResultTxt
//      + "\r\nSN: " + manageRes.SN
//      + "\r\nModel Name: " + manageRes.ModelName
//      + "\r\nOS Version: " + manageRes.OSVersion
//      + "\r\nMac Address: " + manageRes.MacAddress
//      + "\r\nLines Per Screen: " + manageRes.LinesPerScreen
//      + "\r\nCharsPerLine: " + manageRes.CharsPerLine);
  }

  @ReactMethod
  @SuppressLint("MissingPermission")
  @SuppressWarnings("unused")
  public void discoverReaders(Promise promise) {
    if (!this.isInitialized) {
      WritableMap errorMap = Arguments.createMap();
      errorMap.putMap("error", new POSLinkException(500, "The reader hasn't initialized yet!").toWritableMap());
      promise.resolve(errorMap);
      return;
    }
    RNDiscoveryListener listener = new RNDiscoveryListener(getReactApplicationContext(), promise);
    this.bluetoothScanner = new BluetoothScanner(getReactApplicationContext(), listener);
    this.bluetoothScanner.scanLeDevice();
  }
//  public void setBluetoothSetting() {
//    BluetoothSetting bluetoothSetting = new BluetoothSetting();
//    bluetoothSetting.setTimeout(60000);
//    bluetoothSetting.setMacAddr("54:81:2D:A2:F9:1A");
//    if (!bluetoothSetting.equals(commSetting) && terminal != null) {
//      POSLinkSemi.getInstance().removeTerminal(terminal);
//    }
//    commSetting = bluetoothSetting;
////    TcpSetting tcpSetting = new TcpSetting();
////    tcpSetting.setIp("192.168.1.46");
////    tcpSetting.setPort("10009");
////    tcpSetting.setTimeout(60000);
////    commSetting = tcpSetting;
//  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void cancelDiscovering(Promise promise) {
    if (!this.isInitialized || this.bluetoothScanner == null) {
      promise.resolve(false);
      return;
    }
    promise.resolve(this.bluetoothScanner.stopScanning());
  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void connectBluetoothReader(ReadableMap params, Promise promise) {
    ReadableMap readerMap = params.getMap("reader");
    if (readerMap == null) {
      WritableMap retValueMap = Arguments.createMap();
      retValueMap.putMap("error", new POSLinkException(400, "You must provide a reader").toWritableMap());
      promise.resolve(retValueMap);
      return;
    }
    String readerAddress = readerMap.getString("address");
    int connectionTimeout = params.getInt("timeout");
    if (connectionTimeout == 0) {
      connectionTimeout = 60000;
    }
    Log.d(NAME, "params: {\"readerAddress\":" + readerAddress + ", \"connectionTimeout\":" + connectionTimeout + "}");
    BluetoothSetting bluetoothSetting = new BluetoothSetting();
    bluetoothSetting.setTimeout(connectionTimeout);
    bluetoothSetting.setMacAddr(readerAddress);
    if (!bluetoothSetting.equals(this.commSetting) && this.terminal != null) {
      POSLinkSemi.getInstance().removeTerminal(this.terminal);
    }
    this.commSetting = bluetoothSetting;
    this.terminal = POSLinkSemi.getInstance().getTerminal(getReactApplicationContext(), this.commSetting);
    Log.d(NAME, "Bluetooth Connected: " + (this.terminal != null));
    WritableMap retValueMap = Arguments.createMap();
    if (this.terminal == null) { // connect failed
      retValueMap.putMap("error", new BluetoothConnectionException(400).toWritableMap());
      promise.resolve(retValueMap);
      return;
    }
    promise.resolve(retValueMap);
  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void connectTcpReader(ReadableMap params, Promise promise) {
    int connectionTimeout = 60000;
    if (params.hasKey("timeout")) {
      connectionTimeout = params.getInt("timeout");
    }
    TcpSetting tcpSetting = new TcpSetting();
    tcpSetting.setIp(params.getString("ip"));
    tcpSetting.setPort(params.getString("port"));
    tcpSetting.setTimeout(connectionTimeout);
    if (!tcpSetting.equals(this.commSetting) && this.terminal != null) {
      POSLinkSemi.getInstance().removeTerminal(this.terminal);
    }
    this.commSetting = tcpSetting;
    this.terminal = POSLinkSemi.getInstance().getTerminal(getReactApplicationContext(), this.commSetting);
    if (this.terminal == null) { // connect failed
      WritableMap retValueMap = Arguments.createMap();
      retValueMap.putMap("error", new TcpConnectionException(400).toWritableMap());
      promise.resolve(retValueMap);
      return;
    }
    promise.resolve(null);
  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void setAmount(int amount) {
    this.doCreditRequest = new DoCreditRequest();
    this.doCreditRequest.setTransactionType(TransactionType.SALE);

    TraceRequest traceRequest = new TraceRequest();
    traceRequest.setEcrReferenceNumber("1");
    this.doCreditRequest.setTraceInformation(traceRequest);

    AmountRequest amountRequest = new AmountRequest();
    amountRequest.setTransactionAmount(String.valueOf(amount));
    this.doCreditRequest.setAmountInformation(amountRequest);
  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void collectAndCapture(Promise promise) {
    Log.d(NAME, "Start credit request");
    ExecutionResult<DoCreditResponse> executionResult = this.terminal.getTransaction().doCredit(this.doCreditRequest);
    WritableMap retValueMap = Arguments.createMap();
    if (executionResult.isSuccessful()) {
      DoCreditResponse doCreditResponse = executionResult.response();
      if (Objects.equals(doCreditResponse.responseCode(), ResponseCode.OK)) {
        Log.d(NAME, "Payment successful: ["  + doCreditResponse.responseCode() + "]" + doCreditResponse.responseMessage());
        promise.resolve(retValueMap);
      } else {
        Log.e(NAME, "Payment failed: ["  + doCreditResponse.responseCode() + "]" + doCreditResponse.responseMessage());
        retValueMap.putMap("error", new PaymentException(Integer.parseInt(doCreditResponse.responseCode()), doCreditResponse.responseMessage()).toWritableMap());
        promise.resolve(retValueMap);
      }
    } else {
      Log.e(NAME, "Do credit request execution failed: " + executionResult.message());
      retValueMap.putMap("error", new POSLinkException(500, "Capture Failed: " + executionResult.message()).toWritableMap());
      promise.resolve(retValueMap);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  @SuppressWarnings("unused")
  public WritableMap getEventConstants() {
    WritableMap constantsMap = Arguments.createMap();
    for (ReactNativeConstants c : ReactNativeConstants.values()) {
      constantsMap.putString(c.name(), c.listenerName);
    }
    return constantsMap;
  }
}
