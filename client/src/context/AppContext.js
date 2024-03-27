import React, { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {
  const [isLightMode, setIsLightMode] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [dateWiseMessages, setDateWiseMessages] = useState({});

  const [toastMessageAlert, setToastMessageAlert] = useState(null);
  const [newFriendDailogOpen, setNewFriendDailogOpen] = useState(false);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showAvatarsLibrary, setShowAvatarsLibrary] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [sentRequests, setSentRequests] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [latestCall, setLatestCall] = useState();

  const [notifications, setNotifications] = useState([]);
  const [chatUserBlockedUsers, setChatUserBlockedUsers] = useState([]);
  const [prevTab, setPrevTab] = useState("CHAT");

  const toastMessage = (type, msg) => {
    toast[type](msg, {
      position: "bottom-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: isLightMode ? "light" : "dark",
    });
  };

  const topToastMessage = (type, msg) => {
    toast[type](msg, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: isLightMode ? "light" : "dark",
    });
  };

  const getAmPmTime = (inputDateStr) => {
    const inputDate = new Date(inputDateStr);
    const timeFormat = { hour: "numeric", minute: "numeric" };
    const amPmTime = inputDate.toLocaleTimeString("en-US", timeFormat);
    return amPmTime;
  };

  const calculateTime = (inputDateStr) => {
    const inputDate = new Date(inputDateStr);
    const currentDate = new Date();

    const dateFormat = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    if (
      inputDate.getUTCDate() === currentDate.getUTCDate() - 1 &&
      inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
      inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
    ) {
      return "Yesterday";
    } else if (
      Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24) > 1) &&
      Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24) <= 7)
    ) {
      const timeDifference = Math.floor(
        (currentDate - inputDate) / (1000 * 60 * 60 * 24)
      );
      const targetDate = new Date();
      targetDate.setDate(currentDate.getDate() - timeDifference);

      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "WednesDay",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const targetDay = daysOfWeek[targetDate.getDay()];
      return targetDay;
    } else {
      const formattedDate = inputDate.toLocaleDateString("en-GB", dateFormat);
      return formattedDate;
    }
  };

  const getDateWiseMessages = (messages, isGroupsActive) => {
    const currentDate = new Date();
    let dateWiseMessages = {};
    let createdAt;
    if (isGroupsActive) {
      createdAt = "createdAt";
    } else {
      createdAt = "created_at";
    }

    messages.forEach((msg) => {
      const createdDate = new Date(msg[createdAt]);
      let day;
      if (
        currentDate.getDate() === createdDate.getDate() &&
        currentDate.getMonth() === createdDate.getMonth() &&
        currentDate.getFullYear() === createdDate.getFullYear()
      ) {
        day = "Today";
      } else {
        day = calculateTime(msg[createdAt]);
      }

      if (dateWiseMessages[day]) {
        dateWiseMessages[day] = [...dateWiseMessages[day], msg];
      } else {
        dateWiseMessages[day] = [msg];
      }
    });
    setDateWiseMessages(dateWiseMessages);
  };

  return (
    <AppContext.Provider
      value={{
        isLightMode,
        calculateTime,
        getAmPmTime,
        setIsLightMode,
        showEmojiPicker,
        setShowEmojiPicker,
        message,
        setMessage,
        dateWiseMessages,
        setDateWiseMessages,
        getDateWiseMessages,
        toastMessageAlert,
        setToastMessageAlert,
        toastMessage,
        topToastMessage,
        newFriendDailogOpen,
        setNewFriendDailogOpen,
        socket,
        setSocket,
        messages,
        setMessages,
        newGroupDialogOpen,
        setNewGroupDialogOpen,
        setShowAvatarsLibrary,
        showAvatarsLibrary,
        profileImageUrl,
        setProfileImageUrl,
        sentRequests,
        setSentRequests,
        requestsList,
        setRequestsList,
        setLatestCall,
        latestCall,
        notifications,
        setNotifications,
        chatUserBlockedUsers,
        setChatUserBlockedUsers,
        setPrevTab,
        prevTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
