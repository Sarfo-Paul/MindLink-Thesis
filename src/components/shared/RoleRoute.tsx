import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { ReactNode } from "react";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: string;
}

export function RoleRoute({ children, allowedRoles, fallback }: RoleRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth!);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "PRACTITIONER") return <Navigate to="/practitioner" replace />;
    if (user.role === "VOLUNTEER") return <Navigate to="/volunteer" replace />;
    return <Navigate to={fallback ?? "/home"} replace />;
  }

  return <>{children}</>;
}
