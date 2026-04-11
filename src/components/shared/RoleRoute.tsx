import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { ReactNode } from "react";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  /** Where to redirect if logged in but wrong role. Defaults to /home */
  fallback?: string;
}

/**
 * RoleRoute — wraps a route so only users with the correct role can access it.
 * - Unauthenticated → /login
 * - Authenticated but wrong role → fallback (default: /home with a toast)
 */
export function RoleRoute({ children, allowedRoles, fallback = "/home" }: RoleRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth!);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user?.role || "")) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
