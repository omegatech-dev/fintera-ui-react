import { useContext } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import SecurityPasswordForm from "../../components/SecurityPasswordForm";
import AuthContext from "../../../../contexts/AuthContext";
import { Toggle } from "../../../../shared/ui";
import { useLocale } from "../../../../contexts/LocaleContext";

function Security() {
  const { token, user } = useContext(AuthContext);
  const { t } = useLocale();
  const { userId } = useParams();
  const mustChangePassword = user?.must_change_password && String(user?.id || user?.ID) === String(userId);

  const recommendations = [
    t("settings.securityPage.recommendationUnique"),
    t("settings.securityPage.recommendationLength"),
    t("settings.securityPage.recommendationPatterns"),
  ];

  return (
    <div id="tab6" className="tab-pane active w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {mustChangePassword && (
          <div className="mb-4 flex gap-3 rounded-control border border-warning-soft bg-warning-soft/60 p-3.5">
            <svg className="h-5 w-5 shrink-0 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-body-lg font-semibold text-warning">
                {t("settings.securityPage.mustChangeTitle")}
              </p>
              <p className="mt-0.5 text-body text-ink-2">
                {t("settings.securityPage.mustChangeDescription")}
              </p>
            </div>
          </div>
        )}

        <section aria-labelledby="security-password">
          <header className="mb-3">
            <h2 id="security-password" className="text-[15px] font-bold text-ink">
              {t("settings.securityPage.passwordTitle")}
            </h2>
            <p className="mt-0.5 text-label font-medium text-ink-3">
              {t("settings.securityPage.passwordSubtitle")}
            </p>
          </header>

          {token ? (
            <SecurityPasswordForm userId={userId} />
          ) : (
            <div className="space-y-3" aria-live="polite" aria-busy="true">
              <div className="h-10 animate-pulse rounded-control bg-surface-2" />
              <div className="h-10 animate-pulse rounded-control bg-surface-2" />
              <p className="text-body text-ink-3">
                {t("settings.securityPage.loading")}
              </p>
            </div>
          )}

          <p className="mt-1.5 text-micro text-ink-3">
            {t("settings.securityPage.passwordHint")}
          </p>
        </section>

        <section
          aria-labelledby="security-two-factor"
          className="mt-[18px] border-t border-line pt-[18px]"
        >
          <header className="mb-3">
            <h2 id="security-two-factor" className="text-[15px] font-bold text-ink">
              {t("settings.securityPage.twoFactorTitle")}
            </h2>
            <p className="mt-0.5 text-label font-medium text-ink-3">
              {t("settings.securityPage.twoFactorDescription")}
            </p>
          </header>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-surface-2 px-3.5 py-3">
            <span className="inline-flex items-center gap-2 text-body font-medium text-ink-3">
              <span className="h-1.5 w-1.5 rounded-full bg-line-strong" aria-hidden="true" />
              {t("settings.securityPage.twoFactorStatus")}
            </span>
            <Toggle
              checked={false}
              disabled
              label={t("settings.securityPage.twoFactorTitle")}
            />
          </div>
          <p className="mt-1.5 text-micro text-ink-3">
            {t("settings.securityPage.twoFactorHint")}
          </p>
        </section>

        <section
          aria-labelledby="security-sessions"
          className="mt-[18px] border-t border-line pt-[18px]"
        >
          <header className="mb-3">
            <h2 id="security-sessions" className="text-[15px] font-bold text-ink">
              {t("settings.securityPage.sessionsTitle")}
            </h2>
            <p className="mt-0.5 text-label font-medium text-ink-3">
              {t("settings.securityPage.sessionsDescription")}
            </p>
          </header>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-surface-2 px-3.5 py-3">
            <span className="inline-flex items-center gap-2 text-body font-medium text-ink-3">
              <span className="h-1.5 w-1.5 rounded-full bg-line-strong" aria-hidden="true" />
              {t("settings.securityPage.sessionsStatus")}
            </span>
            <button
              type="button"
              disabled
              className="h-[34px] cursor-not-allowed rounded-control border border-line px-3 text-label font-semibold text-ink-3 opacity-60"
            >
              {t("settings.securityPage.sessionsAction")}
            </button>
          </div>
          <p className="mt-1.5 text-micro text-ink-3">
            {t("settings.securityPage.sessionsHint")}
          </p>
        </section>

        <section
          aria-labelledby="security-recommendations"
          className="mt-[18px] border-t border-line pt-[18px]"
        >
          <h2 id="security-recommendations" className="text-[15px] font-bold text-ink">
            {t("settings.securityPage.recommendationsTitle")}
          </h2>
          <ul className="mt-2.5 space-y-2">
            {recommendations.map((recommendation) => (
              <li key={recommendation} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                <p className="text-body text-ink-2">{recommendation}</p>
              </li>
            ))}
          </ul>
        </section>
      </motion.div>
    </div>
  );
}

export default Security;
