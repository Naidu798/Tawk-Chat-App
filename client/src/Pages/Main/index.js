import React from "react";
import { Outlet } from "react-router-dom";
import { AppProvider } from "../../context/AppContext";
import { ToastContainer } from "react-toastify";

const Main = () => {
  return (
    <AppProvider>
      <ToastContainer />
      <Outlet />
    </AppProvider>
  );
};

export default Main;
