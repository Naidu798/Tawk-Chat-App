import { IconButton } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaLink } from "react-icons/fa6";
import { BsEmojiSmile } from "react-icons/bs";
import { PiTelegramLogo } from "react-icons/pi";
import { AppContext } from "../context/AppContext";
import BlockAndDeleteDailog from "../components/BlockAndDeleteDailog";

import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllChatUsers,
  setNewMessage,
  setPinnedChatUsers,
} from "../redux/chatSlice";
import ImagePreview from "./ImagePreview";

const MessageBar = () => {
  const {
    isLightMode,
    showEmojiPicker,
    setShowEmojiPicker,
    setMessage,
    message,
    dateWiseMessages,
    setMessages,
    socket,
    messages,
    chatUserBlockedUsers,
    setChatUserBlockedUsers,
  } = useContext(AppContext);

  const [imgFile, setImgFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [caption, setCaption] = useState("");
  const [openFriendRequest, setOpenFriendRequest] = useState(false);

  const [unblockOpen, setUnblockOpen] = useState(false);

  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);
  const app = useSelector((state) => state.app);

  const imgRef = useRef();

  // const [sound] = useState(new Audio("/send-sound.mp3"));

  const dispatch = useDispatch();

  const getMessageReceiveMembersIds = () => {
    const allMembers = [
      auth.currentGroupChat?.admin,
      ...JSON.parse(auth.currentGroupChat?.members),
    ];
    return allMembers.filter((id) => auth.userInfo?.user_id !== id);
  };

  const sendGroupMessage = async (messageData) => {
    const url = `${process.env.REACT_APP_API_URL}/group-messages/send-message`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      if (dateWiseMessages["Today"]) {
        dateWiseMessages["Today"] = [
          ...dateWiseMessages["Today"],
          data.sentMessage,
        ];
      } else {
        dateWiseMessages["Today"] = [data.sentMessage];
      }

      setMessages((prev) => [...prev, data.sentMessage]);

      socket.emit("newGroupMessage", {
        message: data.sentMessage,
        groupName: auth.currentGroupChat.group_name,
      });
    } else {
      toast.error(data.msg);
    }
  };

  const sendMessage = async (messageData) => {
    const url = `${process.env.REACT_APP_API_URL}/messages/send-message`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      dispatch(setNewMessage({ newMessage: data.sentMessage }));
      if (messages.length === 0) {
        const {
          message_id,
          message,
          sender_id,
          receiver_id,
          message_status,
          type,
          created_at,
        } = data.sentMessage;
        const { name, about, profile_image, user_id } = auth.currentChatUser;
        const newChatUser = {
          messageId: message_id,
          message,
          senderId: sender_id,
          userId: receiver_id,
          messageStatus: message_status,
          messageType: type,
          createdAt: created_at,
          name,
          about,
          profileImage: profile_image,
          totalUnreadMessages: [],
        };
        if (chat.pinnedUsers.includes(user_id)) {
          dispatch(
            setPinnedChatUsers({
              pinnedChatUsers: [...chat.pinnedChatUsers, newChatUser],
            })
          );
        } else {
          dispatch(
            setAllChatUsers({
              allChatUsers: [...chat.allChatUsers, newChatUser],
            })
          );
        }
      }

      if (dateWiseMessages["Today"]) {
        dateWiseMessages["Today"] = [
          ...dateWiseMessages["Today"],
          data.sentMessage,
        ];
      } else {
        dateWiseMessages["Today"] = [data.sentMessage];
      }

      setMessages([...messages, data.sentMessage]);
    } else {
      toast.error(data.msg);
    }
  };

  const isMember = () => {
    const members =
      JSON.parse(auth.currentGroupChat.members) + [auth.currentGroupChat.admin];
    const isMember = members.includes(auth.userInfo.user_id);
    return isMember;
  };

  const handleSendMessage = async () => {
    if (message.length < 1 || message.trim().length < 1) {
      toast.error("Please type a message");
    } else {
      setShowEmojiPicker(false);

      if (app.isGroupsActive) {
        const isUrl = message.startsWith("http");
        const isLink = message.endsWith(".com");
        const isGmail = message.endsWith("gmail.com");

        if (!isMember()) {
          return toast.error(
            "You can't send messages in this group because your not a member of this group."
          );
        }
        const receiverIds = getMessageReceiveMembersIds();
        const groupMessageData = {
          from: auth.userInfo.user_id,
          to: receiverIds,
          groupId: auth.currentGroupChat?.group_id,
          message,
          type: isUrl || isLink ? (isGmail ? "text" : "url") : "text",
          caption: null,
          chatUserBlockedUsers: [],
        };
        sendGroupMessage(groupMessageData);
        setMessage("");
      } else {
        const isFriend = app.usersType.friends.some(
          (user) => user.user_id === auth?.currentChatUser.user_id
        );
        if (!isFriend) {
          setOpenFriendRequest(true);
        } else if (chat.blockedUsers.includes(auth.currentChatUser.user_id)) {
          setUnblockOpen(true);
        } else {
          const isUrl = message.startsWith("http");
          const isLink = message.endsWith(".com");
          const isGmail = message.endsWith("gmail.com");

          const messageData = {
            from: auth.userInfo.user_id,
            to: auth.currentChatUser?.user_id,
            message,
            type: isUrl || isLink ? (isGmail ? "text" : "url") : "text",
            isOnline: Object.keys(chat.onlineUsers).includes(
              auth.currentChatUser?.user_id.toString()
            ),
            caption: null,
            chatUserBlockedUsers,
          };
          setMessage("");
          sendMessage(messageData);
        }
      }
      //sound.play();
    }
  };

  const handleKeyPress = (e) => {
    if (message.length > 0) {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    }
  };

  const imageUploadToServer = async () => {
    setShowImagePreview(false);
    setCaption("");
    setImagePreviewUrl(null);

    const url = `${process.env.REACT_APP_API_URL}/image-upload`;
    const formData = new FormData();
    formData.append("image", imgFile);
    axios
      .post(url, formData)
      .then((res) => {
        if (res.data.status === 200) {
          if (app.isGroupsActive) {
            if (isMember()) {
              const groupMessageData = {
                from: auth.userInfo.user_id,
                to: getMessageReceiveMembersIds(),
                groupId: auth.currentGroupChat?.group_id,
                message: res.data.fileName,
                type: "image",
                caption,
                chatUserBlockedUsers: [],
              };
              sendGroupMessage(groupMessageData);
            } else {
              return toast.error(
                "You can't send messages in this group because your not a member of this group."
              );
            }
          } else {
            const messageData = {
              from: auth.userInfo.user_id,
              to: auth.currentChatUser?.user_id,
              message: res.data.fileName,
              type: "image",
              isOnline: Object.keys(chat.onlineUsers).includes(
                auth.currentChatUser?.user_id.toString()
              ),
              caption,
              chatUserBlockedUsers,
            };
            sendMessage(messageData);
          }
        } else {
          toast.error(res.msg);
        }
      })
      .catch((err) => {
        toast.error("Sending image failed");
      });
  };

  const handleImage = (e) => {
    setImgFile(e.target.files[0]);
    setImagePreviewUrl(URL.createObjectURL(e.target.files[0]));
    setShowImagePreview(true);
  };

  useEffect(() => {
    if (auth?.currentChatUser?.user_id) {
      const getBlockUsersIds = async () => {
        const url = `${process.env.REACT_APP_API_URL}/get-block-users-ids/${auth.currentChatUser.user_id}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 200) {
          setChatUserBlockedUsers(data.blockUsers);
          console.log("chat user blocked", data.blockUsers);
        } else {
          toast.error(data.msg);
        }
      };
      getBlockUsersIds();
    }
  }, [auth.currentChatUser]);

  return (
    <div
      className={`h-[10vh] w-full flex justify-center items-center px-4 py-1 ${
        isLightMode
          ? "bg-lm-chat-bg custom-shadow"
          : "bg-[#171a21] dark-custom-shadow"
      }`}
    >
      {showImagePreview && (
        <ImagePreview
          imageUrl={imagePreviewUrl}
          setShowImagePreview={setShowImagePreview}
          handleSendPhoto={imageUploadToServer}
          setCaption={setCaption}
        />
      )}
      {unblockOpen && (
        <BlockAndDeleteDailog
          open={unblockOpen}
          setOpen={setUnblockOpen}
          type={"send-warning"}
        />
      )}
      {openFriendRequest && (
        <BlockAndDeleteDailog
          open={openFriendRequest}
          setOpen={setOpenFriendRequest}
          type={"request"}
        />
      )}
      <div
        className={`${
          isLightMode ? "bg-lm-sidebar-background" : "bg-[#1e2730]"
        } w-full flex items-center rounded-xl px-4 py-1 custom-shadow`}
      >
        <IconButton onClick={() => imgRef.current.click()}>
          <FaLink className="text-lm-blue" />
          <input type="file" hidden ref={imgRef} onChange={handleImage} />
        </IconButton>
        <input
          type="text"
          className={`w-full h-10 ${
            isLightMode
              ? "bg-lm-sidebar-background"
              : "bg-[#1e2730] text-gray-300"
          } outline-none mx-2`}
          placeholder="Write a message"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          onKeyDown={handleKeyPress}
        />
        <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <BsEmojiSmile className="text-lm-blue" />
        </IconButton>
      </div>
      <div className="bg-[#5B96F7] ml-4 rounded-lg">
        <IconButton sx={{ color: "#ffffff" }} onClick={handleSendMessage}>
          <PiTelegramLogo className="text-white" />
        </IconButton>
      </div>
    </div>
  );
};

export default MessageBar;
