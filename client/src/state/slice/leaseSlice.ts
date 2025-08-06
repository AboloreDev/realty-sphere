import { createSlice } from "@reduxjs/toolkit";

// define the initial state
export const initialState = {};

// create the slice
const leaseSlice = createSlice({
  // consume the value
  name: "lease",
  initialState,
  reducers: {},
});

// export the ruducer
export default leaseSlice.reducer;
// export the actions
export const {} = leaseSlice.actions;
