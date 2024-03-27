import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  friendSidebar: {
    open: false,
    type: null,
  },

  sideBar: {
    activeTab: "CHAT",
  },
  usersType: {
    allUsers: [],
    friends: [],
    friendRequests: [],
  },
  isGroupsActive: false,
  callTypes: {
    voiceCall: null,
    videoCall: null,
    incomingVoiceCall: null,
    incomingVideoCall: null,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setFriendSidebar: (state, action) => {
      state.friendSidebar = action.payload;
    },
    closeFriendSidebar: (state) => {
      state.friendSidebar.open = false;
    },
    changeDashboardTab: (state, action) => {
      state.sideBar.activeTab = action.payload.activeTab;
    },
    setAllUsers: (state, action) => {
      state.usersType.allUsers = action.payload.totalUsers;
    },
    setFriendRequests: (state, action) => {
      state.usersType.friendRequests = action.payload.friendRequests;
    },
    setFriends: (state, action) => {
      state.usersType.friends = action.payload.friends;
    },
    setIsGroupsActive: (state, action) => {
      state.isGroupsActive = action.payload.isGroupsActive;
    },
    setCallTypes: (state, action) => {
      state.callTypes = action.payload;
    },
  },
});

export const {
  setFriendSidebar,
  closeFriendSidebar,
  changeDashboardTab,
  setAllUsers,
  setFriendRequests,
  setFriends,
  setIsGroupsActive,
  setCallTypes,
} = appSlice.actions;

export default appSlice.reducer;
