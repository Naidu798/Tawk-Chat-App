import React, { useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Slide from "@mui/material/Slide";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChatUser } from "../redux/authSlice";
import {
  setAllChatUsers,
  setBlockedUsers,
  setPinnedChatUsers,
} from "../redux/chatSlice";
import { setFriendSidebar } from "../redux/appSlice";
import { toast } from "react-toastify";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Block = ({ open, setOpen, type }) => {
  const {
    isLightMode,
    messages,
    setMessages,
    setSentRequests,
    sentRequests,
    toastMessage,
    requestsList,
    setRequestsList,
    socket,
  } = useContext(AppContext);

  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  const dispatch = useDispatch();

  let typeValue = type === "send-warning" ? "unblock" : type;

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteFriend = async () => {
    if (messages.length === 0) return;

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

  const handleDeleteConfirm = () => {
    handleClose();
    handleDeleteFriend();
    dispatch(setFriendSidebar({ open: false, type: null }));
    dispatch(setCurrentChatUser({ currentChatUser: null }));
  };

  const blockOrUnblockUser = async (type) => {
    const url = `${process.env.REACT_APP_API_URL}/auth/block-or-unblock-user`;
    const reqData = {
      userId: auth.userInfo.user_id,
      blockUserId: auth.currentChatUser.user_id,
      type,
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
      dispatch(setBlockedUsers({ blockedUsers: data.blockedUsers }));
      const socketId = chat.onlineUsers[auth.currentChatUser.user_id];
      if (socketId) {
        socket.emit("updateBlockUsers", {
          blockUser: auth.currentChatUser.user_id,
          id: auth.userInfo.user_id,
          socketId,
          type,
        });
      }
    } else {
      toast.error(data.msg);
    }
  };

  const handleBlockConfirm = () => {
    handleClose();
    blockOrUnblockUser("block");
  };

  const handleUnblockConfirm = () => {
    handleClose();
    blockOrUnblockUser("unblock");
  };

  const handleSendRequest = async () => {
    const id = auth.currentChatUser.user_id;
    const url = `${process.env.REACT_APP_API_URL}/send-friend-request`;
    const reqData = {
      from: auth.userInfo.user_id,
      to: auth.currentChatUser?.user_id,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      setSentRequests([...sentRequests, id]);
      const requestDetails = {
        requestId: data.requestId,
        senderId: auth.userInfo.user_id,
        senderName: auth.userInfo.name,
        senderProfileImage: auth.userInfo.profile_image,
        about: auth.userInfo.about,
        phone: auth.userInfo.phone,
        email: auth.userInfo.email,
      };
      if (chat.onlineUsers[id]) {
        socket.emit("sendFriendRequest", {
          requestDetails,
          socketId: chat.onlineUsers[id],
        });
      }
      toastMessage("success", data.msg);
      handleClose();
    } else {
      toast.error(data.msg);
    }
  };

  const handleConfirm = (type) => {
    switch (type) {
      case "delete":
        return handleDeleteConfirm();
      case "block":
        return handleBlockConfirm();
      case "unblock":
        return handleUnblockConfirm();
      case "request":
        return handleSendRequest();
      default:
        return null;
    }
  };

  useEffect(() => {
    if (type === "request") {
      const getRequests = async () => {
        const url = `${process.env.REACT_APP_API_URL}/get-friend-requests/${auth.userInfo?.user_id}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 200) {
          const requestsIds = data.requestsDetails.map((user) => user.senderId);
          setRequestsList(requestsIds);
          setSentRequests(data.sentRequestsDetails);
        } else {
          toast.error(data.msg);
        }
      };
      getRequests();
    } else return;
  }, []);

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent
          sx={{
            backgroundColor: isLightMode ? "#F0F4FA" : "#171a21",
            color: "#fff",
          }}
        >
          <DialogContentText
            id="alert-dialog-slide-description"
            sx={
              isLightMode
                ? { color: "#000", fontWeight: 600 }
                : { color: "#fff" }
            }
          >
            {type === "send-warning"
              ? "Send messges to this user please unblock first."
              : type === "request"
              ? `${auth.currentChatUser?.name} is not your friend now, if you want to send messages to this user sent a friend request whenever user accept your friend request.`
              : `Are you sure want to ${type} this contact ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: isLightMode ? "#F0F4FA" : "#171a21",
            color: "#fff",
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            size="small"
            sx={{ textTransform: "capitalize", borderRadius: 2, p: 0 }}
          >
            Cancel
          </Button>
          {type === "request" ? (
            sentRequests.includes(auth.currentChatUser?.user_id) ? (
              <span className="text-lm-blue text-sm border border-lm-blue rounded-lg px-2 py-0.5 bg-transparent">
                Request sent
              </span>
            ) : requestsList.includes(auth.currentChatUser?.user_id) ? (
              <span className="text-lm-blue text-sm border border-lm-blue rounded-lg px-2 py-0.5 bg-transparent">
                Received a request
              </span>
            ) : (
              <Button
                variant="contained"
                size="small"
                sx={{
                  textTransform: "capitalize",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 1,
                  py: 0,
                  mr: 2,
                }}
                onClick={() => handleConfirm(typeValue)}
              >
                Send request
              </Button>
            )
          ) : (
            <Button
              variant="contained"
              size="small"
              sx={{
                textTransform: "capitalize",
                fontWeight: 600,
                borderRadius: 2,
                p: 0,
                mr: 2,
              }}
              onClick={() => handleConfirm(typeValue)}
            >
              {type === "send-warning" ? "Unblock" : "Confirm"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Block;
