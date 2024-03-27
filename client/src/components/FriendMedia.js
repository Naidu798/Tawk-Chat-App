import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { FaChevronLeft } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setFriendSidebar } from "../redux/appSlice";
import { LuLink } from "react-icons/lu";
import { IoCloseCircleOutline } from "react-icons/io5";

const FriendMedia = ({ photos, links, audios }) => {
  const { isLightMode } = useContext(AppContext);
  const [value, setValue] = useState("one");

  const dispatch = useDispatch();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderPhotos = () => (
    <div>
      {photos.length > 0 ? (
        <ul className="w-full flex flex-wrap">
          {photos.map((msg) => (
            <li key={msg.created_at} className="m-2">
              <img
                src={`${process.env.REACT_APP_API_URL}/images/${msg.message}`}
                alt="media"
                className="h-20 w-20 rounded-lg"
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-[80vh] w-full flex items-center justify-center">
          <span className={`text-lg ${isLightMode ? "" : "text-gray-300"}`}>
            No Photos
          </span>
        </div>
      )}
    </div>
  );

  const renderLinks = () =>
    links.length > 0 ? (
      <ul className="w-full">
        {links.map((msg) => (
          <li
            key={msg.created_at}
            className={`m-2 flex items-center ${
              isLightMode ? "custom-shadow" : "dark-custom-shadow"
            } py-2 px-3 rounded-lg`}
          >
            <div className="bg-gray-400 bg-opacity-50 p-2 rounded-lg mr-3">
              <LuLink className={`${isLightMode ? "" : "text-white"}`} />
            </div>
            <a
              href={msg.message}
              target={"_blank"}
              rel="noreferrer"
              className="text-lm-blue text-sm"
            >
              {msg.message}
            </a>
          </li>
        ))}
      </ul>
    ) : (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <span className={`text-lg ${isLightMode ? "" : "text-white"}`}>
          No Links
        </span>
      </div>
    );

  const renderAudios = () => {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <span className={`text-lg ${isLightMode ? "" : "text-white"}`}>
          No Audios
        </span>
      </div>
    );
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
          <IconButton
            onClick={() =>
              dispatch(setFriendSidebar({ open: true, type: "INFO" }))
            }
          >
            <FaChevronLeft
              className={`text-lg ${
                isLightMode ? "text-black" : "text-gray-200"
              }`}
            />
          </IconButton>
          <span
            className={`ml-3 text-lg ${
              isLightMode ? "font-semibold" : "text-white"
            }`}
          >
            Media Info
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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="secondary tabs example"
          sx={{ m: 1 }}
        >
          <Tab
            value="one"
            label="Photos"
            sx={{
              textTransform: "capitalize",
              fontSize: 16,
              color: isLightMode ? "" : "gray",
              fontWeight: 500,
            }}
          />
          <Tab
            value="two"
            label="Links"
            sx={{
              textTransform: "capitalize",
              fontSize: 16,
              fontWeight: 500,
              color: isLightMode ? "" : "gray",
            }}
          />
          <Tab
            value="three"
            label="Audios"
            sx={{
              textTransform: "capitalize",
              fontSize: 16,
              fontWeight: 500,
              color: isLightMode ? "" : "gray",
            }}
          />
        </Tabs>
      </Box>
      <div
        className={`h-[80vh] w-full overflow-auto px-3 ${
          isLightMode ? "custom-scrollbar" : "dark-custom-scrollbar"
        }`}
      >
        {value === "one" && renderPhotos()}
        {value === "two" && renderLinks()}
        {value === "three" && renderAudios()}
      </div>
    </div>
  );
};

export default FriendMedia;
