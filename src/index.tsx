import { useState } from "react";
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
  FETCH_TOKEN_PROVIDER,
  CHANGE_CONNECTION_STATUS,
  CHANGE_PAYMENT_STATUS,
  FINISH_DISCOVERING_READERS,
  FINISH_INSTALLING_UPDATE,
  REQUEST_READER_DISPLAY_MESSAGE,
  REQUEST_READER_STATUS,
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

export interface CaptureResponse {
  refNumber: string;
  amount: {
    tax: number;
    total: number;
  };
  card: {
    present: "Y" | "N";
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

export interface POSLinkTernimal {
  initialize: (ecrNumber: number) => void;
  isInitialized: boolean;
  discoverReaders: () => void;
  cancelDiscovering: () => Promise<boolean>;
  connectBluetoothReader: (params: {
    reader: Reader;
    timeout?: number;
  }) => Promise<{ reader: Reader } & POSLinkErrorResponse>;
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
  // onDidReportUnexpectedReaderDisconnect?(error?: StripeError): void;
  // onDidReportAvailableUpdate?(update: Reader.SoftwareUpdate): void;
  // onDidStartInstallingUpdate?(update: Reader.SoftwareUpdate): void;
  // onDidReportReaderSoftwareUpdateProgress?(progress: string): void;
  // onDidFinishInstallingUpdate?(result: UpdateSoftwareResultType): void;
  // onDidRequestReaderInput?(input: Reader.InputOptions[]): void;
  // onDidRequestReaderDisplayMessage?(message: Reader.DisplayMessage): void;
  onDidRequestReaderStatus?(status: ReportStatus): void;
  // onDidChangeConnectionStatus?(status: Reader.ConnectionStatus): void;
  // onDidChangePaymentStatus?(status: PaymentStatus): void;
  // onDidStartReaderReconnect?(): void;
  // onDidSucceedReaderReconnect?(): void;
  // onDidFailReaderReconnect?(): void;
  // onDidChangeOfflineStatus?(status: OfflineStatus): void;
  // onDidForwardPaymentIntent?(paymentIntent: PaymentIntent.Type, error: StripeError): void;
  // onDidForwardingFailure?(error?: StripeError): void;
  // onDidDisconnect?(reason?: Reader.DisconnectReason): void;
};

export function usePOSLinkTerminal(props?: Props): POSLinkTernimal {
  const {
    onUpdateDiscoveredReaders,
    onFinishDiscoveringReaders,
    // onDidFinishInstallingUpdate,
    // onDidReportAvailableUpdate,
    // onDidReportReaderSoftwareUpdateProgress,
    // onDidReportUnexpectedReaderDisconnect,
    // onDidStartInstallingUpdate,
    // onDidRequestReaderInput,
    // onDidRequestReaderDisplayMessage,
    onDidRequestReaderStatus
    // onDidChangePaymentStatus,
    // onDidChangeConnectionStatus,
    // onDidStartReaderReconnect,
    // onDidSucceedReaderReconnect,
    // onDidFailReaderReconnect,
    // onDidChangeOfflineStatus,
    // onDidForwardPaymentIntent,
    // onDidForwardingFailure,
    // onDidDisconnect,
    // onDidUpdateBatteryLevel,
    // onDidReportLowBatteryWarning,
    // onDidReportReaderEvent,
  } = props || {};
  const [isInitialized, setIsInitialized] = useState(false);

  useListener(UPDATE_DISCOVERED_READERS, onUpdateDiscoveredReaders);
  useListener(FINISH_DISCOVERING_READERS, onFinishDiscoveringReaders);
  useListener(REQUEST_READER_STATUS, onDidRequestReaderStatus);

  return {
    initialize: (ecrNumber: number) => {
      POSLink.doInit(ecrNumber);
      setIsInitialized(true);
    },
    isInitialized: isInitialized,
    discoverReaders: POSLink.discoverReaders,
    cancelDiscovering: POSLink.cancelDiscovering,
    connectBluetoothReader: POSLink.connectBluetoothReader,
    connectTcpReader: POSLink.connectTcpReader,
    setAmount: (amount: number, tax: number = 0) => {
      return POSLink.setAmount(amount, tax);
    },
    setTips: POSLink.setTips,
    collectAndCapture: POSLink.collectAndCapture,
    cancel: POSLink.cancel
  };
}
