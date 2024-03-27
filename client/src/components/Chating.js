import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../context/AppContext";
import MessageStatus from "./MessageStatus";
import { Button, Skeleton } from "@mui/material";
import BlockAndDeleteDailog from "../components/BlockAndDeleteDailog";
import { toast } from "react-toastify";

const Chating = () => {
  const {
    messages,
    isLightMode,
    dateWiseMessages,
    getAmPmTime,
    getDateWiseMessages,
    setMessages,
  } = useContext(AppContext);

  const [unblockOpen, setUnblockOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const auth = useSelector((state) => state.auth);
  const app = useSelector((state) => state.app);
  const chat = useSelector((state) => state.chat);
  const scrollRef = useRef();

  const renderLoder = () => (
    <div
      className={`h-[80vh] flex flex-col w-full overflow-auto relative flex-grow p-4`}
    >
      <Skeleton
        height={60}
        width={210}
        sx={{ my: 0, bgcolor: isLightMode ? "" : "grey.800" }}
      />
      <Skeleton
        height={60}
        width={290}
        sx={{ mt: -1, bgcolor: isLightMode ? "" : "grey.800" }}
      />

      <Skeleton
        height={60}
        width={320}
        sx={{
          my: 0,
          bgcolor: isLightMode ? "" : "grey.800",
          alignSelf: "flex-end",
        }}
      />
      <Skeleton
        height={60}
        width={200}
        sx={{
          mt: -1,
          bgcolor: isLightMode ? "" : "grey.800",
          alignSelf: "flex-end",
        }}
      />
      <Skeleton
        height={50}
        width={120}
        sx={{
          mt: -1,
          bgcolor: isLightMode ? "" : "grey.800",
          alignSelf: "center",
        }}
      />
      <Skeleton
        height={60}
        width={300}
        sx={{ mt: -1, bgcolor: isLightMode ? "" : "grey.800" }}
      />
      <Skeleton
        height={60}
        width={250}
        sx={{ mt: -1, bgcolor: isLightMode ? "" : "grey.800" }}
      />
      <Skeleton
        height={60}
        width={340}
        sx={{
          mt: -1,
          bgcolor: isLightMode ? "" : "grey.800",
          alignSelf: "flex-end",
        }}
      />
      <Skeleton
        height={400}
        width={300}
        sx={{
          mt: -7,
          bgcolor: isLightMode ? "" : "grey.800",
          alignSelf: "flex-end",
        }}
      />
      <Skeleton
        height={50}
        width={120}
        sx={{
          mt: -1,
          bgcolor: isLightMode ? "" : "grey.800",
          alignSelf: "center",
        }}
      />
      <Skeleton
        height={60}
        width={200}
        sx={{ mt: -1, bgcolor: isLightMode ? "" : "grey.800" }}
      />
      <Skeleton
        height={60}
        width={340}
        sx={{ mt: -1, bgcolor: isLightMode ? "" : "grey.800" }}
      />
    </div>
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (auth.userInfo && auth.currentChatUser) {
      const getMessages = async () => {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_API_URL}/messages/get-messages/${auth.userInfo.user_id}/${auth.currentChatUser.user_id}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 200) {
          setMessages(data.messages);
          getDateWiseMessages(data.messages, false);
          setIsLoading(false);
        } else {
          toast.error(data.msg);
        }
      };
      getMessages();
    }
  }, [auth.currentChatUser]);

  return isLoading ? (
    renderLoder()
  ) : (
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
          <div>
            {Object.keys(dateWiseMessages).map((date) => {
              return (
                <ul className={`flex justify-end flex-col w-full gap-1`}>
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
                  {dateWiseMessages[date].map((msg) => (
                    <li
                      key={msg.created_at}
                      className={`flex ${
                        msg.sender_id === auth.currentChatUser?.user_id
                          ? "justify-start"
                          : "justify-end "
                      }`}
                      ref={scrollRef}
                    >
                      {msg.type === "text" && (
                        <div
                          className={`px-2 py-[4px] text-sm rounded-xl flex gap-3 max-w-[45%] ${
                            msg.sender_id === auth.currentChatUser?.user_id
                              ? `text-black font-[500] ${
                                  isLightMode ? "bg-white" : "bg-[#97cfc6]"
                                }`
                              : "bg-outgoing-background text-white"
                          }`}
                        >
                          <span className="break-all">{msg.message}</span>
                          <div className="flex gap-1 items-end">
                            <span className="opacity-70 text-[11px] pt-2 min-w-fit self-end">
                              {getAmPmTime(msg.created_at)}
                            </span>
                            {auth.userInfo?.user_id === msg.sender_id && (
                              <MessageStatus status={msg.message_status} />
                            )}
                          </div>
                        </div>
                      )}

                      {msg.type === "block" &&
                        msg.sender_id === auth.userInfo.user_id && (
                          <div
                            className={`px-2 py-[4px] text-sm rounded-xl flex gap-3 max-w-[45%] ${
                              msg.sender_id === auth.currentChatUser?.user_id
                                ? `text-black font-[500] ${
                                    isLightMode ? "bg-white" : "bg-[#97cfc6]"
                                  }`
                                : "bg-outgoing-background text-white"
                            }`}
                          >
                            <span className="break-all">{msg.message}</span>
                            <div className="flex gap-1 items-end">
                              <span className="opacity-70 text-[11px] pt-2 min-w-fit self-end">
                                {getAmPmTime(msg.created_at)}
                              </span>
                              {auth.userInfo?.user_id === msg.sender_id && (
                                <MessageStatus status={msg.message_status} />
                              )}
                            </div>
                          </div>
                        )}

                      {msg.type === "image" && (
                        <div
                          className={`px-2 py-[4px] text-sm rounded-xl flex flex-col max-w-[45%] bg-opacity-70 ${
                            msg.sender_id === auth.currentChatUser?.user_id
                              ? `text-black font-[500] ${
                                  isLightMode
                                    ? "bg-gray-300 bg-opacity-40"
                                    : "bg-[#97cfc6] bg-opacity-30"
                                }`
                              : "bg-outgoing-background text-white"
                          }`}
                        >
                          <img
                            src={`${process.env.REACT_APP_API_URL}/images/${msg.message}`}
                            alt="send"
                            className="rounded-lg w-full h-[36vh] mb-1"
                          />
                          <span
                            className={`break-all ${
                              isLightMode
                                ? msg.sender_id ===
                                  auth.currentChatUser?.user_id
                                  ? "text-black"
                                  : "text-white"
                                : "text-white"
                            } text-md`}
                          >
                            {msg?.caption}
                          </span>
                          <div className="flex gap-1 items-end justify-end w-full">
                            <span className="text-bubble-meta text-[12px] pt-1 min-w-fit self-end opacity-70">
                              {getAmPmTime(msg.created_at)}
                            </span>
                            <span>
                              {msg.sender_id === auth.userInfo?.user_id && (
                                <MessageStatus status={msg.message_status} />
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                      {msg.type === "url" && (
                        <div
                          className={`px-2 py-[4px] text-sm rounded-xl flex gap-3 max-w-[45%] ${
                            msg.sender_id === auth.currentChatUser?.user_id
                              ? `text-black font-[500] ${
                                  isLightMode ? "bg-white" : "bg-[#97cfc6]"
                                }`
                              : "bg-outgoing-background text-white"
                          }`}
                        >
                          <a
                            className="break-all text-[#0933ed] hover:text-purple-500"
                            href={msg.message}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {msg.message}
                          </a>
                          <div className="flex gap-1 items-end">
                            <span className="opacity-70 text-[11px] pt-2 min-w-fit self-end">
                              {getAmPmTime(msg.created_at)}
                            </span>
                            <span>
                              {msg.sender_id === auth.userInfo?.user_id && (
                                <MessageStatus status={msg.message_status} />
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              );
            })}
          </div>
          {chat.blockedUsers.includes(auth?.currentChatUser.user_id) && (
            <div className={`flex flex-col justify-center items-center mt-6`}>
              <div
                className={`flex flex-col justify-center items-center py-2 px-4 rounded-lg ${
                  isLightMode
                    ? "bg-lm-sidebar-background custom-shadow"
                    : "bg-[#1e2724] dark-custom-shaow bg-opacity-80"
                }`}
              >
                <span
                  className={`text-sm ${
                    isLightMode ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  You blocked this user
                </span>
                <Button
                  sx={{ textTransform: "revert", p: 0 }}
                  size="small"
                  color="secondary"
                  onClick={() => setUnblockOpen(true)}
                >
                  Tap to unblock
                </Button>
              </div>
            </div>
          )}
          {
            <BlockAndDeleteDailog
              open={unblockOpen}
              setOpen={setUnblockOpen}
              type={"unblock"}
            />
          }
        </div>
      </div>
    </div>
  );
};

export default Chating;
