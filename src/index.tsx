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

export interface POSLinkTernimal {
  initialize: () => void;
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
  setAmount: (amount: number, tips: number) => void;
  collectAndCapture: () => Promise<POSLinkErrorResponse>;
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
    onFinishDiscoveringReaders
    // onDidFinishInstallingUpdate,
    // onDidReportAvailableUpdate,
    // onDidReportReaderSoftwareUpdateProgress,
    // onDidReportUnexpectedReaderDisconnect,
    // onDidStartInstallingUpdate,
    // onDidRequestReaderInput,
    // onDidRequestReaderDisplayMessage,
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

  return {
    initialize: () => {
      POSLink.doInit();
      setIsInitialized(true);
    },
    isInitialized: isInitialized,
    discoverReaders: POSLink.discoverReaders,
    cancelDiscovering: POSLink.cancelDiscovering,
    connectBluetoothReader: POSLink.connectBluetoothReader,
    connectTcpReader: POSLink.connectTcpReader,
    setAmount: (amount: number, tips: number = 0) => {
      POSLink.setAmount(amount, tips);
    },
    collectAndCapture: POSLink.collectAndCapture
  };
}
