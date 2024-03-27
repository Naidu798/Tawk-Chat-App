import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setFriendSidebar } from "../redux/appSlice";
import { IoCloseCircleOutline } from "react-icons/io5";
import { HiMagnifyingGlass } from "react-icons/hi2";

const SearchMessages = () => {
  const { isLightMode, dateWiseMessages, getAmPmTime } = useContext(AppContext);
  const auth = useSelector((state) => state.auth);
  const app = useSelector((state) => state.app);

  const [searchMessages, setSearchMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();

  const handleSearchMessages = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      let resultMsgs = {};
      if (app.isGroupsActive) {
        Object.keys(dateWiseMessages).map((date) => {
          const msgArray = [];
          dateWiseMessages[date].map(
            (msg) =>
              msg.messageType === "text" &&
              msg.message.toLowerCase().includes(value.toLowerCase()) &&
              msgArray.push(msg)
          );
          if (msgArray.length > 0) {
            resultMsgs[date] = msgArray;
          }

          return null;
        });
      } else {
        Object.keys(dateWiseMessages).map((date) => {
          const msgArray = [];
          dateWiseMessages[date].map(
            (msg) =>
              msg.type === "text" &&
              msg.message.toLowerCase().includes(value.toLowerCase()) &&
              msgArray.push(msg)
          );
          if (msgArray.length > 0) {
            resultMsgs[date] = msgArray;
          }

          return null;
        });
      }
      setSearchMessages(resultMsgs);
    } else {
      setSearchMessages({});
    }
  };

  return (
    <div
      className={`h-full w-full ${
        isLightMode
          ? "custom-shadow bg-lm-chat-bg"
          : "dark-custom-shadow bg-[#171a21]"
      }`}
    >
      <div className="h-[10vh] w-full custom-shadow flex items-center pl-3 justify-between pr-3">
        <div>
          <span
            className={`ml-3 text-lg ${
              isLightMode ? "font-semibold" : "text-white"
            }`}
          >
            Search Messages
          </span>
        </div>
        <IconButton
          onClick={() =>
            dispatch(setFriendSidebar({ open: false, type: null }))
          }
        >
          <IoCloseCircleOutline
            className={`${isLightMode ? "" : "text-gray-200"}`}
          />
        </IconButton>
      </div>
      <div
        className={`flex items-center mt-5 rounded-3xl py-0.5 w-[85%] px-2 m-auto ${
          isLightMode ? "bg-lm-search-bg" : "bg-[#1e2730]"
        }`}
      >
        <IconButton>
          <HiMagnifyingGlass className="h-5 w-5 text-lm-blue font-bold" />
        </IconButton>
        <input
          type="text"
          className={`outline-none w-full text-sm ${
            isLightMode ? "bg-lm-search-bg" : "bg-[#1e2730] text-white"
          }`}
          placeholder="Search messages"
          onChange={handleSearchMessages}
          value={searchTerm}
        />
      </div>
      <div
        className={`overflow-auto h-[78vh] mt-4 py-2 px-4 ${
          isLightMode ? "custom-scrollbar" : "dark-custom-scrollbar"
        }`}
      >
        {Object.keys(searchMessages).map((date) => {
          return (
            <ul
            // className={`overflow-auto h-[78vh] mt-4 py-2 px-4 ${
            //   isLightMode ? "custom-scrollbar" : "dark-custom-scrollbar"
            // }`}
            >
              <div className="flex items-center w-full my-3">
                <hr
                  className={`h-[0.1px] w-[50%] ${
                    isLightMode ? "border-gray-300" : "border-gray-600"
                  }`}
                />
                <span
                  className={` text-[12px] bg-gray-200 px-2 py-1 rounded-2xl mx-2 ${
                    isLightMode
                      ? "text-gray-700"
                      : "bg-purple-600 text-gray-300"
                  }`}
                >
                  {date}
                </span>
                <hr
                  className={`h-[0.1px] w-[50%] ${
                    isLightMode ? "border-gray-300" : "border-gray-600"
                  }`}
                />
              </div>
              {searchMessages[date].map((msg) => (
                <li
                  className={`flex items-center justify-between my-2 rounded-lg py-2 px-4 ${
                    isLightMode
                      ? "bg-lm-sidebar-background bg-opacity-50"
                      : "bg-[#1e2730] bg-opacity-20"
                  }`}
                >
                  <span
                    className={`text-sm ml-3 mt-1 ${
                      isLightMode ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {msg.message}
                  </span>
                  <span
                    className={`text-sm ml-3 mt-1 ${
                      isLightMode ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {getAmPmTime(
                      app.isGroupsActive ? msg.createdAt : msg.created_at
                    )}
                  </span>
                </li>
              ))}
            </ul>
          );
        })}
        {Object.keys(searchMessages).length === 0 && searchTerm && (
          <div className="h-full w-full flex items-center justify-center">
            <span
              className={`text-md ml-3 mt-1 ${
                isLightMode ? "text-gray-800" : "text-gray-200"
              }`}
            >
              No Messages Found
            </span>
          </div>
        )}
        {Object.keys(searchMessages).length === 0 && !searchTerm && (
          <div className="flex justify-center">
            <p
              className={`text-sm ml-3 mt-1 ${
                isLightMode ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Search messages of
              <span className="text-[#09bd0c] ml-2">
                {app.isGroupsActive
                  ? auth.currentGroupChat?.group_name
                  : auth.currentChatUser?.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMessages;
