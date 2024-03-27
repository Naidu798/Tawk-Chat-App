import { IconButton, Button, Skeleton } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { LuCircleDashed } from "react-icons/lu";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { IoFilter } from "react-icons/io5";
import { MdOutlineArchive } from "react-icons/md";
import { TbUsersPlus } from "react-icons/tb";
import ChatingFriends from "../../components/ChatingFriends";
import { AppContext } from "../../context/AppContext";
import NewFriends from "../../components/NewFriends";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllChatUsers,
  setBlockedUsers,
  setPinnedChatUsers,
  setPinnedUsers,
} from "../../redux/chatSlice";
import { toast } from "react-toastify";

const ChatListPage = () => {
  const { isLightMode, setNewFriendDailogOpen, newFriendDailogOpen } =
    useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const auth = useSelector((state) => state.auth);
  const app = useSelector((state) => state.app);

  const dispatch = useDispatch();

  const handleClickOpen = () => {
    setNewFriendDailogOpen(true);
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

  useEffect(() => {
    if (auth.userInfo) {
      const getChatUsers = async () => {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_API_URL}/chat/get-all-chat-users/${auth.userInfo.user_id}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 200) {
          dispatch(setAllChatUsers({ allChatUsers: data.allChatUsers }));
          dispatch(
            setPinnedChatUsers({ pinnedChatUsers: data.allPinnedUsers })
          );
          dispatch(setPinnedUsers({ pinnedUsers: data.pinnedUsers }));
          dispatch(setBlockedUsers({ blockedUsers: data.blockedUsers }));
          if (data.messagesInSentStatus.length > 0) {
            updateMessageStatus(data.messagesInSentStatus, "delivered");
          }
          setIsLoading(false);
        } else {
          toast.error(data.msg);
        }
      };
      getChatUsers();
    }
  }, [auth.userInfo]);

  return (
    <div
      className={`h-full w-full py-3 flex flex-col items-center ${
        isLightMode ? "custom-shadow" : "dark-custom-shadow"
      }`}
    >
      <div className="flex items-center justify-between w-full px-6">
        <span
          className={`text-2xl font-extrabold tracking-wider ${
            isLightMode ? "text-black" : "text-white"
          }`}
        >
          Chats
        </span>
        <div className="relative">
          <IconButton onClick={handleClickOpen}>
            <TbUsersPlus
              className={`${isLightMode ? "text-black" : "text-white"}`}
            />
            {app.usersType.friendRequests.length > 0 && (
              <span className="absolute bg-lm-blue text-[10px] h-4 w-4 text-white flex justify-center items-center rounded-full top-1 right-0">
                {app.usersType.friendRequests.length}
              </span>
            )}
          </IconButton>

          <IconButton sx={{ ml: 2 }}>
            <LuCircleDashed
              className={`${isLightMode ? "text-black" : "text-white"}`}
            />
          </IconButton>
        </div>
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <IconButton>
          <IoFilter
            className={`h-5 w-5 ${isLightMode ? "" : "text-gray-400"}`}
          />
        </IconButton>
      </div>
      <div className="w-full mt-5 px-6">
        <div className="flex items-center gap-1">
          <Button
            startIcon={<MdOutlineArchive className="h-5 w-5" />}
            size="small"
            sx={{ fontWeight: 600 }}
          >
            Archieved
          </Button>
        </div>
      </div>
      <hr className="h-[1px] bg-gray-400 mt-3 w-[90%]" />

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
        <ChatingFriends searchTerm={searchTerm} />
      )}
      {newFriendDailogOpen && (
        <NewFriends
          open={newFriendDailogOpen}
          setOpen={setNewFriendDailogOpen}
        />
      )}
    </div>
  );
};

export default ChatListPage;
