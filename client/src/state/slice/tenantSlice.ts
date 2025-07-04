import { createSlice } from "@reduxjs/toolkit";

// create the initial state for tenant
// const initialState = {
//   tenants: [], // Array to store tenant data
//   loading: false, // Track async operations
//   error: null, // Store error messages
//   selectedTenant: null, // Store a single tenant for details view
// };

export const initialState = {};
// create the slice
const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {},
});

// export functions
export default tenantSlice.reducer;
export const {} = tenantSlice.actions;
