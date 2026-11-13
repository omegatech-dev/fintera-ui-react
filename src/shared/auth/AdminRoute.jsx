import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import ForbiddenPage from "@/features/common/ForbiddenPage";

const AdminRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  const { t } = useLocale();
  const location = useLocation();

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

  const securityPath = `/settings/user/${user.id}/security`;
  if (user?.must_change_password && user?.id && location.pathname !== securityPath) {
    return <Navigate to={securityPath} replace />;
  }

  if (!user || user.role !== "admin") {
    return <ForbiddenPage />;
  }

  return children;
};

export default AdminRoute;
