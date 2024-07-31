import { configureStore } from "@reduxjs/toolkit";
import eulaReducer from "./eula";
import currencyReducer from "./currency";
export const store = configureStore({
  reducer: { eula: eulaReducer, currency: currencyReducer },
});
