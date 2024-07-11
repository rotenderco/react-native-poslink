package com.poslink;

import android.annotation.SuppressLint;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

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
import com.pax.poslinkadmin.constant.StatusReportFlag;
import com.pax.poslinkadmin.constant.TransactionType;
import com.pax.poslinkadmin.util.AmountRequest;
import com.pax.poslinksemiintegration.POSLinkSemi;
import com.pax.poslinksemiintegration.Terminal;
import com.pax.poslinksemiintegration.constant.AdditionalResponseDataFlag;
import com.pax.poslinksemiintegration.transaction.DoCreditRequest;
import com.pax.poslinksemiintegration.transaction.DoCreditResponse;
import com.pax.poslinksemiintegration.util.CashierRequest;
import com.pax.poslinksemiintegration.util.TraceRequest;
import com.pax.poslinksemiintegration.util.TransactionBehavior;
import com.poslink.bluetoothscan.BluetoothScanner;
import com.poslink.exceptions.BluetoothConnectionException;
import com.poslink.exceptions.POSLinkException;
import com.poslink.exceptions.PaymentException;
import com.poslink.exceptions.TcpConnectionException;
import com.poslink.listeners.RNDiscoveryListener;
import com.poslink.listeners.RNReportStatusListener;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.TimeZone;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ReactModule(name = PoslinkModule.NAME)
public class PoslinkModule extends ReactContextBaseJavaModule {
  public static final String NAME = "POSLinkModule";

  private boolean isInitialized = false;
  private Terminal terminal;
  private BluetoothScanner bluetoothScanner;
  private CommunicationSetting commSetting;
  private DoCreditRequest doCreditRequest;

  private String ecrNumber;

  private long lastInvoiceNumber = 0;

