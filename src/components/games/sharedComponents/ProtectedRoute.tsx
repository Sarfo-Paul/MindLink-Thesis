import { type ProtectedRouteProps } from "../../../types/props";

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    // Authentication removed - allow all users to access
    return children;
};

export default ProtectedRoute;
