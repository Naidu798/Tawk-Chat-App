import React, { useContext, useEffect, useRef } from "react";
import SideBar from "../dashboardLayout/SideBar";
import ChatListPage from "../dashboardLayout/ChatListPage";
import ChatContainer from "../dashboardLayout/ChatContainer";
import Empty from "../../components/Empty";
import { AppContext } from "../../context/AppContext";

import { useDispatch, useSelector } from "react-redux";
import FriendSideBar from "../../components/FriendSideBar";
import GroupsListPage from "../dashboardLayout/GroupsListPage";
import CallLog from "../dashboardLayout/CallLog";
import ProfilePage from "../../components/ProfilePage";
import { setUserInfo } from "../../redux/authSlice";
import {
  setAllChatUsers,
  setCallHistory,
  setOnlineUsers,
  setPinnedChatUsers,
} from "../../redux/chatSlice";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import AvatarsLibrary from "../../components/AvatarsLibrary";
import {
  setCallTypes,
  setFriendRequests,
  setFriends,
} from "../../redux/appSlice";
import VoiceOrVideoCall from "../../components/VoiceOrVideoCall";
import IncomingCall from "../../components/IncomingCall";
import Notifications from "../dashboardLayout/Notifications";
import Cookies from "js-cookie";

const endCall = {
  voiceCall: null,
  videoCall: null,
  incomingVoiceCall: null,
  incomingVideoCall: null,
};

