import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../context/AppContext";
import { Avatar } from "@mui/material";

const GroupChating = () => {
  const { messages, isLightMode, dateWiseMessages, getAmPmTime } =
    useContext(AppContext);

  const auth = useSelector((state) => state.auth);
  const app = useSelector((state) => state.app);

  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`h-[80vh] w-full overflow-auto relative flex-grow ${
        isLightMode ? "custom-scrollbar" : "dark-custom-scrollbar"
      }`}
    >
      <div
        className={`${
          app.friendSidebar.open ? "w-[calc(100vw-800px)]" : "w-full"
        } bg-fixed h-[80vh] fixed z-0 chat-background ${
          isLightMode ? "opacity-50" : "opacity-5"
        }`}
      ></div>
      <div className="mx-6 my-6 relative bottom-0 z-40 left-0">
        <div className="w-full">
          {Object.keys(dateWiseMessages).map((date) => {
            return (
              <ul className={`flex justify-end flex-col w-full gap-2`}>
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
                {dateWiseMessages[date].map((msg, index) => (
                  <li
                    key={msg.createdAt}
                    className={`flex ${
                      msg.senderId === auth.userInfo?.user_id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                    ref={scrollRef}
                  >
                    {msg.messageType === "text" &&
                      (auth.userInfo?.user_id === msg.senderId ? (
                        <div
                          className={`px-2 py-[4px] text-sm rounded-xl flex gap-3 max-w-[45%] bg-outgoing-background text-white`}
                        >
                          <span className="break-all">{msg.message}</span>
                          <div className="flex gap-1 items-end">
                            <span className="opacity-70 text-[11px] pt-2 min-w-fit self-end">
                              {getAmPmTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start max-w-[50%]">
                          {index > 0 &&
                          dateWiseMessages[date][index - 1].senderId !==
                            dateWiseMessages[date][index].senderId ? (
                            <Avatar
                              src={msg.senderProfileImage}
                              alt="profile"
                              className="h-4 w-4 rounded-full mr-2"
                            />
                          ) : index === 0 ? (
                            <Avatar
                              src={msg.senderProfileImage}
                              alt="profile"
                              className="h-4 w-4 rounded-full mr-2"
                            />
                          ) : (
                            <div className="ml-12"></div>
                          )}

                          <div
                            className={`${
                              isLightMode ? "bg-white" : "bg-[#97cfc6]"
                            } px-2 py-[4px] text-sm rounded-xl flex flex-col w-full text-black font-[500] custom-shadow items-start`}
                          >
                            <span className="bg-lm-blue rounded-md bg-opacity-60 text-white text-xs px-2">
                              {msg.senderName}
                            </span>
                            <div className="px-2 py-[4px] text-sm rounded-xl flex gap-3 w-full text-black font-[500]">
                              <span className="break-all">{msg.message}</span>
                              <div className="flex gap-1 items-end">
                                <span className="opacity-70 text-[11px] pt-2 min-w-fit self-end">
                                  {getAmPmTime(msg.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {msg.messageType === "image" &&
                      (auth.userInfo?.user_id === msg.senderId ? (
                        <div
                          className={`px-2 py-[4px] text-sm rounded-xl flex flex-col gap-1 max-w-[45%] bg-outgoing-background text-white`}
                        >
                          <img
                            src={`${process.env.REACT_APP_API_URL}/images/${msg.message}`}
                            alt="send"
                            className="rounded-lg w-full mb-1"
                          />
                          <span className="break-all text-gray-200">
                            {msg.caption}
                          </span>
                          <span className="opacity-70 text-[11px] min-w-fit self-end">
                            {getAmPmTime(msg.createdAt)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start max-w-[45%]">
                          {index === 0 && (
                            <Avatar
                              src={msg.senderProfileImage}
                              alt="profile"
                              className="h-4 w-4 rounded-full mr-2"
                            />
                          )}
                          {index > 0 &&
                          messages[index - 1].senderId !==
                            messages[index].senderId ? (
                            <Avatar
                              src={msg.senderProfileImage}
                              alt="profile"
                              className="h-4 w-4 rounded-full mr-2"
                            />
                          ) : index === 0 ? null : (
                            <div className="ml-12"></div>
                          )}
                          <div
                            className={`${
                              isLightMode
                                ? "bg-white bg-opacity-40"
                                : "bg-[#97cfc6]"
                            } px-0.5 py-[4px] text-sm rounded-xl flex flex-col w-full text-black font-[500] custom-shadow items-start`}
                          >
                            <span className="bg-lm-blue rounded-md bg-opacity-60 text-white text-xs ml-2 mb-2 px-2">
                              {msg.senderName}
                            </span>
                            <div className="px-2 py-[1px] text-sm rounded-xl flex w-full text-black font-[500]">
                              <div className="flex flex-col items-end">
                                <img
                                  src={`${process.env.REACT_APP_API_URL}/images/${msg.message}`}
                                  alt="send"
                                  className="rounded-lg w-full mb-1"
                                />
                                <span className="self-start">
                                  {msg.caption}
                                </span>
                                <span className="opacity-70 text-[11px] min-w-fit self-end">
                                  {getAmPmTime(msg.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {msg.messageType === "url" &&
                      (auth.userInfo?.user_id === msg.senderId ? (
                        <div
                          className={`px-2 py-[4px] text-sm rounded-xl flex gap-3 max-w-[45%] bg-outgoing-background text-white`}
                        >
                          <a
                            className="break-all text-green-300"
                            href={msg.message}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {msg.message}
                          </a>
                          <div className="flex gap-1 items-end">
                            <span className="opacity-70 text-[11px] pt-2 min-w-fit self-end">
                              {getAmPmTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start max-w-[50%]">
                          {index === 0 && (
                            <Avatar
                              src={msg.senderProfileImage}
                              alt="profile"
                              className="h-4 w-4 rounded-full mr-2"
                            />
                          )}
                          {index > 0 &&
                          messages[index - 1].senderId !==
                            messages[index].senderId ? (
                            <Avatar
                              src={msg.senderProfileImage}
                              alt="profile"
                              className="h-4 w-4 rounded-full mr-2"
                            />
                          ) : (
                            <div className="ml-12"></div>
                          )}
                          <div
                            className={`${
                              isLightMode ? "bg-white" : "bg-[#97cfc6]"
                            } px-2 py-[4px] text-sm rounded-xl flex flex-col w-full text-black font-[500] custom-shadow items-start`}
                          >
                            <span className="bg-lm-blue rounded-md bg-opacity-60 text-white text-xs px-2">
                              {msg.senderName}
                            </span>
                            <div className="px-2 py-[4px] text-sm rounded-xl flex gap-3 w-full text-black font-[500]">
                              <a
                                className="break-all text-lm-blue"
                                href={msg.message}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {msg.message}
                              </a>
                              <div className="flex gap-1 items-end">
                                <span className="opacity-70 text-[11px] pt-2 min-w-fit self-end">
                                  {getAmPmTime(msg.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </li>
                ))}
              </ul>
            );
          })}
          {auth.currentGroupChat.admin !== auth.userInfo.user_id &&
            !JSON.parse(auth.currentGroupChat?.members).includes(
              auth.userInfo.user_id
            ) && (
              <div className="w-full flex justify-center">
                <span
                  className={` text-md font-bold bg-gray-200 px-2 py-1 mt-4 rounded-2xl mx-2 ${
                    isLightMode
                      ? "text-gray-700"
                      : "bg-purple-600 text-gray-300"
                  }`}
                >
                  You left
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default GroupChating;
