import { Menu, MenuItem } from "@mui/material";
import React, { useContext, useRef } from "react";
import { VscAccount } from "react-icons/vsc";
import { LuUser } from "react-icons/lu";
import { CiLogout } from "react-icons/ci";
import { MdDriveFolderUpload } from "react-icons/md";
import { VscFolderLibrary } from "react-icons/vsc";
import { FcRemoveImage } from "react-icons/fc";
import { changeDashboardTab } from "../redux/appSlice";
import { useDispatch } from "react-redux";
import { AppContext } from "../context/AppContext";

const ProfileContextMenu = ({
  anchorEl,
  setAnchorEl,
  open,
  type,
  setProfileImgFile,
  setImageUrl,
  setLogoImgFile,
}) => {
  const { setShowAvatarsLibrary } = useContext(AppContext);

  const dispatch = useDispatch();
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    setAnchorEl(null);
    dispatch(changeDashboardTab({ activeTab: "PROFILE" }));
  };

  const handleSelectImage = (e) => {
    if (type === "image") {
      setProfileImgFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    } else {
      setLogoImgFile(e.target.files[0]);
    }

    handleClose();
  };

  const imgRef = useRef();

  return (
    <div>
      {type === "image" ? (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem
            onClick={() => {
              imgRef.current.click();
            }}
            sx={{
              direction: "row",
              alignItems: "center",
              fontSize: 15,
            }}
          >
            <MdDriveFolderUpload className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Upload Photo
            <input
              type="file"
              ref={imgRef}
              className="hidden"
              onChange={handleSelectImage}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setShowAvatarsLibrary(true);
              handleClose();
            }}
            sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
          >
            <VscFolderLibrary className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Choose from library
          </MenuItem>
          <MenuItem
            onClick={() => {
              setProfileImgFile(null);
              setImageUrl(null);
              handleClose();
            }}
            sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
          >
            <FcRemoveImage className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Remove Photo
          </MenuItem>
        </Menu>
      ) : type === "groupLogo" ? (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem
            onClick={() => {
              imgRef.current.click();
            }}
            sx={{
              direction: "row",
              alignItems: "center",
              fontSize: 15,
            }}
          >
            <MdDriveFolderUpload className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Upload Photo
            <input
              type="file"
              ref={imgRef}
              className="hidden"
              onChange={handleSelectImage}
            />
          </MenuItem>
          {/* <MenuItem
            onClick={handleClose}
            sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
          >
            <VscFolderLibrary className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Choose from library
          </MenuItem> */}
          <MenuItem
            onClick={() => {
              setLogoImgFile(null);
              handleClose();
            }}
            sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
          >
            <FcRemoveImage className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Remove Photo
          </MenuItem>
        </Menu>
      ) : (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem
            onClick={handleProfile}
            sx={{
              direction: "row",
              alignItems: "center",
              fontSize: 15,
            }}
          >
            <LuUser className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Profile
          </MenuItem>
          <MenuItem
            onClick={handleClose}
            sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
          >
            <VscAccount className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            My Account
          </MenuItem>
          <MenuItem
            onClick={handleClose}
            sx={{ direction: "row", alignItems: "center", fontSize: 15 }}
          >
            <CiLogout className="mr-3 h-5 w-5 text-lm-blue font-bold" />
            Logout
          </MenuItem>
        </Menu>
      )}
    </div>
  );
};

export default ProfileContextMenu;
