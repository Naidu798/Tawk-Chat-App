import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { store } from "./redux/store";
import { Provider } from "react-redux";

import Main from "./Pages/Main";
import Chat from "./Pages/Chat";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import VerifyOtp from "./Pages/auth/VerifyOtp";
import Auth from "./Pages/auth/Auth";
import ResetPassword from "./Pages/auth/ResetPassword";
import NewPassword from "./Pages/auth/NewPassword";
import {
  ProtectedRoute,
  LoginProtectedRoute,
} from "./components/ProtectedRoute";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/auth",
        element: <Auth />,
        children: [
          {
            path: "/auth/signup",
            element: <Signup />,
          },
          {
            path: "/auth/login",
            element: (
              <LoginProtectedRoute>
                <Login />
              </LoginProtectedRoute>
            ),
          },
          {
            path: "/auth/verify-otp",
            element: <VerifyOtp />,
          },
          {
            path: "/auth/reset-password",
            element: <ResetPassword />,
          },
          {
            path: "/auth/new-password",
            element: <NewPassword />,
          },
        ],
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
