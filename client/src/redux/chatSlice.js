import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  onlineUsers: {},
  newMessage: null,
  allChatUsers: [],
  pinnedChatUsers: [],
  myGroupChats: [],
  joinedGroupChats: [],
  pinnedUsers: [],
  blockedUsers: [],
  callHistory: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload.onlineUsers;
    },

    setNewMessage: (state, action) => {
      state.newMessage = action.payload.newMessage;
    },
    setAllChatUsers: (state, action) => {
      state.allChatUsers = action.payload.allChatUsers;
    },
    setPinnedChatUsers: (state, action) => {
      state.pinnedChatUsers = action.payload.pinnedChatUsers;
    },
    setPinnedUsers: (state, action) => {
      state.pinnedUsers = action.payload.pinnedUsers;
    },
    setBlockedUsers: (state, action) => {
      state.blockedUsers = action.payload.blockedUsers;
    },
    setMyGroupChats: (state, action) => {
      state.myGroupChats = action.payload.myGroupChats;
    },
    setJoinedGroupChats: (state, action) => {
      state.joinedGroupChats = action.payload.joinedGroupChats;
    },
    setCallHistory: (state, action) => {
      state.callHistory = action.payload.callHistory;
    },
  },
});

export const {
  setMessages,
  setOnlineUsers,
  setNewMessage,
  setAllChatUsers,
  setPinnedChatUsers,
  setMyGroupChats,
  setJoinedGroupChats,
  setPinnedUsers,
  setBlockedUsers,
  setCallHistory,
} = chatSlice.actions;

export default chatSlice.reducer;
