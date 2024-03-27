import React, { useContext, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import { AppContext } from "../context/AppContext";
import ExploreTab from "./ExploreTab";
import FriendsTab from "./FriendsTab";
import RequestsTab from "./RequestsTab";
import { useSelector } from "react-redux";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const NewFriends = ({ setOpen, open }) => {
  const { isLightMode } = useContext(AppContext);

  const app = useSelector((state) => state.app);

  const [value, setValue] = useState("two");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleClose = () => {
    setOpen(false);
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
              className={`ml-3 text-lg ${
                isLightMode ? "font-semibold text-gray-800" : "text-white"
              }`}
            >
              Add Friends
            </span>
            <IconButton onClick={handleClose}>
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
                label="Explore"
                sx={{
                  textTransform: "capitalize",
                  fontSize: 16,
                  color: isLightMode ? "" : "gray",
                  fontWeight: 500,
                }}
              />
              <Tab
                value="two"
                label="Friends"
                sx={{
                  textTransform: "capitalize",
                  fontSize: 16,
                  fontWeight: 500,
                  color: isLightMode ? "" : "gray",
                }}
              />
              <Tab
                value="three"
                label={
                  <div className="flex items-center">
                    <span>Requests</span>
                    {app.usersType.friendRequests.length > 0 && (
                      <span className="bg-lm-blue text-sm text-white h-5 w-5 flex justify-center items-center rounded-full ml-1">
                        {app.usersType.friendRequests.length}
                      </span>
                    )}
                  </div>
                }
                sx={{
                  textTransform: "capitalize",
                  fontSize: 16,
                  fontWeight: 500,
                  color: isLightMode ? "" : "gray",
                }}
              />
            </Tabs>
          </Box>
          {value === "one" && <ExploreTab />}
          {value === "two" && <FriendsTab close={handleClose} />}
          {value === "three" && <RequestsTab />}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default NewFriends;
