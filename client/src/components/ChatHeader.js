import React, { useContext, useState } from "react";
import Badge from "./Badge";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { LuPhone } from "react-icons/lu";
import { PiCaretDownBold } from "react-icons/pi";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { Avatar, Button, IconButton } from "@mui/material";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { setCallTypes, setFriendSidebar } from "../redux/appSlice";
import FriendSettings from "./FriendSettings";

const ChatHeader = () => {
  const { isLightMode, socket } = useContext(AppContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);
  const app = useSelector((state) => state.app);

  const dispatch = useDispatch();

  const open = Boolean(anchorEl);
  const handleContactSettings = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onlineUsersIds = Object.keys(chat.onlineUsers);

  const handleVideoCall = () => {
    const videoCall = {
      from: auth.userInfo,
      to: auth.currentChatUser,
      callType: "Video call",
      mode: "outgoing",
      status: null,
      friendSocket: chat.onlineUsers[auth.currentChatUser?.user_id],
    };
    dispatch(setCallTypes({ ...app.callTypes, videoCall }));
    if (chat.onlineUsers[auth.currentChatUser?.user_id]) {
      socket.emit("outgoingVideoCall", videoCall);
    }
  };

  const handleVoiceCall = () => {
    const voiceCall = {
      from: auth.userInfo,
      to: auth.currentChatUser,
      callType: "Voice call",
      mode: "outgoing",
      status: null,
      friendSocket: chat.onlineUsers[auth.currentChatUser?.user_id],
    };
    dispatch(setCallTypes({ ...app.callTypes, voiceCall }));
    if (chat.onlineUsers[auth.currentChatUser?.user_id]) {
      socket.emit("outgoingVoiceCall", voiceCall);
    }
  };

  return (
    <div
      className={`${
        isLightMode
          ? "bg-lm-chat-bg custom-shadow"
          : "bg-[#171a21] dark-custom-shadow"
      } border-l-1 border-gray-600 h-[10vh] flex items-center justify-between px-3`}
    >
      <div>
        <div className="flex items-center gap-2">
          <div className="relative w-[50px] mr-3 h-full">
            <Avatar
              sx={{ width: 55, height: 55 }}
              src={
                app.isGroupsActive
                  ? auth.currentGroupChat?.logo
                    ? auth.currentGroupChat?.logo.startsWith("image_")
                      ? `${process.env.REACT_APP_API_URL}/images/${auth.currentGroupChat?.logo}`
                      : auth.currentGroupChat?.logo
                    : null
                  : auth.currentChatUser?.profile_image
                  ? auth.currentChatUser?.profile_image.startsWith("image_")
                    ? `${process.env.REACT_APP_API_URL}/images/${auth.currentChatUser?.profile_image}`
                    : auth.currentChatUser?.profile_image
                  : null
              }
              alt="profile"
              onClick={() =>
                dispatch(setFriendSidebar({ open: true, type: "INFO" }))
              }
            />

            {onlineUsersIds.includes(
              auth.currentChatUser?.user_id.toString()
            ) && (
              <div className="absolute bottom-0 right-0">
                <Badge />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span
              className={`${
                isLightMode ? "text-black font-bold" : "text-gray-200"
              } text-lg`}
            >
              {app.isGroupsActive
                ? auth.currentGroupChat?.group_name
                : auth.currentChatUser?.name}
            </span>
            {app.isGroupsActive ? (
              <Button
                sx={{ textTransform: "unset", p: 0, m: 0 }}
                onClick={() =>
                  dispatch(setFriendSidebar({ open: true, type: "INFO" }))
                }
              >
                <span
                  className={`${
                    isLightMode ? "text-black" : "text-gray-400"
                  } text-sm`}
                >
                  Tap to group info
                </span>
              </Button>
            ) : (
              <span
                className={`${
                  isLightMode ? "text-black" : "text-gray-400"
                } text-sm`}
              >
                {onlineUsersIds.includes(
                  auth.currentChatUser?.user_id.toString()
                )
                  ? "Online"
                  : "Offline"}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-5">
        {app.isGroupsActive ? (
          ""
        ) : (
          <IconButton onClick={handleVideoCall}>
            <HiOutlineVideoCamera
              className={`${isLightMode ? "" : "text-gray-200"}`}
            />
          </IconButton>
        )}
        {app.isGroupsActive ? (
          ""
        ) : (
          <IconButton onClick={handleVoiceCall}>
            <LuPhone
              className={`${isLightMode ? "" : "text-gray-200"} h-5 w-5`}
            />
          </IconButton>
        )}
        <IconButton
          onClick={() =>
            dispatch(setFriendSidebar({ open: true, type: "SEARCH_MESSAGES" }))
          }
        >
          <HiMagnifyingGlass
            className={`${isLightMode ? "" : "text-gray-200"}`}
          />
        </IconButton>
        <hr className="w-[1.5px] bg-gray-400 h-[40px]" />
        {open && (
          <FriendSettings
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            open={open}
          />
        )}
        <IconButton onClick={handleContactSettings}>
          <PiCaretDownBold
            className={`${isLightMode ? "" : "text-gray-200"}`}
          />
        </IconButton>
      </div>
    </div>
  );
};

export default ChatHeader;
