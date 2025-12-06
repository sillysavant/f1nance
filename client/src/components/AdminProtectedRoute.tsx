import { Navigate } from "react-router-dom";
import { getCookie } from "@/lib/cookie";

interface AdminProtectedRouteProps {
  children: JSX.Element;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const token = getCookie("admin_token"); // cookie set on admin login

  if (!token) {
    return <Navigate to="/admin/auth?message=session_expired" replace />;
  }

  return children;
};
