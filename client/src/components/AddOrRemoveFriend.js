import React, { useContext, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { AppContext } from "../context/AppContext";
import { Avatar, IconButton } from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentGroupChat } from "../redux/authSlice";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddOrRemoveFriend = ({
  open,
  setOpen,
  type,
  members,
  alreadyMembers,
  setMembers,
}) => {
  const { isLightMode } = useContext(AppContext);
  const dispatch = useDispatch();

  const [selectedMembers, setSelectedMembers] = useState([]);

  const auth = useSelector((state) => state.auth);

  const handleClose = () => {
    setOpen(false);
  };

  const updateGroupMembers = async (updatedMembersIds, updatedMembers) => {
    const url = `${process.env.REACT_APP_API_URL}/group/add-or-remove-friends`;
    const reqData = {
      groupId: auth.currentGroupChat.group_id,
      members: updatedMembersIds,
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
    if (data.status) {
      dispatch(
        setCurrentGroupChat({
          currentGroupChat: {
            ...auth.currentGroupChat,
            members: JSON.stringify(updatedMembersIds),
          },
        })
      );
      if (type === "ADD") {
        setMembers((prev) => [...prev, ...selectedMembers]);
      } else {
        setMembers(updatedMembers);
      }
      setSelectedMembers([]);
      toast.success("Group members updated successfully");
    } else {
      toast.error(data.msg);
    }
  };

  const handleUpdateMembers = () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
    } else {
      let updatedMembersIds = [];
      let updatedMembers = [];
      if (type === "ADD") {
        updatedMembersIds = [
          ...JSON.parse(auth.currentGroupChat.members),
          ...selectedMembers.map((user) => user.user_id),
        ];
      } else {
        const selMembers = selectedMembers.map((user) => user.user_id);
        members.forEach((user) => {
          if (!selMembers.includes(user.user_id)) {
            updatedMembersIds.push(user.user_id);
            updatedMembers.push(user);
          }
        });
        updatedMembers = [...updatedMembers, auth.userInfo];
      }

      updateGroupMembers(updatedMembersIds, updatedMembers);
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent
          sx={{
            backgroundColor: isLightMode ? "#F0F4FA" : "#171a21",
            color: "#fff",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className={`ml-3 text-md ${
                isLightMode ? "font-semibold text-gray-800" : "text-white"
              }`}
            >
              {type === "ADD"
                ? `Add Friends to ${auth.currentGroupChat.group_name}`
                : `Remove Friends from ${auth.currentGroupChat.group_name}`}
            </span>
            <IconButton onClick={handleClose}>
              <IoCloseCircleOutline
                className={`${isLightMode ? "" : "text-gray-200"}`}
              />
            </IconButton>
          </div>
          {selectedMembers.length > 0 && (
            <ul className="flex items-center my-3 gap-2 flex-wrap max-w-[26vw]">
              {selectedMembers.map((friend) => {
                const handleRemoveFriend = () => {
                  const filterFriends = selectedMembers.filter(
                    (frnd) => friend.user_id !== frnd.user_id
                  );
                  setSelectedMembers(filterFriends);
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
          <ul
            className={`h-[50vh] w-[25vw] overflow-auto mt-5 py-2 rounded-lg ${
              isLightMode
                ? "custom-scrollbar custom-shadow"
                : "dark-custom-scrollbar dark-custom-shadow"
            }`}
          >
            {members.length > 0 ? (
              members.map((user) => {
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
                      {type === "ADD" && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            borderRadius: 4,
                            mr: 2,
                            p: 0,
                          }}
                          color="primary"
                          disabled={
                            alreadyMembers.includes(user.user_id) ||
                            selectedMembers.some(
                              (selUser) => selUser.user_id === user.user_id
                            )
                          }
                          onClick={() => {
                            if (
                              alreadyMembers.length +
                                selectedMembers.length +
                                1 ===
                              10
                            ) {
                              toast.error("Group maximum limit execeded !!!");
                            } else {
                              setSelectedMembers((prev) => [...prev, user]);
                            }
                          }}
                        >
                          Add
                        </Button>
                      )}
                      {type === "REMOVE" && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            borderRadius: 4,
                            mr: 2,
                            p: 0,
                          }}
                          disabled={selectedMembers.some(
                            (selUser) => selUser.user_id === user.user_id
                          )}
                          color="error"
                          onClick={() => {
                            if (
                              members.length + 1 - selectedMembers.length <=
                              3
                            ) {
                              toast.error(
                                "Group have atleast 3 members Or You can delete this group."
                              );
                            } else {
                              setSelectedMembers((prev) => [...prev, user]);
                            }
                          }}
                        >
                          Remove
                        </Button>
                      )}
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
          </ul>
          <div className="mt-4 w-full flex justify-end">
            <Button
              variant="contained"
              size="small"
              sx={{ borderRadius: 4, textTransform: "capitalize" }}
              onClick={handleUpdateMembers}
            >
              Update Group Members
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default AddOrRemoveFriend;