const Chat = () => {
  const {
    toastMessageAlert,
    setToastMessageAlert,
    toastMessage,
    isLightMode,
    setSocket,
    setMessages,
    socket,
    showAvatarsLibrary,
    setDateWiseMessages,
    latestCall,
    setLatestCall,
    topToastMessage,
    setNotifications,
    setChatUserBlockedUsers,
  } = useContext(AppContext);

  // const [receiveSound] = useState(new Audio("/receive-sound.mp3"));

  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  const chatUserRef = useRef(auth.currentChatUser);
  const chatUsersRef = useRef({
    allChatUsers: chat.allChatUsers,
    pinnedChatUsers: chat.pinnedChatUsers,
  });
  const usersTypeRef = useRef({
    friends: app.usersType.friends,
    friendRequests: app.usersType.friendRequests,
  });
  const onlineUsersRef = useRef(chat.onlineUsers);

  const dispatch = useDispatch();

  const currentTab = () => {
    switch (app.sideBar.activeTab) {
      case "CHAT":
        return <ChatListPage />;
      case "GROUP":
        return <GroupsListPage />;
      case "CALL_LOG":
        return <CallLog />;
      case "PROFILE":
        return <ProfilePage />;
      case "NOTIFICATIONS":
        return <Notifications />;
      default:
        return null;
    }
  };

  const updateMessagesStatus = (msgs) => {
    if (msgs["Today"]) {
      const msgId = msgs["Today"][0];
      setDateWiseMessages((prev) => {
        let updatedMessages = [];
        if (prev["Today"]) {
          updatedMessages = prev["Today"].map((msg) =>
            msg.message_id === msgId ? { ...msg, message_status: "read" } : msg
          );
        }
        return { ...prev, Today: updatedMessages };
      });
    } else {
      const msgsIds = msgs["Not_Today"];
      setDateWiseMessages((prev) => {
        let UpdatedDateWiseMessages = {};
        Object.keys(prev).map((date) => {
          let updatedMessages = prev[date].map((msg) =>
            msgsIds.includes(msg.message_id)
              ? { ...msg, message_status: "read" }
              : msg
          );
          UpdatedDateWiseMessages[date] = updatedMessages;
          return null;
        });
        return UpdatedDateWiseMessages;
      });
    }
  };

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

  const updateChatusers = (messageData, sender) => {
    const { allChatUsers, pinnedChatUsers } = chatUsersRef.current;
    const isPinnedChatUser = pinnedChatUsers.some(
      (user) => user.userId === messageData.sender_id
    );
    if (isPinnedChatUser) {
      let updatedUser = {};
      let remainingUsers = [];

      pinnedChatUsers.forEach((user) => {
        if (user.userId === messageData.sender_id) {
          updatedUser = {
            ...user,
            totalUnreadMessages: [
              ...user.totalUnreadMessages,
              messageData.message_id,
            ],
          };
        } else {
          remainingUsers.push(user);
        }
      });
      const modifiedChatUsers = [updatedUser, ...remainingUsers];
      dispatch(setPinnedChatUsers({ pinnedChatUsers: modifiedChatUsers }));
    } else {
      const isAllchatUser = allChatUsers.some(
        (user) => user.userId === messageData.sender_id
      );
      if (isAllchatUser) {
        let updatedUser = {};
        let remainingUsers = [];

        allChatUsers.forEach((user) => {
          if (user.userId === messageData.sender_id) {
            updatedUser = {
              ...user,
              totalUnreadMessages: [
                ...user.totalUnreadMessages,
                messageData.message_id,
              ],
            };
          } else {
            remainingUsers.push(user);
          }
        });
        const modifiedChatUsers = [updatedUser, ...remainingUsers];
        dispatch(setAllChatUsers({ allChatUsers: modifiedChatUsers }));
      } else {
        const {
          message_id,
          message,
          sender_id,
          receiver_id,
          message_status,
          type,
          created_at,
        } = messageData;
        const { name, about, profile_image } = sender;
        const newChatUser = {
          messageId: message_id,
          message,
          senderId: receiver_id,
          userId: sender_id,
          messageStatus: message_status,
          messageType: type,
          createdAt: created_at,
          name,
          about,
          profileImage: profile_image,
          totalUnreadMessages: [message_id],
        };
        dispatch(
          setAllChatUsers({ allChatUsers: [newChatUser, ...allChatUsers] })
        );
      }
    }
  };

  useEffect(() => {
    chatUserRef.current = auth.currentChatUser;
  }, [auth.currentChatUser]);

  useEffect(() => {
    onlineUsersRef.current = chat.onlineUsers;
  }, [chat.onlineUsers]);

  useEffect(() => {
    chatUsersRef.current = {
      allChatUsers: chat.allChatUsers,
      pinnedChatUsers: chat.pinnedChatUsers,
    };
  }, [chat.pinnedChatUsers, chat.allChatUsers]);

  useEffect(() => {
    usersTypeRef.current = {
      friends: app.usersType.friends,
      friendRequests: app.usersType.friendRequests,
    };
  }, [app.usersType.friendRequests, app.usersType.friends]);

  // toast alert
  useEffect(() => {
    if (toastMessageAlert) {
      toastMessage(toastMessageAlert.type, toastMessageAlert.msg);
      setToastMessageAlert(null);
    }
  }, []);

  // set userIfno
  useEffect(() => {
    const user = Cookies.get("tawk_chat_user");
    if (user) {
      const { email } = JSON.parse(user);
      const getUser = async () => {
        const url = `${process.env.REACT_APP_API_URL}/get-user/${email}`;
        const res = await fetch(url);
        const data = await res.json();
        dispatch(setUserInfo({ userInfo: data.user }));
      };
      getUser();
    }
  }, []);

  // set friends
  useEffect(() => {
    if (!auth.userInfo) return;
    const getFriends = async () => {
      const url = `${process.env.REACT_APP_API_URL}/get-friends/${auth.userInfo.user_id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 200) {
        dispatch(setFriends({ friends: data.friendsDetails }));
      } else {
        toast.error(data.msg);
      }
    };
    getFriends();
  }, [auth.userInfo]);

  // getting friend requests
  useEffect(() => {
    if (!auth.userInfo) return;
    const getRequests = async () => {
      const url = `${process.env.REACT_APP_API_URL}/get-friend-requests/${auth.userInfo.user_id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 200) {
        dispatch(setFriendRequests({ friendRequests: data.requestsDetails }));
      } else {
        toast.error(data.msg);
      }
    };
    getRequests();
  }, [auth.userInfo]);

  // setup socket
  useEffect(() => {
    if (auth.userInfo) {
      const newSocket = io(`${process.env.REACT_APP_API_URL}`);
      setSocket(newSocket);
    }
  }, [auth.userInfo]);

  // add New User
  useEffect(() => {
    if (socket === null) return;

    socket.emit("addNewUser", auth.userInfo?.user_id);
    socket.on("getOnlineUsers", (result) => {
      dispatch(setOnlineUsers({ onlineUsers: result }));
    });
    return () => {
      socket.off("addNewUser");
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  // send message
  useEffect(() => {
    if (socket === null || !chat.newMessage) return;
    const user = chat.onlineUsers[chat.newMessage.receiver_id];
    if (user) {
      socket.emit("sendMessage", {
        message: chat.newMessage,
        socketId: chat.onlineUsers[chat.newMessage.receiver_id],
        sender: auth.userInfo,
      });
    } else {
      return;
    }
  }, [chat.newMessage]);

  // receive message, remove friend notification and friend requests
  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", ({ message, sender }) => {
      // receiveSound.play();
      if (chatUserRef?.current?.user_id === message.sender_id) {
        setDateWiseMessages((prev) => {
          let updatedMessages = [];
          if (prev["Today"]) {
            updatedMessages = [
              ...prev["Today"],
              { ...message, message_status: "read" },
            ];
          } else {
            updatedMessages = [{ ...message, message_status: "read" }];
          }
          return { ...prev, Today: updatedMessages };
        });
        setMessages((prev) => [...prev, message]);

        socket.emit("updateMessageStatus", {
          msgs: { Today: [message.message_id] },
          socketId: onlineUsersRef.current[message.sender_id],
        });
        updateMessageStatus([message.message_id], "read");
      } else {
        if (message.type !== "block") {
          updateChatusers(message, sender);
        }
      }
    });

    socket.on("getUpdateMessageStatus", (msgs) => {
      updateMessagesStatus(msgs);
    });

    socket.on("incomingVoiceCall", (voiceCall) => {
      dispatch(
        setCallTypes({ ...app.callTypes, incomingVoiceCall: voiceCall })
      );
    });

    socket.on("incomingVideoCall", (videoCall) => {
      dispatch(
        setCallTypes({ ...app.callTypes, incomingVideoCall: videoCall })
      );
    });

    socket.on("callAccepted", (callData) => {
      dispatch(
        setCallTypes({
          ...app.callTypes,
          voiceCall: callData,
        })
      );
    });

    socket.on("callEnded", () => {
      dispatch(setCallTypes(endCall));
      if (latestCall) {
        dispatch(
          setCallHistory({ callHistory: [latestCall, ...chat.callHistory] })
        );
      }
      setLatestCall(undefined);
    });

    return () => {
      socket.off("getMessage");
      socket.off("getUpdateMessageStatus");
      socket.off("incomingVoiceCall");
      socket.off("incomingVideoCall");
      socket.off("callAccepted");
      socket.off("callEnded");
    };
  }, [socket]);

  useEffect(() => {
    if (!auth.userInfo || socket === null) return;

    socket.on("getFriendRequest", (newRequestDetails) => {
      const notification = {
        requestId: newRequestDetails.requestId,
        name: newRequestDetails.senderName,
        userId: newRequestDetails.senderId,
        profileImage: newRequestDetails.senderProfileImage,
        about: newRequestDetails.about,
        phone: newRequestDetails.phone,
        email: newRequestDetails.email,
        type: "request",
        status: "unread",
        createdAt: new Date(),
        reaction: undefined,
      };
      dispatch(
        setFriendRequests({
          friendRequests: [
            ...usersTypeRef.current.friendRequests,
            newRequestDetails,
          ],
        })
      );
      setNotifications((prev) => [notification, ...prev]);
      topToastMessage(
        "info",
        `${newRequestDetails.senderName} sent a friend request.`
      );
    });

    socket.on("getAcceptRequest", (friendDetails) => {
      dispatch(
        setFriends({
          friends: [...usersTypeRef.current.friends, friendDetails],
        })
      );
      const notification = {
        requestId: friendDetails.request_id,
        name: friendDetails.name,
        userId: friendDetails.user_id,
        profileImage: friendDetails.profile_image,
        type: "accept",
        status: "unread",
        createdAt: new Date(),
      };
      setNotifications((prev) => [notification, ...prev]);
      topToastMessage(
        "info",
        `${friendDetails.name} is accepted your friend request.`
      );
    });

    socket.on("getRejectRequest", (friendDetails) => {
      const notification = {
        requestId: friendDetails.request_id,
        name: friendDetails.name,
        userId: friendDetails.user_id,
        profileImage: friendDetails.profile_image,
        type: "reject",
        status: "unread",
        createdAt: new Date(),
      };
      setNotifications((prev) => [notification, ...prev]);
      topToastMessage(
        "info",
        `${friendDetails.name} is rejected your friend request.`
      );
    });

    socket.on("getRemoveFriend", (user) => {
      dispatch(
        setFriends({
          friends: usersTypeRef.current.friends.filter(
            (friend) => friend.user_id !== user.user_id
          ),
        })
      );
      const notification = {
        requestId: null,
        name: user.name,
        userId: user.user_id,
        profileImage: user.profile_image,
        type: "remove",
        status: "unread",
        createdAt: new Date(),
      };
      setNotifications((prev) => [notification, ...prev]);
      topToastMessage("info", `${user.name} removed as a friend`);
    });

    socket.on("getUpdateBlockUsers", ({ blockUser, id, type }) => {
      if (id === chatUserRef.current.user_id) {
        if (type === "block") {
          setChatUserBlockedUsers((prev) => [...prev, blockUser]);
        } else {
          setChatUserBlockedUsers((prev) =>
            prev.filter((userId) => userId !== blockUser)
          );
        }
      }
    });

    return () => {
      socket.off("getFriendRequest");
      socket.off("getAcceptRequest");
      socket.off("getRejectRequest");
      socket.off("getRemoveFriend");
      socket.off("getUpdateBlockUsers");
    };
  }, [socket]);

  return (
    <div className="w-screen h-screen flex relative">
      <div
        className={`w-[100px] h-full ${
          isLightMode ? "bg-lm-sidebar-background" : "bg-[#1e2730]"
        }`}
      >
        <SideBar />
      </div>
      <div
        className={`w-[400px] h-full ${
          isLightMode ? "bg-lm-chat-bg" : "bg-[#171a21]"
        }`}
      >
        {currentTab()}
      </div>
      <div
        className={`${
          app.friendSidebar.open
            ? "w-[calc(100vw-800px)]"
            : "w-[calc(100vw-500px)]"
        } h-full ${isLightMode ? "bg-lm-sidebar-background" : "bg-[#1e2730]"}`}
      >
        {auth.currentChatUser || auth.currentGroupChat ? (
          <ChatContainer />
        ) : (
          <Empty />
        )}
      </div>
      {app.friendSidebar.open && (
        <div className="h-full w-[320px]">
          <FriendSideBar />
        </div>
      )}
      {showAvatarsLibrary && <AvatarsLibrary />}
      {(app.callTypes.voiceCall || app.callTypes.videoCall) && (
        <VoiceOrVideoCall />
      )}

      {(app.callTypes.incomingVoiceCall || app.callTypes.incomingVideoCall) && (
        <IncomingCall />
      )}
    </div>
  );
};

export default Chat;
