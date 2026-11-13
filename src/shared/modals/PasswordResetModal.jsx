import { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";
import { usersApi } from "../../features/users/api";
import { Banner, Button, Dialog, Field, Input } from "../ui";

function CloseButton({ onClose }) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={t("common.close")}
      className="absolute right-3 top-3 rounded-control p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 6L18 18M6 18L18 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

CloseButton.propTypes = {
  onClose: PropTypes.func.isRequired,
};

function EyeIcon({ hidden }) {
  if (hidden) {
    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.832-6.906M6.414 6.414A9.97 9.97 0 0012 5c5.523 0 10 4.477 10 10a9.97 9.97 0 01-1.414 5.586M15 15l-3-3m0 0l-3-3m3 3V6" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

EyeIcon.propTypes = {
  hidden: PropTypes.bool,
};

function PasswordField({ id, label, value, onChange, autoComplete }) {
  const { t } = useLocale();
  const [show, setShow] = useState(false);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-label font-semibold text-ink-2">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-control p-1.5 text-ink-3 transition-colors hover:bg-surface-2"
        >
          <EyeIcon hidden={show} />
        </button>
      </div>
    </div>
  );
}

PasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  autoComplete: PropTypes.string,
};

function ErrorBanner({ error }) {
  if (!error) return null;
  return <Banner tone="danger">{error}</Banner>;
}

ErrorBanner.propTypes = {
  error: PropTypes.string,
};

function ResetStep({ email, setEmail, error, loading, onSubmit }) {
  const { t } = useLocale();
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBanner error={error} />
      <Field label={t("auth.email")}>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder={t("auth.email")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
        />
      </Field>
      <Link
        to="/signin"
        className="block text-label font-bold text-brand-strong hover:underline"
      >
        {t("auth.backToSignIn")}
      </Link>
      <Button type="submit" className="w-full" loading={loading}>
        {loading ? t("auth.sending") : t("common.continue")}
      </Button>
    </form>
  );
}

ResetStep.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

function VerifyStep({
  digits,
  setDigits,
  error,
  loading,
  resending,
  onSubmit,
  onResend,
}) {
  const { t } = useLocale();
  const inputs = useRef([]);

  const handleChange = (index, value) => {
    if (value === "") {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    if (!/^\d$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pasted)) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBanner error={error} />
      <div className="flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            maxLength={1}
            autoFocus={index === 0}
            aria-label={`${t("auth.verificationDigit")} ${index + 1}`}
            className="h-12 w-full min-w-0 rounded-control border border-line-strong bg-surface text-center text-section font-bold text-ink outline-none focus:border-brand"
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onResend}
        disabled={resending}
        className="text-label font-bold text-brand-strong hover:underline disabled:opacity-60"
      >
        {resending ? t("auth.sending") : t("auth.resendCode")}
      </button>
      <Button type="submit" className="w-full" loading={loading}>
        {loading ? t("auth.verifying") : t("auth.verify")}
      </Button>
    </form>
  );
}

VerifyStep.propTypes = {
  digits: PropTypes.arrayOf(PropTypes.string).isRequired,
  setDigits: PropTypes.func.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
  resending: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired,
};

function NewPasswordStep({
  password,
  setPassword,
  confirm,
  setConfirm,
  error,
  loading,
  onSubmit,
}) {
  const { t } = useLocale();
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBanner error={error} />
      <PasswordField
        id="reset-new-password"
        label={t("auth.password")}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
      />
      <PasswordField
        id="reset-confirm-password"
        label={t("auth.confirmPassword")}
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        autoComplete="new-password"
      />
      <Button type="submit" className="w-full" loading={loading}>
        {loading ? t("auth.updating") : t("auth.confirmPassword")}
      </Button>
    </form>
  );
}

