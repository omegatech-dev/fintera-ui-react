import { useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSection from "./SettingsSection";
import { useSettingsSaveBarRegistration } from "../hooks/useSettingsSaveBarRegistration";
import { useSettingsDraft } from "../hooks/useSettingsDraft";
import {
  settingsErrorClass,
  settingsGridWideClass,
  settingsHelperClass,
  settingsInputClass,
  settingsInputDefaultClass,
  settingsInputErrorClass,
  settingsLabelClass,
} from "./settingsFormStyles";

const FIELDS = ["default_currency", "default_locale", "timezone"];

const CURRENCIES = ["HNL", "USD", "EUR"];
const LOCALES = [
  { value: "es", label: "Español (es)" },
  { value: "en", label: "English (en)" },
];
const TIMEZONES = [
  "America/Tegucigalpa",
  "America/Guatemala",
  "America/El_Salvador",
  "America/Costa_Rica",
  "America/Panama",
  "America/Mexico_City",
  "America/New_York",
  "UTC",
];

const isValidTimezone = (value) => {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

const inputClass = (hasError) =>
  `${settingsInputClass} ${hasError ? settingsInputErrorClass : settingsInputDefaultClass}`;

function RegionalSettingsForm() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { draft, setField, reset, dirty, save, loading } = useSettingsDraft(FIELDS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleDiscard = () => {
    reset();
    setErrors({});
  };

  const submitDraft = async () => {
    const nextErrors = {};
    const currency = String(draft.default_currency || "").trim().toUpperCase();
    const locale = String(draft.default_locale || "").trim();
    const timezone = String(draft.timezone || "").trim();

    if (!/^[A-Z]{3}$/.test(currency)) {
      nextErrors.default_currency = t("branding.regional.errorCurrency");
    }
    if (!["es", "en"].includes(locale)) {
      nextErrors.default_locale = t("branding.regional.errorLocale");
    }
    if (!isValidTimezone(timezone)) {
      nextErrors.timezone = t("branding.regional.errorTimezone");
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await save({ default_currency: currency, default_locale: locale, timezone });
      showToast(t("branding.regional.saved"), "success");
    } catch (requestError) {
      showToast(requestError?.message || t("branding.regional.error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitDraft();
  };

  const updateField = (field, value) => {
    setField(field, value);
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: "" }));
    }
  };

  const currencyOptions =
    draft.default_currency && !CURRENCIES.includes(draft.default_currency)
      ? [draft.default_currency, ...CURRENCIES]
      : CURRENCIES;
  const localeOptions =
    draft.default_locale && !LOCALES.some((item) => item.value === draft.default_locale)
      ? [{ value: draft.default_locale, label: draft.default_locale }, ...LOCALES]
      : LOCALES;

  const inShell = useSettingsSaveBarRegistration("regional", {
    dirty,
    saving,
    onDiscard: handleDiscard,
    onSubmit: submitDraft,
  });

  return (
    <SettingsSection
      title={t("branding.regional.title")}
      description={t("branding.regional.subtitle")}
    >
      {loading ? (
        <div className="h-24 animate-pulse rounded-control bg-surface-2" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className={settingsGridWideClass}>
            <div>
              <label htmlFor="default-currency" className={settingsLabelClass}>
                {t("branding.regional.currency")}
              </label>
              <select
                id="default-currency"
                className={inputClass(errors.default_currency)}
                value={draft.default_currency || "HNL"}
                onChange={(event) => updateField("default_currency", event.target.value)}
                aria-invalid={Boolean(errors.default_currency)}
                aria-describedby="default-currency-help default-currency-error"
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <p id="default-currency-help" className={settingsHelperClass}>
                {t("branding.regional.currencyHint")}
              </p>
              {errors.default_currency && (
                <p id="default-currency-error" role="alert" className={settingsErrorClass}>
                  {errors.default_currency}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="default-locale" className={settingsLabelClass}>
                {t("branding.regional.locale")}
              </label>
              <select
                id="default-locale"
                className={inputClass(errors.default_locale)}
                value={draft.default_locale || "es"}
                onChange={(event) => updateField("default_locale", event.target.value)}
                aria-invalid={Boolean(errors.default_locale)}
                aria-describedby="default-locale-help default-locale-error"
              >
                {localeOptions.map((locale) => (
                  <option key={locale.value} value={locale.value}>
                    {locale.label}
                  </option>
                ))}
              </select>
              <p id="default-locale-help" className={settingsHelperClass}>
                {t("branding.regional.localeHint")}
              </p>
              {errors.default_locale && (
                <p id="default-locale-error" role="alert" className={settingsErrorClass}>
                  {errors.default_locale}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="default-timezone" className={settingsLabelClass}>
                {t("branding.regional.timezone")}
              </label>
              <input
                id="default-timezone"
                list="timezone-options"
                className={inputClass(errors.timezone)}
                value={draft.timezone || ""}
                onChange={(event) => updateField("timezone", event.target.value)}
                aria-invalid={Boolean(errors.timezone)}
                aria-describedby="default-timezone-help default-timezone-error"
              />
              <datalist id="timezone-options">
                {TIMEZONES.map((timezone) => (
                  <option key={timezone} value={timezone} />
                ))}
              </datalist>
              <p id="default-timezone-help" className={settingsHelperClass}>
                {t("branding.regional.timezoneHint")}
              </p>
              {errors.timezone && (
                <p id="default-timezone-error" role="alert" className={settingsErrorClass}>
                  {errors.timezone}
                </p>
              )}
            </div>
          </div>

          {!inShell && (
            <SettingsSaveBar
              visible={dirty}
              saving={saving}
              saveDisabled={saving || loading}
              onDiscard={handleDiscard}
              onSave={submitDraft}
              labels={{
                unsaved: t("settings.saveBar.unsaved"),
                discard: t("settings.saveBar.discard"),
                save: t("settings.saveBar.save"),
                saving: t("settings.saveBar.saving"),
              }}
            />
          )}
        </form>
      )}
    </SettingsSection>
  );
}

export default RegionalSettingsForm;
