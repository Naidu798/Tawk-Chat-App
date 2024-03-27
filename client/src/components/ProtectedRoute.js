import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const user = Cookies.get("tawk_chat_user");

  if (!user) {
    return <Navigate to={"/auth/login"} />;
  } else {
    return <>{children}</>;
  }
};

export const LoginProtectedRoute = ({ children }) => {
  const user = Cookies.get("tawk_chat_user");

  if (user) {
    return <Navigate to={"/"} />;
  } else {
    return <>{children}</>;
  }
};
