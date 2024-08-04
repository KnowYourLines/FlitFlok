import React from "react";
import { Stack } from "expo-router/stack";
import { persistor, store } from "../redux/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function AppLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
