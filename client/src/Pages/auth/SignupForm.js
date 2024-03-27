import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { MdVisibilityOff } from "react-icons/md";
import { MdVisibility } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "../../context/AppContext";

const SignupForm = () => {
  const { setToastMessageAlert, toastMessage } = useContext(AppContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorFirstName, setErrorFirstName] = useState(" ");
  const [errorLastName, setErrorLastName] = useState(" ");
  const [errorEmail, setErrorEmail] = useState(" ");
  const [errorPassword, setErrorPassword] = useState(" ");

  const handleFirstName = (e) => {
    let value = e.target.value;
    setFirstName(value);
    if (value.length < 3) {
      setErrorFirstName("First name have at least 3 chracters");
    } else {
      setErrorFirstName(" ");
    }
  };

  const handleLastName = (e) => {
    let value = e.target.value;
    setLastName(value);
    if (value.length < 1) {
      setErrorLastName("Last name have at least 1 chracter");
    } else {
      setErrorLastName(" ");
    }
  };

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

  const handleFirstNameBlur = () => {
    if (!firstName) {
      setErrorFirstName("First name should be required");
    }
  };

  const handleLastNameBlur = () => {
    if (!lastName) {
      setErrorLastName("Last name should be required");
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

  const isDisabile = () => {
    if (
      errorFirstName === " " &&
      errorLastName === " " &&
      errorEmail === " " &&
      errorPassword === " "
    ) {
      return false;
    }
    return true;
  };

  const registerUser = async () => {
    const url = `${process.env.REACT_APP_API_URL}/auth/register`;
    const userData = {
      name: firstName + " " + lastName,
      email,
      password,
      friends: [],
      pinnedUsers: [],
      blocked: [],
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.status === 200) {
      localStorage.setItem(
        "user",
        JSON.stringify({ email, name: userData.name })
      );
      setToastMessageAlert({
        type: "success",
        msg: "verification code sent to your email",
      });
      navigate("/auth/verify-otp");
    } else {
      toastMessage("error", data.msg);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (
      firstName.length < 3 ||
      lastName.length < 1 ||
      !email.endsWith("@gmail.com") ||
      password.length < 6
    ) {
      toast.error("Please fill the details");
    } else {
      registerUser();
    }
  };

  return (
    <form className="mt-4" onSubmit={handleSubmitForm}>
      <div className="flex items-center justify-between">
        <div>
          <TextField
            label="First Name"
            type="text"
            size="small"
            id="first-name"
            onBlur={handleFirstNameBlur}
            onChange={handleFirstName}
            value={firstName}
            error={errorFirstName === " " ? false : true}
          />
          <FormHelperText children={errorFirstName} error={true} />
        </div>
        <div>
          <TextField
            label="Last Name"
            type="text"
            size="small"
            id="last-name"
            onBlur={handleLastNameBlur}
            onChange={handleLastName}
            value={lastName}
            error={errorLastName === " " ? false : true}
          />
          <FormHelperText children={errorLastName} error={true} />
        </div>
      </div>

      <div className="w-full mt-2">
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
          sx={{ mt: 1 }}
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
        disabled={isDisabile()}
        type="submit"
      >
        Signup
      </Button>
      <ToastContainer />
      <p className="text-gray-800 text-xs text-center font-semibold mt-2">
        By signing up, I agree to{" "}
        <span className=" font-extrabold underline text-gray-900 px-1">
          Terms of Services
        </span>{" "}
        and{" "}
        <span className="font-extrabold underline text-gray-900 px-1">
          Privacy Policy
        </span>
      </p>
    </form>
  );
};

export default SignupForm;
