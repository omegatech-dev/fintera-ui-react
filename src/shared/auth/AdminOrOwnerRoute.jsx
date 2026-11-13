import { Navigate, useLocation, useParams } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import ForbiddenPage from "@/features/common/ForbiddenPage";

const AdminOrOwnerRoute = ({ children }) => {
  const { token, user: currentUser, loading } = useContext(AuthContext);
  const { t } = useLocale();
  const location = useLocation();
  const params = useParams();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas">
        <div className="text-center" role="status">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-ink-3">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const securityPath = `/settings/user/${currentUser.id}/security`;
  if (currentUser?.must_change_password && currentUser?.id && location.pathname !== securityPath) {
    return <Navigate to={securityPath} replace />;
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
