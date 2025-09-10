import { Chat, User } from "@/types/prismaTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// define the initial state
export const initialState = {
  selectedUser: null,
  selectedChat: null,
};

// create the slice
const messageSlice = createSlice({
  // consume the value
  name: "messages",
  initialState,
  reducers: {
    setSelectedChat: (state, action: PayloadAction<Chat | null>) => {
      state.selectedChat = action.payload;
      // Update selectedUser for backward compatibility
      state.selectedUser = action.payload?.user || null;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
      // Clear selectedChat when setting user directly
      state.selectedChat = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.selectedChat = null;
    },
  },
});

// export the actions
export const { setSelectedUser, setSelectedChat, clearSelectedUser } =
  messageSlice.actions;
// export the ruducer
export default messageSlice.reducer;
