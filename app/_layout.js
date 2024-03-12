import React from "react";
import { Stack } from "expo-router/stack";
import NoInternet from "../components/NoInternet.js";
import { store } from "../redux/store.js";
import { Provider } from "react-redux";
import { useNetInfo } from "@react-native-community/netinfo";

export default function AppLayout() {
  const netInfo = useNetInfo();
  if (!netInfo.isInternetReachable && netInfo.isInternetReachable !== null) {
    return <NoInternet></NoInternet>;
  }
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
