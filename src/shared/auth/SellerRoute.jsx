import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import ForbiddenPage from "@/features/common/ForbiddenPage";

// Back-office routes for the sales team: admins and sellers only.
const SellerRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  const location = useLocation();

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

  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const securityPath = `/settings/user/${user.id}/security`;
  if (user?.must_change_password && user?.id && location.pathname !== securityPath) {
    return <Navigate to={securityPath} replace />;
  }

  if (!user || (user.role !== "admin" && user.role !== "seller")) {
    return <ForbiddenPage />;
  }

  return children;
};

export default SellerRoute;
