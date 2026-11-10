import { Navigate, useLocation, useParams } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import ForbiddenPage from "@/features/common/ForbiddenPage";

const AdminOrOwnerRoute = ({ children }) => {
  const { token, user: currentUser, loading } = useContext(AuthContext);
  const location = useLocation();
  const params = useParams();

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

  // Admin and seller are the back-office roles.
  if (currentUser?.role === "admin" || currentUser?.role === "seller") {
    return children;
  }

  // Allow a user to inspect their own resources.
  if (params.userId && String(currentUser?.id) === String(params.userId)) {
    return children;
  }

  return <ForbiddenPage />;
};

export default AdminOrOwnerRoute;
