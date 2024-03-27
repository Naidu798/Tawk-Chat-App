import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import appReducer from "./appSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    chat: chatReducer,
  },
});
