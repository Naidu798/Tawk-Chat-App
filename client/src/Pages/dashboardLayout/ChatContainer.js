import React, { useContext } from "react";
import ChatHeader from "../../components/ChatHeader";
import Chating from "../../components/Chating";
import MessageBar from "../../components/MessageBar";
import { AppContext } from "../../context/AppContext";
import EmojiPicker from "emoji-picker-react";
import { useSelector } from "react-redux";
import GroupChating from "../../components/GroupChatting";

const ChatContainer = () => {
  const { showEmojiPicker, isLightMode, setMessage } = useContext(AppContext);
  const auth = useSelector((state) => state.auth);
  const app = useSelector((state) => state.app);

  const handleEmojimessage = (emoji) => {
    setMessage((prev) => (prev += emoji.emoji));
  };
  return (
    <div className="h-[100vh] w-full custom-shadow flex flex-col justify-between relative">
      <ChatHeader />
      {app.isGroupsActive && auth.currentGroupChat ? (
        <GroupChating />
      ) : (
        <Chating />
      )}
      <MessageBar />
      {showEmojiPicker && (
        <div className="absolute bottom-24 right-10 z-40">
          <EmojiPicker
            theme={isLightMode ? "light" : "dark"}
            onEmojiClick={handleEmojimessage}
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
