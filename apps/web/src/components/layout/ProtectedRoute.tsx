import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { Spinner } from "../ui/Spinner.js";

interface ProtectedRouteProps {
  type: "parent" | "child";
  children: React.ReactNode;
}

export function ProtectedRoute({ type, children }: ProtectedRouteProps) {
  const { token, type: authType, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!token) return <Navigate to="/login" replace />;
  if (authType !== type) {
    return <Navigate to={authType === "parent" ? "/parent/dashboard" : "/child/chores"} replace />;
  }

  return <>{children}</>;
}
