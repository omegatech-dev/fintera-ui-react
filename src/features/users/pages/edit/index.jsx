import { useState, useEffect, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usersApi } from "../../api";
import AuthContext from "../../../../contexts/AuthContext";
import { useLocale } from "../../../../contexts/LocaleContext";
import UserForm, { formatCedula, formatRTN } from "../../components/UserForm";
import RightSidebar from "../../components/RightSidebar";
import { Button, ErrorState, Skeleton } from "@/shared/ui";
import { formatDate } from "../../../../shared/utils/formatters";

const toInitialValues = (user) => ({
  full_name: user.full_name || "",
  phone: user.phone || "",
  email: user.email || "",
  identity: formatCedula(String(user.identity || "")),
  rtn: formatRTN(String(user.rtn || "")),
  address: user.address || "",
  role: user.role || "user",
});

const getLastAccess = (user) =>
  user?.last_sign_in_at ||
  user?.last_login_at ||
  user?.last_access_at ||
  user?.last_seen_at ||
  null;

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const { t } = useLocale();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.get(id);
      setUser(data?.user || data);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!showProfile) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowProfile(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showProfile]);

  const handleSubmit = async (formData, imageFile) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        identity: formData.identity.replace(/\D/g, ""),
        rtn: formData.rtn.replace(/\D/g, ""),
        address: formData.address,
        role: currentUser?.role === "admin" ? formData.role : user?.role,
      };
      if (formData.password !== "") {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      await usersApi.update(id, payload);

      if (imageFile) {
        const imageData = new FormData();
        imageData.append("image", imageFile);
        try {
          await usersApi.uploadPicture(id, imageData);
        } catch (imgErr) {
          console.error("Failed to upload profile picture", imgErr);
        }
      }

      navigate("/users");
    } catch (err) {
      const message = err.errors
        ? err.errors.join(", ")
        : err.message || t("users.errorUpdatingUser");
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const role = String(user?.role || "user").toLowerCase();
  const roleLabel = t(`userFilter.${role === "user" ? "client" : role}`);
  const lastAccess = getLastAccess(user);
  const meta = user
    ? lastAccess
      ? t("users.profileSummary", {
          role: roleLabel,
          date: user.created_at ? formatDate(user.created_at) : "—",
          lastAccess: formatDate(lastAccess),
        })
      : t("users.profileSummaryNoAccess", {
          role: roleLabel,
          date: user.created_at ? formatDate(user.created_at) : "—",
        })
    : t("users.editUserSubtitle");

  return (
    <main className="min-h-screen w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto max-w-[1200px] space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <nav className="mb-1 flex items-center gap-1.5 text-label text-ink-3">
              <Link to="/users" className="hover:text-ink">
                {t("users.title")}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="truncate">
                {user?.full_name || user?.email || "—"}
              </span>
            </nav>
            <h1 className="text-page font-bold tracking-tight text-ink">
              {t("users.editUser")}
            </h1>
            <p className="mt-1 text-body text-ink-3">{meta}</p>
          </div>
          {user && (
            <Button
              variant="secondary"
              onClick={() => setShowProfile(true)}
            >
              {t("users.viewProfile")}
            </Button>
          )}
        </header>

        {loading ? (
          <Skeleton rows={8} />
        ) : error ? (
          <ErrorState
            title={t("common.error")}
            description={error}
            onRetry={fetchUser}
          />
        ) : (
          <UserForm
            mode="edit"
            user={user}
            initialValues={toInitialValues(user || {})}
            onSubmit={handleSubmit}
            error={submitError}
            submitting={submitting}
            creatorRole={currentUser?.role}
            creatorName={user?.creator?.full_name || user?.created_by || ""}
          />
        )}
      </div>

      {showProfile &&
        user &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex justify-end bg-black/30"
            onClick={(event) => {
              if (event.target === event.currentTarget) setShowProfile(false);
            }}
          >
            <div className="h-full w-[460px] max-w-full border-l border-line bg-surface shadow-pop">
              <RightSidebar
                user={user}
                onClose={() => setShowProfile(false)}
                showActions={false}
              />
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}

export default EditUser;
