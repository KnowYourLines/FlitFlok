// Import the createSlice API from Redux Toolkit
import { createSlice } from "@reduxjs/toolkit";

// This is the initial state of the slice
const initialState = {
  code: "",
};

export const currencySlice = createSlice({
  name: "currency", // This is the name of the slice, we will later use this name to access the slice from the store
  initialState: initialState, // This is the initial state of the slice
  reducers: {
    setCode: (state, action) => {
      state.code = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCode } = currencySlice.actions;

// We export the reducer function so that it can be added to the store
export default currencySlice.reducer;
