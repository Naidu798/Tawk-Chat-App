import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { AppContext } from "../context/AppContext";
import { Avatar, IconButton, TextField } from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "../redux/appSlice";
import { toast } from "react-toastify";
import { IoIosCamera } from "react-icons/io";
import ProfileContextMenu from "./ProfileContextMenu";
import axios from "axios";
import { setMyGroupChats } from "../redux/chatSlice";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateNewGroup = ({ open, setOpen }) => {
  const { isLightMode, toastMessage } = useContext(AppContext);
  const app = useSelector((state) => state.app);
  const auth = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat);

  const dispatch = useDispatch();

  const [showFriends, setShowFriends] = useState(false);
  const [filteredFriends, setFilteredFriends] = useState(app.usersType.friends);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [logoImgFile, setLogoImgFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const contextMenuOpen = Boolean(anchorEl);
  const handleGroupLogoContextMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChangeSearchKey = (e) => {
    const value = e.target.value;
    if (value) {
      const filterFriends = app.usersType.friends.filter((friend) =>
        friend.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredFriends(filterFriends);
    } else {
      setFilteredFriends(app.usersType.friends);
    }
  };

  const getMembers = () => {
    const friends = selectedFriends.map((friend) => friend.user_id);
    return friends;
  };

  const createGroup = async (reqData) => {
    const url = `${process.env.REACT_APP_API_URL}/group/create-group`;
    setGroupName("");
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
      dispatch(
        setMyGroupChats({ myGroupChats: [...chat.myGroupChats, data.group] })
      );
      toastMessage("success", data.msg);
      setSelectedFriends([]);
      setLogoImgFile(null);
    } else {
      toast.error(data.msg);
    }
  };

  const imageUploadToServer = async () => {
    const url = `${process.env.REACT_APP_API_URL}/image-upload`;
    const formData = new FormData();
    formData.append("image", logoImgFile);
    axios
      .post(url, formData)
      .then((res) => {
        if (res.data.status === 200) {
          const reqData = {
            groupName,
            admin: auth.userInfo.user_id,
            members: getMembers(),
            logo: res.data.fileName,
          };
          createGroup(reqData);
        } else {
          toast.error(res.msg);
        }
      })
      .catch((err) => {
        toast.error("upload image failed");
      });
  };

  const handleSaveGroup = () => {
    if (groupName.length < 3) {
      toast.error("Group Name must have at least 3 letters");
    } else if (selectedFriends.length < 2) {
      toast.info("Group have atleast 2 friends except you");
    } else {
      if (logoImgFile) {
        imageUploadToServer();
      } else {
        const reqData = {
          groupName,
          admin: auth.userInfo.user_id,
          members: getMembers(),
          logo: null,
        };
        createGroup(reqData);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const getFriends = async () => {
      const url = `${process.env.REACT_APP_API_URL}/get-friends/${auth.userInfo.user_id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 200) {
        dispatch(setFriends({ friends: data.friendsDetails }));
        setFilteredFriends(data.friendsDetails);
      } else {
        toast.error(data.msg);
      }
    };
    getFriends();
  }, []);

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        onClick={() => setShowFriends(false)}
      >
        <DialogContent
          sx={{
            backgroundColor: isLightMode ? "#F0F4FA" : "#171a21",
            color: "#fff",
            width: "25vw",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className={`ml-3 text-lg ${
                isLightMode ? "font-semibold text-gray-800" : "text-white"
              }`}
            >
              Create New Group
            </span>
            <IconButton onClick={handleClose}>
              <IoCloseCircleOutline
                className={`${isLightMode ? "" : "text-gray-200"}`}
              />
            </IconButton>
          </div>
          <div className="relative h-full w-full flex justify-center pb-4 mt-5">
            <IconButton onClick={handleGroupLogoContextMenu}>
              <Avatar
                src={logoImgFile ? URL.createObjectURL(logoImgFile) : null}
                alt="logo"
                sx={{ height: 100, width: 100 }}
              />

              <IoIosCamera
                className={`h-7 w-7 absolute bottom-0 right-5 ${
                  isLightMode ? "text-gray-600" : "text-gray-200"
                }`}
              />
            </IconButton>
            {contextMenuOpen && (
              <ProfileContextMenu
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                open={contextMenuOpen}
                type="groupLogo"
                setLogoImgFile={setLogoImgFile}
              />
            )}
          </div>
          <div>
            <TextField
              label="Name"
              variant="outlined"
              helperText="Group name required"
              sx={{ width: "100%", my: 2 }}
              size="small"
              value={groupName}
              required
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                className="h-10 w-full text-md px-2 text-gray-900 rounded-lg outline-2 outline-lm-blue border border-gray-500 bg-transparent"
                placeholder="Search Friends"
                onChange={handleChangeSearchKey}
                onFocus={() => setShowFriends(true)}
              />
              {selectedFriends.length > 0 && (
                <ul className="flex items-center my-3 gap-2 flex-wrap">
                  {selectedFriends.map((friend) => {
                    const handleRemoveFriend = () => {
                      const filterFriends = selectedFriends.filter(
                        (frnd) => friend.user_id !== frnd.user_id
                      );
                      setSelectedFriends(filterFriends);
                    };
                    return (
                      <li className="flex items-center gap-1 bg-purple-500  pl-2 rounded-md">
                        <span className="text-sm">{friend.name}</span>
                        <IconButton onClick={handleRemoveFriend}>
                          <RxCross2 className="text-sm text-gray-100" />
                        </IconButton>
                      </li>
                    );
                  })}
                </ul>
              )}
              {showFriends && (
                <ul
                  className={`bg-white rounded-lg h-[25vh] overflow-auto ${
                    isLightMode
                      ? "custom-shadow custom-scrollbar"
                      : "dark-custom-scrollbar dark-custom-shadow"
                  } py-1 px-2`}
                >
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => {
                      const handleClickFriends = () => {
                        const isSelected = selectedFriends.some(
                          (selFriend) => selFriend.user_id === friend.user_id
                        );
                        if (isSelected) {
                          toast.error("Friend Already Selected");
                        } else {
                          setSelectedFriends([...selectedFriends, friend]);
                        }
                      };

                      const isSelected = selectedFriends.some(
                        (selFriend) => selFriend.user_id === friend.user_id
                      );

                      return (
                        <Button
                          sx={{
                            width: "100%",
                            textTransform: "none",
                            padding: 0,
                            mt: 0.5,
                            mb: 0.5,
                            display: "flex",
                            justifyContent: "flex-start",
                          }}
                          onClick={handleClickFriends}
                        >
                          <li className="flex items-center w-full gap-2 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded-lg">
                            <Avatar
                              sx={{ width: 30, height: 30 }}
                              src={friend.profile_image}
                              alt="profile"
                            />
                            <span
                              className={`cursor-pointer text-[15px] text-black ${
                                isSelected && "font-semibold"
                              }`}
                            >
                              {friend.name}
                            </span>
                          </li>
                        </Button>
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex justify-center items-center">
                      <span>No Friends Found</span>
                    </div>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="w-full text-end">
            <Button
              onClick={handleSaveGroup}
              sx={{ textTransform: "capitalize", mt: 3 }}
              variant="contained"
              size="small"
              disabled={showFriends ? true : false}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateNewGroup;
