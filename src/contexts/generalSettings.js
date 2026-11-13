import { createContext, useContext } from "react";

export const STORAGE_KEY = "fintera_general_settings";

// Safe defaults preserve current hardcoded contact/legal data until an admin
// saves a replacement. They also keep the app usable when the API is offline.
export const DEFAULT_GENERAL_SETTINGS = {
  support_whatsapp: "+50431848112",
  support_email: "support@omegatech.dev",
  legal_name: "Omegatech S. de R.L.",
  legal_tax_id: "",
  legal_address: "",
  website: "https://omegatech.dev/",
  terms_effective_date: "",
  terms_content_es: "",
  terms_content_en: "",
  reservation_hold_hours: 48,
  reservation_min_amount: 5000,
  reservation_due_days: 7,
  down_payment_due_days: 14,
  down_payment_due_days_with_reservation: 21,
  email_notifications_enabled: true,
  upcoming_reminder_days: 1,
  overdue_reminders_enabled: true,
  default_currency: "HNL",
  default_locale: "es",
  timezone: "America/Tegucigalpa",
};

const NUMBER_FIELDS = [
  "reservation_hold_hours",
  "reservation_min_amount",
  "reservation_due_days",
  "down_payment_due_days",
  "down_payment_due_days_with_reservation",
  "upcoming_reminder_days",
];

const BOOLEAN_FIELDS = [
  "email_notifications_enabled",
  "overdue_reminders_enabled",
];

const toBoolean = (value, fallback) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  return fallback;
};

export const normalizeGeneralSettings = (raw = {}) => {
  const next = { ...DEFAULT_GENERAL_SETTINGS, ...(raw || {}) };

  NUMBER_FIELDS.forEach((field) => {
    const parsed = Number(next[field]);
    next[field] = Number.isFinite(parsed)
      ? parsed
      : DEFAULT_GENERAL_SETTINGS[field];
  });

  BOOLEAN_FIELDS.forEach((field) => {
    next[field] = toBoolean(next[field], DEFAULT_GENERAL_SETTINGS[field]);
  });

  next.support_whatsapp =
    String(next.support_whatsapp || "").trim() ||
    DEFAULT_GENERAL_SETTINGS.support_whatsapp;
  next.support_email =
    String(next.support_email || "").trim() ||
    DEFAULT_GENERAL_SETTINGS.support_email;
  next.legal_name =
    String(next.legal_name || "").trim() ||
    DEFAULT_GENERAL_SETTINGS.legal_name;
  next.legal_tax_id = String(next.legal_tax_id || "").trim();
  next.legal_address = String(next.legal_address || "").trim();
  next.website =
    String(next.website || "").trim() || DEFAULT_GENERAL_SETTINGS.website;
  next.terms_effective_date = String(next.terms_effective_date || "").trim();
  next.terms_content_es = String(next.terms_content_es || "").trim();
  next.terms_content_en = String(next.terms_content_en || "").trim();
  next.default_currency =
    String(next.default_currency || DEFAULT_GENERAL_SETTINGS.default_currency)
      .trim()
      .toUpperCase() || DEFAULT_GENERAL_SETTINGS.default_currency;
  next.default_locale =
    String(next.default_locale || DEFAULT_GENERAL_SETTINGS.default_locale).trim() ||
    DEFAULT_GENERAL_SETTINGS.default_locale;
  next.timezone =
    String(next.timezone || DEFAULT_GENERAL_SETTINGS.timezone).trim() ||
    DEFAULT_GENERAL_SETTINGS.timezone;

  return next;
};

const GeneralSettingsContext = createContext();

export const useGeneralSettings = () => {
  const context = useContext(GeneralSettingsContext);
  if (!context) {
    // Outside the provider (e.g. during HMR), fall back to safe defaults.
    return {
      settings: DEFAULT_GENERAL_SETTINGS,
      loading: false,
      refresh: async () => DEFAULT_GENERAL_SETTINGS,
      update: async (partial) => ({ ...DEFAULT_GENERAL_SETTINGS, ...partial }),
    };
  }
  return context;
};

export default GeneralSettingsContext;
