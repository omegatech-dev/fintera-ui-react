import { useMemo } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../contexts/LocaleContext";
import { useGeneralSettings } from "../../contexts/generalSettings";
import { formatDate } from "../utils/formatters";
import { Button, Dialog } from "../ui";
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

  const customContent =
    locale === "en"
      ? String(settings.terms_content_en || "").trim()
      : String(settings.terms_content_es || "").trim();
  const hasCustomContent = customContent.length > 0;
  const customParagraphs = hasCustomContent
    ? customContent
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];

  const sections = [
    {
      title: t("termsAndConditions.sections.acceptanceTitle"),
      body: t("termsAndConditions.sections.acceptance"),
    },
    {
      title: t("termsAndConditions.sections.descriptionTitle"),
      body: t("termsAndConditions.sections.description"),
    },
    {
      title: t("termsAndConditions.sections.accountRegistrationTitle"),
      points: getTranslationArray(
        "termsAndConditions.sections.accountRegistration.points"
      ),
    },
    {
      title: t("termsAndConditions.sections.useOfPlatformTitle"),
      body: t("termsAndConditions.sections.useOfPlatform"),
    },
    {
      title: t("termsAndConditions.sections.feesAndPaymentsTitle"),
      body: t("termsAndConditions.sections.feesAndPayments"),
    },
    {
      title: t("termsAndConditions.sections.notificationsTitle"),
      body: t("termsAndConditions.sections.notifications.intro"),
      points: getTranslationArray("termsAndConditions.sections.notifications.points"),
    },
    {
      title: t("termsAndConditions.sections.privacyPolicyTitle"),
      body: t("termsAndConditions.sections.privacyPolicy"),
    },
    {
      title: t("termsAndConditions.sections.limitationOfLiabilityTitle"),
      body: t("termsAndConditions.sections.limitationOfLiability"),
    },
    {
      title: t("termsAndConditions.sections.accountSuspensionTitle"),
      body: t("termsAndConditions.sections.accountSuspension"),
    },
    {
      title: t("termsAndConditions.sections.amendmentsTitle"),
      body: t("termsAndConditions.sections.amendments"),
    },
  ];

  const contactRows = [
    ["legalName", settings.legal_name],
    ["email", settings.support_email],
    ["phone", settings.support_whatsapp],
    ["address", settings.legal_address],
  ].filter(([, value]) => Boolean(value));

  return (
    <Dialog
      open={Boolean(isActive)}
      onClose={onClose}
      title={t("termsAndConditions.title")}
      description={`${t("termsAndConditions.lastUpdated")}: ${effectiveDate}`}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {t("common.close")}
        </Button>
      }
      className="max-h-[90vh]"
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-body text-ink-2">
        <p>{t("termsAndConditions.sections.welcome")}</p>

        {hasCustomContent ? (
          <div className="space-y-3">
            {customParagraphs.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          sections.map((section, index) => (
            <section key={index}>
              <h3 className="mb-1 text-body font-semibold text-ink">
                {index + 1}. {section.title}
              </h3>
              {section.body && (
                <p className="text-body leading-relaxed">{section.body}</p>
              )}
              {section.points && section.points.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-2">
                      <span className="mt-0.5 text-brand-strong">•</span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))
        )}

        <section>
          <h3 className="mb-1 text-body font-semibold text-ink">
            {hasCustomContent
              ? t("termsAndConditions.sections.contactInformationTitle")
              : `11. ${t("termsAndConditions.sections.contactInformationTitle")}`}
          </h3>
          <p className="text-body leading-relaxed">
            {t("termsAndConditions.sections.contactInformation.content")}
          </p>
          <div className="mt-1 space-y-1">
            {contactRows.map(([key, value]) => (
              <p key={key}>
                <span className="font-semibold text-ink">
                  {t(`termsAndConditions.sections.contactInformation.${key}`)}:{" "}
                </span>
                {value}
              </p>
            ))}
            {settings.website && (
              <p>
                <span className="font-semibold text-ink">
                  {t("termsAndConditions.sections.contactInformation.website")}:{" "}
                </span>
                <a
                  href={settings.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand-strong hover:underline"
                >
                  {settings.website}
                </a>
              </p>
            )}
          </div>
        </section>

        <p className="border-t border-line pt-3 text-micro text-ink-3">
          {t("termsAndConditions.footerNote")}
        </p>
      </div>
    </Dialog>
  );
}

LoginTermsModal.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoginTermsModal;
