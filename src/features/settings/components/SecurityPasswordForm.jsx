import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { usersApi } from "@/features/users/api";
import { useToast } from "@/contexts/ToastContext";
import { useLocale } from "@/contexts/LocaleContext";
import AuthContext from "@/contexts/AuthContext";
import { Button } from "@/shared/ui";
import {
  settingsHelperClass,
  settingsInputClass,
  settingsInputDefaultClass,
  settingsLabelClass,
} from "./settingsFormStyles";

function PasswordField({ id, label, value, onChange, show, onToggle, hint, showLabel, hideLabel }) {
  return (
    <div>
      <label htmlFor={id} className={settingsLabelClass}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </span>
        <input
          type={show ? "text" : "password"}
          id={id}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          required
          className={`${settingsInputClass} ${settingsInputDefaultClass} pl-10 pr-10`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-control p-1.5 text-ink-3 transition-colors hover:bg-surface-2"
          aria-label={show ? hideLabel : showLabel}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {show ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.832-6.906M6.414 6.414A9.97 9.97 0 0012 5c5.523 0 10 4.477 10 10a9.97 9.97 0 01-1.414 5.586M15 15l-3-3m0 0l-3-3m3 3V6" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </>
            )}
          </svg>
        </button>
      </div>
      {hint && <p className={settingsHelperClass}>{hint}</p>}
    </div>
  );
}

PasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  show: PropTypes.bool,
  onToggle: PropTypes.func,
  hint: PropTypes.string,
  showLabel: PropTypes.string,
  hideLabel: PropTypes.string,
};

function SecurityPasswordForm({ userId }) {
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

  const isAdminOverride =
    currentUser?.role === "admin" &&
    String(currentUser?.ID || currentUser?.id) !== String(userId);

  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 5);
  };

  const strengthInfo =
    passwordStrength < 3
      ? { text: t("users.weak") || "Weak", color: "bg-danger", textColor: "text-danger" }
      : passwordStrength < 4
        ? { text: t("users.medium") || "Medium", color: "bg-warning", textColor: "text-warning" }
        : { text: t("users.strong") || "Strong", color: "bg-brand", textColor: "text-brand" };

  const handleNewPasswordChange = (event) => {
    const value = event.target.value;
    setNewPassword(value);
    setPasswordStrength(calculateStrength(value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast(t("errors.passwordsDoNotMatch") || "Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast(t("errors.passwordTooShort") || "Password must be at least 8 characters.", "error");
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
            // ignore malformed cached user
          }
        }
      }
      showToast(t("security.passwordChangedSuccessfully"), "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength(0);
    } catch (error) {
      showToast(error.message || "Error updating password.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {!isAdminOverride && (
        <PasswordField
          label={t("security.currentPassword") || "Current Password"}
          id="oldPassword"
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
          show={showOldPassword}
          onToggle={() => setShowOldPassword(!showOldPassword)}
          showLabel={t("settings.securityPage.showPassword")}
          hideLabel={t("settings.securityPage.hidePassword")}
        />
      )}

      <PasswordField
        label={t("security.newPassword") || "New Password"}
        id="newPassword"
        value={newPassword}
        onChange={handleNewPasswordChange}
        show={showNewPassword}
        onToggle={() => setShowNewPassword(!showNewPassword)}
        showLabel={t("settings.securityPage.showPassword")}
        hideLabel={t("settings.securityPage.hidePassword")}
      />
      {newPassword && (
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full transition-all duration-300 ${strengthInfo.color}`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            />
          </div>
          <span className={`text-micro font-semibold ${strengthInfo.textColor}`}>
            {strengthInfo.text}
          </span>
        </div>
      )}

      <PasswordField
        label={t("security.confirmPassword") || "Confirm New Password"}
        id="confirmPassword"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        show={showConfirmPassword}
        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        showLabel={t("settings.securityPage.showPassword")}
        hideLabel={t("settings.securityPage.hidePassword")}
      />
      {confirmPassword && (
        <p
          className={`text-micro font-medium ${
            newPassword === confirmPassword ? "text-brand" : "text-danger"
          }`}
        >
          {newPassword === confirmPassword
            ? t("users.passwordsMatch") || "Passwords match"
            : t("users.passwordsDoNotMatch") || "Passwords do not match"}
        </p>
      )}

      <div className="rounded-control border border-line bg-surface-2 px-3.5 py-2.5 text-micro text-ink-2">
        {t("settings.securityPage.passwordFormHint")}
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" loading={isSubmitting}>
          {t("settings.securityPage.passwordAction")}
        </Button>
      </div>
    </form>
  );
}

SecurityPasswordForm.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SecurityPasswordForm;