NewPasswordStep.propTypes = {
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  confirm: PropTypes.string.isRequired,
  setConfirm: PropTypes.func.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

function SuccessStep({ onClose }) {
  const { t } = useLocale();
  return (
    <div className="space-y-4">
      <Link
        to="/signin"
        onClick={onClose}
        className="inline-flex h-11 w-full items-center justify-center rounded-control bg-brand px-4 text-body-lg font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        {t("auth.backToSignIn")}
      </Link>
    </div>
  );
}

SuccessStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

function PasswordResetModal({ isActive, handleActive }) {
  const { t } = useLocale();
  const [step, setStep] = useState("reset");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const resetState = useCallback(() => {
    setStep("reset");
    setEmail("");
    setDigits(Array(6).fill(""));
    setPassword("");
    setConfirm("");
    setError("");
  }, []);

  const handleSendCode = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await usersApi.sendRecoveryCode(email.trim());
      setStep("verify");
    } catch (err) {
      setError(err?.message || t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const code = digits.join("").trim();
      if (code.length !== 6) {
        setError(t("auth.invalidVerificationCode"));
        return;
      }
      const data = await usersApi.verifyRecoveryCode(email.trim(), code);

      if (data.valid !== true) {
        setError(data.error || t("auth.invalidVerificationCode"));
        return;
      }

      setStep("newPass");
    } catch (err) {
      setError(err?.message || t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError("");

    try {
      await usersApi.sendRecoveryCode(email.trim());
    } catch {
      setError(t("auth.resendCodeError"));
    } finally {
      setResending(false);
    }
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (password !== confirm) {
        throw new Error(t("auth.passwordsDoNotMatch"));
      }
      if (password.length < 8) {
        throw new Error(t("auth.passwordMinLength"));
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error(t("auth.passwordUppercaseRequired"));
      }
      if (!/\d/.test(password)) {
        throw new Error(t("auth.passwordNumberRequired"));
      }

      await usersApi.updatePasswordWithCode({
        email: email.trim(),
        code: digits.join("").trim(),
        new_password: password,
        new_password_confirmation: confirm,
      });

      setStep("success");
    } catch (err) {
      setError(err?.message || t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const close = useCallback(() => {
    handleActive(false);
    resetState();
  }, [handleActive, resetState]);

  const maskedEmail = email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, "$1***@$2");
  const copy = {
    reset: {
      title: t("auth.resetPassword"),
      description: t("auth.enterEmailAssociated"),
    },
    verify: {
      title: t("auth.enterVerificationCode"),
      description: `${t("auth.sentTo")} ${maskedEmail}`,
    },
    newPass: {
      title: t("auth.createNewPassword"),
      description: t("auth.enterNewPassword"),
    },
    success: {
      title: t("auth.passwordUpdatedSuccessfully"),
      description: t("auth.passwordResetCorrectly"),
    },
  }[step];

  return (
    <Dialog
      open={Boolean(isActive)}
      onClose={close}
      title={copy.title}
      description={copy.description}
      size="md"
      className="relative max-w-lg"
    >
      {step === "reset" && (
        <ResetStep
          email={email}
          setEmail={setEmail}
          error={error}
          loading={loading}
          onSubmit={handleSendCode}
        />
      )}

      {step === "verify" && (
        <VerifyStep
          digits={digits}
          setDigits={setDigits}
          error={error}
          loading={loading}
          resending={resending}
          onSubmit={handleVerifyCode}
          onResend={handleResendCode}
        />
      )}

      {step === "newPass" && (
        <NewPasswordStep
          password={password}
          setPassword={setPassword}
          confirm={confirm}
          setConfirm={setConfirm}
          error={error}
          loading={loading}
          onSubmit={handleUpdatePassword}
        />
      )}

      {step === "success" && <SuccessStep onClose={close} />}

      <CloseButton onClose={close} />
    </Dialog>
  );
}

PasswordResetModal.propTypes = {
  isActive: PropTypes.bool,
  handleActive: PropTypes.func.isRequired,
};

export default PasswordResetModal;
