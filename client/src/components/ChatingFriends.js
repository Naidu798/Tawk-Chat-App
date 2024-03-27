import { Avatar, Button, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { IoIosCamera } from "react-icons/io";
import Badge from "./Badge";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChatUser } from "../redux/authSlice";
import { setFriendSidebar } from "../redux/appSlice";

import { setAllChatUsers, setPinnedChatUsers } from "../redux/chatSlice";

import { toast } from "react-toastify";
import MessageStatus from "./MessageStatus";

const ChatingFriends = ({ searchTerm }) => {
  const { isLightMode, socket } = useContext(AppContext);

  const chat = useSelector((state) => state.chat);
  const auth = useSelector((state) => state.auth);

  const [filteredPinnedChatUsers, setFilteredPinnedChatUsers] = useState(
    chat.pinnedChatUsers
  );
  const [filteredAllChatUsers, setFilteredAllChatUsers] = useState(
    chat.allChatUsers
  );

  const dispatch = useDispatch();

  const calculateTime = (inputDateStr) => {
    const inputDate = new Date(inputDateStr);
    const currentDate = new Date();

    const timeFormat = { hour: "numeric", minute: "numeric" };
    const dateFormat = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    if (
      inputDate.getUTCDate() === currentDate.getUTCDate() &&
      inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
      inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
    ) {
      const amPmTime = inputDate.toLocaleTimeString("en-US", timeFormat);
      return amPmTime;
    } else if (
      inputDate.getUTCDate() === currentDate.getUTCDate() - 1 &&
      inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
      inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
    ) {
      return "Yesterday";
    } else if (
      Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24) > 1) &&
      Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24) <= 7)
    ) {
      const timeDifference = Math.floor(
        (currentDate - inputDate) / (1000 * 60 * 60 * 24)
      );
      const targetDate = new Date();
      targetDate.setDate(currentDate.getDate() - timeDifference);

      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "WednesDay",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const targetDay = daysOfWeek[targetDate.getDay()];
      return targetDay;
    } else {
      const formattedDate = inputDate.toLocaleDateString("en-GB", dateFormat);
      return formattedDate;
    }
  };
  const onlineUsersIds = Object.keys(chat.onlineUsers);

  const updateMessageStatus = async (messageIds, status) => {
    const url = `${process.env.REACT_APP_API_URL}/messages/update-message-status`;
    const reqData = {
      messageIds,
      status,
    };
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 400) {
      toast.error(data.msg);
    }
  };

  const handleChangeChatUser = (user, i, type) => {
    if (user?.userId === auth?.currentChatUser?.user_id) return;
    const userDetails = {
      user_id: user.userId,
      name: user.name,
      profile_image: user.profileImage,
      about: user.about,
      phone: user.phone,
      isPinned: user.isPinned,
      isGroupChat: false,
      total_unread_messages: user.totalUnreadMessages,
    };
    dispatch(setFriendSidebar({ open: false, type: null }));
    dispatch(setCurrentChatUser({ currentChatUser: userDetails }));

    if (type === "ALL_CHAT") {
      if (user.totalUnreadMessages.length > 0) {
        const modifiedChatUsersData = chat.allChatUsers.map((obj, index) =>
          index === i ? { ...obj, totalUnreadMessages: [] } : obj
        );
        dispatch(setAllChatUsers({ allChatUsers: modifiedChatUsersData }));
      }
    } else {
      if (user.totalUnreadMessages.length > 0) {
        const modifiedChatUsersData = chat.pinnedChatUsers.map((obj, index) =>
          index === i ? { ...obj, totalUnreadMessages: [] } : obj
        );
        dispatch(
          setPinnedChatUsers({ pinnedChatUsers: modifiedChatUsersData })
        );
      }
    }

    if (user.totalUnreadMessages.length > 0) {
      updateMessageStatus(user.totalUnreadMessages, "read");
    }
  };

  useEffect(() => {
    if (auth?.currentChatUser?.user_id) {
      let socketId = chat.onlineUsers[auth.currentChatUser.user_id];
      if (auth.currentChatUser.total_unread_messages.length > 0 && socketId) {
        socket.emit("updateMessageStatus", {
          msgs: { Not_Today: auth.currentChatUser.total_unread_messages },
          socketId,
        });
      }
    } else {
      return;
    }
  }, [auth.currentChatUser]);

  useEffect(() => {
    setFilteredPinnedChatUsers(chat.pinnedChatUsers);
    setFilteredAllChatUsers(chat.allChatUsers);
  }, [chat.pinnedChatUsers, chat.allChatUsers]);

  useEffect(() => {
    if (searchTerm) {
      const filteredPinnedUsers = chat.pinnedChatUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredAlldUsers = chat.allChatUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPinnedChatUsers(filteredPinnedUsers);
      setFilteredAllChatUsers(filteredAlldUsers);
    } else {
      setFilteredPinnedChatUsers(chat.pinnedChatUsers);
      setFilteredAllChatUsers(chat.allChatUsers);
    }
  }, [searchTerm]);
  return (
    <div
      className={`w-full h-full overflow-auto px-4 ${
        isLightMode ? "custom-scrollbar" : "dark-custom-scrollbar"
      }`}
    >
      {filteredPinnedChatUsers.length > 0 && (
        <div>
          <Typography
            sx={{ mt: 2, fontSize: 17, color: isLightMode ? "" : "#fff" }}
          >
            Pinned Chats
          </Typography>
          <ul className="px-2">
            {filteredPinnedChatUsers.map((user, i) => {
              return (
                <Button
                  sx={{
                    width: "100%",
                    textTransform: "none",
                    padding: 0,
                    mt: 1,
                    mb: 1,
                  }}
                  onClick={(e) => {
                    handleChangeChatUser(user, i, "PINNED_CHAT");
                  }}
                >
                  <li
                    key={user?.createdAt}
                    className={`flex items-center w-full px-3 py-3 rounded-2xl ${
                      isLightMode
                        ? ` ${
                            user.userId === auth.currentChatUser?.user_id
                              ? "bg-lm-blue"
                              : "bg-[#fff] hover:bg-[#eff1f2]"
                          }`
                        : `${
                            user.userId === auth.currentChatUser?.user_id
                              ? "bg-lm-blue"
                              : "bg-[#1e2730] hover:bg-[#2d3947]"
                          }`
                    }`}
                  >
                    <div className="relative w-[60px] mr-3 h-full">
                      <Avatar
                        sx={{ width: 60, height: 60 }}
                        src={
                          user?.profileImage
                            ? user.profileImage.startsWith("image_")
                              ? `${process.env.REACT_APP_API_URL}/images/${user.profileImage}`
                              : user.profileImage
                            : null
                        }
                        alt="profile"
                      />{" "}
                      {onlineUsersIds.includes(user.userId.toString()) && (
                        <div className="absolute bottom-0 right-1">
                          <Badge />
                        </div>
                      )}
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span
                          className={`text-[17px] ${
                            isLightMode
                              ? user.userId === auth.currentChatUser?.user_id
                                ? "text-white font-semibold"
                                : "text-black font-bold"
                              : user.userId === auth.currentChatUser?.user_id
                              ? "text-white font-semibold"
                              : "text-[#ecf2f8]"
                          }`}
                        >
                          {user.name}
                        </span>
                        {user?.createdAt && (
                          <span
                            className={`text-[12px] ${
                              isLightMode
                                ? user.userId === auth.currentChatUser?.user_id
                                  ? "text-gray-200"
                                  : "text-gray-700"
                                : "text-[#ecf2f8] opacity-50"
                            }`}
                          >
                            {calculateTime(user.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        {user.messageType === "image" ? (
                          <div
                            className={`text-sm flex items-center gap-1 h-5 max-w-[200px] text-left overflow-hidden ${
                              isLightMode
                                ? user.userId === auth.currentChatUser?.user_id
                                  ? "text-gray-200"
                                  : "text-gray-700"
                                : user.userId === auth.currentChatUser?.user_id
                                ? "text-gray-100"
                                : "text-[#7e8384]"
                            }`}
                          >
                            <MessageStatus
                              status={user.messageStatus}
                              isActive={
                                user?.userId === auth.currentChatUser?.user_id
                              }
                              type="CHAT"
                            />
                            <IoIosCamera className={`text-lg`} />
                            <span>Image</span>
                          </div>
                        ) : user.messageType === "url" ? (
                          <div className="flex items-center gap-1">
                            <MessageStatus
                              status={user.messageStatus}
                              isActive={
                                user?.userId === auth.currentChatUser?.user_id
                              }
                              type="CHAT"
                            />
                            <p
                              className={`text-sm h-5 max-w-[200px] text-left overflow-hidden
                              ${
                                user.userId === auth.currentChatUser?.user_id
                                  ? "text-green-300"
                                  : "text-[#19d14a]"
                              }
                              `}
                            >
                              {user.message}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <MessageStatus
                              status={user.messageStatus}
                              isActive={
                                user?.userId === auth.currentChatUser?.user_id
                              }
                              type="CHAT"
                            />
                            <p
                              className={`text-sm h-5 max-w-[200px] text-left overflow-hidden ${
                                isLightMode
                                  ? user.userId ===
                                    auth.currentChatUser?.user_id
                                    ? "text-gray-200"
                                    : "text-gray-700"
                                  : user.userId ===
                                    auth.currentChatUser?.user_id
                                  ? "text-gray-100"
                                  : "text-[#7e8384]"
                              }`}
                            >
                              {user.message}
                            </p>
                          </div>
                        )}
                        {user.totalUnreadMessages.length > 0 ? (
                          <span className="bg-lm-blue h-5 w-5 text-[12px] rounded-full text-white flex justify-center items-center">
                            {user.totalUnreadMessages.length}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </li>
                </Button>
              );
            })}
          </ul>
        </div>
      )}
      {filteredAllChatUsers.length === 0 &&
      filteredPinnedChatUsers.length === 0 ? (
        <div className="h-[70vh] w-full flex justify-center items-center">
          <span
            className={`text-[19px] tracking-wider ${
              isLightMode ? "text-gray-700 font-bold" : "text-[#ecf2f8]"
            }`}
          >
            {searchTerm ? "No Chats Found" : "No Chats"}
          </span>
        </div>
      ) : (
        filteredAllChatUsers.length > 0 && (
          <div>
            <Typography
              sx={{ mt: 2, fontSize: 17, color: isLightMode ? "" : "#fff" }}
            >
              All Chats
            </Typography>
            <ul className="px-2">
              {chat.allChatUsers.map((user, i) => {
                return (
                  <Button
                    sx={{
                      width: "100%",
                      textTransform: "none",
                      padding: 0,
                      mt: 1,
                      mb: 1,
                    }}
                    onClick={(e) => {
                      handleChangeChatUser(user, i, "ALL_CHAT");
                      // rippleEffect(e);
                    }}
                  >
                    <li
                      key={user?.createdAt}
                      className={`flex items-center w-full px-3 py-3 rounded-2xl ${
                        isLightMode
                          ? ` ${
                              user?.userId === auth.currentChatUser?.user_id
                                ? "bg-lm-blue"
                                : "bg-[#fff] hover:bg-[#eff1f2]"
                            }`
                          : `${
                              user?.userId === auth.currentChatUser?.user_id
                                ? "bg-lm-blue"
                                : "bg-[#1e2730] hover:bg-[#2d3947]"
                            }`
                      }`}
                    >
                      <div className="relative w-[60px] mr-3 h-full">
                        <Avatar
                          sx={{ width: 60, height: 60 }}
                          src={
                            user?.profileImage
                              ? user?.profileImage.startsWith("image_")
                                ? `${process.env.REACT_APP_API_URL}/images/${user?.profileImage}`
                                : user?.profileImage
                              : null
                          }
                          alt="profile"
                        />
                        {onlineUsersIds.includes(user?.userId.toString()) && (
                          <div className="absolute bottom-0 right-1">
                            <Badge />
                          </div>
                        )}
                      </div>
                      <div className="w-full">
                        <div className="flex items-center justify-between w-full mb-1">
                          <span
                            className={`text-[17px] ${
                              isLightMode
                                ? user?.userId === auth.currentChatUser?.user_id
                                  ? "text-white font-semibold"
                                  : "text-black font-bold"
                                : user?.userId === auth.currentChatUser?.user_id
                                ? "text-white font-semibold"
                                : "text-[#ecf2f8]"
                            }`}
                          >
                            {user.name}
                          </span>
                          {user?.createdAt && (
                            <span
                              className={`text-[12px] ${
                                isLightMode
                                  ? user.userId ===
                                    auth.currentChatUser?.user_id
                                    ? "text-gray-200"
                                    : "text-gray-700"
                                  : "text-[#ecf2f8] opacity-50"
                              }`}
                            >
                              {calculateTime(user?.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between w-full">
                          {user?.messageType === "image" ? (
                            <div
                              className={`text-sm flex items-center gap-1 h-5 max-w-[200px] text-left overflow-hidden ${
                                isLightMode
                                  ? user.userId ===
                                    auth.currentChatUser?.user_id
                                    ? "text-gray-200"
                                    : "text-gray-700"
                                  : user.userId ===
                                    auth.currentChatUser?.user_id
                                  ? "text-gray-100"
                                  : "text-[#7e8384]"
                              }`}
                            >
                              <MessageStatus
                                status={user?.messageStatus}
                                isActive={
                                  user?.userId === auth.currentChatUser?.user_id
                                }
                                type="CHAT"
                              />
                              <IoIosCamera className={`text-lg`} />
                              <span>Image</span>
                            </div>
                          ) : user.messageType === "url" ? (
                            <div className="flex items-center gap-1">
                              <MessageStatus
                                status={user.messageStatus}
                                isActive={
                                  user?.userId === auth.currentChatUser?.user_id
                                }
                                type="CHAT"
                              />
                              <p
                                className={`text-sm h-5 max-w-[200px] text-left overflow-hidden
                                ${
                                  user.userId === auth.currentChatUser?.user_id
                                    ? "text-green-300"
                                    : "text-[#19d14a]"
                                }
                                `}
                              >
                                {user.message}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <MessageStatus
                                status={user.messageStatus}
                                isActive={
                                  user?.userId === auth.currentChatUser?.user_id
                                }
                                type="CHAT"
                              />
                              <p
                                className={`text-sm h-5 max-w-[200px] text-left overflow-hidden ${
                                  isLightMode
                                    ? user.userId ===
                                      auth.currentChatUser?.user_id
                                      ? "text-gray-200"
                                      : "text-gray-700"
                                    : user.userId ===
                                      auth.currentChatUser?.user_id
                                    ? "text-gray-100"
                                    : "text-[#7e8384]"
                                }`}
                              >
                                {user.message}
                              </p>
                            </div>
                          )}

                          {user.totalUnreadMessages.length > 0 ? (
                            <span className="bg-lm-blue h-5 w-5 text-[12px] rounded-full text-white flex justify-center items-center">
                              {user.totalUnreadMessages.length}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </li>
                  </Button>
                );
              })}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export default ChatingFriends;
