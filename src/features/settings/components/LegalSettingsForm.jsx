import { useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { SettingsSaveBar } from "../../../shared/ui";
import SettingsSection from "./SettingsSection";
import { useSettingsDraft } from "../hooks/useSettingsDraft";
import {
  settingsErrorClass,
  settingsGridClass,
  settingsHelperClass,
  settingsInputClass,
  settingsInputDefaultClass,
  settingsInputErrorClass,
  settingsLabelClass,
} from "./settingsFormStyles";

const FIELDS = [
  "legal_name",
  "legal_tax_id",
  "legal_address",
  "website",
  "terms_effective_date",
];

const inputClass = (hasError) =>
  `${settingsInputClass} ${hasError ? settingsInputErrorClass : settingsInputDefaultClass}`;

const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

function LegalSettingsForm() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { draft, setField, reset, dirty, save, loading } = useSettingsDraft(FIELDS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleDiscard = () => {
    reset();
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const website = String(draft.website || "").trim();
    const effectiveDate = String(draft.terms_effective_date || "").trim();

    if (!isValidUrl(website)) {
      nextErrors.website = t("branding.legal.errorWebsite");
    }
    if (effectiveDate && Number.isNaN(new Date(effectiveDate).getTime())) {
      nextErrors.terms_effective_date = t("branding.legal.errorDate");
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await save({
        legal_name: String(draft.legal_name || "").trim(),
        legal_tax_id: String(draft.legal_tax_id || "").trim(),
        legal_address: String(draft.legal_address || "").trim(),
        website,
        terms_effective_date: effectiveDate,
      });
      showToast(t("branding.legal.saved"), "success");
    } catch (requestError) {
      showToast(requestError?.message || t("branding.legal.error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setField(field, value);
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: "" }));
    }
  };

  return (
    <SettingsSection
      title={t("branding.legal.title")}
      description={t("branding.legal.subtitle")}
    >
      {loading ? (
        <div className="space-y-3" aria-live="polite">
          <div className="h-12 animate-pulse rounded-xl bg-bgray-100 dark:bg-darkblack-500" />
          <div className="h-12 animate-pulse rounded-xl bg-bgray-100 dark:bg-darkblack-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={settingsGridClass}>
            <div>
              <label htmlFor="legal-name" className={settingsLabelClass}>
                {t("branding.legal.name")}
              </label>
              <input
                id="legal-name"
                className={inputClass(errors.legal_name)}
                value={draft.legal_name || ""}
                onChange={(event) => updateField("legal_name", event.target.value)}
                aria-invalid={Boolean(errors.legal_name)}
                aria-describedby="legal-name-help"
              />
              <p id="legal-name-help" className={settingsHelperClass}>
                {t("branding.legal.nameHint")}
              </p>
            </div>

            <div>
              <label htmlFor="legal-tax-id" className={settingsLabelClass}>
                {t("branding.legal.taxId")}
              </label>
              <input
                id="legal-tax-id"
                className={inputClass(errors.legal_tax_id)}
                value={draft.legal_tax_id || ""}
                onChange={(event) => updateField("legal_tax_id", event.target.value)}
                aria-invalid={Boolean(errors.legal_tax_id)}
                aria-describedby="legal-tax-id-help"
              />
              <p id="legal-tax-id-help" className={settingsHelperClass}>
                {t("branding.legal.taxIdHint")}
              </p>
            </div>

            <div>
              <label htmlFor="legal-website" className={settingsLabelClass}>
                {t("branding.legal.website")}
              </label>
              <input
                id="legal-website"
                type="url"
                placeholder="https://"
                className={inputClass(errors.website)}
                value={draft.website || ""}
                onChange={(event) => updateField("website", event.target.value)}
                aria-invalid={Boolean(errors.website)}
                aria-describedby="legal-website-error"
              />
              {errors.website && (
                <p id="legal-website-error" role="alert" className={settingsErrorClass}>
                  {errors.website}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="legal-effective-date" className={settingsLabelClass}>
                {t("branding.legal.effectiveDate")}
              </label>
              <input
                id="legal-effective-date"
                type="date"
                className={inputClass(errors.terms_effective_date)}
                value={draft.terms_effective_date || ""}
                onChange={(event) => updateField("terms_effective_date", event.target.value)}
                aria-invalid={Boolean(errors.terms_effective_date)}
                aria-describedby="legal-effective-date-help legal-effective-date-error"
              />
              <p id="legal-effective-date-help" className={settingsHelperClass}>
                {t("branding.legal.effectiveDateHint")}
              </p>
              {errors.terms_effective_date && (
                <p id="legal-effective-date-error" role="alert" className={settingsErrorClass}>
                  {errors.terms_effective_date}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="legal-address" className={settingsLabelClass}>
              {t("branding.legal.address")}
            </label>
            <textarea
              id="legal-address"
              rows={3}
              className={`w-full rounded-xl border bg-bgray-50 px-4 py-3 text-sm font-semibold transition-all focus:border-transparent focus:ring-2 dark:bg-darkblack-500 dark:text-white ${
                errors.legal_address
                  ? settingsInputErrorClass
                  : settingsInputDefaultClass
              }`}
              value={draft.legal_address || ""}
              onChange={(event) => updateField("legal_address", event.target.value)}
              aria-invalid={Boolean(errors.legal_address)}
              aria-describedby="legal-address-help"
            />
            <p id="legal-address-help" className={settingsHelperClass}>
              {t("branding.legal.addressHint")}
            </p>
          </div>

          <SettingsSaveBar
            visible={dirty}
            saving={saving}
            disabled={saving || loading}
            onDiscard={handleDiscard}
            labels={{
              unsaved: t("branding.saveBar.unsaved"),
              discard: t("branding.saveBar.discard"),
              save: t("branding.save"),
              saving: t("branding.saving"),
            }}
          />
        </form>
      )}
    </SettingsSection>
  );
}

export default LegalSettingsForm;
