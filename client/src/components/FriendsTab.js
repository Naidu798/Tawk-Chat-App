import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Skeleton } from "@mui/material";
import { toast } from "react-toastify";
import { BsChatLeftDotsFill } from "react-icons/bs";
import { setFriends } from "../redux/appSlice";
import { setCurrentChatUser } from "../redux/authSlice";
import Badge from "./Badge";

const FriendsTab = ({ close }) => {
  const { isLightMode, toastMessage, socket } = useContext(AppContext);

  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  const onlineUsersIds = Object.keys(chat.onlineUsers);

  const handleRemoveFriend = async (friendId, name) => {
    const url = `${process.env.REACT_APP_API_URL}/remove-friend`;
    const reqData = {
      userId: auth?.userInfo.user_id,
      friendId,
    };
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      const updatedFriends = app.usersType.friends.filter(
        (user) => user.user_id !== friendId
      );
      dispatch(setFriends({ friends: updatedFriends }));

      if (chat.onlineUsers[friendId]) {
        socket.emit("sendRemoveFriend", {
          from: auth.userInfo,
          socketId: chat.onlineUsers[friendId],
        });
      }
      toastMessage("info", `you and ${name} no longer friends now.`);
    } else {
      toast.error(data.msg);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const getFriends = async () => {
      const url = `${process.env.REACT_APP_API_URL}/get-friends/${auth.userInfo.user_id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 200) {
        dispatch(setFriends({ friends: data.friendsDetails }));
        setIsLoading(false);
      } else {
        toast.error(data.msg);
      }
    };
    getFriends();
  }, []);

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
          {app.usersType.friends.length > 0 ? (
            app.usersType.friends.map((user) => {
              return (
                <li
                  key={user.user_id}
                  className={`flex items-center justify-between gap-2 py-2 mx-4 px-2 rounded-lg my-2 ${
                    isLightMode ? "bg-[#fff]" : "bg-[#1e2730]"
                  }`}
                >
                  <div className="flex items-center gap-4 relative">
                    <Avatar
                      sx={{ width: 30, height: 30 }}
                      src={user?.profile_image}
                      alt="profile"
                    />
                    {onlineUsersIds.includes(user.user_id.toString()) && (
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
                      {user.name}
                    </span>
                  </div>
                  <div>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        borderRadius: 4,
                        mr: 2,
                        p: 0,
                      }}
                      color="error"
                      onClick={() =>
                        handleRemoveFriend(user.user_id, user.name)
                      }
                    >
                      Remove
                    </Button>
                    <Button
                      startIcon={<BsChatLeftDotsFill className="h-4 w-4" />}
                      variant="contained"
                      size="small"
                      sx={{ borderRadius: 2, textTransform: "capitalize" }}
                      color="primary"
                      onClick={() => {
                        dispatch(
                          setCurrentChatUser({
                            currentChatUser: {
                              ...user,
                              total_unread_messages: [],
                            },
                          })
                        );
                        close();
                      }}
                    >
                      Chat
                    </Button>
                  </div>
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
                No Friends
              </span>
            </div>
          )}
        </>
      )}
    </ul>
  );
};

export default FriendsTab;
