import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "@/contexts/AuthContext";
import PasswordResetModal from "@/shared/modals/PasswordResetModal";
import LeftSide from "./LeftSide";
import { useLocale } from "@/contexts/LocaleContext";
import { resolvePostLoginDestination } from "../../postLoginDestination";

function SignIn() {
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLocale();

  // Only auto-fill admin credentials during local development or staging.
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isDevOrStaging =
    (typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production") ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes("staging");

  const [email, setEmail] = useState(() => (isDevOrStaging ? import.meta.env.VITE_DEFAULT_EMAIL : ""));
  const [password, setPassword] = useState(() => (isDevOrStaging ? import.meta.env.VITE_DEFAULT_PASSWORD : ""));
  const [errors, setErrors] = useState({ email: "", password: "" });

  const navigate = useNavigate();
  const { login, loading, error: apiError } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = t('signin.emailRequired');
      valid = false;
    }

    if (!password) {
      newErrors.password = t('signin.passwordRequired');
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;

    const result = await login(email, password);
    if (result?.success) {
      const destination = resolvePostLoginDestination(result.user);
      if (destination.type === "external") {
        window.location.assign(destination.path);
        return;
      }
      navigate(destination.path);
    }
    // If not success, error is handled by apiError from context
  };

  return (
    <div className="flex w-full justify-center">
      <LeftSide
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        errors={errors}
        handleSubmit={handleSubmit}
        loading={loading}
        apiError={apiError ? t(apiError) : null}
        setModalOpen={setModalOpen}
      />
      <PasswordResetModal
        isActive={modalOpen}
        handleActive={setModalOpen}
      />
    </div>
  );
}

SignIn.propTypes = {};

export default SignIn;