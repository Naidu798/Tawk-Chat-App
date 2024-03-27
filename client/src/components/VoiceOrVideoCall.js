import { Avatar, Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LiaAngleDoubleRightSolid } from "react-icons/lia";
import { AppContext } from "../context/AppContext";
import { setCallTypes } from "../redux/appSlice";
import { setCallHistory } from "../redux/chatSlice";

const endCall = {
  voiceCall: null,
  videoCall: null,
  incomingVoiceCall: null,
  incomingVideoCall: null,
};

let interval;

const VoiceOrVideoCall = () => {
  const { isLightMode, socket, latestCall } = useContext(AppContext);
  const dispatch = useDispatch();

  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  const voiceCall = app.callTypes.voiceCall;
  let ongoingCall;
  if (voiceCall) {
    ongoingCall = voiceCall;
  } else {
    ongoingCall = app.callTypes.videoCall;
  }

  const handleEndCall = () => {
    clearInterval(interval);
    dispatch(setCallTypes(endCall));

    let user;
    user = chat.onlineUsers[ongoingCall.to.user_id];

    if (ongoingCall.status === "accepted") {
      if (auth.userInfo.user_id === ongoingCall.from.user_id) {
        user = chat.onlineUsers[ongoingCall.to.user_id];
      } else {
        user = chat.onlineUsers[ongoingCall.from.user_id];
      }
    }

    if (user) {
      socket.emit("endCall", user);
    }

    if (latestCall) {
      dispatch(
        setCallHistory({ callHistory: [latestCall, ...chat.callHistory] })
      );
    }
  };

  // useEffect(() => {
  //   if (ongoingCall.status === "accepted") {
  //     interval = setInterval(() => {
  //       setSeconds((prev) => prev + 1);
  //     }, 1000);
  //   }

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [ongoingCall.status]);

  // const formatTime = () => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  // };

  return (
    <div
      className={`absolute ${
        isLightMode
          ? "custom-shadow bg-white"
          : "dark-custom-shadow bg-gray-800 text-white"
      } top-5 right-10 z-50  w-[25vw] h-[42vh] rounded-xl py-6 flex flex-col items-center`}
    >
      <div className="flex items-center gap-5">
        {ongoingCall.from.user_id === auth.userInfo.user_id ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src={
                ongoingCall.from?.profile_image
                  ? ongoingCall.from?.profile_image.startsWith("image_")
                    ? `${process.env.REACT_APP_API_URL}/images/${ongoingCall.from?.profile_image}`
                    : ongoingCall.from?.profile_image
                  : null
              }
              alt="profile"
              sx={{ height: 80, width: 80, borderRadius: 10 }}
            />
            <span className="">You</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src={
                ongoingCall.to?.profile_image
                  ? ongoingCall.to?.profile_image.startsWith("image_")
                    ? `${process.env.REACT_APP_API_URL}/images/${ongoingCall.to?.profile_image}`
                    : ongoingCall.to?.profile_image
                  : null
              }
              sx={{ height: 80, width: 80, borderRadius: 10 }}
              alt="profile"
            />
            <span>You</span>
          </div>
        )}
        <div className="flex items-center text-green-400">
          <LiaAngleDoubleRightSolid />
          <LiaAngleDoubleRightSolid />
          <LiaAngleDoubleRightSolid />
        </div>
        {ongoingCall.from.user_id === auth.userInfo.user_id ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src={
                ongoingCall.to?.profile_image
                  ? ongoingCall.to?.profile_image.startsWith("image_")
                    ? `${process.env.REACT_APP_API_URL}/images/${ongoingCall.to?.profile_image}`
                    : ongoingCall.to?.profile_image
                  : null
              }
              sx={{ height: 80, width: 80, borderRadius: 10 }}
              alt="profile"
            />
            <span>{ongoingCall.to.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src={
                ongoingCall.from?.profile_image
                  ? ongoingCall.from?.profile_image.startsWith("image_")
                    ? `${process.env.REACT_APP_API_URL}/images/${ongoingCall.from?.profile_image}`
                    : ongoingCall.from?.profile_image
                  : null
              }
              alt="profile"
              sx={{ height: 80, width: 80, borderRadius: 10 }}
            />
            <span className="">{ongoingCall.from.name}</span>
          </div>
        )}
      </div>
      {ongoingCall.status === "accepted" ? (
        <div className="flex flex-col items-center font-semibold">
          <span className="mt-5 mb-3 text-md font-semibold text-green-500">
            Connected
          </span>
          {/* <span>{formatTime(seconds)}</span> */}
        </div>
      ) : (
        <span className="my-5 text-md font-semibold">Connecting . . .</span>
      )}
      <Button
        variant="outlined"
        color="error"
        sx={{ textTransform: "capitalize", borderRadius: 3, mt: 2 }}
        size="small"
        onClick={handleEndCall}
      >
        Hang up
      </Button>
    </div>
  );
};

export default VoiceOrVideoCall;
