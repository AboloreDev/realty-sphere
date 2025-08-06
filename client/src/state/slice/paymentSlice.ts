import { createSlice } from "@reduxjs/toolkit";

// define the initial state
export const initialState = {};

// create the slice
const paymentSlice = createSlice({
  // consume the value
  name: "payment",
  initialState,
  reducers: {},
});

// export the ruducer
export default paymentSlice.reducer;
// export the actions
export const {} = paymentSlice.actions;
