import React, { useContext, useEffect, useState } from "react";

import { LuUsers } from "react-icons/lu";
import { IoMdNotificationsOutline } from "react-icons/io";
import { LuPhone } from "react-icons/lu";
import { Avatar, IconButton, Switch } from "@mui/material";
import { AppContext } from "../../context/AppContext";
import ProfileContextMenu from "../../components/ProfileContextMenu";
import { BsChatDots } from "react-icons/bs";
import { MdDarkMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import {
  changeDashboardTab,
  setFriendSidebar,
  setIsGroupsActive,
} from "../../redux/appSlice";
import { setCurrentChatUser, setCurrentGroupChat } from "../../redux/authSlice";

const sideBarIcons = [
  {
    index: 1,
    element: <BsChatDots className="h-6 w-6" />,
    tabName: "CHAT",
  },
  { index: 2, element: <LuUsers className="h-6 w-6" />, tabName: "GROUP" },
  { index: 3, element: <LuPhone className="h-6 w-6" />, tabName: "CALL_LOG" },
];
const label = { inputProps: { "aria-label": "switch" } };

const SideBar = () => {
  const { isLightMode, setIsLightMode, socket, notifications, setPrevTab } =
    useContext(AppContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsCount, setNotificationsCount] = useState(0);
  // const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  // const [unreadGroupChatsCount, setUnreadGroupChatsCount] = useState(0);

  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const open = Boolean(anchorEl);
  const handleProfileContextMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // const getUnreadChats = () => {
  //   let count = 0;
  //   const totalChats = chat.allChatUsers.concat(chat.pinnedChatUsers);
  //   totalChats.forEach((user) => {
  //     if (user.totalUnreadMessages.length > 0) {
  //       count += 1;
  //     }
  //   });
  //   setUnreadChatsCount(count);
  // };

  // const getUreadGroupChats = () => {
  //   let count = 0;
  //   const totalGroups = chat.myGroupChats.concat(chat.joinedGroupChats);
  //   totalGroups.forEach((group) => {
  //     if (group?.totalUnreadMessages?.length > 0) {
  //       count += 1;
  //     }
  //   });
  //   setUnreadGroupChatsCount(count);
  // };

  const getUnreadNotifications = () => {
    let notificationsCount = 0;
    notifications.forEach((ntf) => {
      if (ntf.status === "unread") {
        notificationsCount += 1;
      }
    });
    setNotificationsCount(notificationsCount);
  };

  useEffect(() => {
    getUnreadNotifications();
  });

  return (
    <div
      className={`w-full h-full flex flex-col justify-between items-center py-6 px-2 border-r-1 ${
        isLightMode ? "custom-shadow" : "dark-custom-shadow"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="rounded-lg p-2 bg-logo-background">
          <img src="/logo.png" alt="logo" className="h-10 w-10" />
        </div>
        <ul className="mt-4 mb-3">
          {sideBarIcons.map((ele) => {
            return (
              <li
                key={ele.index}
                className={`my-4 cursor-pointer flex flex-col items-center justify-center`}
              >
                <div
                  className={`relative ${
                    app.sideBar.activeTab === ele.tabName
                      ? `h-12 w-12 bg-[#5B96F7] rounded-lg flex items-center justify-center`
                      : ""
                  }`}
                >
                  <IconButton
                    sx={{
                      color: isLightMode
                        ? app.sideBar.activeTab === ele.tabName
                          ? "#fff"
                          : "#080707"
                        : "#b1efff",
                    }}
                    onClick={() => {
                      dispatch(changeDashboardTab({ activeTab: ele.tabName }));
                      setPrevTab(ele.tabName);
                      if (ele.index === 2) {
                        dispatch(setIsGroupsActive({ isGroupsActive: true }));
                        dispatch(setCurrentChatUser({ currentChatUser: null }));
                        dispatch(setFriendSidebar({ open: false, type: null }));
                      } else if (ele.index === 1) {
                        if (auth.currentGroupChat) {
                          socket.emit("leaveGroup", {
                            groupDetails: auth.currentGroupChat,
                            userDetails: auth.userInfo,
                          });
                        }
                        dispatch(setFriendSidebar({ open: false, type: null }));

                        dispatch(
                          setCurrentGroupChat({ currentGroupChat: null })
                        );
                        dispatch(setIsGroupsActive({ isGroupsActive: false }));
                      }
                    }}
                  >
                    {ele.element}
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
        <hr className="h-0.5 bg-gray-400 w-full mb-4" />
        <div
          className={`relative cursor-pointer ${
            app.sideBar.activeTab === "NOTIFICATIONS"
              ? "h-12 w-12 bg-[#5B96F7] rounded-lg flex items-center justify-center"
              : ""
          }`}
          onClick={() => {
            dispatch(changeDashboardTab({ activeTab: "NOTIFICATIONS" }));
            setPrevTab("NOTIFICATIONS");
          }}
        >
          <IconButton
            sx={{
              color: isLightMode
                ? app.sideBar.activeTab === "NOTIFICATIONS"
                  ? "#fff"
                  : "#080707"
                : "#b1efff",
            }}
          >
            <IoMdNotificationsOutline className="h-7 w-7" />
          </IconButton>
          {notificationsCount > 0 && (
            <div className="text-[11px] cursor-pointer flex items-center justify-center bg-purple-600 h-5 w-5 p-0.5 text-white rounded-full absolute right-0.5 top-0.5">
              {notificationsCount}
            </div>
          )}
        </div>
      </div>
      <div className="relative flex flex-col w-full items-center">
        <div className="flex items-center">
          {isLightMode ? (
            <MdDarkMode className="h-6 w-6 text-gray-800" />
          ) : (
            <CiLight className="h-6 w-6 text-white font-bold" />
          )}
          <Switch
            {...label}
            defaultChecked
            onChange={() => setIsLightMode(!isLightMode)}
          />
        </div>
        <IconButton
          sx={{ width: 70, height: 70, mt: 3 }}
          onClick={handleProfileContextMenu}
        >
          <Avatar
            sx={{ width: 60, height: 60 }}
            src={
              auth.userInfo?.profile_image
                ? auth.userInfo?.profile_image.startsWith("image_")
                  ? `${process.env.REACT_APP_API_URL}/images/${auth.userInfo?.profile_image}`
                  : auth.userInfo?.profile_image
                : null
            }
            alt="profile"
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          />
        </IconButton>
        {open && (
          <ProfileContextMenu
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            open={open}
            type="profile"
          />
        )}
      </div>
    </div>
  );
};

export default SideBar;
