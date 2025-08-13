import { createSlice } from "@reduxjs/toolkit";

// define the initial state
export const initialState = {};

// create the slice
const landlordSlice = createSlice({
  // consume the value
  name: "landlord",
  initialState,
  reducers: {},
});

// export the actions
export const {} = landlordSlice.actions;
// export the ruducer
export default landlordSlice.reducer;
