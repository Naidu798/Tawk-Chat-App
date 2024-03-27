import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useSelector } from "react-redux";

const Empty = () => {
  const { isLightMode, setNewFriendDailogOpen, setNewGroupDialogOpen } =
    useContext(AppContext);

  const app = useSelector((state) => state.app);

  return (
    <div className="h-full w-full flex justify-center items-center custom-shadow">
      <div className="flex flex-col gap-6">
        <img src="/empty.png" alt="empty" />
        {app.isGroupsActive ? (
          <p
            className={`text-md ${
              isLightMode ? "text-black font-bold" : "text-white"
            }`}
          >
            Select a conversation or Create a
            <span
              className="text-lm-blue text-bold ml-1 cursor-pointer"
              onClick={() => setNewGroupDialogOpen(true)}
            >
              New Group
            </span>
          </p>
        ) : (
          <p
            className={`text-md ${
              isLightMode ? "text-black font-bold" : "text-white"
            }`}
          >
            Select a conversation or start with{" "}
            <span
              className="text-lm-blue text-bold ml-1 cursor-pointer"
              onClick={() => setNewFriendDailogOpen(true)}
            >
              New One
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Empty;
