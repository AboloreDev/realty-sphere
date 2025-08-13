import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialStateTypes {
  activeTab: "all" | "pending" | "approved" | "declined";
}

// define the initial state
export const initialState: InitialStateTypes = {
  activeTab: "all",
};

// create the slice
const applicationSlice = createSlice({
  // consume the value
  name: "application",
  initialState,
  reducers: {
    setActiveTab: (
      state,
      action: PayloadAction<"all" | "pending" | "approved" | "declined">
    ) => {
      state.activeTab = action.payload;
    },
  },
});

// export the actions
export const { setActiveTab } = applicationSlice.actions;
// export the ruducer
export default applicationSlice.reducer;
