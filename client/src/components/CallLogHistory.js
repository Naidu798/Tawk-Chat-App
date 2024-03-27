import { Avatar, IconButton, Typography } from "@mui/material";
import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { LuPhone } from "react-icons/lu";
import { GoArrowUpRight, GoArrowDownLeft } from "react-icons/go";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setCallTypes } from "../redux/appSlice";

const CallLogHistory = ({ searchCallLogs, searchTerm }) => {
  const { isLightMode, calculateTime, getAmPmTime, socket } =
    useContext(AppContext);

  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);
  const app = useSelector((state) => state.app);

  const dispatch = useDispatch();

  const handleVideoCall = (user) => {
    if (
      app.usersType.friends.some((friend) => friend.user_id === user.userId)
    ) {
      const userDetails = {
        user_id: user.userId,
        name: user.name,
        profile_image: user.profileImage,
      };

      const videoCall = {
        from: auth.userInfo,
        to: userDetails,
        callType: "Video call",
        mode: "outgoing",
        status: null,
        friendSocket: chat.onlineUsers[userDetails.user_id],
      };
      dispatch(setCallTypes({ ...app.callTypes, videoCall }));
      if (chat.onlineUsers[userDetails.user_id]) {
        socket.emit("outgoingVideoCall", videoCall);
      }
    } else {
      toast.info("This user is not your friend now.");
    }
  };

  const handleVoiceCall = (user) => {
    if (
      app.usersType.friends.some((friend) => friend.user_id === user.userId)
    ) {
      const userDetails = {
        user_id: user.userId,
        name: user.name,
        profile_image: user.profileImage,
      };

      const voiceCall = {
        from: auth.userInfo,
        to: userDetails,
        callType: "Voice call",
        mode: "outgoing",
        status: null,
        friendSocket: chat.onlineUsers[userDetails.user_id],
      };
      dispatch(setCallTypes({ ...app.callTypes, voiceCall }));
      if (chat.onlineUsers[userDetails.user_id]) {
        socket.emit("outgoingVoiceCall", voiceCall);
      }
    } else {
      toast.info("This is user not your friend now.");
    }
  };

  return (
    <div
      className={`w-full h-full overflow-auto px-4 ${
        isLightMode ? "custom-scrollbar" : "dark-custom-scrollbar"
      }`}
    >
      <Typography
        sx={{ mt: 2, fontSize: 19, color: isLightMode ? "" : "#fff" }}
      >
        History
      </Typography>
      {searchCallLogs.length === 0 ? (
        <div className="h-[60vh] w-full flex justify-center items-center">
          <span
            className={`text-[19px] tracking-wider ${
              isLightMode ? "text-gray-700 font-bold" : "text-[#ecf2f8]"
            }`}
          >
            {searchTerm ? "No History Found" : "No History"}
          </span>
        </div>
      ) : (
        <div>
          <ul className="px-2">
            {searchCallLogs.map((user) => {
              return (
                <li
                  className={`flex items-center w-full my-2 py-1 px-3 rounded-lg ${
                    isLightMode
                      ? "bg-[#fff] custom-shadow"
                      : "bg-[#1e2730] dark-custom-shadow"
                  }`}
                >
                  <div className="relative w-[60px] mr-2 h-full">
                    <Avatar
                      sx={{ width: 50, height: 50 }}
                      src={
                        user?.profileImage
                          ? user?.profileImage.startsWith("image_")
                            ? `${process.env.REACT_APP_API_URL}/images/${user?.profileImage}`
                            : user?.profileImage
                          : null
                      }
                      alt="profile"
                    />
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-[16px] ${
                          isLightMode
                            ? "text-black font-bold"
                            : "text-[#ecf2f8]"
                        }`}
                      >
                        {user.name}
                      </span>
                      {user.type === "Voice call" ? (
                        <IconButton
                          color="success"
                          onClick={() => handleVoiceCall(user)}
                        >
                          <LuPhone className="h-5 w-5" />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="success"
                          onClick={() => handleVideoCall(user)}
                        >
                          <HiOutlineVideoCamera className="h-5 w-5" />
                        </IconButton>
                      )}
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {auth.userInfo.user_id === user.senderId ? (
                          <GoArrowUpRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <GoArrowDownLeft className="h-5 w-5 text-green-500" />
                        )}
                        <span
                          className={`text-[14px] ${
                            isLightMode ? "" : "text-[#ecf2f8] opacity-50"
                          }`}
                        >
                          {calculateTime(user.createdAt)}
                        </span>
                      </div>
                      <span
                        className={`text-[14px] ${
                          isLightMode ? "" : "text-[#ecf2f8] opacity-40"
                        }`}
                      >
                        {getAmPmTime(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CallLogHistory;
