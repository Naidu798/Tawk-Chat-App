import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Avatar, Box, Button, IconButton, Tab, Tabs } from "@mui/material";
import { useDispatch } from "react-redux";
import { setFriendSidebar } from "../redux/appSlice";
import { FaChevronLeft } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { IoIosArrowForward } from "react-icons/io";

const FriendGroups = ({ createdGroups, joinedGroups }) => {
  const { isLightMode } = useContext(AppContext);

  const [value, setValue] = useState("one");
  const [members, setMembers] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setMembers([]);
  };

  const handleGetGroupUsers = async (admin, members) => {
    const url = `${process.env.REACT_APP_API_URL}/get-group-users/${admin}/${members}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 200) {
      setMembers(data.membersDetails);
    } else {
      toast.error(data.msg);
    }
  };

  const renderCreatedGroups = () => (
    <div className="mt-2">
      {createdGroups.length > 0 ? (
        <ul className="w-full">
          {createdGroups.map((group, groupIndex) => (
            <li>
              <div
                key={group.group_id}
                className={`flex items-center w-full px-3 py-2 rounded-2xl ${
                  isLightMode ? "bg-[#fff]" : "bg-[#1e2730]"
                }`}
              >
                <div className="relative w-[60px] mr-3 h-full">
                  <Avatar
                    sx={{ width: 45, height: 45 }}
                    src={group.logo}
                    alt="logo"
                  />{" "}
                </div>
                <div className="w-full">
                  <div className="flex flex-col items-start">
                    <span
                      className={`text-[16px] pl-2 pb-1 ${
                        isLightMode
                          ? "text-black font-semibold"
                          : "text-white font-normal"
                      }`}
                    >
                      {group.group_name}
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
                      onClick={() => {
                        handleGetGroupUsers(group.admin, group.members);
                        setActiveId(groupIndex);
                      }}
                    >
                      Members
                    </Button>
                  </div>
                </div>
              </div>
              {groupIndex === activeId && members.length > 0 && (
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
                    {group.group_name} Members
                  </span>
                  {members.map((user, i) => (
                    <li>
                      <div
                        key={group.group_id}
                        className={`flex items-center w-full px-3 py-2 rounded-2xl mt-2 ${
                          isLightMode
                            ? "bg-lm-sidebar-background"
                            : "bg-[#1e2724]"
                        }`}
                      >
                        <div className="relative w-[60px] mr-3 h-full">
                          <Avatar
                            sx={{ width: 45, height: 45 }}
                            src={
                              user.profile_image
                                ? user.profile_image.startsWith("image_")
                                  ? `${process.env.REACT_APP_API_URL}/images/${user.profile_image}`
                                  : user.profile_image
                                : null
                            }
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
                              {group.admin === user.user_id && (
                                <span
                                  className={`text-[12px] pl-2 text-lm-blue font-semibold bg-gray-300 rounded-xl pb-0.5 px-2 py-0.5 ml-3`}
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
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-[80vh] w-full flex items-center justify-center">
          <span className={`text-lg ${isLightMode ? "" : "text-white"}`}>
            No Groups
          </span>
        </div>
      )}
    </div>
  );

  const renderJoinedGroups = () => (
    <div className="mt-2">
      {joinedGroups.length > 0 ? (
        <ul className="w-full">
          {joinedGroups.map((group, groupIndex) => (
            <li>
              <div
                key={group.group_id}
                className={`flex items-center w-full px-3 py-2 my-3 rounded-2xl ${
                  isLightMode ? "bg-[#fff]" : "bg-[#1e2730]"
                }`}
              >
                <div className="relative w-[60px] mr-3 h-full">
                  <Avatar
                    sx={{ width: 45, height: 45 }}
                    src={group.logo}
                    alt="logo"
                  />{" "}
                </div>
                <div className="w-full">
                  <div className="flex flex-col items-start">
                    <span
                      className={`text-[16px] pl-2 pb-1 ${
                        isLightMode
                          ? "text-black font-semibold"
                          : "text-white font-normal"
                      }`}
                    >
                      {group.group_name}
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
                      onClick={() => {
                        handleGetGroupUsers(group.admin, group.members);
                        setActiveId(groupIndex);
                      }}
                    >
                      Members
                    </Button>
                  </div>
                </div>
              </div>
              {activeId === groupIndex && members.length > 0 && (
                <ul
                  className={`w-full px-3 py-2 rounded-2xl ${
                    isLightMode
                      ? "bg-lm-sidebar-background custom-shadow"
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
                    {group.group_name} Members
                  </span>
                  {members.map((user, i) => (
                    <li>
                      <div
                        key={group.group_id}
                        className={`flex items-center w-full px-3 py-2 rounded-2xl mt-2 ${
                          isLightMode
                            ? "bg-lm-sidebar-background"
                            : "bg-[#1e2724]"
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
                            <div className="flex items-center">
                              <span
                                className={`text-[16px] max-w-[150px] overflow-hidden pl-2 ${
                                  isLightMode
                                    ? "text-black font-semibold"
                                    : "text-white font-normal"
                                }`}
                              >
                                {user.name}
                              </span>
                              {group.admin === user.user_id && (
                                <span
                                  className={`text-[12px] pl-2 text-lm-blue font-semibold bg-gray-300 rounded-xl pb-0.5 px-2 py-0.5 ml-3`}
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
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-[80vh] w-full flex items-center justify-center">
          <span className={`text-lg ${isLightMode ? "" : "text-white"}`}>
            No Groups
          </span>
        </div>
      )}
    </div>
  );

  const dispatch = useDispatch();

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
            Groups Info
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
            label="Created Groups"
            sx={{
              textTransform: "capitalize",
              fontSize: 16,
              color: isLightMode ? "" : "gray",
              fontWeight: 500,
            }}
          />
          <Tab
            value="two"
            label="Joined Groups"
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
        {value === "one" && renderCreatedGroups()}
        {value === "two" && renderJoinedGroups()}
      </div>
    </div>
  );
};

export default FriendGroups;
