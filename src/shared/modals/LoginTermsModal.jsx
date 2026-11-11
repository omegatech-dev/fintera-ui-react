import { useMemo } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../contexts/LocaleContext";
import { useGeneralSettings } from "../../contexts/generalSettings";
import { formatDate } from "../utils/formatters";
import enTranslations from "../../locales/en.json";
import esTranslations from "../../locales/es.json";

function LoginTermsModal({ isActive, onClose }) {
  const { t, locale } = useLocale();
  const { settings } = useGeneralSettings();
  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString(locale === "es" ? "es" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [locale]
  );
  const effectiveDate = settings.terms_effective_date
    ? formatDate(settings.terms_effective_date)
    : currentDate;

  const getTranslationArray = (key) => {
    const keys = key.split(".");
    const translations = locale === "es" ? esTranslations : enTranslations;
    const value = keys.reduce((current, k) => current?.[k], translations);
    return Array.isArray(value) ? value : [];
  };

  if (!isActive) return null;

  return (
    <div className="modal fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 dark:bg-black/70"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("termsAndConditions.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            aria-label={t("common.close")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("termsAndConditions.sections.welcome")}
          </p>

          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("termsAndConditions.lastUpdated")}: {effectiveDate}
          </div>

          {/* 1. Acceptance */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              1. {t("termsAndConditions.sections.acceptanceTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("termsAndConditions.sections.acceptance")}
            </p>
          </section>

          {/* 2. Description */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              2. {t("termsAndConditions.sections.descriptionTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("termsAndConditions.sections.description")}
            </p>
          </section>

          {/* 3. Account Registration */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              3. {t("termsAndConditions.sections.accountRegistrationTitle")}
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              {getTranslationArray("termsAndConditions.sections.accountRegistration.points").map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Use of Platform */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              4. {t("termsAndConditions.sections.useOfPlatformTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("termsAndConditions.sections.useOfPlatform")}
            </p>
          </section>

          {/* 5. Fees and Payments */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              5. {t("termsAndConditions.sections.feesAndPaymentsTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("termsAndConditions.sections.feesAndPayments")}
            </p>
          </section>

          {/* 6. Notifications and Communications (Email) */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              6. {t("termsAndConditions.sections.notificationsTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              {t("termsAndConditions.sections.notifications.intro")}
            </p>
            <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              {getTranslationArray("termsAndConditions.sections.notifications.points").map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 7. Privacy */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              7. {t("termsAndConditions.sections.privacyPolicyTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("termsAndConditions.sections.privacyPolicy")}
            </p>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              8. {t("termsAndConditions.sections.limitationOfLiabilityTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("termsAndConditions.sections.limitationOfLiability")}
            </p>
          </section>

          {/* 9. Account Suspension */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              9. {t("termsAndConditions.sections.accountSuspensionTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("termsAndConditions.sections.accountSuspension")}
            </p>
          </section>

          {/* 10. Amendments */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              10. {t("termsAndConditions.sections.amendmentsTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("termsAndConditions.sections.amendments")}
            </p>
          </section>

          {/* 11. Contact */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              11. {t("termsAndConditions.sections.contactInformationTitle")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              {t("termsAndConditions.sections.contactInformation.content")}
            </p>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {settings.legal_name && (
                <p>
                  {t("termsAndConditions.sections.contactInformation.legalName")}:{" "}
                  {settings.legal_name}
                </p>
              )}
              {settings.support_email && (
                <p>
                  {t("termsAndConditions.sections.contactInformation.email")}:{" "}
                  {settings.support_email}
                </p>
              )}
              {settings.support_whatsapp && (
                <p>
                  {t("termsAndConditions.sections.contactInformation.phone")}:{" "}
                  {settings.support_whatsapp}
                </p>
              )}
              {settings.legal_address && (
                <p>
                  {t("termsAndConditions.sections.contactInformation.address")}:{" "}
                  {settings.legal_address}
                </p>
              )}
              {settings.website && (
                <p>
                  {t("termsAndConditions.sections.contactInformation.website")}:{" "}
                  <a
                    href={settings.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {settings.website}
                  </a>
                </p>
              )}
            </div>
          </section>

          <p className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
            {t("termsAndConditions.footerNote")}
          </p>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

LoginTermsModal.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoginTermsModal;
