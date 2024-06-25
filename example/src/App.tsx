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
  TextInput
} from "react-native";
import {
  usePOSLinkTerminal,
  type POSLinkError,
  type POSLinkTernimal,
  type Reader
} from "@rotender/react-native-poslink";

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [connectStatus, setConnectStatus] = useState<string>("Disconnection");
  const [price, setPrice] = useState<string>("0");
  const currentReader: MutableRefObject<Reader | undefined> = useRef<
    Reader | undefined
  >();

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
    }
  });
  const {
    initialize,
    isInitialized,
    discoverReaders,
    connectBluetoothReader,
    cancelDiscovering,
    setAmount,
    collectAndCapture
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
      initialize();
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
    setAmount(Number(price) * 100);
    console.log(`Start collecting for $${Number(price).toFixed(2)}`);
    const { error } = await collectAndCapture();
    if (error) {
      console.error("Capture failed: ", error.message);
      return;
    }
    console.log(
      `Collect and capture successfully with $${Number(price).toFixed(2)}`
    );
  }, [price, setAmount, collectAndCapture]);

  return (
    <View style={styles.container}>
      <Text>isInitialized: {String(isInitialized)}</Text>
      <Text style={{ marginBottom: 20 }}>Connected: {connectStatus}</Text>
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
      <Button title="Collect" onPress={startPOS}></Button>
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
