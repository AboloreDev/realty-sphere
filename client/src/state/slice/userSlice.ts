import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types";

// declare an interface for userState
export interface UserState {
  user: User | null;
}

// declare the initial state
export const initialState: UserState = {
  user: null,
};

// create a slice for the user state
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      // Save the user to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
});

// export the actions and reducer
export default userSlice.reducer;
export const { setUser } = userSlice.actions;
