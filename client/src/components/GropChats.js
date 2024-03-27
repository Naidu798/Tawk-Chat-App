import { Avatar, Button, Typography } from "@mui/material";
import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentGroupChat } from "../redux/authSlice";
import { toast } from "react-toastify";
import { setJoinedGroupChats, setMyGroupChats } from "../redux/chatSlice";
import { IoIosCamera } from "react-icons/io";
import { setFriendSidebar } from "../redux/appSlice";

const GroupChats = () => {
  const {
    isLightMode,
    socket,
    calculateTime,
    getDateWiseMessages,
    setMessages,
  } = useContext(AppContext);
  const dispatch = useDispatch();

  const chat = useSelector((state) => state.chat);
  const auth = useSelector((state) => state.auth);

  // const onlineUsersIds = Object.keys(chat.onlineUsers)

  const updateMessageStatus = async (messageIds, status) => {
    const url = `${process.env.REACT_APP_API_URL}/group-messages/update-message-status`;
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

  const switchGroup = () => {
    if (auth.currentGroupChat) {
      socket.emit("leaveGroup", {
        groupDetails: auth.currentGroupChat,
        userDetails: auth.userInfo,
      });
    }
  };

  const handleChangeGroupChat = (group, index, type) => {
    if (auth.currentGroupChat?.group_id === group.groupId) return;

    const currentGroup = {
      group_id: group.groupId,
      group_name: group.groupName,
      admin: group.admin,
      members: group.members,
      logo: group.logo,
      groupCreatedAt: group.groupCreatedAt,
      isGroupChat: true,
    };

    switchGroup();

    if (group?.totalUnreadMessages?.length > 0) {
      if (type === "my_groups") {
        const newGroups = chat.myGroupChats.map((group, idx) =>
          idx === index ? { ...group, totalUnreadMessages: [] } : group
        );
        dispatch(setMyGroupChats({ myGroupChats: newGroups }));
      } else {
        const newGroups = chat.joinedGroupChats.map((group, idx) =>
          idx === index ? { ...group, totalUnreadMessages: [] } : group
        );
        dispatch(setJoinedGroupChats({ joinedGroupChats: newGroups }));
      }
    }

    dispatch(setFriendSidebar({ open: false, type: null }));
    dispatch(setCurrentGroupChat({ currentGroupChat: currentGroup }));

    group?.totalUnreadMessages?.length > 0 &&
      updateMessageStatus(group.totalUnreadMessages, "read");
  };

  const getTypeMessage = (group) => {
    switch (group.messageType) {
      case "text":
        return (
          <div
            className={`h-6 max-w-[200px] text-left overflow-hidden ${
              isLightMode
                ? group.groupId === auth.currentGroupChat?.group_id
                  ? "text-gray-200"
                  : "text-gray-700"
                : group.groupId === auth.currentGroupChat?.group_id
                ? "text-gray-100"
                : "text-[#7e8384]"
            }`}
          >
            <span className="text-sm">{group.message}</span>
          </div>
        );
      case "image":
        return (
          <div
            className={`h-6 max-w-[200px] text-left flex items-center gap-1 ${
              isLightMode
                ? group.groupId === auth.currentGroupChat?.group_id
                  ? "text-gray-200"
                  : "text-gray-700"
                : group.groupId === auth.currentGroupChat?.group_id
                ? "text-gray-100"
                : "text-[#7e8384]"
            }`}
          >
            <IoIosCamera className={`text-lg`} />
            <span>Image</span>
          </div>
        );
      case "url":
        return (
          <div
            className={`h-6 max-w-[200px] text-left overflow-hidden ${
              isLightMode
                ? group.groupId === auth.currentGroupChat?.group_id
                  ? "text-gray-200"
                  : "text-gray-700"
                : group.groupId === auth.currentGroupChat?.group_id
                ? "text-gray-100"
                : "text-[#7e8384]"
            }`}
          >
            <span className="text-sm text-green-400">{group.message}</span>
          </div>
        );
      default:
        return (
          <div
            className={`h-6 ${
              isLightMode
                ? group.groupId === auth.currentGroupChat?.group_id
                  ? "text-gray-200"
                  : "text-gray-700"
                : group.groupId === auth.currentGroupChat?.group_id
                ? "text-gray-100"
                : "text-[#7e8384]"
            }`}
          >
            <span className="text-sm">No Messages</span>
          </div>
        );
    }
  };

  useEffect(() => {
    if (auth.currentGroupChat?.group_id) {
      const getMessages = async () => {
        const url = `${process.env.REACT_APP_API_URL}/group-messages/get-messages/${auth.currentGroupChat.group_id}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 200) {
          getDateWiseMessages(data.messages, true);
          setMessages(data.messages);
        } else {
          toast.error(data.msg);
        }
      };
      getMessages();
    }
  }, [auth.currentGroupChat]);

  return (
    <div
      className={`w-full h-full overflow-auto px-4 ${
        isLightMode ? "custom-scrollbar" : "dark-custom-scrollbar"
      }`}
    >
      {chat.myGroupChats.length > 0 && (
        <div>
          <Typography
            sx={{ mt: 2, fontSize: 17, color: isLightMode ? "" : "#fff" }}
          >
            My Groups
          </Typography>
          <ul className="px-2">
            {chat.myGroupChats.map((group, i) => {
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
                    handleChangeGroupChat(group, i, "my_groups");
                  }}
                >
                  <li
                    key={group.groupCreatedAt}
                    className={`flex items-center w-full px-3 py-3 rounded-2xl ${
                      isLightMode
                        ? ` ${
                            group.groupId === auth.currentGroupChat?.group_id
                              ? "bg-lm-blue"
                              : "bg-[#fff] hover:bg-[#eff1f2]"
                          }`
                        : `${
                            group.groupId === auth.currentGroupChat?.group_id
                              ? "bg-lm-blue"
                              : "bg-[#1e2730] hover:bg-[#2d3947]"
                          }`
                    }`}
                  >
                    <div className="relative w-[60px] mr-3 h-full">
                      <Avatar
                        sx={{ width: 60, height: 60 }}
                        src={
                          group.logo
                            ? group.logo.startsWith("image_")
                              ? `${process.env.REACT_APP_API_URL}/images/${group.logo}`
                              : group.logo
                            : null
                        }
                        alt="profile"
                      />{" "}
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span
                          className={`text-[17px] ${
                            isLightMode
                              ? group.groupId ===
                                auth.currentGroupChat?.group_id
                                ? "text-white font-semibold"
                                : "text-black font-bold"
                              : group.groupId ===
                                auth.currentGroupChat?.group_id
                              ? "text-white font-semibold"
                              : "text-[#ecf2f8]"
                          }`}
                        >
                          {group.groupName}
                        </span>
                        {group?.totalUnreadMessages?.length > 0 ? (
                          <span className="bg-lm-blue h-5 w-5 text-[12px] rounded-full text-white flex justify-center items-center">
                            {group.totalUnreadMessages.length}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        {getTypeMessage(group)}

                        {group?.createdAt && (
                          <span
                            className={`h-6 max-w-[200px] text-left overflow-hidden text-[12px] ${
                              isLightMode
                                ? group.groupId ===
                                  auth.currentGroupChat?.group_id
                                  ? "text-gray-200"
                                  : "text-gray-700"
                                : group.groupId ===
                                  auth.currentGroupChat?.group_id
                                ? "text-gray-100"
                                : "text-[#7e8384]"
                            }`}
                          >
                            {calculateTime(group.createdAt)}
                          </span>
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

      {chat.joinedGroupChats.length > 0 && (
        <div>
          <Typography
            sx={{ mt: 2, fontSize: 17, color: isLightMode ? "" : "#fff" }}
          >
            Joined Groups
          </Typography>
          <ul className="px-2">
            {chat.joinedGroupChats.map((group, i) => {
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
                    handleChangeGroupChat(group, i, "joined_groups");
                  }}
                >
                  <li
                    key={group.groupId}
                    className={`flex items-center w-full px-3 py-3 rounded-2xl ${
                      isLightMode
                        ? ` ${
                            group.groupId === auth.currentGroupChat?.group_id
                              ? "bg-lm-blue"
                              : "bg-[#fff] hover:bg-[#eff1f2]"
                          }`
                        : `${
                            group.groupId === auth.currentGroupChat?.group_id
                              ? "bg-lm-blue"
                              : "bg-[#1e2730] hover:bg-[#2d3947]"
                          }`
                    }`}
                  >
                    <div className="relative w-[60px] mr-3 h-full">
                      <Avatar
                        sx={{ width: 60, height: 60 }}
                        src={
                          group.logo
                            ? group.logo.startsWith("image_")
                              ? `${process.env.REACT_APP_API_URL}/images/${group.logo}`
                              : group.logo
                            : null
                        }
                        alt="profile"
                      />{" "}
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span
                          className={`text-[17px] ${
                            isLightMode
                              ? group.groupId ===
                                auth.currentGroupChat?.group_id
                                ? "text-white font-semibold"
                                : "text-black font-bold"
                              : group.groupId ===
                                auth.currentGroupChat?.group_id
                              ? "text-white font-semibold"
                              : "text-[#ecf2f8]"
                          }`}
                        >
                          {group.groupName}
                        </span>
                        {group?.totalUnreadMessages?.length > 0 ? (
                          <span className="bg-lm-blue h-5 w-5 text-[12px] rounded-full text-white flex justify-center items-center">
                            {group?.totalUnreadMessages.length}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        {getTypeMessage(group)}
                        {group?.createdAt && (
                          <span
                            className={`h-6 max-w-[200px] text-left overflow-hidden text-[12px] ${
                              isLightMode
                                ? group.groupId ===
                                  auth.currentGroupChat?.group_id
                                  ? "text-gray-200"
                                  : "text-gray-700"
                                : group.groupId ===
                                  auth.currentGroupChat?.group_id
                                ? "text-gray-100"
                                : "text-[#7e8384]"
                            }`}
                          >
                            {calculateTime(group?.createdAt)}
                          </span>
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
      {chat.myGroupChats.length === 0 && chat.joinedGroupChats.length === 0 && (
        <div className="h-[70vh] w-full flex justify-center items-center">
          <span
            className={`text-[19px] tracking-wider ${
              isLightMode ? "text-gray-700 font-bold" : "text-[#ecf2f8]"
            }`}
          >
            No Group Chats
          </span>
        </div>
      )}
    </div>
  );
};

export default GroupChats;
