const DEFAULT_FORMAT_SETTINGS = {
  currency: "HNL",
  locale: "es",
  timezone: "America/Tegucigalpa",
};

const LOCALE_CODES = {
  es: "es-HN",
  en: "en-US",
};

let current = { ...DEFAULT_FORMAT_SETTINGS };

const safeTimezone = (timezone) => {
  if (!timezone) return DEFAULT_FORMAT_SETTINGS.timezone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return timezone;
  } catch {
    return DEFAULT_FORMAT_SETTINGS.timezone;
  }
};

/**
 * Update the deployment-wide formatting defaults used by shared formatters.
 * Record-specific values (for example a contract currency) still take priority.
 */
export const setFormatSettings = (settings = {}) => {
  const requestedCurrency = String(settings.default_currency || "").trim().toUpperCase();
  current = {
    currency: /^[A-Z]{3}$/.test(requestedCurrency)
      ? requestedCurrency
      : DEFAULT_FORMAT_SETTINGS.currency,
    locale:
      typeof settings.default_locale === "string" &&
      LOCALE_CODES[settings.default_locale.trim()]
        ? settings.default_locale.trim()
        : DEFAULT_FORMAT_SETTINGS.locale,
    timezone: safeTimezone(String(settings.timezone || "").trim()),
  };
  return current;
};

export const getFormatSettings = () => current;

export const getIntlLocale = (locale = current.locale) =>
  LOCALE_CODES[locale] || LOCALE_CODES[DEFAULT_FORMAT_SETTINGS.locale];

export const getDefaultCurrency = () => current.currency;

export { DEFAULT_FORMAT_SETTINGS };
