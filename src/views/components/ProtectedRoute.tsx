import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ user, redirectTo = '/'}) => {
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet></Outlet>;
};