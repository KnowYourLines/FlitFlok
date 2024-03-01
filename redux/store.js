import { configureStore } from "@reduxjs/toolkit";
import eulaReducer from "./eula";
export const store = configureStore({
  reducer: { eula: eulaReducer },
});
