import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const VerifyOtp = () => {
  const { toastMessageAlert, toastMessage, setToastMessageAlert } =
    useContext(AppContext);
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(180);
  const otpInputRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  const handleChangeInput = (index, event) => {
    const value = event.target.value;
    if (isNaN(value)) {
      return;
    }
    setOtp([...otp.map((prev, idx) => (idx === index ? value : prev))]);

    if (value && otpInputRefs[index + 1] && index < 5) {
      otpInputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && index > 0 && !otp[index]) {
      otpInputRefs[index - 1].current.focus();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [countdown]);

  useEffect(() => {
    if (toastMessageAlert) {
      toastMessage(toastMessageAlert.type, toastMessageAlert.msg);
      setToastMessageAlert(null);
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const resendOtp = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.email) {
      const url = `${process.env.REACT_APP_API_URL}/auth/send-otp`;
      const userData = { name: user.name, email: user.email };
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      };
      const response = await fetch(url, options);
      const data = await response.json();
      if (data.status === 400) {
        toastMessage("error", data.msg);
      } else {
        toastMessage("success", data.msg);
      }
    }
  };

  const handleSubmitOtp = async () => {
    if (otp.some((val) => val === "")) {
      toast.error("Please fill the all input fields");
    } else {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.email) {
        const OTP = otp.join("");
        const url = `${process.env.REACT_APP_API_URL}/auth/verify-otp`;
        const userData = {
          otp: OTP,
          email: user.email,
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
          if (user?.type === "reset") {
            navigate("/auth/new-password");
          } else {
            localStorage.removeItem("user");
            navigate("/auth/login");
          }
        } else {
          toastMessage("error", data.msg);
        }
      } else {
        toastMessage("info", "Please try after some time");
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-start items-center py-10 bg-lm-dash-background">
      <div className="w-[20vw]">
        <div className="flex justify-center">
          <img src={"/logo.png"} alt="logo" className="h-20 w-20 mb-3" />
        </div>
        <div className="w-full flex justify-center flex-col items-center">
          <h2 className="text-xl text-black font-extrabold tracking-wider mb-3">
            Verify Email With Code
          </h2>
          <div className="text-gray text-sm font-semibold opacity-90 flex items-center gap-3 ml-4">
            <p className="">Don't receive the code ?</p>
            <div className="w-16">
              {countdown === 0 ? (
                <button
                  className="text-lm-blue"
                  onClick={() => {
                    resendOtp();
                    setCountdown(120);
                  }}
                >
                  Resend
                </button>
              ) : (
                <span className="text-lm-blue">{formatTime(countdown)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="w-full mt-12 flex justify-center items-center">
          {otp.map((data, index) => {
            return (
              <input
                key={index}
                value={data}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                onChange={(e) => handleChangeInput(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={otpInputRefs[index]}
                className="h-10 w-10 font-normal text-lg rounded-lg border-2 border-gray-700 mx-1.5 text-center p-1 focus:outline-lm-blue focus:outline-offset-2 focus:border-0
              "
              />
            );
          })}
        </div>
        <div className="w-full mt-1">
          <span className="text-[11px] text-black font-semibold ml-1">
            Note :- Please check your spam folder also
          </span>
        </div>
        <div className="w-full mt-7 flex justify-center">
          <Button
            variant="contained"
            size="small"
            sx={{ borderRadius: 2, width: "100%" }}
            onClick={handleSubmitOtp}
          >
            Verify OTP
          </Button>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
