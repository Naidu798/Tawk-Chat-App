import React from "react";
import { useNavigate } from "react-router-dom";
import { Chip, Divider, IconButton } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import { FiGithub } from "react-icons/fi";
import { PiTwitterLogo } from "react-icons/pi";
import LoginForm from "../auth/LoginForm";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col justify-start items-center py-10 bg-lm-chat-bg">
      <img src={"/logo.png"} alt="logo" className="h-20 w-20 mb-3" />
      <div className="w-[30vw]">
        <h2 className="text-xl text-black font-extrabold tracking-wider mb-8">
          Login to Tawk
        </h2>
        <p className="text-gray text-sm font-semibold opacity-90">
          New User ?
          <button
            className="text-lm-blue ml-2"
            onClick={() => navigate("/auth/signup")}
          >
            Create an account
          </button>
        </p>
        <LoginForm />
        <div className="mt-4 w-full">
          <Divider>
            <Chip label="OR" />
          </Divider>
        </div>
        <div className="flex w-full justify-center mt-4">
          <div className="flex items-center gap-3">
            <IconButton>
              <FcGoogle />
            </IconButton>
            <IconButton>
              <FiGithub className="text-gray-800" />
            </IconButton>

            <IconButton>
              <PiTwitterLogo className="text-blue-500" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
