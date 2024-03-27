import { IconButton, Skeleton } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { IoFilter } from "react-icons/io5";
import { AppContext } from "../../context/AppContext";
import { MdAdd } from "react-icons/md";
import GroupChats from "../../components/GropChats";
import CreateNewGroup from "../../components/CreateNewGroup";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setJoinedGroupChats, setMyGroupChats } from "../../redux/chatSlice";

const GroupsListPage = () => {
  const {
    isLightMode,
    newGroupDialogOpen,
    setNewGroupDialogOpen,
    socket,
    setMessages,
    setDateWiseMessages,
  } = useContext(AppContext);

  const [isLoading, setIsLoading] = useState(true);

  const auth = useSelector((state) => state.auth);
  const userRef = useRef(auth.userInfo);

  const dispatch = useDispatch();

  const handleClickOpen = () => {
    setNewGroupDialogOpen(true);
  };

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

  useEffect(() => {
    const getGroupChats = async () => {
      setIsLoading(true);
      const url = `${process.env.REACT_APP_API_URL}/group/get-group-chats/${auth.userInfo.user_id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 200) {
        if (data.messagesInSentStatus.length > 0) {
          updateMessageStatus(data.messagesInSentStatus, "delivered");
        }
        dispatch(setJoinedGroupChats({ joinedGroupChats: data.joinedGroups }));
        dispatch(setMyGroupChats({ myGroupChats: data.myGroups }));
        setIsLoading(false);
      } else {
        toast.error(data.msg);
      }
    };
    getGroupChats();
  }, []);

  useEffect(() => {
    userRef.current = auth.userInfo;
  }, [auth.userInfo]);

  useEffect(() => {
    if (!auth.currentGroupChat) return;

    socket.emit("joinRoom", {
      groupDetails: auth.currentGroupChat,
      userDetails: auth.userInfo,
    });

    socket.on("getGroupMessage", (message) => {
      if (JSON.parse(message.receiverIds).includes(userRef.current.user_id)) {
        setDateWiseMessages((prev) => {
          let updatedMessages = [];
          if (prev["Today"]) {
            updatedMessages = [...prev["Today"], message];
          } else {
            updatedMessages = [message];
          }
          return { ...prev, Today: updatedMessages };
        });
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("joinRoom");
      socket.off("getGroupMessage");
    };
  }, [auth.currentGroupChat, socket]);

  return (
    <div
      className={`h-full w-full py-3 flex flex-col items-center ${
        isLightMode ? "custom-shadow" : "dark-custom-shadow"
      }`}
    >
      <div className="w-full px-6">
        <span
          className={`text-2xl font-extrabold tracking-wider ${
            isLightMode ? "text-black" : "text-white"
          }`}
        >
          Groups
        </span>
      </div>

      <div
        className={`flex items-center mt-5 rounded-3xl py-0.5 w-[85%] px-2 ${
          isLightMode ? "bg-lm-search-bg" : "bg-[#1e2730]"
        }`}
      >
        <IconButton>
          <HiMagnifyingGlass className="h-5 w-5 text-lm-blue font-bold" />
        </IconButton>
        <input
          type="text"
          className={`outline-none w-full ${
            isLightMode ? "bg-lm-search-bg" : "bg-[#1e2730] text-white"
          }`}
          placeholder="Search"
        />
        <IconButton>
          <IoFilter
            className={`h-5 w-5 ${isLightMode ? "" : "text-gray-400"}`}
          />
        </IconButton>
      </div>
      <div className="w-full mt-6 px-6">
        <div className="flex items-center justify-between">
          <span className="text-md text-[#5B96F7]">Create New Group</span>
          <IconButton sx={{ fontWeight: 700 }} onClick={handleClickOpen}>
            <MdAdd className="h-6 w-6 text-[#5B96F7]" />
          </IconButton>
        </div>
      </div>
      <hr className="h-[1px] bg-gray-400 mt-3 w-[90%]" />
      {newGroupDialogOpen && (
        <CreateNewGroup
          open={newGroupDialogOpen}
          setOpen={setNewGroupDialogOpen}
        />
      )}
      {isLoading ? (
        <>
          <div className="self-start ml-3 mt-2">
            <Skeleton
              height={30}
              width={140}
              sx={{ my: 0, bgcolor: isLightMode ? "" : "grey.800" }}
            />
            <div className="ml-3 m-0">
              <Skeleton
                height={120}
                width={350}
                sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
              />
              <Skeleton
                height={120}
                width={350}
                sx={{ my: -3, bgcolor: isLightMode ? "" : "grey.800" }}
              />
            </div>
          </div>
          <div className="self-start ml-3 mt-2">
            <Skeleton
              height={30}
              width={140}
              sx={{ mt: 2, bgcolor: isLightMode ? "" : "grey.800" }}
            />
            <div className="ml-3">
              <Skeleton
                height={120}
                width={350}
                sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
              />
              <Skeleton
                height={120}
                width={350}
                sx={{ my: -3, bgcolor: isLightMode ? "" : "grey.800" }}
              />
              <Skeleton
                height={70}
                width={350}
                sx={{ my: -3, bgcolor: isLightMode ? "" : "grey.800" }}
              />
            </div>
          </div>
        </>
      ) : (
        <GroupChats />
      )}
    </div>
  );
};

export default GroupsListPage;
