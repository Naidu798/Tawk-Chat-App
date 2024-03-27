import { IconButton } from "@mui/material";
import React, { useContext } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { PiTelegramLogo } from "react-icons/pi";
import { AppContext } from "../context/AppContext";

const ImagePreview = ({
  imageUrl,
  setShowImagePreview,
  handleSendPhoto,
  setCaption,
}) => {
  const { isLightMode } = useContext(AppContext);

  return (
    <div
      className={`absolute bottom-20 left-6 z-40 custom-shadow rounded-lg ${
        isLightMode ? "bg-lm-sidebar-background" : "bg-[#171a21]"
      }`}
    >
      <div className="bg-black-200 max-h-[58vh] h-[50vh] w-80 pb-3 pt-0.5 px-3 rounded-xl relative">
        <IconButton onClick={() => setShowImagePreview(false)} sx={{ p: 0 }}>
          <IoIosArrowRoundBack
            className={`h-8 w-8 mb-1 ${isLightMode ? "" : "text-white"}`}
          />
        </IconButton>
        <img
          src={imageUrl}
          alt="preview"
          className="rounded-lg w-full h-[36vh]"
        />
        <div className="flex items-center justify-between mt-3">
          <input
            type="text"
            className={`text-[16px] ${
              isLightMode ? "text-gray-900 font-medium" : "text-white"
            } bg-transparent outline-none w-full h-8 py-1 rounded-md px-1.5`}
            placeholder="Add a Caption (optional)"
            onChange={(e) => setCaption(e.target.value)}
          />
          <div className="bg-[#5B96F7] ml-1 rounded-lg">
            <IconButton
              sx={{ color: "#ffffff", p: 1 }}
              onClick={handleSendPhoto}
            >
              <PiTelegramLogo className="text-white text-[19px]" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
