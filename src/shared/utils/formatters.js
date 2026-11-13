import {
  getDefaultCurrency,
  getFormatSettings,
  getIntlLocale,
} from "./formatSettings";

export const formatLargeNumber = (num, locale) => {
  const value = Number(num || 0);
  if (Number.isNaN(value)) return '0';
  const localeCode = locale || getIntlLocale();
  if (value >= 1000000000) {
    const formatted = (value / 1000000000).toFixed(1);
    return formatted.replace('.0', '') + 'B';
  } else if (value >= 1000000) {
    const formatted = (value / 1000000).toFixed(1);
    return formatted.replace('.0', '') + 'M';
  } else if (value >= 1000) {
    const formatted = (value / 1000).toFixed(1);
    return formatted.replace('.0', '') + 'K';
  }
  return value.toLocaleString(localeCode);
};

const CURRENCY_PREFIXES = {
  HNL: "L",
};

export const formatCurrency = (v, currency = getDefaultCurrency()) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return String(v);
  const code = String(currency || getDefaultCurrency()).toUpperCase();
  const fractionDigits = Number.isInteger(num) ? 0 : 2;
  const formatted = new Intl.NumberFormat(getIntlLocale(), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
  const prefix = CURRENCY_PREFIXES[code];
  return prefix ? `${prefix} ${formatted}` : `${formatted} ${code}`;
};

const isZeroDate = (value) => {
  const raw = String(value || "");
  return raw.startsWith("0001-01-01") || raw.startsWith("0000-00-00");
};

export const formatDate = (d) => {
  if (!d || isZeroDate(d)) return "—";
  const value = /^\d{4}-\d{2}-\d{2}$/.test(String(d))
    ? `${d}T12:00:00`
    : d;
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return d;
  const { timezone } = getFormatSettings();
  return dt.toLocaleDateString(getIntlLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  });
};

export const formatDateTime = (d) => {
  if (!d || isZeroDate(d)) return "—";
  const value = /^\d{4}-\d{2}-\d{2}$/.test(String(d))
    ? `${d}T12:00:00`
    : d;
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return "—";
  const { timezone } = getFormatSettings();
  return dt.toLocaleString(getIntlLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
};
