import { useEffect, useState, useContext } from "react";
import { usersApi } from "@/features/users/api";
import { getFullImageUrl } from "@/shared/utils/avatarUtils";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";
import AuthContext from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

// helper formatters (minimal, preserve digits and insert dashes)
function formatCedula(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  return out;
}

function formatRTN(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  const g4 = d.slice(13, 14);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  if (g4) out += `-${g4}`;
  return out;
}

// Defined outside so the component identity is stable and inputs don't lose focus on re-render
function InputField({ label, name, value, onChange, type = "text", readOnly = false, icon }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold text-bgray-700 dark:text-bgray-300 ml-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value ?? ""}
          onChange={onChange}
          readOnly={readOnly}
          className={`w-full bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white p-4 ${icon ? 'pl-12' : 'pl-4'} rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-hidden ${readOnly ? "opacity-70 cursor-not-allowed bg-bgray-50 dark:bg-darkblack-600" : ""}`}
        />
      </div>
    </div>
  );
}

function PersonalInfoForm({ userId }) {
  const { t, setLocale, locale } = useLocale();
  const [user, setUser] = useState({
    full_name: "",
    phone: "",
    email: "",
    identity: "",
    rtn: "",
    address: "",
    locale: locale,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const { setUser: setAuthUser } = useContext(AuthContext);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError(t("errors.userIdInvalid"));
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await usersApi.get(userId);
        const userData = data.user || data;
        setUser({
          ...userData,
          identity: formatCedula(userData.identity),
          rtn: formatRTN(userData.rtn),
          locale: userData.locale || locale,
        });

        if (userData.profile_picture_thumb) {
          setImagePreview(getFullImageUrl(userData.profile_picture_thumb));
        }

        if (userData.locale && userData.locale !== locale) {
          setLocale(userData.locale);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "identity") v = formatCedula(value);
    if (name === "rtn") v = formatRTN(value);
    setUser((prevUser) => ({
      ...prevUser,
      [name]: v,
    }));

    if (name === "locale") {
      setLocale(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(t("errors.imageTooLarge") || "Image too large (max 5MB)", "error");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError(t("errors.updateWithoutId"));
      return;
    }

    try {
      const returned = await usersApi.update(userId, {
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        identity: user.identity.replace(/-/g, ''),
        rtn: user.rtn.replace(/-/g, ''),
        address: user.address,
        locale: user.locale,
      });
      let finalUser = returned?.user || returned;

      // Upload image if selected
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("image", imageFile);

        try {
          const imageData = await usersApi.uploadPicture(userId, formDataImage);
          if (imageData.user) {
            finalUser = { ...finalUser, ...imageData.user };
          }
        } catch (error) {
          console.error("Failed to upload profile picture", error);
          showToast(t("errors.imageUploadFailed") || "Failed to upload profile picture", "error");
        }
      }

      if (finalUser) {
        // Refetch to get updated image URLs if needed, or just update local state
        // Simplest is to rely on the fact that image upload is separate.
        // If image upload succeeded, we might want to refresh the user data completely or manually update the thumb URL if api returned it.
        // For now, let's refetch or update state if image was uploaded.

        setUser((u) => ({
          ...u,
          ...finalUser,
          identity: formatCedula(finalUser.identity),
          rtn: formatRTN(finalUser.rtn),
        }));

        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "null");
          if (storedUser && Number(storedUser.id) === Number(finalUser.id)) {
            // Ensure the explicitly-chosen locale is always preserved,
            // even if the API response doesn't return it.
            const merged = { ...storedUser, ...finalUser, locale: user.locale };
            localStorage.setItem("user", JSON.stringify(merged));
            if (typeof setAuthUser === "function") setAuthUser(merged);
          }
        } catch {
          // ignore localStorage issues
        }

        if (finalUser.locale) setLocale(finalUser.locale);
      }

      showToast(t("errors.profileUpdated"), "success");
      // Optional: Refresh parent or context if image changed
      if (imageFile) {
        // Reload window or trigger a deep refresh context? 
        // For now, minimal impact. User might need to refresh to see new avatar in header if not wired up fully.
      }

    } catch (err) {
      setError(err.message);
    }
  };

  if (!userId) {
    return <p className="text-red-500">{t("errors.userIdRequired")}</p>;
  }

  if (loading) return (
    <div className="w-full flex justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return <p className="text-red-500">{t("common.error")}: {error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white dark:bg-darkblack-600 rounded-2xl p-6 md:p-8 shadow-xs"
    >
      <div className="border-b border-bgray-200 dark:border-darkblack-400 pb-6 mb-8">
        <h3 className="text-xl font-bold text-bgray-900 dark:text-white">
          {t("personalInfo.title")}
        </h3>
        <p className="text-sm text-bgray-500 dark:text-bgray-400 mt-1">
          {t("personalInfo.description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-bgray-100 dark:bg-darkblack-500 border-4 border-white dark:border-darkblack-400 shadow-lg flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <svg className="w-12 h-12 text-bgray-300 dark:text-bgray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <label
              htmlFor="profile-picture-edit"
              className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-all transform hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input
              type="file"
              id="profile-picture-edit"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <p className="mt-3 text-sm text-bgray-500 dark:text-bgray-400 font-medium">
            {t('users.changePhoto') || 'Change Profile Photo'}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <InputField
            label={t("personalInfo.fullName")}
            name="full_name"
            value={user.full_name}
            onChange={handleInputChange}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <InputField
            label={t("personalInfo.phoneOptional")}
            name="phone"
            value={user.phone}
            onChange={handleInputChange}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
          <InputField
            label={t("personalInfo.email")}
            name="email"
            value={user.email}
            onChange={handleInputChange}
            readOnly
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <InputField
            label={t("personalInfo.addressOptional")}
            name="address"
            value={user.address}
            onChange={handleInputChange}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>

        <div className="pt-4">
          <h4 className="text-lg font-bold text-bgray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883 3.918 1.6 6 1.6s6-.717 6-1.6M3 9c0 .883 3.918 1.6 6 1.6s6-.717 6-1.6" />
              </svg>
            </span>
            {t("personalInfo.legalInfo")}
          </h4>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <InputField
              label={t("personalInfo.identity")}
              name="identity"
              value={user.identity}
              onChange={handleInputChange}
            />
            <InputField
              label={t("personalInfo.rtn")}
              name="rtn"
              value={user.rtn}
              onChange={handleInputChange}
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="locale" className="text-sm font-semibold text-bgray-700 dark:text-bgray-300 ml-1">
                {t("personalInfo.language")}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <select
                  name="locale"
                  id="locale"
                  value={user.locale}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white p-4 pl-12 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-hidden appearance-none"
                >
                  <option value="es">{t("personalInfo.spanish")}</option>
                  <option value="en">{t("personalInfo.english")}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-bgray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-bgray-200 dark:border-darkblack-400">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>{t("personalInfo.saveProfile")}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

PersonalInfoForm.propTypes = {
  userId: PropTypes.string,
};

export default PersonalInfoForm;