import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Skeleton } from "@mui/material";
import { setAllUsers } from "../redux/appSlice";
import { toast } from "react-toastify";
import Badge from "./Badge";

const ExploreTab = () => {
  const {
    isLightMode,
    toastMessage,
    sentRequests,
    setSentRequests,
    requestsList,
    setRequestsList,
    socket,
  } = useContext(AppContext);

  const [friendsList, setFriendsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  useEffect(() => {
    if (auth.userInfo) {
      const getAllUsers = async () => {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_API_URL}/get-users/${auth.userInfo.user_id}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 200) {
          setRequestsList(data.requestsDetails);
          setFriendsList(data.friendsDetails);
          setSentRequests(data.sentRequestsDetails);
          dispatch(setAllUsers({ totalUsers: data.users }));
          setIsLoading(false);
        } else {
          toast.error(data.msg);
        }
      };
      getAllUsers();
    }
  }, []);

  const handleSendRequest = async (id) => {
    const url = `${process.env.REACT_APP_API_URL}/send-friend-request`;
    const reqData = {
      from: auth.userInfo.user_id,
      to: id,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      setSentRequests([...sentRequests, id]);
      const requestDetails = {
        requestId: data.requestId,
        senderId: auth.userInfo.user_id,
        senderName: auth.userInfo.name,
        senderProfileImage: auth.userInfo.profile_image,
        about: auth.userInfo.about,
        phone: auth.userInfo.phone,
        email: auth.userInfo.email,
      };
      if (chat.onlineUsers[id]) {
        socket.emit("sendFriendRequest", {
          requestDetails,
          socketId: chat.onlineUsers[id],
        });
      }

      toastMessage("success", data.msg);
    } else {
      toastMessage("error", data.msg);
    }
  };

  const onlineUsersIds = Object.keys(chat.onlineUsers);

  return (
    <ul
      className={`h-[50vh] w-[25vw] overflow-auto mt-5 py-2 rounded-lg ${
        isLightMode
          ? "custom-scrollbar custom-shadow"
          : "dark-custom-scrollbar dark-custom-shadow"
      }`}
    >
      {isLoading ? (
        <>
          <div className="self-start ml-3 mt-2">
            <Skeleton
              height={70}
              width={360}
              sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
            />
            <Skeleton
              height={70}
              width={360}
              sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
            />
            <Skeleton
              height={70}
              width={360}
              sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
            />
            <Skeleton
              height={70}
              width={360}
              sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
            />
            <Skeleton
              height={70}
              width={360}
              sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
            />
            <Skeleton
              height={70}
              width={360}
              sx={{ mt: -2, bgcolor: isLightMode ? "" : "grey.800" }}
            />
          </div>
        </>
      ) : (
        <>
          {app.usersType.allUsers.length > 0 ? (
            app.usersType.allUsers.map((user) => {
              return (
                <li
                  key={user?.user_id}
                  className={`flex items-center justify-between gap-2 py-2 mx-4 px-2 rounded-lg my-2 ${
                    isLightMode ? "bg-[#fff]" : "bg-[#1e2730]"
                  }`}
                >
                  <div className="flex items-center gap-2 relative">
                    <Avatar
                      sx={{ width: 30, height: 30 }}
                      src={user?.profile_image}
                      alt="profile"
                    />
                    {onlineUsersIds.includes(user.user_id) && (
                      <div className="absolute bottom-0 left-6">
                        <Badge />
                      </div>
                    )}
                    <span
                      className={`text-[16px] ${
                        isLightMode
                          ? "text-gray-700 font-bold"
                          : "text-[#ecf2f8]"
                      }`}
                    >
                      {user?.name}
                    </span>
                  </div>
                  {friendsList.includes(user.user_id) ? (
                    <span className="text-lm-blue text-sm mr-2">
                      Already a friend
                    </span>
                  ) : requestsList.includes(user.user_id) ? (
                    <span className="text-lm-blue text-sm mr-2">
                      Received a request
                    </span>
                  ) : sentRequests.includes(user.user_id) ? (
                    <span className="text-lm-blue text-sm mr-2">
                      Request Sent
                    </span>
                  ) : (
                    <Button
                      sx={{ textTransform: "capitalize", borderRadius: 3 }}
                      onClick={() => handleSendRequest(user.user_id)}
                      variant="outlined"
                      size="small"
                    >
                      Send Request
                    </Button>
                  )}
                </li>
              );
            })
          ) : (
            <div className="h-[45vh] w-[25vw] flex justify-center items-center">
              <span
                className={`ml-3 text-lg tracking-wider ${
                  isLightMode ? "font-semibold text-gray-700" : "text-white"
                }`}
              >
                No Users Found
              </span>
            </div>
          )}
        </>
      )}
    </ul>
  );
};

export default ExploreTab;
