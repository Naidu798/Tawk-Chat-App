import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FormHelperText, TextField } from "@mui/material";
import { FaAngleLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ResetPassword = () => {
  const { setToastMessageAlert, toastMessage } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState(" ");

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

  const handleEmailBlur = () => {
    if (!email) {
      setErrorEmail("Email must be required");
    }
  };

  const handleSubmitSendRequest = async () => {
    if (errorEmail.length > 2 || email.length < 3) {
      toast.error("Please fill valid email address ");
    } else {
      const url = `${process.env.REACT_APP_API_URL}/auth/reset-password`;
      const userData = {
        email,
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
      if (data.status === 201) {
        localStorage.setItem("user", JSON.stringify(data.userDetails));
        setToastMessageAlert({ type: "success", msg: data.msg });
        navigate("/auth/verify-otp");
      } else {
        toastMessage("error", data.msg);
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-start items-center py-10 bg-lm-sidebar-background">
      <img src={"/logo.png"} alt="logo" className="h-20 w-20 mb-3" />
      <div className="w-[30vw]">
        <h2 className="text-xl text-black font-extrabold tracking-wider mb-8">
          Forget your Password ?
        </h2>
        <p className="text-gray-500 text-sm font-normal opacity-90 mb-3">
          Please enter the email address associated with your account and We
          will email a verification code to reset password.
        </p>
        <form>
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

          <Button
            variant="contained"
            className="w-full"
            sx={{ mt: 2 }}
            onClick={handleSubmitSendRequest}
          >
            Send Request
          </Button>
          <ToastContainer />
        </form>
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

export default ResetPassword;
