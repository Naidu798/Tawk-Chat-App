import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Cookies from "js-cookie";

const LoginForm = () => {
  const { toastMessageAlert, setToastMessageAlert, toastMessage } =
    useContext(AppContext);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState(" ");
  const [errorPassword, setErrorPassword] = useState(" ");

  const navigate = useNavigate();

  const handleEmail = (e) => {
    let value = e.target.value;
    setEmail(value);
    if (!value.endsWith("@gmail.com")) {
      setErrorEmail("Please enter valid Email address");
    } else {
      setErrorEmail(" ");
    }
  };

  const handlePassword = (e) => {
    let value = e.target.value;
    setPassword(value);
    if (value.length < 6) {
      setErrorPassword("Password must have at least 6 chracters");
    } else {
      setErrorPassword(" ");
    }
  };

  const handleEmailBlur = () => {
    if (!email) {
      setErrorEmail("Email must be required");
    }
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setErrorPassword("Password must be required");
    }
  };

  const loginUser = async () => {
    const url = `${process.env.REACT_APP_API_URL}/auth/login`;
    const userData = {
      email,
      password,
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
      Cookies.set("tawk_chat_user", JSON.stringify(data.userDetails), {
        expires: 10,
      });
      setToastMessageAlert({ type: "success", msg: data.msg });
      navigate("/");
      const user = localStorage.getItem("user");
      if (user) {
        localStorage.removeItem("user");
      }
    } else if (data.status === 201) {
      setToastMessageAlert({ type: "success", msg: data.msg });

      localStorage.setItem("user", JSON.stringify(data.userDetails));
      navigate("/auth/verify-otp");
    } else {
      toastMessage("error", data.msg);
    }
  };

  const handleSubmitLoginForm = (e) => {
    e.preventDefault();
    if (!email.endsWith("@gmail.com") || password.length < 6) {
      toast.error("Please fill the details");
    } else {
      loginUser();
    }
  };

  useEffect(() => {
    if (toastMessageAlert) {
      toastMessage(toastMessageAlert.type, toastMessageAlert.msg);
      setToastMessageAlert(null);
    }
  }, []);

  return (
    <form className="w-full mt-4" onSubmit={handleSubmitLoginForm}>
      <div className="w-full">
        <TextField
          label="Email"
          type="text"
          size="small"
          id="email"
          className="w-full"
          onBlur={handleEmailBlur}
          onChange={handleEmail}
          value={email}
          error={errorEmail === " " ? false : true}
        />
        <FormHelperText children={errorEmail} error={true} />
        <FormControl
          sx={{ mt: 1, mb: 0 }}
          variant="outlined"
          className="w-full"
          error={errorPassword === " " ? false : true}
        >
          <InputLabel htmlFor="outlined-adornment-password" size="small">
            Password
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
            onBlur={handlePasswordBlur}
            onChange={handlePassword}
            value={password}
            error={errorPassword === " " ? false : true}
          />
        </FormControl>
        <FormHelperText children={errorPassword} error={true} />
      </div>
      <Button
        variant="contained"
        className="w-full"
        sx={{ mt: 2 }}
        type="submit"
      >
        Login
      </Button>
      <div
        className="w-full flex justify-end mt-2"
        onClick={() => navigate("/auth/reset-password")}
      >
        <span className="text-md text-black font-bold cursor-pointer">
          Forget Your Password ?
        </span>
      </div>
      <ToastContainer />
    </form>
  );
};

export default LoginForm;
