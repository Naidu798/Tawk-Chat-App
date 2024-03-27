import React, { useContext, useEffect, useState } from "react";
import { Avatar, Button, IconButton, TextField } from "@mui/material";
import { FaChevronLeft } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { IoIosCamera } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import ProfileContextMenu from "./ProfileContextMenu";
import { toast } from "react-toastify";
import { setUserInfo } from "../redux/authSlice";
import { changeDashboardTab } from "../redux/appSlice";
import Cookies from "js-cookie";

const ProfilePage = () => {
  const {
    isLightMode,
    toastMessage,
    profileImageUrl,
    setProfileImageUrl,
    prevTab,
  } = useContext(AppContext);

  const auth = useSelector((state) => state.auth);

  const [focus, setFocus] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("+91");
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileImgFile, setProfileImgFile] = useState(null);

  const open = Boolean(anchorEl);
  const handleProfileImageContextMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const dispatch = useDispatch();

  const isPhoneDigits = () => {
    const reqPhone = phone.slice(1, phone.length);
    Array.from(reqPhone).forEach((char) => {
      if (isNaN(char)) {
        return false;
      }
    });
    return true;
  };

  const updateProfile = async (reqData) => {
    const url = `${process.env.REACT_APP_API_URL}/auth/update-profile`;
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
      setProfileImgFile(null);
      const updatedUserInfo = {
        user_id: auth.userInfo.user_id,
        name,
        email: auth.userInfo.email,
        profile_image: profileImageUrl,
        about,
        phone,
      };
      dispatch(setUserInfo({ userInfo: updatedUserInfo }));
      toastMessage("success", data.msg);
    } else {
      toast.error(data.msg);
    }
  };

  const imageUploadToServer = async () => {
    const url = `${process.env.REACT_APP_API_URL}/image-upload`;
    const formData = new FormData();
    formData.append("image", profileImgFile);
    axios
      .post(url, formData)
      .then((res) => {
        if (res.data.status === 200) {
          const reqData = {
            userId: auth.userInfo.user_id,
            profileImage: res.data.fileName,
            about,
            name,
            phone: phone.length > 3 ? phone.slice(3, phone.length) : null,
          };
          updateProfile(reqData);
        } else {
          toast.error(res.msg);
        }
      })
      .catch((err) => {
        toast.error("upload image failed");
      });
  };

  const uodateData = () => {
    if (profileImgFile) {
      imageUploadToServer();
    } else {
      const reqData = {
        userId: auth.userInfo.user_id,
        profileImage: profileImageUrl,
        about,
        name,
        phone: phone.length > 3 ? phone.slice(3, phone.length) : null,
      };
      updateProfile(reqData);
    }
  };

  const saveProfile = () => {
    if (name.length < 3) {
      toast.error("Name should be atleast 3 letters");
    } else if (!phone.startsWith("+91")) {
      toast.info("Please keep +91 as country code");
    } else if (phone.length > 3 && phone.length <= 12) {
      if (phone.length <= 12) {
        toast.error("Please enter phone number correctly");
      }
    } else if (phone.length >= 13) {
      if (phone.length > 13 || !isPhoneDigits()) {
        toast.error("Please enter valid phone number");
      } else {
        uodateData();
      }
    } else {
      uodateData();
    }
  };

  useEffect(() => {
    const user = JSON.parse(Cookies.get("tawk_chat_user"));
    if (user?.email) {
      const getUser = async () => {
        const url = `${process.env.REACT_APP_API_URL}/get-user/${user.email}`;
        const res = await fetch(url);
        const data = await res.json();
        setProfileImageUrl(data.user.profile_image);
        setName(data.user.name);
        setAbout(data.user.about);
        setPhone(data.user.phone ? `+91${data.user.phone}` : "+91");
        dispatch(setUserInfo({ userInfo: data.user }));
      };
      getUser();
    }
  }, []);

  return (
    <div className="py-4 px-3">
      <div className="flex items-center">
        <IconButton
          onClick={() => dispatch(changeDashboardTab({ activeTab: prevTab }))}
        >
          <FaChevronLeft
            className={`${!isLightMode ? "text-white" : "text-black"}`}
          />
        </IconButton>
        <span
          className={`text-2xl font-extrabold tracking-wider ml-3 ${
            isLightMode ? "text-black" : "text-white"
          }`}
        >
          Profile
        </span>
      </div>
      <div className="relative w-full flex justify-center mt-4 mb-5 pb-4">
        <IconButton onClick={handleProfileImageContextMenu}>
          <Avatar
            src={
              profileImageUrl
                ? profileImageUrl.startsWith("image_")
                  ? `${process.env.REACT_APP_API_URL}/images/${profileImageUrl}`
                  : profileImageUrl
                : null
            }
            alt="avatar"
            sx={{ height: 120, width: 120 }}
          />

          <IoIosCamera
            className={`h-7 w-7 absolute bottom-0 right-5 ${
              isLightMode ? "text-gray-600" : "text-gray-200"
            }`}
          />
        </IconButton>
        {open && (
          <ProfileContextMenu
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            open={open}
            type="image"
            setProfileImgFile={setProfileImgFile}
            setImageUrl={setProfileImageUrl}
          />
        )}
      </div>
      <form className="w-full gap-2 px-7">
        <TextField
          label="Name"
          type="text"
          size="small"
          id="name"
          value={name}
          fullWidth
          color={`${isLightMode ? "primary" : "secondary"}`}
          InputLabelProps={{ className: isLightMode ? "" : "input-label-dark" }}
          onFocus={() => setNameFocus(true)}
          onBlur={() => setNameFocus(false)}
          onChange={(e) => setName(e.target.value)}
          sx={
            isLightMode
              ? { mt: 3 }
              : nameFocus
              ? { mt: 3 }
              : {
                  mt: 3,
                  border: 2,
                  borderStyle: "solid",
                  borderRadius: 1,
                  borderColor: "blueviolet",
                }
          }
        />
        <span
          className={`text-[13px] mt-2 ${
            isLightMode ? "text-gray-900" : "text-gray-500"
          }`}
        >
          This name is visble to your contacts
        </span>
        <TextField
          label="Phone"
          type="text"
          size="small"
          id="phone"
          value={phone}
          fullWidth
          color={`${isLightMode ? "primary" : "secondary"}`}
          InputLabelProps={{ className: isLightMode ? "" : "input-label-dark" }}
          onFocus={() => setPhoneFocus(true)}
          onBlur={() => setPhoneFocus(false)}
          onChange={(e) => setPhone(e.target.value)}
          sx={
            isLightMode
              ? { mt: 3 }
              : phoneFocus
              ? { mt: 3 }
              : {
                  mt: 3,
                  border: 2,
                  borderStyle: "solid",
                  borderRadius: 1,
                  borderColor: "blueviolet",
                }
          }
        />
        <TextField
          sx={
            isLightMode
              ? { mt: 3 }
              : focus
              ? { mt: 3, color: "cyan" }
              : {
                  color: "cyan",
                  mt: 3,
                  border: 2,
                  borderStyle: "solid",
                  borderRadius: 1,
                  borderColor: "blueviolet",
                }
          }
          color={`${isLightMode ? "primary" : "secondary"}`}
          multiline
          fullWidth
          rows={4}
          label="About"
          type="text"
          size="small"
          id="about"
          value={about}
          InputLabelProps={{ className: isLightMode ? "" : "input-label-dark" }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => setAbout(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            size="small"
            color={`${isLightMode ? "primary" : "secondary"}`}
            onClick={saveProfile}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
