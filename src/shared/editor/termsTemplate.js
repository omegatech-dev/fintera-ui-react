import enTranslations from "../../locales/en.json";
import esTranslations from "../../locales/es.json";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const plainTextToHtml = (value) =>
  escapeHtml(value).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>");

const buildPointList = (points) =>
  points?.length
    ? `<ul>${points
        .map((point) => `<li>${plainTextToHtml(point)}</li>`)
        .join("")}</ul>`
    : "";

/**
 * Default terms body as editable HTML. It intentionally excludes the welcome
 * and contact blocks because the terms page and login modal render those from
 * the settings/i18n shell to avoid duplicated sections.
 */
export function buildDefaultTermsHtml(locale = "es") {
  const sections =
    locale === "en" ? enTranslations.termsAndConditions.sections : esTranslations.termsAndConditions.sections;

  const blocks = [
    {
      title: sections.acceptanceTitle,
      body: sections.acceptance,
    },
    {
      title: sections.descriptionTitle,
      body: sections.description,
    },
    {
      title: sections.accountRegistrationTitle,
      points: sections.accountRegistration?.points,
    },
    {
      title: sections.useOfPlatformTitle,
      body: sections.useOfPlatform,
    },
    {
      title: sections.feesAndPaymentsTitle,
      body: sections.feesAndPayments,
    },
    {
      title: sections.notificationsTitle,
      body: sections.notifications?.intro,
      points: sections.notifications?.points,
    },
    {
      title: sections.privacyPolicyTitle,
      body: sections.privacyPolicy,
    },
    {
      title: sections.limitationOfLiabilityTitle,
      body: sections.limitationOfLiability,
    },
    {
      title: sections.accountSuspensionTitle,
      body: sections.accountSuspension,
    },
    {
      title: sections.amendmentsTitle,
      body: sections.amendments,
    },
  ];

  return blocks
    .map(
      (block, index) =>
        `<h2>${index + 1}. ${escapeHtml(block.title)}</h2>` +
        (block.body ? `<p>${plainTextToHtml(block.body)}</p>` : "") +
        buildPointList(block.points)
    )
    .join("");
}

export default buildDefaultTermsHtml;
