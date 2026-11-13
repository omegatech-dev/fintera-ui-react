import { useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSection from "./SettingsSection";
import { useSettingsSaveBarRegistration } from "../hooks/useSettingsSaveBarRegistration";
import { useSettingsDraft } from "../hooks/useSettingsDraft";
import {
  settingsErrorClass,
  settingsGridClass,
  settingsHelperClass,
  settingsInputClass,
  settingsInputDefaultClass,
  settingsInputErrorClass,
  settingsLabelClass,
  settingsTextareaClass,
} from "./settingsFormStyles";

const FIELDS = [
  "legal_name",
  "legal_tax_id",
  "legal_address",
  "website",
  "terms_effective_date",
  "terms_content_es",
  "terms_content_en",
];

const TERMS_MAX_LENGTH = 20000;

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

  const submitDraft = async () => {
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
        terms_content_es: String(draft.terms_content_es || "").trim(),
        terms_content_en: String(draft.terms_content_en || "").trim(),
      });
      showToast(t("branding.legal.saved"), "success");
    } catch (requestError) {
      showToast(requestError?.message || t("branding.legal.error"), "error");
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

  const inShell = useSettingsSaveBarRegistration("legal", {
    dirty,
    saving,
    onDiscard: handleDiscard,
    onSubmit: submitDraft,
  });

  return (
    <SettingsSection
      title={t("branding.legal.title")}
      description={t("branding.legal.subtitle")}
    >
      {loading ? (
        <div className="space-y-3" aria-live="polite">
          <div className="h-10 animate-pulse rounded-control bg-surface-2" />
          <div className="h-10 animate-pulse rounded-control bg-surface-2" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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
              className={`${settingsTextareaClass} ${
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

          <div className="space-y-4 border-t border-line pt-5">
            <div>
              <label htmlFor="legal-terms-es" className={settingsLabelClass}>
                {t("branding.legal.termsContentEs")}
              </label>
              <textarea
                id="legal-terms-es"
                rows={10}
                maxLength={TERMS_MAX_LENGTH}
                className={`${settingsTextareaClass} ${settingsInputDefaultClass}`}
                value={draft.terms_content_es || ""}
                onChange={(event) =>
                  updateField("terms_content_es", event.target.value)
                }
                aria-describedby="legal-terms-es-help legal-terms-es-count"
              />
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p id="legal-terms-es-help" className={settingsHelperClass}>
                  {t("branding.legal.termsContentEsHint")}
                </p>
                <p id="legal-terms-es-count" className={settingsHelperClass}>
                  {t("branding.legal.termsCharacters", {
                    count: String(draft.terms_content_es || "").length,
                    max: TERMS_MAX_LENGTH,
                  })}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="legal-terms-en" className={settingsLabelClass}>
                {t("branding.legal.termsContentEn")}
              </label>
              <textarea
                id="legal-terms-en"
                rows={10}
                maxLength={TERMS_MAX_LENGTH}
                className={`${settingsTextareaClass} ${settingsInputDefaultClass}`}
                value={draft.terms_content_en || ""}
                onChange={(event) =>
                  updateField("terms_content_en", event.target.value)
                }
                aria-describedby="legal-terms-en-help legal-terms-en-count"
              />
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p id="legal-terms-en-help" className={settingsHelperClass}>
                  {t("branding.legal.termsContentEnHint")}
                </p>
                <p id="legal-terms-en-count" className={settingsHelperClass}>
                  {t("branding.legal.termsCharacters", {
                    count: String(draft.terms_content_en || "").length,
                    max: TERMS_MAX_LENGTH,
                  })}
                </p>
              </div>
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

export default LegalSettingsForm;
