import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { getAuthUser } from "../utils/authStorage";

interface ProtectedRouteProps {
  children: ReactElement;
  role?: "OWNER" | "TENANT" | "ADMIN";
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const user = getAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}