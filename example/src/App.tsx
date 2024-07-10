import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type MutableRefObject
} from "react";
import {
  StyleSheet,
  type Permission,
  PermissionsAndroid,
  View,
  Text,
  Button,
  TextInput,
  ToastAndroid,
  Alert
} from "react-native";
import {
  ReportStatus,
  usePOSLinkTerminal,
  type POSLinkError,
  type POSLinkTernimal,
  type Reader
} from "@rotender/react-native-poslink";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { version } from "../package.json";
import dayjs from "dayjs";
import CheckBox from "@react-native-community/checkbox";

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  console.log("Request(", init?.method, ")[", input, "]");
  const response: Response = await fetch(input, init);
  if (response.ok) {
    const resJson = await response.json();
    console.log(
      "Response(",
      init?.method,
      ")[",
      input,
      "]",
      JSON.stringify(resJson, undefined, 2)
    );
    return resJson;
  } else {
    console.error(
      "Response(",
      init?.method,
      ")[",
      input,
      "]",
      response.statusText,
      await response.text()
    );
    throw new Error(`${ response.statusText }, ${ await response.text() }`);
  }
}

const UNIT_NUMBER: number = 17;

export default function App() {
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  // const [clerkId, setClerkId] = useState<string>(`${ UNIT_NUMBER }`);
  const [connectStatus, setConnectStatus] = useState<string>("Disconnection");
  const [price, setPrice] = useState<string>("0");
  const [tipValue, setTipValue] = useState<string>("0");
  const [tax] = useState<number>(0.07); // 7%
  const [needTips, setNeedTips] = useState<boolean>(false);
  const [tiping, setTiping] = useState<boolean>(false);
  const [refNumber, setRefNumber] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const currentReader: MutableRefObject<Reader | undefined> = useRef<
    Reader | undefined
  >();

  // 1. Access Token Exchange
  useEffect(() => {
    (async () => {
      const oldAccessToken: string | null = await AsyncStorage.getItem("accessToken");
      if (oldAccessToken) {
        console.log("Access token: ", oldAccessToken);
        setAccessToken(oldAccessToken);
        return;
      }
      const { result } = await request<{ result: [{ credential: { accessToken: string } }] }>("https://api.shift4test.com/api/rest/v1/credentials/accesstoken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "InterfaceVersion": version,
          "InterfaceName": "Rotender",
          "CompanyName": "Rotender"
        },
        body: JSON.stringify({
          dateTime: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
          credential: {
            clientGuid: "573DFF61-0B77-1C20-B4186AAA55A11DE6",
            authToken: "86E986A3-A8BB-4F22-8101328A307840CF"
          }
        })
      });
      console.log("A new access token: ", result);
      await AsyncStorage.setItem("accessToken", result[0].credential.accessToken);
    })();
  }, []);

  const poslinkTerminal: POSLinkTernimal = usePOSLinkTerminal({
    onUpdateDiscoveredReaders: async (readers: Reader[]) => {
      if (currentReader.current) {
        return;
      }
      console.log("Found readers: ", readers);
      if (readers.length > 0) {
        for (let i: number = 0; i < readers.length; ++i) {
          const reader: Reader = readers[i] as Reader;
          if (reader.serialNumber === "A77-1760013671") {
            await cancelDiscovering();
            currentReader.current = reader;
            console.log("Found reader: ", reader.serialNumber);
            handleConnectReader();
            break;
          }
        }
      }
    },
    onFinishDiscoveringReaders: (error?: POSLinkError) => {
      if (error) {
        console.error("Discovery Readers Failed: ", error);
        return;
      }
      console.log("Discovery Readers Finished.");
    },
    onDidRequestReaderStatus: (status: ReportStatus) => {
      console.log("status: ", ReportStatus[status], status);
    }
  });
  const {
    initialize,
    isInitialized,
    discoverReaders,
    connectBluetoothReader,
    cancelDiscovering,
    setAmount,
    setTips,
    collectAndCapture,
    cancel
  } = poslinkTerminal;

  useEffect(() => {
    (async () => {
      let permissions: Permission[] = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION as Permission,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN as Permission,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT as Permission
      ];
      permissions = permissions.filter(
        (permission: Permission | undefined) => !!permission
      );
      let _hasPermission: boolean = (
        await Promise.all(
          permissions.map((permission: Permission) =>
            PermissionsAndroid.check(permission)
          )
        )
      ).reduce((a: boolean, b: boolean) => a && b);
      if (!_hasPermission) {
        const result = await PermissionsAndroid.requestMultiple(permissions);
        for (let i: number = 0; i < permissions.length; ++i) {
          const permission: Permission = permissions[i] as Permission;
          _hasPermission =
            result[permission] === PermissionsAndroid.RESULTS.GRANTED;
          if (!_hasPermission) {
            console.log(permission, _hasPermission);
            break;
          }
        }
      }
      setHasPermission(_hasPermission);
    })();
  }, []);

  useEffect(() => {
    if (hasPermission && !isInitialized) {
      initialize(UNIT_NUMBER);
    }
  }, [hasPermission, isInitialized, initialize]);

  useEffect(() => {
    if (
      isInitialized &&
      !isDiscovering &&
      !currentReader.current &&
      connectStatus === "Disconnection"
    ) {
      // initialized
      discoverReaders();
      setIsDiscovering(true);
    }
  }, [isInitialized, isDiscovering, connectStatus, discoverReaders]);

  const handleConnectReader = useCallback(async () => {
    if (!currentReader.current) {
      return;
    }
    setConnectStatus("Connecting");
    const { error } = await connectBluetoothReader({
      reader: currentReader.current,
      timeout: 60000
      // autoReconnectOnUnexpectedDisconnect: true
    });

    if (error) {
      setConnectStatus("Error");
      console.error(
        "Error connecting through the reader via bluetooth: ",
        error.message
      );
      return;
    }

    setConnectStatus("Connected");
    console.log("Reader connected successfully");
  }, [connectBluetoothReader]);

  const startPOS = useCallback(async () => {
    setAmount(Number(price) * 100, tax * Number(price) * 100);
    // setAmount(Number(price) * 100);
    console.log(`Start collecting for $${Number(price).toFixed(2)}`);
    const { error, refNumber, ...restRtv } = await collectAndCapture();
    if (error) {
      console.error("Capture failed: ", error.message, ", response: ", restRtv);
      return;
    }
    setRefNumber(refNumber);
    setTiping(needTips);
    ToastAndroid.show("Payment Successfully", ToastAndroid.CENTER);
    console.log(
      `Collect successfully with price($${Number(price).toFixed(2)})`
    );
    console.log(restRtv);
    setPrice("0");
    setInvoiceNumber(restRtv.transaction.invoice);
  }, [needTips, price, setAmount, collectAndCapture]);

  const submit = useCallback(async () => {
    setTips(Number(tipValue) * 100, refNumber);
    console.log(`Start collecting tips for $${Number(tipValue).toFixed(2)}`);
    const { error } = await collectAndCapture();
    if (error) {
      console.error("Capture failed: ", error.message);
      return;
    }
    ToastAndroid.show("Payment Successfully", ToastAndroid.CENTER);
    console.log(
      `Payment successfully with tips($${Number(tipValue).toFixed(2)})`
    );
    setTiping(false);
    setNeedTips(false);
    setTipValue("0");
  }, [tipValue, setTips, collectAndCapture, refNumber]);

  const onCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  const onVoidPayment = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    const { result } = await request<{ result: any[] }>("https://api.shift4test.com/api/rest/v1/transactions/invoice", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Invoice": invoiceNumber,
        "InterfaceVersion": version,
        "InterfaceName": "Rotender",
        "CompanyName": "Rotender",
        "AccessToken": accessToken
      }
    });
    console.log("Void: ", JSON.stringify(result, undefined, 2));
    ToastAndroid.show(`Void the invoice(${ invoiceNumber }) Successfully`, ToastAndroid.CENTER);
  }, [accessToken, invoiceNumber]);

  const onGetInvoiceInformation = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    const { result } = await request<{ result: any[] }>("https://api.shift4test.com/api/rest/v1/transactions/invoice", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Invoice": invoiceNumber,
        "InterfaceVersion": version,
        "InterfaceName": "Rotender",
        "CompanyName": "Rotender",
        "AccessToken": accessToken
      }
    });
    Alert.alert("Invoice Information", JSON.stringify(result, undefined, 2));
  }, [accessToken, invoiceNumber]);

  return (
    <View style={styles.container}>
      <Text>isInitialized: {String(isInitialized)}</Text>
      <Text style={{ marginBottom: 20 }}>Connected: {connectStatus}</Text>
      {/* <View style={ { display: "flex", flexDirection: "row", gap: 2, alignItems: "center", marginBottom: 20 } }>
        <Text>Clerk:</Text>
        <TextInput
          value={ clerkId }
          onChangeText={ setClerkId }
          style={{
            width: 50,
            borderColor: "#000",
            borderWidth: 1
          }}
        ></TextInput>
      </View> */}
      {tiping ? (
        <>
          <Text>Tips($):</Text>
          <TextInput
            value={tipValue}
            inputMode="decimal"
            onChangeText={setTipValue}
            style={{
              width: 200,
              borderColor: "#000",
              borderWidth: 1,
              marginBottom: 20
            }}
          ></TextInput>
          <View style={{ marginBottom: 24 }}>
            <Button title="Submit" onPress={submit}></Button>
          </View>
        </>
      ) : (
        <>
          <Text>Amount($):</Text>
          <TextInput
            value={price}
            inputMode="decimal"
            onChangeText={setPrice}
            style={{
              width: 200,
              borderColor: "#000",
              borderWidth: 1,
              marginBottom: 20
            }}
          ></TextInput>
          <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 20 }}>
            <CheckBox
              value={ needTips }
              onValueChange={(value) => setNeedTips(value)}
            />
            <Text>Tips</Text>
          </View>
          <View style={{ marginBottom: 24 }}>
            <Button title="Collect" onPress={startPOS}></Button>
          </View>
        </>
      )}
      <View style={{ marginBottom: 24 }}>
        <Button title="Cancel" onPress={onCancel}></Button>
      </View>
      <View style={ { display: "flex", flexDirection: "row", gap: 2, alignItems: "center", marginBottom: 20 } }>
        <Text>Invoice:</Text>
        <TextInput
          value={ invoiceNumber }
          onChangeText={ setInvoiceNumber }
          style={{
            width: 200,
            borderColor: "#000",
            borderWidth: 1
          }}
        ></TextInput>
      </View>
      <View style={{ marginBottom: 24, display: "flex", flexDirection: "row", gap: 50, alignItems: "center" }}>
        <Button title="Information" onPress={onGetInvoiceInformation }></Button>
        <Button title="Void" onPress={onVoidPayment }></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20
  }
});
