import React from "react";
import { Stack } from "expo-router/stack";
import { store } from "../redux/store.js";
import { Provider } from "react-redux";

export default function AppLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