  public PoslinkModule(ReactApplicationContext reactContext) {
    super(reactContext);
    commSetting = new AidlSetting();
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void doInit(int ecrNumber) {
    this.ecrNumber = String.valueOf(ecrNumber);
    this.isInitialized = true;
    Log.d(NAME, "init POSLink");
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
    this.terminal = this.getTerminal();
    Log.d(NAME, "Bluetooth Connected: " + (this.terminal != null));
    WritableMap retValueMap = Arguments.createMap();
    if (this.terminal == null) { // connect failed
      retValueMap.putMap("error", new BluetoothConnectionException(400).toWritableMap());
      promise.resolve(retValueMap);
      return;
    }
    promise.resolve(retValueMap);
  }

  private Terminal getTerminal() {
    Terminal tm = POSLinkSemi.getInstance().getTerminal(getReactApplicationContext(), this.commSetting);
    if (tm != null) {
      Log.d(NAME, "setReportStatusListener");

      tm.setReportStatusListener(new RNReportStatusListener(getReactApplicationContext()));
    }
    return tm;
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
    this.terminal = this.getTerminal();
    if (this.terminal == null) { // connect failed
      WritableMap retValueMap = Arguments.createMap();
      retValueMap.putMap("error", new TcpConnectionException(400).toWritableMap());
      promise.resolve(retValueMap);
      return;
    }
    promise.resolve(null);
  }

  protected String generateInvoiceNumber() {
    // 10 digits.
    long limit = 10000000000L;
    long invoiceNumber = System.currentTimeMillis() % limit;
    if ( invoiceNumber <= lastInvoiceNumber ) {
      invoiceNumber = (lastInvoiceNumber + 1) % limit;
    }
    lastInvoiceNumber = invoiceNumber;
    String invoiceNumberStr = String.valueOf(lastInvoiceNumber);
    while (invoiceNumberStr.length() < 10) {
      invoiceNumberStr = String.format("0%s", invoiceNumberStr);
    }
    return invoiceNumberStr;
  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void setAmount(int amount, int tax) {
    this.doCreditRequest = new DoCreditRequest();

    TransactionBehavior transactionBehavior = TransactionBehavior.builder().build();
    transactionBehavior.setStatusReportFlag(StatusReportFlag.TO_REPORT);
    transactionBehavior.setAdditionalResponseDataFlag(AdditionalResponseDataFlag.YES);
    this.doCreditRequest.setTransactionBehavior(transactionBehavior);

    this.doCreditRequest.setTransactionType(TransactionType.SALE);

    TraceRequest traceRequest = new TraceRequest();
    traceRequest.setEcrReferenceNumber(this.ecrNumber);
    String invoiceNumber = this.generateInvoiceNumber();
    traceRequest.setEcrTransactionId(invoiceNumber);
    traceRequest.setInvoiceNumber(invoiceNumber);
    this.doCreditRequest.setTraceInformation(traceRequest);

    AmountRequest amountRequest = new AmountRequest();
    amountRequest.setTransactionAmount(String.valueOf(amount));
    if (tax > 0) {
      amountRequest.setTaxAmount(String.valueOf(tax));
    }
    this.doCreditRequest.setAmountInformation(amountRequest);
  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void setTips(int tips, String refNumber) {
    this.doCreditRequest = new DoCreditRequest();
    this.doCreditRequest.setTransactionType(TransactionType.ADJUST);

    TraceRequest traceRequest = new TraceRequest();
    traceRequest.setOriginalEcrReferenceNumber(this.ecrNumber);
    traceRequest.setOriginalReferenceNumber(refNumber);
    traceRequest.setEcrReferenceNumber(this.ecrNumber);
    this.doCreditRequest.setTraceInformation(traceRequest);

    AmountRequest amountRequest = new AmountRequest();
    amountRequest.setTransactionAmount(String.valueOf(tips));
    this.doCreditRequest.setAmountInformation(amountRequest);
  }

  @ReactMethod
  @SuppressWarnings("unused")
  public void collectAndCapture(Promise promise) {
    Log.d(NAME, "Start credit request");

    CashierRequest cashierRequest = new CashierRequest();
    cashierRequest.setClerkId(this.ecrNumber);
    this.doCreditRequest.setCashierInformation(cashierRequest);

    Executors.newSingleThreadExecutor().submit(new Runnable() {
      @Override
      public void run() {
        ExecutionResult<DoCreditResponse> executionResult = terminal.getTransaction().doCredit(doCreditRequest);
        WritableMap retValueMap = Arguments.createMap();
        if (executionResult.isSuccessful()) {
          DoCreditResponse doCreditResponse = executionResult.response();
          if (Objects.equals(doCreditResponse.responseCode(), ResponseCode.OK)) {
            Log.d(NAME, "Payment successful: ["  + doCreditResponse.responseCode() + "]" + doCreditResponse.responseMessage());
            retValueMap.putString("refNumber", doCreditResponse.traceInformation().referenceNumber());
            wrapReturnedValue(retValueMap, doCreditResponse);
            promise.resolve(retValueMap);
          } else {
            Log.e(NAME, "Payment failed: ["  + doCreditResponse.responseCode() + "]" + doCreditResponse.responseMessage());
            retValueMap.putMap("error", new PaymentException(Integer.parseInt(doCreditResponse.responseCode()), doCreditResponse.responseMessage()).toWritableMap());
            wrapReturnedValue(retValueMap, doCreditResponse);
            promise.resolve(retValueMap);
          }
        } else {
          Log.e(NAME, "Do credit request execution failed: " + executionResult.message());
          retValueMap.putMap("error", new POSLinkException(500, "Capture Failed: " + executionResult.message()).toWritableMap());
          promise.resolve(retValueMap);
        }
      }
    });
  }

  private String covertDateTimeISO8601(@Nullable String timeStamp) {
    if (timeStamp == null || timeStamp.isEmpty()) {
      return "";
    }
    Matcher matcher = Pattern
      .compile("(\\d{0,4})(\\d{0,2})(\\d{0,2})(\\d{0,2})(\\d{0,2})(\\d{0,2})")
      .matcher(timeStamp);
    if(matcher.matches()) {
      OffsetDateTime offsetDateTime = OffsetDateTime.of(
        Integer.parseInt(Objects.requireNonNull(matcher.group(1))), // year
        Integer.parseInt(Objects.requireNonNull(matcher.group(2))), // month
        Integer.parseInt(Objects.requireNonNull(matcher.group(3))), // day
        Integer.parseInt(Objects.requireNonNull(matcher.group(4))), // hour
        Integer.parseInt(Objects.requireNonNull(matcher.group(5))), // minute
        Integer.parseInt(Objects.requireNonNull(matcher.group(6))), // second
        0,
        OffsetDateTime.now().getOffset()
      );
      timeStamp = offsetDateTime.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
    return timeStamp;
  }

  // Follow the GTV Token
  protected void wrapReturnedValue(WritableMap retValueMap, DoCreditResponse doCreditResponse) {
    // DateTime
    retValueMap.putString("dateTime", this.covertDateTimeISO8601(doCreditResponse.traceInformation().timeStamp()));

    // Amount
    WritableMap amountMap = Arguments.createMap();
    String tax = doCreditResponse.amountInformation().approvedTaxAmount();
    amountMap.putInt("tax", tax.isEmpty() ? 0 : Integer.parseInt(tax));
    String amount = doCreditResponse.amountInformation().approvedAmount();
    amountMap.putInt("total", amount.isEmpty() ? 0 : Integer.parseInt(amount));
    retValueMap.putMap("amount", amountMap);

    // Clerk
    WritableMap clerkMap = Arguments.createMap();
    clerkMap.putString("numericId", ecrNumber);
    retValueMap.putMap("clerk", clerkMap);

    // Transaction
    WritableMap transactionMap = Arguments.createMap();
    transactionMap.putString("invoice", doCreditResponse.traceInformation().invoiceNumber());
    transactionMap.putString("token", doCreditResponse.paymentTransactionInformation().token());
    transactionMap.putString("source", "10");
    retValueMap.putMap("transaction", transactionMap);

    // Card
    WritableMap cardMap = Arguments.createMap();
    cardMap.putString("present", "Y");
    retValueMap.putMap("card", cardMap);
  }

  @ReactMethod()
  @SuppressWarnings("unused")
  public void cancel() {
    Log.d(NAME, "cancel");
    this.terminal.cancel();
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

  @ReactMethod(isBlockingSynchronousMethod = true)
  @SuppressWarnings("unused")
  public WritableMap getReportStatus() {
    WritableMap statusMap = Arguments.createMap();
    for (TerminalReportStatus c : TerminalReportStatus.values()) {
      statusMap.putInt(c.name(), c.status);
    }
    return statusMap;
  }
}
