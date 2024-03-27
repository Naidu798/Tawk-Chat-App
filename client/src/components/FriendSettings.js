import { Button, Menu, MenuItem } from "@mui/material";
import React, { useContext, useState } from "react";
import { VscAccount } from "react-icons/vsc";
import { RiContractLeftLine } from "react-icons/ri";
import { setFriendSidebar } from "../redux/appSlice";
import { useDispatch, useSelector } from "react-redux";
import { VscPinned } from "react-icons/vsc";
import { TbPinnedOff } from "react-icons/tb";
import { TbClearAll } from "react-icons/tb";
import { toast } from "react-toastify";
import {
  setAllChatUsers,
  setMyGroupChats,
  setPinnedChatUsers,
  setPinnedUsers,
} from "../redux/chatSlice";
import { setCurrentChatUser, setCurrentGroupChat } from "../redux/authSlice";
import { AppContext } from "../context/AppContext";
import WarningDailog from "./WarningDailog";

const ContactSettings = ({ anchorEl, setAnchorEl, open }) => {
  const { messages, setMessages, setDateWiseMessages } = useContext(AppContext);

  const [openClearChat, setOpenClearChat] = useState(false);

  const dispatch = useDispatch();
  const handleClose = () => {
    setAnchorEl(null);
  };

  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);
  const app = useSelector((state) => state.app);

  const addUserToPinnedUsers = () => {
    let pinnedUsers = [...chat.pinnedChatUsers];
    let chatUsers = [];
    chat.allChatUsers.forEach((user) => {
      if (user.userId === auth.currentChatUser.user_id) {
        pinnedUsers = [...chat.pinnedChatUsers, { ...user, isPinned: true }];
      } else {
        chatUsers.push(user);
      }
    });
    dispatch(
      setCurrentChatUser({
        currentChatUser: { ...auth.currentChatUser, isPinned: true },
      })
    );
    dispatch(setPinnedChatUsers({ pinnedChatUsers: pinnedUsers }));
    dispatch(setAllChatUsers({ allChatUsers: chatUsers }));
  };

  const removeUserFromPinnedUsers = () => {
    let pinnedUsers = [];
    let chatUsers = [...chat.allChatUsers];
    chat.pinnedChatUsers.forEach((user) => {
      if (user.userId === auth.currentChatUser.user_id) {
        chatUsers = [...chat.allChatUsers, { ...user, isPinned: false }];
      } else {
        pinnedUsers.push(user);
      }
    });

    dispatch(
      setCurrentChatUser({
        currentChatUser: { ...auth.currentChatUser, isPinned: false },
      })
    );
    dispatch(setPinnedChatUsers({ pinnedChatUsers: pinnedUsers }));
    dispatch(setAllChatUsers({ allChatUsers: chatUsers }));
  };

  const handlePinnedUsers = async () => {
    setAnchorEl(null);
    const url = `${process.env.REACT_APP_API_URL}/chat/update-pinned-chats`;
    const reqData = {
      userId: auth.userInfo.user_id,
      pinnedUser: auth.currentChatUser.user_id,
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
    if (data.status === 200) {
      addUserToPinnedUsers();
      dispatch(setPinnedUsers({ pinnedUsers: data.pinnedUsers }));
    } else {
      toast.error(data.msg);
    }
  };

  const handleUnpinnedUsers = async () => {
    setAnchorEl(null);
    const url = `${process.env.REACT_APP_API_URL}/chat/update-unpinned-chats`;
    const reqData = {
      userId: auth.userInfo.user_id,
      unpinnedUser: auth.currentChatUser.user_id,
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
    if (data.status === 200) {
      removeUserFromPinnedUsers();
      dispatch(setPinnedUsers({ pinnedUsers: data.pinnedUsers }));
    } else {
      toast.error(data.msg);
    }
  };

  const clearMessages = async () => {
    let messageIds = [];
    let images = [];
    messages.forEach((msg) => {
      if (msg.type === "image") {
        images.push(msg.message);
      }
      messageIds.push(msg.message_id);
    });

    const reqData = {
      messageIds,
      images,
    };
    const url = `${process.env.REACT_APP_API_URL}/messages/delete-messages`;
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      setMessages([]);
      setDateWiseMessages({});
      if (chat.pinnedUsers.includes(auth.currentChatUser.user_id)) {
        dispatch(
          setPinnedChatUsers({
            pinnedChatUsers: chat.pinnedChatUsers.filter(
              (user) => user.userId !== auth.currentChatUser.user_id
            ),
          })
        );
      } else {
        dispatch(
          setAllChatUsers({
            allChatUsers: chat.allChatUsers.filter(
              (user) => user.userId !== auth.currentChatUser.user_id
            ),
          })
        );
      }
    }
  };

  const getReqData = () => {
    let images = [];
    messages.forEach((msg) => {
      if (msg.messageType === "image") {
        images.push(msg.message);
      }
    });
    return { groupId: auth.currentGroupChat.group_id, images };
  };

  const clearGroupMessages = async () => {
    const url = `${process.env.REACT_APP_API_URL}/group-messages/clear-group-chat`;
    const reqData = getReqData();
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      const updatedGroupChats = chat.myGroupChats.map((group) =>
        group.groupId === auth.currentGroupChat.group_id
          ? { ...group, message: "No messages" }
          : group
      );

      dispatch(setMyGroupChats({ myGroupChats: updatedGroupChats }));
      setDateWiseMessages({});
      setMessages([]);
      toast.success("Chat cleared");
    } else {
      toast.error(data.msg);
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) {
      handleClose();
      return toast.error("No messages found");
    }

    if (app.isGroupsActive) {
      if (auth.currentGroupChat.admin === auth.userInfo.user_id) {
        handleClose();
        clearGroupMessages();
        setOpenClearChat(false);
      } else {
        toast.error(
          "Only admin can be clear this group chat or You can delete this group"
        );
      }
    } else {
      handleClose();
      clearMessages();
      setOpenClearChat(false);
    }
  };

  const getUpdatedMembers = () => {
    const updatedMembers = JSON.parse(auth.currentGroupChat.members).filter(
      (userId) => userId !== auth.userInfo.user_id
    );
    return updatedMembers;
  };

  const handleLeaveGroup = async () => {
    const url = `${process.env.REACT_APP_API_URL}/group/add-or-remove-friends`;
    const updatedMembers = getUpdatedMembers();
    const reqData = {
      groupId: auth.currentGroupChat.group_id,
      members: updatedMembers,
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
    if (data.status === 200) {
      dispatch(
        setCurrentGroupChat({
          currentGroupChat: {
            ...auth.currentGroupChat,
            members: JSON.stringify(updatedMembers),
          },
        })
      );
      toast.success("Leaving group success");
    } else {
      toast.error(data.msg);
    }
  };

  return (
    <div>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {app.isGroupsActive ? (
          ""
        ) : auth.currentChatUser?.isPinned ? (
          <MenuItem
            onClick={handleUnpinnedUsers}
            sx={{
              direction: "row",
              alignItems: "center",
              fontSize: 15,
            }}
          >
            <TbPinnedOff className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Unpin
          </MenuItem>
        ) : (
          <MenuItem
            onClick={handlePinnedUsers}
            sx={{
              direction: "row",
              alignItems: "center",
              fontSize: 15,
            }}
          >
            <VscPinned className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Pin Chat
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            dispatch(setFriendSidebar({ open: true, type: "INFO" }));
            handleClose();
          }}
          sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
        >
          <VscAccount className="mr-3 h-5 w-5 text-lm-blue font-bold" />
          {app.isGroupsActive ? "Group Info" : "Friend Info"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenClearChat(true);
          }}
          sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
        >
          <TbClearAll className="mr-3 h-5 w-5 text-lm-blue font-bold" />
          Clear Chat
        </MenuItem>
        {app.isGroupsActive &&
          auth.currentGroupChat.admin !== auth.userInfo.user_id && (
            <MenuItem
              onClick={() => {
                handleLeaveGroup();
                handleClose();
              }}
              sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
            >
              <RiContractLeftLine className="mr-3 h-5 w-5 text-lm-blue font-bold" />
              Leave Group
            </MenuItem>
          )}
      </Menu>
      {openClearChat && (
        <WarningDailog open={openClearChat} setOpen={setOpenClearChat}>
          <div>
            <p>Are you sure you want to clear this chat.</p>
            <div className="flex items-center gap-4 justify-end mt-5 mr-2">
              <Button
                variant="outlined"
                size="small"
                color="info"
                sx={{ textTransform: "capitalize", borderRadius: 4 }}
                onClick={() => setOpenClearChat(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary"
                sx={{ textTransform: "capitalize", borderRadius: 4 }}
                onClick={handleClearChat}
              >
                Confirm
              </Button>
            </div>
          </div>
        </WarningDailog>
      )}
    </div>
  );
};

export default ContactSettings;
