import { Avatar, IconButton, Skeleton } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { LuPhone } from "react-icons/lu";
import { HiMagnifyingGlass, HiOutlineVideoCamera } from "react-icons/hi2";
import { IoCloseCircleOutline, IoFilter } from "react-icons/io5";
import CallLogHistory from "../../components/CallLogHistory";
import { AppContext } from "../../context/AppContext";
import CustomDailog from "../../components/CustomDailog";
import { useDispatch, useSelector } from "react-redux";
import { setCallTypes } from "../../redux/appSlice";
import { setCallHistory } from "../../redux/chatSlice";
import { toast } from "react-toastify";

const CallLog = () => {
  const { isLightMode, socket } = useContext(AppContext);

  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  const dispatch = useDispatch();

  const [openNewCall, setOpenNewCall] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [searchFriends, setSearchFriends] = useState(app.usersType.friends);
  const [searchCallLogs, setSearchCalllogs] = useState(chat.callHistory);

  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => {
    setOpenNewCall(false);
  };

  const getCallLogHistory = async () => {
    setIsLoading(true);
    const url = `${process.env.REACT_APP_API_URL}/messages/get-call-history/${auth.userInfo.user_id}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 200) {
      dispatch(setCallHistory({ callHistory: data.callLogHistory }));
      setSearchCalllogs(data.callLogHistory);
      setIsLoading(false);
    } else {
      toast.error(data.msg);
    }
  };

  const handleSearchFriends = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredFriends = app.usersType.friends.filter((user) =>
        user.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchFriends(filteredFriends);
    } else {
      setSearchFriends(app.usersType.friends);
    }
  };

  const handleSearchCallLogFriends = (e) => {
    const searchContent = e.target.value;
    setSearchKey(searchContent);
    if (searchContent) {
      const filteredCallLogs = chat.callHistory.filter((callLog) =>
        callLog.name.toLowerCase().includes(searchContent.toLowerCase())
      );
      setSearchCalllogs(filteredCallLogs);
    } else {
      setSearchCalllogs(chat.callHistory);
    }
  };

  const handleVideoCall = (user) => {
    handleClose();
    const videoCall = {
      from: auth.userInfo,
      to: user,
      callType: "Video call",
      mode: "outgoing",
      status: null,
      friendSocket: chat.onlineUsers[user.user_id],
    };
    dispatch(setCallTypes({ ...app.callTypes, videoCall }));
    if (chat.onlineUsers[user.user_id]) {
      socket.emit("outgoingVideoCall", videoCall);
    }
  };

  const handleVoiceCall = (user) => {
    handleClose();
    const voiceCall = {
      from: auth.userInfo,
      to: user,
      callType: "Voice call",
      mode: "outgoing",
      status: null,
      friendSocket: chat.onlineUsers[user.user_id],
    };
    dispatch(setCallTypes({ ...app.callTypes, voiceCall }));
    if (chat.onlineUsers[user.user_id]) {
      socket.emit("outgoingVoiceCall", voiceCall);
    }
  };

  const renderNewCallFriends = () => {
    return (
      <ul
        className={`h-[50vh] w-[25vw] overflow-auto mt-5 py-2 rounded-lg ${
          isLightMode
            ? "custom-scrollbar custom-shadow"
            : "dark-custom-scrollbar dark-custom-shadow"
        }`}
      >
        {searchFriends.length > 0 ? (
          searchFriends.map((user) => {
            return (
              <li
                key={user.user_id}
                className={`flex items-center justify-between gap-2 py-2 mx-4 px-4 rounded-lg my-2 ${
                  isLightMode
                    ? "bg-[#fff] custom-shadow"
                    : "bg-[#1e2730] dark-custom-shadow"
                }`}
              >
                <div className="flex items-center gap-3 relative">
                  <Avatar
                    sx={{ width: 50, height: 50 }}
                    src={
                      user?.profile_image
                        ? user?.profile_image.startsWith("image_")
                          ? `${process.env.REACT_APP_API_URL}/images/${user?.profile_image}`
                          : user?.profile_image
                        : null
                    }
                    alt="profile"
                  />

                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-[16px] font-semibold ${
                        isLightMode ? "text-gray-700" : "text-[#ecf2f8]"
                      }`}
                    >
                      {user.name}
                    </span>
                    <span
                      className={`text-[14px] max-w-[250px] ${
                        isLightMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {user?.about ? user.about : "No about set"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton
                    color="success"
                    onClick={() => handleVoiceCall(user)}
                  >
                    <LuPhone className="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    color="success"
                    onClick={() => handleVideoCall(user)}
                  >
                    <HiOutlineVideoCamera className="h-5 w-5" />
                  </IconButton>
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
              {searchTerm ? "No Friends Found" : "No Friends"}
            </span>
          </div>
        )}
      </ul>
    );
  };

  useEffect(() => {
    getCallLogHistory();
  }, []);

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
          Call Logs
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
          value={searchKey}
          onChange={handleSearchCallLogFriends}
        />
        <IconButton>
          <IoFilter
            className={`h-5 w-5 ${isLightMode ? "" : "text-gray-400"}`}
          />
        </IconButton>
      </div>
      <div className="w-full mt-6 px-6">
        <div className="flex items-center justify-between">
          <span className="text-md text-[#5B96F7]">Start new conversation</span>
          <IconButton
            sx={{ fontWeight: 700 }}
            onClick={() => setOpenNewCall(true)}
          >
            <LuPhone className="h-5 w-5 text-[#5B96F7]" />
          </IconButton>
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
                height={100}
                width={350}
                sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
              />
              <Skeleton
                height={100}
                width={350}
                sx={{ my: -3, bgcolor: isLightMode ? "" : "grey.800" }}
              />
              <Skeleton
                height={100}
                width={350}
                sx={{ my: -3, bgcolor: isLightMode ? "" : "grey.800" }}
              />
              <Skeleton
                height={100}
                width={350}
                sx={{ my: -3, bgcolor: isLightMode ? "" : "grey.800" }}
              />
              <Skeleton
                height={100}
                width={350}
                sx={{ my: -3, bgcolor: isLightMode ? "" : "grey.800" }}
              />
              <Skeleton
                height={100}
                width={350}
                sx={{ my: -3, bgcolor: isLightMode ? "" : "grey.800" }}
              />
            </div>
          </div>
        </>
      ) : (
        <CallLogHistory
          searchCallLogs={searchCallLogs}
          searchTerm={searchKey}
        />
      )}
      {openNewCall && (
        <CustomDailog open={openNewCall} setOpen={setOpenNewCall}>
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center mt-5 rounded-3xl py-0.5 w-[85%] px-2 ${
                  isLightMode
                    ? "bg-lm-search-bg custom-shadow"
                    : "bg-[#1e2730] dark-custom-shadow"
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
                  placeholder="Search friends"
                  value={searchTerm}
                  onChange={handleSearchFriends}
                />
                <IconButton>
                  <IoFilter
                    className={`h-5 w-5 ${isLightMode ? "" : "text-gray-400"}`}
                  />
                </IconButton>
              </div>
              <IconButton onClick={handleClose} sx={{ mt: 3 }}>
                <IoCloseCircleOutline
                  className={`${isLightMode ? "" : "text-gray-200"}`}
                />
              </IconButton>
            </div>
            {renderNewCallFriends()}
          </div>
        </CustomDailog>
      )}
    </div>
  );
};

export default CallLog;
