import { useEffect } from "react";
import { NativeEventEmitter } from "react-native";
import type { EmitterSubscription } from "react-native/Libraries/vendor/emitter/EventEmitter";

const eventEmitter = new NativeEventEmitter();

export function useListener(name: string, callback?: (...args: any[]) => any) {
  useEffect(() => {
    let listener: EmitterSubscription;
    if (callback) {
      listener = eventEmitter.addListener(name, callback);
    }

    return () => {
      if (listener && listener.remove) {
        listener.remove();
      }
    };
  }, [name, callback]);
}
