import PropTypes from "prop-types";
import { useLocale } from "../../../../contexts/LocaleContext";
import { Banner, Button, Field, Input } from "@/shared/ui";

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  handleSubmit,
  loading,
  apiError,
  setModalOpen,
}) {
  const { t } = useLocale();
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {apiError && <Banner tone="danger">{apiError}</Banner>}

        <Field label={t("auth.email")} error={errors.email}>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email")}
            invalid={!!errors.email}
            disabled={loading}
          />
        </Field>

        <Field label={t("auth.password")} error={errors.password}>
          <Input
            type="password"
            name="current-password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            invalid={!!errors.password}
            disabled={loading}
          />
        </Field>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-label font-bold text-brand transition-colors hover:text-brand-strong hover:underline"
        >
          {t("auth.forgotPassword")}
        </button>

        <Button
          type="submit"
          className="h-[46px] w-full text-body-lg font-bold"
          loading={loading}
        >
          {t("auth.signIn")}
        </Button>

        <p className="text-center text-micro font-medium text-ink-3">
          {t("auth.needHelp")}
        </p>
      </form>
    </div>
  );
}

LoginForm.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  apiError: PropTypes.string,
  setModalOpen: PropTypes.func.isRequired,
};

export default LoginForm;
