import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { usersApi } from "@/features/users/api";
import { useToast } from "@/contexts/ToastContext";
import { useLocale } from "@/contexts/LocaleContext";
import AuthContext from "@/contexts/AuthContext";

const PasswordInputField = ({ label, value, onChange, show, onToggle, id, placeholder, required = true }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-semibold text-bgray-700 dark:text-bgray-300 ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <input
        type={show ? "text" : "password"}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-white dark:bg-darkblack-500 text-bgray-900 dark:text-white p-4 pl-12 pr-12 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-hidden`}
        required={required}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-bgray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-bgray-400"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.832-6.906M6.414 6.414A9.97 9.97 0 0012 5c5.523 0 10 4.477 10 10a9.97 9.97 0 01-1.414 5.586M15 15l-3-3m0 0l-3-3m3 3V6" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  </div>
);

function PasswordChange({ userId }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { user: currentUser, setUser } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminOverride = currentUser?.role === "admin" && String(currentUser?.ID || currentUser?.id) !== String(userId);

  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 5);
  };

  const getStrengthLabel = (score) => {
    if (score < 3) return { text: t("users.weak") || "Weak", color: "bg-error-300", textColor: "text-error-300" };
    if (score < 4) return { text: t("users.medium") || "Medium", color: "bg-warning-300", textColor: "text-warning-300" };
    return { text: t("users.strong") || "Strong", color: "bg-success-300", textColor: "text-success-300" };
  };

  const strengthInfo = getStrengthLabel(passwordStrength);

  const handleNewPasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    setPasswordStrength(calculateStrength(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast(t("errors.passwordsDoNotMatch") || "Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast(t("errors.passwordTooShort") || "Password must be at least 6 characters.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await usersApi.changePassword(userId, {
        current_password: isAdminOverride ? "" : oldPassword,
        new_password: newPassword,
      });
      if (setUser && currentUser && String(currentUser?.id || currentUser?.ID) === String(userId)) {
        setUser({ ...currentUser, must_change_password: false });
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            localStorage.setItem("user", JSON.stringify({ ...parsed, must_change_password: false }));
          } catch {
            // ignore
          }
        }
      }
    } catch (error) {
      const msg = error.message || "Error updating password.";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white dark:bg-darkblack-600 rounded-2xl p-6 md:p-8 shadow-xs"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isAdminOverride && (
          <PasswordInputField
            label={t("security.currentPassword") || "Current Password"}
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            show={showOldPassword}
            onToggle={() => setShowOldPassword(!showOldPassword)}
            placeholder="••••••••"
          />
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <PasswordInputField
              label={t("security.newPassword") || "New Password"}
              id="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              placeholder="••••••••"
            />
            {newPassword && (
              <div className="flex items-center gap-3 mt-2 px-1">
                <div className="flex-1 h-2 bg-bgray-200 dark:bg-darkblack-400 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${strengthInfo.textColor}`}>
                  {strengthInfo.text}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <PasswordInputField
              label={t("security.confirmPassword") || "Confirm New Password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              placeholder="••••••••"
            />
            {confirmPassword && (
              <div className={`flex items-center gap-2 text-sm mt-1 px-1 ${newPassword === confirmPassword ? "text-success-300" : "text-error-300"}`}>
                {newPassword === confirmPassword ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("users.passwordsMatch") || "Passwords match"}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{t("users.passwordsDoNotMatch") || "Passwords do not match"}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl flex gap-3 items-start">
          <div className="text-indigo-500 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Password must be at least 6 characters long and include a mix of letters and numbers for better security.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 ${isSubmitting ? "opacity-70 cursor-not-allowed transform-none" : ""}`}
          >
            <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
            {!isSubmitting && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

PasswordChange.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default PasswordChange;