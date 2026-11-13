import React, { useState, useRef } from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";
import logoColor from "../../assets/images/logo/logo-color.svg";
import logoWhite from "../../assets/images/logo/logo-white.svg";
import { usersApi } from "../../features/users/api";
import Dialog from "../ui/Dialog";

// Cross button component remains the same
export const CrossBtn = ({ close }) => (
  <div className="absolute top-0 right-0 pt-5 pr-5">
    <button
      aria-label="none"
      type="button"
      onClick={close}
      className="rounded-md bg-white dark:bg-darkblack-500 focus:outline-hidden"
    >
      <span className="sr-only">Close</span>
      <svg
        className="stroke-darkblack-300"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 6L18 18M6 18L18 6L6 18Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
);

export const HeadingLogo = () => (
  <Link to="/signin" className="block mb-7">
    <img src={logoColor} className="block dark:hidden" alt="" />
    <img src={logoWhite} className="hidden dark:block" alt="" />
  </Link>
);

export const ResetPass = ({ email, setEmail, error, loading, onSubmit, onClose }) => {
  const { t } = useLocale();
  return (
    <div className="step-content step-1">
      <div className="relative max-w-[492px] transform overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 p-8 text-left transition-all">
        <CrossBtn close={onClose} />
        <div>
          <HeadingLogo />
          <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
            {t('auth.resetPassword')}
          </h3>
          <p className="text-base font-medium text-bgray-600 dark:text-darkblack-300 mb-7">
            {t('auth.enterEmailAssociated')}
          </p>

          {error && <p className="text-red-500 mb-3" aria-live="assertive">{error}</p>}

          <form onSubmit={onSubmit}>
            <div className="mb-8">
              <input
                type="email"
                required
                className="rounded-lg bg-[#F5F5F5] dark:bg-darkblack-500 dark:text-white p-4 border-0 focus:border focus:ring-0 focus:border-success-300 w-full placeholder:font-medium text-base h-14"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Link
              to="/signin"
              className="block text-sm font-bold text-success-300 mb-8 underline"
            >
              {t('auth.backToSignIn')}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full py-4 text-white bg-success-300 hover:bg-success-400 transition-all justify-center text-base font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? t('auth.sending') : t('common.continue')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const CodeVerify = ({
  email,
  digits,
  setDigits,
  error,
  loading,
  resending,
  onSubmit,
  onResend,
  onClose
}) => {
  const { t } = useLocale();
  const inputs = useRef([]);

  const handleChange = (index, value) => {
    if (/^\d$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);

      if (index < 5) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(paste)) {
      const newDigits = paste.split('');
      setDigits(newDigits);
      inputs.current[5].focus();
    }
  };

  const maskedEmail = email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, '$1***@$2');

  return (
    <div className="step-content step-2">
      <div className="relative max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 p-8 text-left transition-all">
        <CrossBtn close={onClose} />
        <div>
          <HeadingLogo />
          <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
            {t('auth.enterVerificationCode')}
          </h3>
          <p className="text-base font-medium text-bgray-600 dark:text-darkblack-300 mb-7">
            {t('auth.sentTo')} {maskedEmail}
          </p>

          {error && <p className="text-red-500 mb-3" aria-live="assertive">{error}</p>}

          <form onSubmit={onSubmit}>
            <div className="flex space-x-6 mb-8">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  className="px-5 py-3 rounded-xl text-2xl border border-transparent focus:ring-0 focus:border focus:border-success-300 font-bold text-bgray-900 bg-[#F5F5F5] dark:bg-darkblack-500 dark:text-white w-14 h-14 text-center"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onPaste={handlePaste}
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              className="block text-sm font-bold text-success-300 mb-8 disabled:opacity-50"
            >
              {resending ? t('auth.sending') : t('auth.resendCode')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full py-4 text-white bg-success-300 hover:bg-success-400 transition-all justify-center text-base font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? t('auth.verifying') : t('auth.verify')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const NewPass = ({
  password,
  setPassword,
  confirm,
  setConfirm,
  error,
  loading,
  onSubmit,
  onClose
}) => {
  const { t } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="step-content step-3">
      <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 p-8 text-left transition-all">
        <CrossBtn close={onClose} />
        <div>
          <HeadingLogo />
          <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
            {t('auth.createNewPassword')}
          </h3>
          <p className="text-base font-medium text-bgray-600 dark:text-darkblack-300 mb-7">
            {t('auth.enterNewPassword')}
          </p>

          {error && <p className="text-red-500 mb-3" aria-live="assertive">{error}</p>}

          <form onSubmit={onSubmit}>
            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                className="text-bgray-800 text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-bgray-500 placeholder:text-base dark:text-white dark:bg-darkblack-500 dark:border-0"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-4 right-4 bottom-4"
              >
                {/* Eye icon SVG remains same */}
              </button>
            </div>
            <div className="mb-8 relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="text-bgray-800 text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-bgray-500 placeholder:text-base dark:bg-darkblack-500 dark:border-0"
                placeholder={t('auth.confirmPassword')}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-4 right-4 bottom-4"
              >
                {/* Eye icon SVG remains same */}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full py-4 text-white bg-success-300 hover:bg-success-400 transition-all justify-center text-base font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? t('auth.updating') : t('auth.confirmPassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const SuccessFull = ({ onClose }) => {
  const { t } = useLocale();
  return (
    <div className="step-content step-4">
      <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 p-8 text-left transition-all">
        <CrossBtn close={onClose} />
        <div className="text-center mt-4">
          <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
            {t('auth.passwordUpdatedSuccessfully')}
          </h3>
          <p className="text-base font-medium text-bgray-600 dark:text-darkblack-300 mb-7">
            {t('auth.passwordResetCorrectly')}
          </p>
          <Link
            to="/signin"
            onClick={onClose}
            className="flex w-full py-4 text-white bg-success-300 hover:bg-success-400 transition-all justify-center text-base font-semibold rounded-lg"
          >
            {t('auth.backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

function PasswordResetModal({ isActive, handleActive }) {
  const { t } = useLocale();
  const [step, setStep] = useState('reset');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const resetState = () => {
    setStep('reset');
    setEmail('');
    setDigits(Array(6).fill(''));
    setPassword('');
    setConfirm('');
    setError('');
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await usersApi.sendRecoveryCode(email);
      setStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const code = digits.join('').trim();
      if (code.length !== 6) {
        setError(t('auth.invalidVerificationCode'));
        return;
      }
      const data = await usersApi.verifyRecoveryCode(email.trim(), code);

      if (data.valid !== true) {
        setError(data.error || t('auth.invalidVerificationCode'));
        return;
      }

      setStep('newPass');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');

    try {
      await usersApi.sendRecoveryCode(email);
    } catch {
      setError('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (password !== confirm) {
        throw new Error(t('auth.passwordsDoNotMatch'));
      }
      if (password.length < 8) {
        throw new Error(t('auth.passwordMinLength'));
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error(t('auth.passwordUppercaseRequired'));
      }
      if (!/\d/.test(password)) {
        throw new Error(t('auth.passwordNumberRequired'));
      }

      await usersApi.updatePasswordWithCode({
        email: email.trim(),
        code: digits.join('').trim(),
        new_password: password,
        new_password_confirmation: confirm
      });

      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    handleActive(false);
    resetState();
  };

  return (
    <Dialog
      open={Boolean(isActive)}
      onClose={close}
      size="lg"
      className="max-w-lg p-0"
    >
      <div className="modal-content w-full">
        {step === 'reset' && (
          <ResetPass
            email={email}
            setEmail={setEmail}
            error={error}
            loading={loading}
            onSubmit={handleSendCode}
            onClose={close}
          />
        )}

        {step === 'verify' && (
          <CodeVerify
            email={email}
            digits={digits}
            setDigits={setDigits}
            error={error}
            loading={loading}
            resending={resending}
            onSubmit={handleVerifyCode}
            onResend={handleResendCode}
            onClose={close}
          />
        )}

        {step === 'newPass' && (
          <NewPass
            password={password}
            setPassword={setPassword}
            confirm={confirm}
            setConfirm={setConfirm}
            error={error}
            loading={loading}
            onSubmit={handleUpdatePassword}
            onClose={close}
          />
        )}

        {step === 'success' && <SuccessFull onClose={close} />}
      </div>
    </Dialog>
  );
}

PasswordResetModal.propTypes = {
  isActive: ProtoTypes.bool,
  handleActive: ProtoTypes.func,
};

export default PasswordResetModal;