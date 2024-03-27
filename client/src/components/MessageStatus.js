import React from "react";
import { MdCheck } from "react-icons/md";
import { RiCheckDoubleLine } from "react-icons/ri";

const MessageStatus = ({ status, isActive, type }) => {
  return (
    <div>
      {status === "sent" && (
        <MdCheck
          className={`text-md font-[600] ${
            isActive
              ? " text-white"
              : type === "CHAT"
              ? "text-gray-400"
              : "text-white"
          }`}
        />
      )}
      {status === "delivered" && (
        <RiCheckDoubleLine
          className={`text-lg font-[600] ${
            isActive
              ? " text-white"
              : type === "CHAT"
              ? "text-gray-400"
              : "text-white"
          }`}
        />
      )}
      {status === "read" && (
        <RiCheckDoubleLine className="text-lg font-[600] text-[#4cfb69]" />
      )}
    </div>
  );
};

export default MessageStatus;
