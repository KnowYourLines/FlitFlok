import { configureStore } from "@reduxjs/toolkit";
import eulaReducer from "./eulaSlice";
export const store = configureStore({
  reducer: { eula: eulaReducer },
});
