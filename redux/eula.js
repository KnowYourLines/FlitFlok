// Import the createSlice API from Redux Toolkit
import { createSlice } from "@reduxjs/toolkit";

// This is the initial state of the slice
const initialState = {
  agreed: true,
};

export const eulaSlice = createSlice({
  name: "eula", // This is the name of the slice, we will later use this name to access the slice from the store
  initialState: initialState, // This is the initial state of the slice
  reducers: {
    agreeEula: (state, action) => {
      state.agreed = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { agreeEula } = eulaSlice.actions;

// We export the reducer function so that it can be added to the store
export default eulaSlice.reducer;
