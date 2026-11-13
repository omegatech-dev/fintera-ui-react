import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usersApi } from "../../api";
import AuthContext from "../../../../contexts/AuthContext";
import { useLocale } from "../../../../contexts/LocaleContext";
import UserForm, { formatCedula, formatRTN } from "../../components/UserForm";
import { ErrorState, Skeleton } from "@/shared/ui";

const toInitialValues = (user) => ({
  full_name: user.full_name || "",
  phone: user.phone || "",
  email: user.email || "",
  identity: formatCedula(String(user.identity || "")),
  rtn: formatRTN(String(user.rtn || "")),
  address: user.address || "",
  role: user.role || "user",
});

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

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell dark:bg-darkblack-700 min-h-screen">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-page font-bold text-ink">
            {t("users.editUser")}
          </h1>
          <p className="text-body text-ink-3">
            {user
              ? user.full_name || user.email
              : t("users.editUserSubtitle")}
          </p>
        </div>

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
            initialValues={toInitialValues(user || {})}
            onSubmit={handleSubmit}
            error={submitError}
            submitting={submitting}
            creatorRole={currentUser?.role}
            creatorName={user?.creator?.full_name || user?.created_by || ""}
          />
        )}
      </div>
    </main>
  );
}

export default EditUser;
