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
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-card border border-line bg-surface p-6 shadow-pop sm:p-8"
      >
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

        <Button type="submit" className="w-full" loading={loading}>
          {t("auth.signIn")}
        </Button>

        <div className="border-t border-line pt-4 text-center">
          <p className="mb-2 text-micro text-ink-3">{t("auth.needHelp")}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            {t("auth.forgotPassword")}
          </Button>
        </div>
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
