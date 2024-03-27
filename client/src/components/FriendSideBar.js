import React, { useContext, useEffect, useState } from "react";
import { Avatar, Button, IconButton } from "@mui/material";

import { IoCloseCircleOutline } from "react-icons/io5";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { LuPhone } from "react-icons/lu";
import { IoIosArrowForward } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { ImBlocked } from "react-icons/im";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RiUserAddLine } from "react-icons/ri";
import { MdOutlinePersonRemove } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { setCallTypes, setFriendSidebar } from "../redux/appSlice";
import BlockAndDeleteDailog from "./BlockAndDeleteDailog";
import FriendMedia from "./FriendMedia";
import FriendGroups from "./FriendGroups";
import { toast } from "react-toastify";
import SearchMessages from "./SearchMessages";
import AddOrRemoveFriend from "./AddOrRemoveFriend";
import WarningDailog from "./WarningDailog";
import { setCurrentGroupChat } from "../redux/authSlice";
import { setJoinedGroupChats, setMyGroupChats } from "../redux/chatSlice";

const FriendSideBar = () => {
  const { isLightMode, messages, socket } = useContext(AppContext);

  const [blockOpen, setBlockOpen] = useState(false);
  const [unblockOpen, setUnblockOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [links, setLinks] = useState([]);
  const [audios, setAudios] = useState([]);
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);

  const [members, setMembers] = useState([]);
  const [addOrRemoveFriendOpen, setAddOrRemoveFriendOpen] = useState({
    open: false,
    type: null,
  });
  const [deleteGroupDailogOpen, setDeleteGroupDailogOpen] = useState(false);

  const auth = useSelector((state) => state.auth);
  const app = useSelector((state) => state.app);
  const chat = useSelector((state) => state.chat);

  const dispatch = useDispatch();

  const handleVideoCall = () => {
    const videoCall = {
      from: auth.userInfo,
      to: auth.currentChatUser,
      callType: "Video call",
      mode: "outgoing",
      status: null,
      friendSocket: chat.onlineUsers[auth.currentChatUser?.user_id],
    };
    dispatch(setCallTypes({ ...app.callTypes, videoCall }));
    if (chat.onlineUsers[auth.currentChatUser?.user_id]) {
      socket.emit("outgoingVideoCall", videoCall);
    }
  };

  const handleVoiceCall = () => {
    const voiceCall = {
      from: auth.userInfo,
      to: auth.currentChatUser,
      callType: "Voice call",
      mode: "outgoing",
      status: null,
      friendSocket: chat.onlineUsers[auth.currentChatUser?.user_id],
    };
    dispatch(setCallTypes({ ...app.callTypes, voiceCall }));
    if (chat.onlineUsers[auth.currentChatUser?.user_id]) {
      socket.emit("outgoingVoiceCall", voiceCall);
    }
  };

  const handleGetGroupUsers = async () => {
    if (!auth.currentGroupChat) return;
    const url = `${process.env.REACT_APP_API_URL}/get-group-users/${auth.currentGroupChat.admin}/${auth.currentGroupChat.members}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 200) {
      setMembers(data.membersDetails);
    } else {
      toast.error(data.msg);
    }
  };

  const handleLeaveAndDeleteGroup = async () => {
    if (
      JSON.parse(auth.currentGroupChat?.members).includes(auth.userInfo.user_id)
    ) {
      toast.warning("If you want to delete this group leave first.");
    } else {
      const updatedGroupChats = chat.joinedGroupChats.filter(
        (group) => group.groupId !== auth.currentGroupChat.group_id
      );

      dispatch(setCurrentGroupChat({ currentGroupChat: null }));
      dispatch(setFriendSidebar({ open: false, type: null }));
      dispatch(setJoinedGroupChats({ joinedGroupChats: updatedGroupChats }));

      toast.success(`${auth.currentGroupChat?.group_name} group deleted`);
    }
  };

  const getMembers = () => {
    if (addOrRemoveFriendOpen.type === "ADD") {
      return app.usersType.friends;
    } else {
      return members.filter((user) => user.user_id !== auth.userInfo.user_id);
    }
  };

  const getReqData = () => {
    let messageIds = [];
    let images = [];
    messages.forEach((msg) => {
      if (msg.messageType === "image") {
        images.push(msg.message);
      }
      messageIds.push(msg.messageId);
    });
    return { groupId: auth.currentGroupChat.group_id, messageIds, images };
  };

  const handleGroupDelete = async () => {
    const url = `${process.env.REACT_APP_API_URL}/group/delete-group`;
    const reqData = getReqData();
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.status === 200) {
      const updatedGroupChats = chat.myGroupChats.filter(
        (group) => group.groupId !== auth.currentGroupChat.group_id
      );

      dispatch(setCurrentGroupChat({ currentGroupChat: null }));
      dispatch(setFriendSidebar({ open: false, type: null }));
      dispatch(setMyGroupChats({ myGroupChats: updatedGroupChats }));

      setDeleteGroupDailogOpen(false);
      toast.success("Group Deleted Successful");
    } else {
      toast.error(data.msg);
    }
  };

  const renderGroupButtons = () => {
    return (
      <div className="mt-5">
        <div className="flex justify-center mb-5">
          <div className="flex items-center gap-4">
            <Button
              size="small"
              variant="outlined"
              startIcon={<RiUserAddLine />}
              onClick={() =>
                setAddOrRemoveFriendOpen({ open: true, type: "ADD" })
              }
              sx={{
                fontWeight: 600,

                borderRadius: 4,
              }}
            >
              Add
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<MdOutlinePersonRemove />}
              onClick={() =>
                setAddOrRemoveFriendOpen({ open: true, type: "REMOVE" })
              }
              sx={{
                fontWeight: 600,

                borderRadius: 4,
              }}
            >
              Remove
            </Button>
          </div>
        </div>
        <hr
          className={`h-[0.1px w-full] ${
            isLightMode ? "border-gray-300" : "border-gray-800"
          }`}
        />
        <div className="flex justify-center mt-4 mb-5">
          <Button
            size="medium"
            variant="outlined"
            startIcon={<MdDeleteForever />}
            onClick={() => setDeleteGroupDailogOpen(true)}
            sx={{
              fontWeight: 600,
              textTransform: "capitalize",
              fontSize: 14,
              borderRadius: 4,
            }}
            color="error"
          >
            Delete Group
          </Button>
        </div>

        {addOrRemoveFriendOpen.open && (
          <AddOrRemoveFriend
            open={addOrRemoveFriendOpen}
            setOpen={setAddOrRemoveFriendOpen}
            type={addOrRemoveFriendOpen.type}
            members={getMembers()}
            alreadyMembers={JSON.parse(auth.currentGroupChat.members)}
            setMembers={setMembers}
          />
        )}
        {deleteGroupDailogOpen && (
          <WarningDailog
            open={deleteGroupDailogOpen}
            setOpen={setDeleteGroupDailogOpen}
          >
            <div>
              <p>
                Are you sure you want to delete{" "}
                {auth.currentGroupChat.group_name} ?
              </p>
              <div className="flex items-center gap-4 justify-end mt-5 mr-2">
                <Button
                  variant="outlined"
                  size="small"
                  color="info"
                  sx={{ textTransform: "capitalize", borderRadius: 4 }}
                  onClick={() => setDeleteGroupDailogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  sx={{ textTransform: "capitalize", borderRadius: 4 }}
                  onClick={handleGroupDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </WarningDailog>
        )}
      </div>
    );
  };

  const renderGroupMembers = () => (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          sx={{ width: 55, height: 55 }}
          src={
            auth.currentGroupChat?.logo
              ? auth.currentGroupChat?.logo.startsWith("image_")
                ? `${process.env.REACT_APP_API_URL}/images/${auth.currentGroupChat?.logo}`
                : auth.currentGroupChat?.logo
              : null
          }
          alt="logo"
        />
        <div className="flex flex-col gap-1">
          <span
            className={`text-md ${
              isLightMode ? "font-semibold" : "text-gray-200"
            }`}
          >
            {auth.currentGroupChat?.group_name}
          </span>
          <Button
            endIcon={<IoIosArrowForward className="h-5 w-5" />}
            size="small"
            sx={{
              fontWeight: 600,
              textTransform: "capitalize",
              px: 1,
              py: 0,
              borderRadius: 4,
            }}
            // onClick={() => {
            //   handleGetGroupUsers();
            // }}
          >
            {members.length} Members
          </Button>
        </div>
      </div>
      {members.length > 0 && (
        <ul
          className={`w-full px-3 py-2 rounded-2xl ${
            isLightMode
              ? "custom-shadow bg-lm-sidebar-background"
              : "bg-[#1e2724] dark-custom-shadow"
          }`}
        >
          <span
            className={`text-[14px] pl-2 pb-1 ${
              isLightMode
                ? "text-gray-800 font-semibold"
                : "text-white font-normal"
            }`}
          >
            Members
          </span>
          {members.map((user, i) => (
            <li>
              <div
                key={app.currentGroupChat?.group_id}
                className={`flex items-center w-full px-2 py-2 rounded-2xl mt-2 ${
                  isLightMode ? "bg-lm-sidebar-background" : "bg-[#1e2724]"
                }`}
              >
                <div className="relative w-[60px] mr-3 h-full">
                  <Avatar
                    sx={{ width: 45, height: 45 }}
                    src={user.profile_image}
                    alt="profile"
                  />{" "}
                </div>
                <div className="w-full">
                  <div className="flex flex-col">
                    <div className="w-full flex items-center">
                      <p
                        className={`max-w-[150px] text-[16px] pl-2 overflow-hidden ${
                          isLightMode
                            ? "text-black font-semibold"
                            : "text-white font-normal"
                        }`}
                      >
                        {user.name}
                      </p>
                      {auth.currentGroupChat?.admin === user.user_id && (
                        <span
                          className={`text-[12px] text-lm-blue font-semibold bg-gray-300 rounded-xl px-2 pb-0.5 py-0.5 ml-3`}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                    <p
                      className={`max-w-[200px] overflow-hidden text-[14px] pl-2 pb-1 ${
                        isLightMode
                          ? "text-gray-600"
                          : "text-white font-normal opacity-50"
                      }`}
                    >
                      {user?.about ? user.about : "No About"}
                    </p>
                  </div>
                </div>
              </div>
              {i !== members.length - 1 && (
                <hr
                  className={`h-[0.1px w-full] ${
                    isLightMode ? "border-gray-300" : "border-gray-700"
                  }`}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderFriendSidebar = () => (
    <div
      className={`h-full w-full ${
        isLightMode
          ? "custom-shadow bg-lm-chat-bg"
          : "dark-custom-shadow bg-[#171a21]"
      }`}
    >
      <div className="h-[10vh] custom-shadow flex items-center pl-3">
        <IconButton
          onClick={() =>
            dispatch(setFriendSidebar({ open: false, type: null }))
          }
        >
          <IoCloseCircleOutline
            className={`${isLightMode ? "" : "text-gray-200"}`}
          />
        </IconButton>
        {app.isGroupsActive ? (
          <span
            className={`ml-3 text-lg ${
              isLightMode ? "font-semibold" : "text-white"
            }`}
          >
            Group Info
          </span>
        ) : (
          <span
            className={`ml-3 text-lg ${
              isLightMode ? "font-semibold" : "text-white"
            }`}
          >
            Friend Info
          </span>
        )}
      </div>
      <div
        className={`pt-6 pb-2 px-5 overflow-auto h-[90vh] ${
          isLightMode ? "custom-scrollbar" : "dark-custom-scrollbar"
        }`}
      >
        {app.isGroupsActive ? (
          renderGroupMembers()
        ) : (
          <div className="flex items-center gap-3">
            <Avatar
              sx={{ width: 55, height: 55 }}
              src={
                auth.currentChatUser?.profile_image
                  ? auth.currentChatUser?.profile_image.startsWith("image_")
                    ? `${process.env.REACT_APP_API_URL}/images/${auth.currentChatUser?.profile_image}`
                    : auth.currentChatUser?.profile_image
                  : null
              }
              alt="profile"
            />
            <div className="flex flex-col gap-1">
              <span
                className={`text-md ${
                  isLightMode ? "font-semibold" : "text-gray-200"
                }`}
              >
                {auth.currentChatUser?.name}
              </span>
              <span
                className={`${
                  isLightMode
                    ? "text-gray-600 text-sm"
                    : "text-gray-400 text-sm"
                }`}
              >
                {auth.currentChatUser?.phone
                  ? "+91 " + auth.currentChatUser?.phone
                  : "Phone not available"}
              </span>
            </div>
          </div>
        )}
        {!app.isGroupsActive && (
          <div className="flex items-center justify-center gap-8 mt-3 mb-4">
            <div className="flex flex-col">
              <IconButton onClick={handleVideoCall}>
                <HiOutlineVideoCamera
                  className={`h-5 w-5 ${isLightMode ? "" : "text-gray-400"}`}
                />
              </IconButton>
              <span className={`text-sm ${isLightMode ? "" : "text-gray-400"}`}>
                Video
              </span>
            </div>
            <div className="flex flex-col">
              <IconButton onClick={handleVoiceCall}>
                <LuPhone
                  className={`h-4 w-4 ${isLightMode ? "" : "text-gray-400"}`}
                />
              </IconButton>
              <span className={`text-sm ${isLightMode ? "" : "text-gray-400"}`}>
                Audio
              </span>
            </div>
          </div>
        )}
        <hr
          className={`h-[0.1px w-full] ${
            isLightMode ? "border-gray-300" : "border-gray-800"
          }`}
        />
        {!app.isGroupsActive && (
          <div className="py-4">
            <span
              className={`text-sm ${isLightMode ? "font-bold" : "text-white"}`}
            >
              About
            </span>

            <p
              className={`text-sm ml-2 mt-1 ${
                isLightMode ? "text-black font-medium" : "text-gray-400"
              }`}
            >
              {auth.currentChatUser?.about
                ? auth.currentChatUser?.about
                : "About not set"}
            </p>
          </div>
        )}
        {!app.isGroupsActive && (
          <hr
            className={`h-[0.1px w-full] ${
              isLightMode ? "border-gray-300" : "border-gray-800"
            }`}
          />
        )}
        <div className="py-2 mb-4">
          <div className="flex items-center justify-between">
            <span
              className={`text-sm ${
                isLightMode ? "font-semibold" : "text-white"
              }`}
            >
              Media, Links and Audios
            </span>
            <div>
              <IconButton
                onClick={() =>
                  dispatch(setFriendSidebar({ open: true, type: "MEDIA" }))
                }
                sx={{ color: "blue", fontSize: 15, fontWeight: 600 }}
              >
                <span>{photos.length + links.length + audios.length}</span>
                <IoIosArrowForward className="text-xl" />
              </IconButton>
            </div>
          </div>
          <div className="flex items-center gap-6  px-4 mt-2">
            {photos.length === 0 && (
              <div className="w-full flex items-center justify-center">
                <span
                  className={`text-sm ${isLightMode ? "" : "text-gray-400"}`}
                >
                  No Media Found
                </span>
              </div>
            )}
            {photos.length > 0 && (
              <img
                src={`${process.env.REACT_APP_API_URL}/images/${photos[0].message}`}
                alt="media"
                className="h-16 w-16 rounded-md"
              />
            )}
            {photos.length > 1 && (
              <img
                src={`${process.env.REACT_APP_API_URL}/images/${photos[1].message}`}
                alt="media"
                className="h-16 w-16 rounded-md"
              />
            )}
            {photos.length > 2 && (
              <img
                src={`${process.env.REACT_APP_API_URL}/images/${photos[2].message}`}
                alt="media"
                className="h-16 w-16 rounded-md"
              />
            )}
          </div>
        </div>
        <hr
          className={`h-[0.1px w-full] ${
            isLightMode ? "border-gray-300" : "border-gray-800"
          }`}
        />

        {!app.isGroupsActive && (
          <hr
            className={`h-[0.1px w-full] ${
              isLightMode ? "border-gray-300" : "border-gray-800"
            }`}
          />
        )}
        {!app.isGroupsActive && (
          <div className="mt-2 mb-3">
            <div className="flex items-center justify-between">
              <span
                className={`text-[16px] ${
                  isLightMode ? "text-black font-semibold" : "text-white"
                }`}
              >
                Groups Info
              </span>
              <IconButton
                onClick={() =>
                  dispatch(
                    setFriendSidebar({ open: true, type: "GROUPS_INFO" })
                  )
                }
                sx={{ color: "blue", fontSize: 15, fontWeight: 600 }}
              >
                <span>{createdGroups.length + joinedGroups.length}</span>
                <IoIosArrowForward className="text-xl" />
              </IconButton>
            </div>
            {createdGroups.length > 0 || joinedGroups.length > 0 ? (
              <div className="flex items-center gap-3 mt-2">
                <Avatar
                  src={
                    createdGroups.length > 0
                      ? createdGroups[0].logo
                      : joinedGroups[0].logo
                  }
                  alt="group logo"
                  className="h-12 w-12 rounded-full"
                />
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-[15px] ${
                      isLightMode
                        ? "text-gray-900 font-semibold"
                        : "text-gray-300"
                    }`}
                  >
                    {createdGroups.length > 0
                      ? createdGroups[0].group_name
                      : joinedGroups[0].group_name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center my-2">
                <span
                  className={`text-sm ${isLightMode ? "" : "text-gray-400"}`}
                >
                  No Groups Found
                </span>
              </div>
            )}
          </div>
        )}
        <hr
          className={`h-[0.1px w-full] ${
            isLightMode ? "border-gray-300" : "border-gray-800"
          }`}
        />
        {app.isGroupsActive ? (
          auth.userInfo.user_id === auth.currentGroupChat.admin ? (
            renderGroupButtons()
          ) : (
            <div className="flex justify-center mt-4 mb-5">
              <Button
                size="medium"
                variant="outlined"
                startIcon={<MdDeleteForever />}
                onClick={handleLeaveAndDeleteGroup}
                sx={{
                  fontWeight: 600,
                  textTransform: "capitalize",
                  fontSize: 14,
                  borderRadius: 4,
                }}
                color="error"
              >
                Delete Group
              </Button>
            </div>
          )
        ) : (
          <div className="flex h-[15vh] items-center justify-center gap-6">
            {chat.blockedUsers.includes(auth?.currentChatUser.user_id) ? (
              <Button
                size="medium"
                variant="outlined"
                startIcon={<ImBlocked />}
                onClick={() => setUnblockOpen(true)}
                sx={{ fontWeight: 600, borderRadius: 4, px: 2 }}
              >
                Unblock
              </Button>
            ) : (
              <Button
                size="medium"
                variant="outlined"
                startIcon={<ImBlocked />}
                onClick={() => setBlockOpen(true)}
                sx={{ fontWeight: 600, borderRadius: 4, px: 2 }}
              >
                Block
              </Button>
            )}

            <Button
              size="medium"
              variant="outlined"
              color="error"
              startIcon={<RiDeleteBin6Line />}
              sx={{ fontWeight: 600, borderRadius: 4, px: 2 }}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {blockOpen && (
        <BlockAndDeleteDailog
          open={blockOpen}
          setOpen={setBlockOpen}
          type={"block"}
        />
      )}
      {deleteOpen && (
        <BlockAndDeleteDailog
          open={deleteOpen}
          setOpen={setDeleteOpen}
          type={"delete"}
        />
      )}
      {unblockOpen && (
        <BlockAndDeleteDailog
          open={unblockOpen}
          setOpen={setUnblockOpen}
          type={"unblock"}
        />
      )}
    </div>
  );

  const getCurrentFriendSidebarTab = () => {
    switch (app.friendSidebar.type) {
      case "INFO":
        return renderFriendSidebar();
      case "MEDIA":
        return <FriendMedia photos={photos} links={links} audios={audios} />;
      case "GROUPS_INFO":
        return (
          <FriendGroups
            createdGroups={createdGroups}
            joinedGroups={joinedGroups}
          />
        );
      case "SEARCH_MESSAGES":
        return <SearchMessages />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!auth.currentChatUser?.user_id) return;
    const getGroups = async () => {
      const url = `${process.env.REACT_APP_API_URL}/get-joined-groups/${auth.currentChatUser.user_id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 200) {
        setCreatedGroups(data.createdGroups);
        setJoinedGroups(data.joinedGroups);
      } else {
        toast.error(data.msg);
      }
    };
    getGroups();
  }, []);

  useEffect(() => {
    const getMediaInfo = () => {
      let totalPhotos = [];
      let totalLinks = [];
      let totalAudios = [];

      let type;
      if (app.isGroupsActive) {
        type = "messageType";
      } else {
        type = "type";
      }
      messages.forEach((msg) => {
        switch (msg[type]) {
          case "image":
            totalPhotos.push(msg);
            break;
          case "url":
            totalLinks.push(msg);
            break;
          case "audio":
            totalAudios.push(msg);
            break;
          default:
            break;
        }
      });
      setPhotos(totalPhotos);
      setLinks(totalLinks);
      setAudios(totalAudios);
    };
    getMediaInfo();
  }, []);

  useEffect(() => {
    if (app.isGroupsActive) {
      handleGetGroupUsers();
    }
  }, []);

  return getCurrentFriendSidebarTab();
};

export default FriendSideBar;
