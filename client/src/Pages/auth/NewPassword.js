import {
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const NewPassword = () => {
  const { toastMessageAlert, setToastMessageAlert, toastMessage } =
    useContext(AppContext);

  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [confirmErrorPassword, setConfirmErrorPassword] = useState(" ");
  const [newErrorPassword, setNewErrorPassword] = useState(" ");

  const handleNewPassword = (e) => {
    let value = e.target.value;
    setNewPassword(value);
    if (value.length < 6) {
      setNewErrorPassword("Password must have at least 6 chracters");
    } else {
      setNewErrorPassword(" ");
    }
  };
  const handleConfirmPassword = (e) => {
    let value = e.target.value;
    setConfirmPassword(value);
    if (newPassword === value) {
      setConfirmErrorPassword(" ");
    } else {
      setConfirmErrorPassword("Password must be match with password");
    }
  };

  useEffect(() => {
    if (toastMessageAlert) {
      toastMessage(toastMessageAlert.type, toastMessageAlert.msg);
      setToastMessageAlert(null);
    }
  }, []);

  const handleSubmitNewPassword = async () => {
    if (newPassword.length < 6 || confirmPassword.length < 6) {
      toast.error("Please fill the details");
    } else if (
      confirmErrorPassword.length > 2 ||
      newPassword !== confirmPassword
    ) {
      toast.error("Please fill correct details");
    } else {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.email) {
        const url = `${process.env.REACT_APP_API_URL}/auth/new-password`;
        const userData = {
          email: user.email,
          password: newPassword,
        };
        const options = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        };
        const response = await fetch(url, options);
        const data = await response.json();
        if (data.status === 200) {
          setToastMessageAlert({ type: "success", msg: data.msg });
          navigate("/auth/login");
        } else {
          toastMessage("error", data.msg);
        }
      } else {
        toastMessage("error", "Please try after some time");
      }
    }
  };

  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex flex-col justify-start items-center py-10 bg-lm-sidebar-background">
      <img src={"/logo.png"} alt="logo" className="h-20 w-20 mb-3" />
      <div className="w-[30vw]">
        <h2 className="text-xl text-black font-extrabold tracking-wider mb-8">
          Set your Password
        </h2>
      </div>
      <div className="w-[30vw]">
        <FormControl
          sx={{ mt: 1, mb: 0 }}
          variant="outlined"
          className="w-full"
        >
          <InputLabel htmlFor="outlined-adornment-password" size="small">
            New Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            size="small"
            onBlur={() => {}}
            onChange={handleNewPassword}
            value={newPassword}
            error={newErrorPassword === " " ? false : true}
          />
        </FormControl>
        <FormHelperText children={newErrorPassword} error={true} />
        <FormControl
          sx={{ mt: 1, mb: 0 }}
          variant="outlined"
          className="w-full"
        >
          <InputLabel htmlFor="outlined-adornment-password" size="small">
            Confirm Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={confirmShowPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setConfirmShowPassword(!confirmShowPassword)}
                  edge="end"
                >
                  {confirmShowPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            size="small"
            onBlur={() => {}}
            onChange={handleConfirmPassword}
            value={confirmPassword}
            error={confirmErrorPassword === " " ? false : true}
          />
        </FormControl>
        <FormHelperText children={confirmErrorPassword} error={true} />

        <Button
          variant="contained"
          className="w-full"
          sx={{ mt: 2 }}
          onClick={handleSubmitNewPassword}
        >
          Send Request
        </Button>
        <ToastContainer />
        <div
          className="flex items-center mt-2"
          onClick={() => navigate("/auth/login")}
        >
          <FaAngleLeft className="w-4 h-5 text-gray-700 font-semibold cursor-pointer" />
          <spam
            className={`text-gray-700 font-semibold text-sm cursor-pointer`}
          >
            Back to Sign In
          </spam>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
