// Import the createSlice API from Redux Toolkit
import { createSlice } from "@reduxjs/toolkit";

// This is the initial state of the slice
const initialState = {
  purpose: "",
};

export const reelSlice = createSlice({
  name: "reel", // This is the name of the slice, we will later use this name to access the slice from the store
  initialState: initialState, // This is the initial state of the slice
  reducers: {
    setPurpose: (state, action) => {
      state.purpose = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPurpose } = reelSlice.actions;

// We export the reducer function so that it can be added to the store
export default reelSlice.reducer;
