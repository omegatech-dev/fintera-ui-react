import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";

const HAS_TIMEZONE = /(z|[+-]\d{2}:?\d{2})$/i;

export const parseAuditDate = (value) => {
  if (!value) return null;
  const normalized =
    typeof value === "string" && !HAS_TIMEZONE.test(value) ? `${value}Z` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getAuditDateKey = (value) => {
  const date = parseAuditDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
};

export const formatAuditDateLabel = (value, locale) => {
  const date = parseAuditDate(value);
  if (!date) return "";
  return format(
    date,
    locale === "es" ? "EEEE, d 'de' MMMM" : "EEEE, MMMM d",
    { locale: locale === "es" ? es : enUS }
  );
};

export const formatAuditTime = (value, locale, t) => {
  const date = parseAuditDate(value);
  if (!date) return t("common.notAvailable");
  const rawLocale = t("common.locale_code");
  const localeCode = /^[a-z]{2}(-[a-z]{2})?$/i.test(rawLocale || "")
    ? rawLocale
    : locale === "es"
      ? "es-ES"
      : "en-US";
  return date
    .toLocaleTimeString(localeCode, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\s+/g, " ")
    .replace(/([ap])\. ?m\./i, "$1.m.")
    .trim();
};
