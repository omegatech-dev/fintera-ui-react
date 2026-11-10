import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import CustomerPortalNotice from "./CustomerPortalNotice";

const ProtectedRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  const location = useLocation();
  const pathname = location.pathname || "";
  const isSecurityPage = /^\/settings\/user\/\d+\/security$/.test(pathname);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-darkblack-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Customers use the dedicated customer portal, not the admin app.
  if (user?.role === "user") {
    return <CustomerPortalNotice />;
  }

  // First-time login: must change password before accessing other pages
  if (user?.must_change_password && !isSecurityPage && user?.id) {
    return <Navigate to={`/settings/user/${user.id}/security`} replace />;
  }

  return children;
};

export default ProtectedRoute;