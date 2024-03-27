import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { Button } from "@mui/material";
import { setCallTypes } from "../redux/appSlice";
import { toast } from "react-toastify";

const endCall = {
  voiceCall: null,
  videoCall: null,
  incomingVoiceCall: null,
  incomingVideoCall: null,
};

const IncomingCall = () => {
  const { isLightMode, socket, setLatestCall } = useContext(AppContext);

  const dispatch = useDispatch();

  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  const incomingVoiceCall = app.callTypes.incomingVoiceCall;
  let incomingCall;
  if (incomingVoiceCall) {
    incomingCall = incomingVoiceCall;
  } else {
    incomingCall = app.callTypes.incomingVideoCall;
  }

  const createCallHistory = async () => {
    const url = `${process.env.REACT_APP_API_URL}/messages/send-message`;
    const callerDetails = {
      senderId: incomingCall.from.user_id,
      senderName: incomingCall.from.name,
      senderProfileImage: incomingCall.from.profile_image,
      receiverId: incomingCall.to.user_id,
      receiverName: incomingCall.to.name,
      receiverProfileImage: incomingCall.to.profile_image,
    };
    const callData = {
      from: incomingCall.from.user_id,
      to: incomingCall.to?.user_id,
      message: JSON.stringify(callerDetails),
      type: incomingCall.callType,
      isOnline: true,
      caption: null,
      chatUserBlockedUsers: [],
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      const { message, created_at, type, sender_id, receiver_id } =
        data.sentMessage;
      const {
        senderId,
        senderName,
        senderProfileImage,
        receiverId,
        receiverName,
        receiverProfileImage,
      } = JSON.parse(message);
      let user;
      if (senderId === auth.userInfo.user_id) {
        user = {
          userId: receiverId,
          name: receiverName,
          profileImage: receiverProfileImage,
          createdAt: created_at,
          type,
          senderId: sender_id,
          receiverId: receiver_id,
        };
      } else {
        user = {
          userId: senderId,
          name: senderName,
          profileImage: senderProfileImage,
          createdAt: created_at,
          type,
          senderId: sender_id,
          receiverId: receiver_id,
        };
      }
      setLatestCall(user);
    } else {
      toast.error(data.msg);
    }
  };

  const handleAcceptCall = () => {
    const user = chat.onlineUsers[incomingCall.from.user_id];
    if (incomingCall.callType === "Voice call") {
      dispatch(
        setCallTypes({
          ...app.callTypes,
          voiceCall: { ...incomingCall, status: "accepted" },
          incomingVoiceCall: null,
        })
      );
    } else {
      dispatch(
        setCallTypes({
          ...app.callTypes,
          videoCall: { ...incomingCall, status: "accepted" },
          incomingVideoCall: null,
        })
      );
    }
    if (user) {
      socket.emit("acceptCall", {
        callData: { ...incomingCall, status: "accepted" },
        user,
      });
      createCallHistory();
    }
  };

  const handleRejectCall = () => {
    dispatch(setCallTypes(endCall));
    const user = chat.onlineUsers[incomingCall.from.user_id];
    if (user) {
      socket.emit("endCall", user);
    }
  };

  return (
    <div
      className={`absolute px-4 py-3 ${
        isLightMode
          ? "custom-shadow bg-white"
          : "dark-custom-shadow bg-gray-800 text-white"
      } top-5 right-10 z-50 w-[19vw]  rounded-xl`}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={
            incomingCall.from?.profile_image
              ? incomingCall.from?.profile_image.startsWith("image_")
                ? `${process.env.REACT_APP_API_URL}/images/${incomingCall.from?.profile_image}`
                : incomingCall.from?.profile_image
              : null
          }
          alt="profile"
          sx={{ height: 50, width: 50, borderRadius: 10 }}
        />
        <div className="flex flex-col">
          <span className="font-semibold">{incomingCall.from.name}</span>
          <span>{incomingCall.callType}</span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button
          variant="outlined"
          color="error"
          sx={{ textTransform: "capitalize", borderRadius: 3 }}
          size="small"
          onClick={handleRejectCall}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          sx={{ textTransform: "capitalize", borderRadius: 3 }}
          size="small"
          //   onClick={() =>
          //     dispatch(setCallTypes({ ...app.callTypes, voiceCall: null }))
          //   }
          color="success"
          onClick={handleAcceptCall}
        >
          Accept
        </Button>
      </div>
    </div>
  );
};

export default IncomingCall;
