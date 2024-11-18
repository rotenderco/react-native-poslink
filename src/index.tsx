import { useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";
import { useListener } from "./useListener";

const LINKING_ERROR =
  `The package "@rotender/react-native-poslink" doesn"t seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: '- You have run "pod install"\n', default: "" }) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

const POSLink = NativeModules.POSLinkModule
  ? NativeModules.POSLinkModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        }
      }
    );

export const {
  INITIALIZATION,
  INITIALIZATION_FAIL,
  FETCH_TOKEN_PROVIDER,
  CHANGE_CONNECTION_STATUS,
  CHANGE_PAYMENT_STATUS,
  FINISH_DISCOVERING_READERS,
  FINISH_INSTALLING_UPDATE,
  REQUEST_READER_DISPLAY_MESSAGE,
  REQUEST_READER_INPUT,
  REPORT_AVAILABLE_UPDATE,
  REPORT_UNEXPECTED_READER_DISCONNECT,
  REPORT_UPDATE_PROGRESS,
  START_INSTALLING_UPDATE,
  UPDATE_DISCOVERED_READERS,
  START_READER_RECONNECT,
  READER_RECONNECT_SUCCEED,
  READER_RECONNECT_FAIL,
  CHANGE_OFFLINE_STATUS,
  FORWARD_PAYMENT_INTENT,
  REPORT_FORWARDING_ERROR,
  DISCONNECT,
  UPDATE_BATTERY_LEVEL,
  REPORT_LOW_BATTERY_WARNING,
  REPORT_READER_EVENT
} = POSLink.getEventConstants();

const reportStatus = POSLink.getReportStatus();

export enum ReportStatus {
  NONE = reportStatus.NONE,
  CARD_INPUT = reportStatus.CARD_INPUT,
  PIN_ENTRY = reportStatus.PIN_ENTRY,
  SIGNATURE = reportStatus.SIGNATURE,
  ONLINE_PROCESSING = reportStatus.ONLINE_PROCESSING,
  SECOND_CARD_INPUT_4_REPLACE_MERGE = reportStatus.SECOND_CARD_INPUT_4_REPLACE_MERGE,
  SIGNATURE_RETRY_BY_PRESSING_CLEAR_KEY = reportStatus.SIGNATURE_RETRY_BY_PRESSING_CLEAR_KEY,
  PIN_RETRY_BY_INPUTTING_WRONG_OFFLINE_PIN_4_EMV = reportStatus.PIN_RETRY_BY_INPUTTING_WRONG_OFFLINE_PIN_4_EMV,
  EMV_CARD_INPUT = reportStatus.EMV_CARD_INPUT,
  EMV_PIN_ENTRY = reportStatus.EMV_PIN_ENTRY,
  EMV_SIGNATURE = reportStatus.EMV_SIGNATURE,
  EMV_ONLINE_PROCESSING = reportStatus.EMV_ONLINE_PROCESSING,
  EMV_SECOND_CARD_INPUT_4_REPLACE_MERGE = reportStatus.EMV_SECOND_CARD_INPUT_4_REPLACE_MERGE,
  EMV_SIGNATURE_RETRY_BY_PRESSING_CLEAR_KEY = reportStatus.EMV_SIGNATURE_RETRY_BY_PRESSING_CLEAR_KEY,
  EMV_PIN_RETRY_BY_INPUTTING_WRONG_OFFLINE_PIN_4_EMV = reportStatus.EMV_PIN_RETRY_BY_INPUTTING_WRONG_OFFLINE_PIN_4_EMV,
  EMV_SEE_PHONE = reportStatus.EMV_SEE_PHONE,
  EMV_TRY_ANOTHER_CARD = reportStatus.EMV_TRY_ANOTHER_CARD,
  EMV_PRESENT_ONE_CARD_ONLY = reportStatus.EMV_PRESENT_ONE_CARD_ONLY,
  EMV_FALLBACK_SWIPE = reportStatus.EMV_FALLBACK_SWIPE,
  EMV_ENTERING_CASHBACK = reportStatus.EMV_ENTERING_CASHBACK,
  EMV_REMOVE_CARD = reportStatus.EMV_REMOVE_CARD,
  EMV_RE_INSERT_CARD = reportStatus.EMV_RE_INSERT_CARD
}

const connectionStatus = POSLink.getConnectionStatus();
export enum ConnectionStatus {
  CONNECTED = connectionStatus.CONNECTED,
  CONNECTING = connectionStatus.CONNECTING,
  NOT_CONNECTED = connectionStatus.NOT_CONNECTED
}

const disconnectReason = POSLink.getDisconnectReason();
export enum DisconnectReason {
  DISCONNECT_REQUESTED = disconnectReason.DISCONNECT_REQUESTED,
  REBOOT_REQUESTED = disconnectReason.REBOOT_REQUESTED,
  SECURITY_REQUESTED = disconnectReason.SECURITY_REQUESTED,
  CRITICALLY_LOW_BATTERY = disconnectReason.CRITICALLY_LOW_BATTERY,
  POWERED_OFF = disconnectReason.POWERED_OFF,
  BLUETOOTH_DISABLED = disconnectReason.BLUETOOTH_DISABLED
}

const enum AppActivated {
  NOT_SET = "",
  ACTIVATED = "Y",
  NOT_ACTIVATED = "N"
}

export interface POSLinkError extends Error {
  message: string;
  code: string;
  stack: string;
}

export interface Reader {
  readonly name: string;
  readonly address: string;
  readonly serialNumber: string;
}

export interface POSLinkErrorResponse {
  error?: POSLinkError;
}

export interface InitResponse {
  sn: string;
  appName: string;
  appVersion: string;
  appActivated: AppActivated;
  licenseExpiry: string;
  modelName: string;
  wifiMac: string;
  osVersion: string;
}

export interface CaptureResponse {
  refNumber: string;
  amount: {
    tax: number;
    total: number;
  };
  card: {
    present: "Y" | "N";
    cardHolderName: string;
  };
  clerk: {
    numericId: string;
  };
  dateTime: string;
  transaction: {
    invoice: string;
    source: string;
    token: string;
  };
}

export interface ConnectionParams {
  reader: Reader;
  timeout?: number;
  autoReconnectOnUnexpectedDisconnect?: boolean;
}

export interface POSLinkTernimal {
  isInitialized: boolean;
  discoverReaders: () => void;
  cancelDiscovering: () => Promise<boolean>;
  connectBluetoothReader: (params: ConnectionParams) => Promise<{ reader: Reader } & POSLinkErrorResponse>;
  connectTcpReader: (params: {
    ip: string;
    port: string;
    timeout?: number;
  }) => Promise<POSLinkErrorResponse>;
  setAmount: (amount: number, tax?: number) => void;
  setTips: (tips: number, refNumber: string) => void;
  collectAndCapture: () => Promise<CaptureResponse & POSLinkErrorResponse>;
  cancel: () => void;
}

/**
 *  useStripeTerminal hook Props
 */
export declare type Props = {
  onUpdateDiscoveredReaders?(readers: Reader[]): void;
  onFinishDiscoveringReaders?(error?: POSLinkError): void;
  onDidReportUnexpectedReaderDisconnect?(error?: POSLinkError): void;
  onDidInitializationListener?(initResponse: InitResponse): void;
  onDidInitializationFailListener?(error?: POSLinkError): void;
  // onDidReportAvailableUpdate?(update: Reader.SoftwareUpdate): void;
  // onDidStartInstallingUpdate?(update: Reader.SoftwareUpdate): void;
  // onDidReportReaderSoftwareUpdateProgress?(progress: string): void;
  // onDidFinishInstallingUpdate?(result: UpdateSoftwareResultType): void;
  // onDidRequestReaderInput?(input: Reader.InputOptions[]): void;
  // onDidRequestReaderDisplayMessage?(message: Reader.DisplayMessage): void;
  onDidChangeConnectionStatus?(status: ConnectionStatus): void;
  onDidChangePaymentStatus?(status: ReportStatus): void;
  onDidStartReaderReconnect?(): void;
  onDidSucceedReaderReconnect?(): void;
  onDidFailReaderReconnect?(): void;
  onDidDisconnect?(reason?: DisconnectReason): void;
  // onDidChangeOfflineStatus?(status: OfflineStatus): void;
  // onDidForwardPaymentIntent?(paymentIntent: PaymentIntent.Type, error: StripeError): void;
  // onDidForwardingFailure?(error?: StripeError): void;
};

export interface UsePOSLinkTerminalParams {
  unitNumber: number;
  connectionDetectedDuration?: number;
}

export function usePOSLinkTerminal(params: UsePOSLinkTerminalParams, props?: Props): POSLinkTernimal {
  const {
    onUpdateDiscoveredReaders,
    onFinishDiscoveringReaders,
    onDidInitializationListener,
    onDidInitializationFailListener,
    // onDidFinishInstallingUpdate,
    // onDidReportAvailableUpdate,
    // onDidReportReaderSoftwareUpdateProgress,
    // onDidStartInstallingUpdate,
    // onDidRequestReaderInput,
    // onDidRequestReaderDisplayMessage,
    onDidChangePaymentStatus,
    onDidReportUnexpectedReaderDisconnect,
    onDidChangeConnectionStatus,
    onDidStartReaderReconnect,
    onDidSucceedReaderReconnect,
    onDidFailReaderReconnect,
    onDidDisconnect
    // onDidChangeOfflineStatus,
    // onDidForwardPaymentIntent,
    // onDidForwardingFailure,
    // onDidUpdateBatteryLevel,
    // onDidReportLowBatteryWarning,
    // onDidReportReaderEvent,
  } = props || {};
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (params.unitNumber) {
      POSLink.doInit(params.unitNumber, params.connectionDetectedDuration || 3 * 60 * 1000);
    }
  }, [params.unitNumber, params.connectionDetectedDuration]);

  useListener(INITIALIZATION, (initResponse: InitResponse) => {
    setIsInitialized(true);
    if (onDidInitializationListener) {
      return onDidInitializationListener(initResponse);
    }
  });
  useListener(INITIALIZATION_FAIL, (error: POSLinkError) => {
    setIsInitialized(false);
    if (onDidInitializationFailListener) {
      return onDidInitializationFailListener(error);
    }
  });
  useListener(CHANGE_PAYMENT_STATUS, onDidChangePaymentStatus);

  useListener(REPORT_UNEXPECTED_READER_DISCONNECT, onDidReportUnexpectedReaderDisconnect);
  useListener(CHANGE_CONNECTION_STATUS, onDidChangeConnectionStatus);
  useListener(START_READER_RECONNECT, onDidStartReaderReconnect);
  useListener(READER_RECONNECT_SUCCEED, onDidSucceedReaderReconnect);
  useListener(READER_RECONNECT_FAIL, onDidFailReaderReconnect);
  useListener(DISCONNECT, onDidDisconnect);

  useListener(UPDATE_DISCOVERED_READERS, onUpdateDiscoveredReaders);
  useListener(FINISH_DISCOVERING_READERS, onFinishDiscoveringReaders);

  return {
    isInitialized: isInitialized,
    discoverReaders: POSLink.discoverReaders,
    cancelDiscovering: POSLink.cancelDiscovering,
    connectBluetoothReader: (params: ConnectionParams): Promise<{ reader: Reader } & POSLinkErrorResponse> => {
      return POSLink.connectBluetoothReader({
        timeout: 60000,
        autoReconnectOnUnexpectedDisconnect: false,
        ...params
      });
    },
    connectTcpReader: POSLink.connectTcpReader,
    setAmount: (amount: number, tax: number = 0) => {
      return POSLink.setAmount(amount, tax);
    },
    setTips: POSLink.setTips,
    collectAndCapture: POSLink.collectAndCapture,
    cancel: POSLink.cancel
  };
}
