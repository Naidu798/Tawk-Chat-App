import { IconButton } from "@mui/material";
import React, { useContext } from "react";
import { RxCrossCircled } from "react-icons/rx";
import { AppContext } from "../context/AppContext";

const avatars = [
  "avatars/avatar1.jpg",
  "avatars/avatar2.jpg",
  "avatars/avatar3.jpg",
  "avatars/avatar4.jpg",
  "avatars/avatar5.jpg",
  "avatars/avatar6.jpg",
  "avatars/avatar7.jpg",
  "avatars/avatar8.jpg",
  "avatars/avatar9.jpg",
  "avatars/avatar10.jpg",
  "avatars/avatar11.jpg",
  "avatars/avatar12.jpg",
  "avatars/avatar13.jpg",
  "avatars/avatar14.jpg",
  "avatars/avatar15.jpg",
];

const AvatarsLibrary = () => {
  const { setShowAvatarsLibrary, isLightMode, setProfileImageUrl } =
    useContext(AppContext);

  return (
    <div
      className={`absolute top-0 left-0 h-screen w-screen flex justify-center items-center z-50 bg-opacity-50 ${
        isLightMode ? "bg-gray-300" : "bg-gray-800"
      }`}
      onClick={() => setShowAvatarsLibrary(false)}
    >
      <div>
        <div
          className={`${
            isLightMode ? "bg-lm-sidebar-background" : "bg-[#171a21]"
          } py-3 px-4 rounded-lg custom-shadow flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xl ${
                isLightMode ? "font-semibold" : "text-white"
              }`}
            >
              Choose Avatar
            </span>
            <IconButton onClick={() => setShowAvatarsLibrary(false)}>
              <RxCrossCircled
                className={`${isLightMode ? "" : "text-white"}`}
              />
            </IconButton>
          </div>
          <ul className="flex flex-wrap max-w-[30vw] w-full justify-center">
            {avatars.map((avatar) => {
              return (
                <li className="m-3" key={avatar}>
                  <IconButton onClick={() => setProfileImageUrl(avatar)}>
                    <img
                      src={avatar}
                      alt="avatar"
                      className="h-16 w-16 rounded-full"
                    />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AvatarsLibrary;
