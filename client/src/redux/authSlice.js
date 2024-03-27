import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userInfo: null,
  currentChatUser: null,
  currentGroupChat: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload.userInfo;
    },
    setCurrentChatUser: (state, action) => {
      state.currentChatUser = action.payload.currentChatUser;
    },
    setCurrentGroupChat: (state, action) => {
      state.currentGroupChat = action.payload.currentGroupChat;
    },
  },
});

export const {
  login,
  logout,
  setUserInfo,
  setCurrentChatUser,
  setCurrentGroupChat,
} = authSlice.actions;
export default authSlice.reducer;
