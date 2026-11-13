import { useLocale } from "../../../../contexts/LocaleContext";
import { useGeneralSettings } from "../../../../contexts/generalSettings";
import { formatDate } from "../../../../shared/utils/formatters";
import { useState, useEffect } from "react";
import en from "../../../../locales/en.json";
import es from "../../../../locales/es.json";

function TermsAndCondition() {
  const { t, locale } = useLocale();
  const { settings } = useGeneralSettings();
  const [currentDate, setCurrentDate] = useState("");
  const effectiveDate = settings.terms_effective_date
    ? formatDate(settings.terms_effective_date)
    : currentDate;

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, [locale]);

  const getTranslationArray = (key) => {
    const keys = key.split(".");
    const translations = locale === "es" ? es : en;
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

  const sectionShell = "border-t border-line pt-[18px] first:border-t-0 first:pt-0";

  const SectionHeading = ({ number, children }) => (
    <div className="mb-2 flex items-center gap-2.5">
      {number != null && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-label font-bold text-brand-strong">
          {number}
        </span>
      )}
      <h2 className="text-[15px] font-bold text-ink">{children}</h2>
    </div>
  );

  const ContactRow = ({ icon, label, children }) => (
    <p className="flex items-center gap-2 text-body text-ink-2">
      <svg className="h-4 w-4 shrink-0 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {icon}
      </svg>
      <span>
        <span className="font-semibold text-ink">{label}:</span> {children}
      </span>
    </p>
  );

  return (
    <div id="tab7" className="tab-pane active w-full">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-title font-bold text-ink">
            {t("termsAndConditions.title")}
          </h2>
          <p className="mt-1 max-w-2xl text-body text-ink-3">
            {t("termsAndConditions.sections.welcome")}
          </p>
        </div>
        <span className="inline-flex h-[30px] shrink-0 items-center rounded-control bg-surface-2 px-2.5 text-micro font-semibold text-ink-2">
          {t("termsAndConditions.lastUpdated")}: {effectiveDate}
        </span>
      </header>

      <div className="mt-4 flex flex-col gap-[18px]">
        {hasCustomContent ? (
          <section className={sectionShell}>
            <div className="space-y-3">
              {customParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="whitespace-pre-line text-body leading-relaxed text-ink-2"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ) : (
          <>
        <section className={sectionShell}>
          <SectionHeading number="1">
            {t("termsAndConditions.sections.acceptanceTitle")}
          </SectionHeading>
          <p className="text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.acceptance")}
          </p>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="2">
            {t("termsAndConditions.sections.descriptionTitle")}
          </SectionHeading>
          <p className="text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.description")}
          </p>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="3">
            {t("termsAndConditions.sections.accountRegistrationTitle")}
          </SectionHeading>
          <ul className="space-y-2">
            {getTranslationArray("termsAndConditions.sections.accountRegistration.points").map((point, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-body leading-relaxed text-ink-2">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="4">
            {t("termsAndConditions.sections.useOfPlatformTitle")}
          </SectionHeading>
          <p className="text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.useOfPlatform")}
          </p>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="5">
            {t("termsAndConditions.sections.feesAndPaymentsTitle")}
          </SectionHeading>
          <p className="text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.feesAndPayments")}
          </p>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="6">
            {t("termsAndConditions.sections.notificationsTitle")}
          </SectionHeading>
          <p className="mb-2 text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.notifications.intro")}
          </p>
          <ul className="space-y-1.5">
            {getTranslationArray("termsAndConditions.sections.notifications.points").map((point, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
                <span className="text-body leading-relaxed text-ink-2">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="7">
            {t("termsAndConditions.sections.privacyPolicyTitle")}
          </SectionHeading>
          <p className="text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.privacyPolicy")}
          </p>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="8">
            {t("termsAndConditions.sections.limitationOfLiabilityTitle")}
          </SectionHeading>
          <p className="text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.limitationOfLiability")}
          </p>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="9">
            {t("termsAndConditions.sections.accountSuspensionTitle")}
          </SectionHeading>
          <p className="text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.accountSuspension")}
          </p>
        </section>

        <section className={sectionShell}>
          <SectionHeading number="10">
            {t("termsAndConditions.sections.amendmentsTitle")}
          </SectionHeading>
          <p className="text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.amendments")}
          </p>
        </section>
          </>
        )}

        <section className={sectionShell}>
          <SectionHeading number={hasCustomContent ? undefined : "11"}>
            {t("termsAndConditions.sections.contactInformationTitle")}
          </SectionHeading>
          <p className="mb-2 text-body leading-relaxed text-ink-2">
            {t("termsAndConditions.sections.contactInformation.content")}
          </p>
          <div className="space-y-1.5">
            {settings.legal_name && (
              <ContactRow
                label={t("termsAndConditions.sections.contactInformation.legalName")}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" />}
              >
                {settings.legal_name}
              </ContactRow>
            )}
            {settings.support_email && (
              <ContactRow
                label={t("termsAndConditions.sections.contactInformation.email")}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
              >
                {settings.support_email}
              </ContactRow>
            )}
            {settings.support_whatsapp && (
              <ContactRow
                label={t("termsAndConditions.sections.contactInformation.phone")}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}
              >
                {settings.support_whatsapp}
              </ContactRow>
            )}
            {settings.legal_address && (
              <ContactRow
                label={t("termsAndConditions.sections.contactInformation.address")}
                icon={
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </>
                }
              >
                {settings.legal_address}
              </ContactRow>
            )}
            {settings.website && (
              <ContactRow
                label={t("termsAndConditions.sections.contactInformation.website")}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.5 4-6 4-9s-1.5-6.5-4-9c-2.5 2.5-4 6-4 9s1.5 6.5 4 9zM3 12h18" />}
              >
                <a
                  href={settings.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand hover:underline"
                >
                  {settings.website}
                </a>
              </ContactRow>
            )}
          </div>
        </section>
      </div>

      <p className="mt-4 rounded-control bg-surface-2 p-3.5 text-body text-ink-3">
        {t("termsAndConditions.footerNote")}
      </p>
    </div>
  );
}

export default TermsAndCondition;
