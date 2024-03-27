import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button } from "@mui/material";
import { toast } from "react-toastify";
import { setFriendRequests, setFriends } from "../redux/appSlice";

const RequestsTab = () => {
  const { isLightMode, toastMessage, socket, setNotifications, notifications } =
    useContext(AppContext);

  const dispatch = useDispatch();

  const app = useSelector((state) => state.app);
  const chat = useSelector((state) => state.chat);
  const auth = useSelector((state) => state.auth);

  const handleAcceptRequest = async (id, name, senderId) => {
    const url = `${process.env.REACT_APP_API_URL}/accept-friend-request`;
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: id,
        sender: senderId,
        receiver: auth.userInfo.user_id,
      }),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      const updatedFriendRequests = app.usersType.friendRequests.filter(
        (request) => request.requestId !== id
      );
      const friendDetails = {
        request_id: id,
        ...auth.userInfo,
      };

      dispatch(setFriendRequests({ friendRequests: updatedFriendRequests }));
      dispatch(
        setFriends({
          friends: [...app.usersType.friends, auth.currentChatUser],
        })
      );
      if (notifications.length > 0) {
        const updatedNotifications = notifications.map((ntf) =>
          ntf.requestId === id ? { ...ntf, reaction: "accept" } : ntf
        );
        setNotifications(updatedNotifications);
      }

      if (chat.onlineUsers[senderId]) {
        socket.emit("sendAcceptRequest", {
          friendDetails,
          socketId: chat.onlineUsers[senderId],
        });
      }

      toastMessage("success", `You and ${name} are friends now.`);
    } else {
      toast.error(data.msg);
    }
  };

  const handleRejectRequest = async (id, userId) => {
    const url = `${process.env.REACT_APP_API_URL}/reject-friend-request`;
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId: id }),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      const updatedFriendRequests = app.usersType.friendRequests.filter(
        (request) => request.requestId !== id
      );
      const friendDetails = {
        request_id: id,
        ...auth.userInfo,
      };
      dispatch(setFriendRequests({ friendRequests: updatedFriendRequests }));
      const updatedNotifications = notifications.map((ntf) =>
        ntf.requestId === id ? { ...ntf, reaction: "reject" } : ntf
      );
      setNotifications(updatedNotifications);
      console.log("reject trigger");

      if (chat.onlineUsers[userId]) {
        console.log("reject in online trigger");
        socket.emit("sendRejectRequest", {
          friendDetails,
          socketId: chat.onlineUsers[userId],
        });
      }
    } else {
      toast.error(data.msg);
    }
  };

  return (
    <ul
      className={`h-[50vh] w-[25vw] overflow-auto mt-5 py-2 rounded-lg ${
        isLightMode
          ? "custom-scrollbar custom-shadow"
          : "dark-custom-scrollbar dark-custom-shadow"
      }`}
    >
      {app.usersType.friendRequests.length > 0 ? (
        app.usersType.friendRequests.map((user) => {
          return (
            <li
              className={`flex items-center justify-between gap-2 py-2 mx-4 px-2 rounded-lg my-2 ${
                isLightMode ? "bg-[#fff]" : "bg-[#1e2730]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Avatar
                  sx={{ width: 30, height: 30 }}
                  src={user?.profile_image}
                  alt="profile"
                />
                <span
                  className={`text-[16px] ${
                    isLightMode ? "text-gray-700 font-bold" : "text-[#ecf2f8]"
                  }`}
                >
                  {user.senderName}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ textTransform: "capitalize", borderRadius: 10 }}
                  onClick={() =>
                    handleRejectRequest(user.requestId, user.senderId)
                  }
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ textTransform: "capitalize", borderRadius: 10 }}
                  onClick={() =>
                    handleAcceptRequest(
                      user.requestId,
                      user.senderName,
                      user.senderId
                    )
                  }
                >
                  Accept
                </Button>
              </div>
            </li>
          );
        })
      ) : (
        <div className="h-[45vh] w-[25vw] flex justify-center items-center">
          <span
            className={`ml-3 text-lg tracking-wider ${
              isLightMode ? "font-semibold text-gray-700" : "text-white"
            }`}
          >
            No Requests
          </span>
        </div>
      )}
    </ul>
  );
};

export default RequestsTab;
