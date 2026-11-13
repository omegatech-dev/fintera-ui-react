import { useState, useContext } from "react";
import { usersApi } from "../../api";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../../contexts/AuthContext";
import { useLocale } from "../../../../contexts/LocaleContext";
import UserForm from "../../components/UserForm";

function CreateUser() {
  const navigate = useNavigate();
  const { user: creator } = useContext(AuthContext);
  const { t } = useLocale();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData, imageFile) => {
    setError(null);
    setSubmitting(true);
    try {
      const safeRole = creator?.role === "admin" ? formData.role : "user";
      // Map to PascalCase for the backend validator (omit Password if empty - backend generates)
      const payload = {
        FullName: formData.full_name,
        Email: formData.email,
        Phone: formData.phone,
        Identity: formData.identity.replace(/\D/g, ""),
        RTN: formData.rtn.replace(/\D/g, ""),
        Address: formData.address,
        Role: safeRole,
        CreatedBy: creator?.id,
      };
      if (formData.password !== "") {
        payload.Password = formData.password;
      }

      const successBody = await usersApi.create(payload);
      const newUserId =
        successBody?.id || successBody?.user?.id || successBody?.data?.id;

      if (imageFile && newUserId) {
        const formDataImage = new FormData();
        formDataImage.append("image", imageFile);
        try {
          await usersApi.uploadPicture(newUserId, formDataImage);
        } catch (imgErr) {
          console.error("Failed to upload profile picture", imgErr);
          // Don't throw error here to allow user creation to succeed
        }
      }

      if (newUserId) {
        navigate(`/settings/user/${newUserId}`);
      } else {
        navigate("/users");
      }
    } catch (err) {
      const msg =
        err.errors
          ? err.errors.join(", ")
          : err.message || t("users.errorCreatingUser");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell dark:bg-darkblack-700 min-h-screen">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-page font-bold text-ink">
            {t("users.createUserTitle")}
          </h1>
          <p className="text-body text-ink-3">
            {t("users.subtitle") || "Fill in the details to create a new user"}
          </p>
        </div>

        <UserForm
          onSubmit={handleSubmit}
          error={error}
          submitting={submitting}
          creatorRole={creator?.role}
          creatorName={creator?.full_name}
        />
      </div>
    </main>
  );
}

export default CreateUser;
