import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button } from "@mui/material";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { setFriendRequests, setFriends } from "../../redux/appSlice";
import { toast } from "react-toastify";

const Notifications = () => {
  const {
    isLightMode,
    getAmPmTime,
    socket,
    toastMessage,
    setNotifications,
    notifications,
  } = useContext(AppContext);

  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  const dispatch = useDispatch();

  const handleShowNotification = (value) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.createdAt === value
        ? { ...notification, status: "read" }
        : notification
    );
    setNotifications(updatedNotifications);
  };

  const deleteNotification = (value) => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.createdAt !== value
    );
    setNotifications(updatedNotifications);
  };

  const handleAcceptRequest = async (user) => {
    const url = `${process.env.REACT_APP_API_URL}/accept-friend-request`;
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId: user.requestId,
        sender: user.userId,
        receiver: auth.userInfo.user_id,
      }),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      const updatedFriendRequests = app.usersType.friendRequests.filter(
        (request) => request.requestId !== user.requestId
      );
      const friendDetails = {
        request_id: user.requestId,
        ...auth.userInfo,
      };
      const newFriend = {
        user_id: user.userId,
        name: user.name,
        profile_image: user.profileImage,
        about: user.about,
        phone: user.phone,
        email: user.email,
      };
      dispatch(setFriendRequests({ friendRequests: updatedFriendRequests }));
      dispatch(setFriends({ friends: [...app.usersType.friends, newFriend] }));
      const updatedNotifications = notifications.map((ntf) =>
        ntf.createdAt === user.createdAt ? { ...ntf, reaction: "accept" } : ntf
      );
      setNotifications(updatedNotifications);

      if (chat.onlineUsers[user.userId]) {
        socket.emit("sendAcceptRequest", {
          friendDetails,
          socketId: chat.onlineUsers[user.userId],
        });
      }

      toastMessage("success", `You and ${user.name} are friends now.`);
    } else {
      toast.error(data.msg);
    }
  };

  const handleRejectRequest = async (id, userId, value) => {
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
        ntf.createdAt === value ? { ...ntf, reaction: "reject" } : ntf
      );
      setNotifications(updatedNotifications);
      if (chat.onlineUsers[userId]) {
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
    <div
      className={`h-full w-full py-3 flex flex-col px-3 ${
        isLightMode ? "custom-shadow" : "dark-custom-shadow"
      }`}
    >
      <span
        className={`text-xl font-extrabold tracking-wider ${
          isLightMode ? "text-black" : "text-white"
        }`}
      >
        Notifications
      </span>
      <div
        className={`w-full h-full overflow-auto px-4 rounded-xl mt-3 ${
          isLightMode
            ? "custom-scrollbar custom-shadow"
            : "dark-custom-scrollbar dark-custom-shadow"
        }`}
      >
        {notifications.length === 0 ? (
          <div className="h-full w-full flex justify-center items-center">
            <span
              className={`text-[19px] tracking-wider ${
                isLightMode ? "text-gray-700 font-bold" : "text-[#ecf2f8]"
              }`}
            >
              No notifications
            </span>
          </div>
        ) : (
          <ul>
            {notifications.map((user) => {
              return (
                <li
                  className={`w-full my-2 pt-1 pb-2 px-3 rounded-lg ${
                    isLightMode
                      ? `${
                          user.status === "read" ? "bg-[#fff] " : "bg-[#efeeee]"
                        } custom-shadow`
                      : `${
                          user.status === "read"
                            ? "bg-[#1e2730]"
                            : "bg-[#27323d]"
                        } dark-custom-shadow`
                  }`}
                >
                  <div className="mr-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 mb-2">
                      <Avatar
                        sx={{ width: 25, height: 25 }}
                        src={
                          user?.profileImage
                            ? user?.profileImage.startsWith("image_")
                              ? `${process.env.REACT_APP_API_URL}/images/${user?.profileImage}`
                              : user?.profileImage
                            : null
                        }
                        alt="profile"
                      />
                      <span
                        className={`text-[15px] px-2 ${
                          isLightMode
                            ? "text-black font-bold"
                            : "text-[#ecf2f8]"
                        }`}
                      >
                        {user.name}
                      </span>
                    </div>
                    <span
                      className={`text-[14px] ${
                        isLightMode ? "" : "text-gray-500"
                      }`}
                    >
                      {getAmPmTime(user.createdAt)}
                    </span>
                  </div>
                  {user.status !== "read" ? (
                    <Button
                      size="small"
                      sx={{ textTransform: "capitalize", p: 0, ml: 3, mt: 0 }}
                      onClick={() => handleShowNotification(user.createdAt)}
                    >
                      More...
                    </Button>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <p
                          className={`text-sm text-left ml-9 ${
                            isLightMode ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {user.type === "request"
                            ? `${user.name} sent a friend request.`
                            : user.type === "accept"
                            ? `${user.name} is accepted your friend request.`
                            : user.type === "remove"
                            ? `${user.name} is removed from his friends list.`
                            : `${user.name} is rejected your friend request.`}
                        </p>
                        <MdOutlineDeleteOutline
                          className={`text-xl ${
                            isLightMode ? "text-gray-700" : "text-gray-400"
                          }`}
                          onClick={() => deleteNotification(user.createdAt)}
                        />
                      </div>
                      {user.type === "request" && (
                        <div className="flex items-center gap-1 self-end">
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{
                              textTransform: "capitalize",
                              borderRadius: 10,
                              fontSize: 10,
                              padding: 0,
                            }}
                            onClick={() =>
                              handleRejectRequest(
                                user.requestId,
                                user.userId,
                                user.createdAt
                              )
                            }
                            disabled={user?.reaction ? true : false}
                          >
                            {user?.reaction === "reject"
                              ? "Rejected"
                              : "Reject"}
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{
                              textTransform: "capitalize",
                              borderRadius: 10,
                              fontSize: 10,
                              padding: 0,
                            }}
                            disabled={user?.reaction ? true : false}
                            onClick={() => handleAcceptRequest(user)}
                          >
                            {user?.reaction === "accept"
                              ? "Accepted"
                              : "Accept"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="my-2">
        <Button
          size="small"
          variant="contained"
          sx={{ textTransform: "capitalize", width: "100%", borderRadius: 3 }}
          onClick={() => setNotifications([])}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default Notifications;
