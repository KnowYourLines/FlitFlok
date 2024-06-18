import { configureStore } from "@reduxjs/toolkit";
import eulaReducer from "./eula";
import reelReducer from "./reel";
export const store = configureStore({
  reducer: { eula: eulaReducer, reel: reelReducer },
});
