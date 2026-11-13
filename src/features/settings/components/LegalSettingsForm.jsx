import { useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import RichTextEditor from "../../../shared/editor/RichTextEditor";
import { buildDefaultTermsHtml } from "../../../shared/editor/termsTemplate";
import {
  countVisibleCharacters,
  isRichTextEmpty,
} from "../../../shared/utils/sanitizeHtml";
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

const normalizeTermsContent = (value) => {
  const html = String(value || "");
  return isRichTextEmpty(html) ? "" : html.trim();
};

const termsTemplateButtonClass =
  "rounded-control border border-line bg-surface px-2.5 py-1.5 text-micro font-semibold text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";

function TermsEditorField({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
  error,
  count,
  counterText,
  maxLength,
  templateLabel,
  onUseTemplate,
  toolbarLabels,
}) {
  const labelId = `${id}-label`;
  const helpId = `${id}-help`;
  const countId = `${id}-count`;
  const errorId = `${id}-error`;
  const overLimit = count > maxLength;

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span id={labelId} className={`${settingsLabelClass} mb-0`}>
          {label}
        </span>
        <button type="button" onClick={onUseTemplate} className={termsTemplateButtonClass}>
          {templateLabel}
        </button>
      </div>
      <RichTextEditor
        id={id}
        value={value}
        onChange={onChange}
        labelId={labelId}
        describedBy={`${helpId} ${countId} ${errorId}`}
        invalid={Boolean(error)}
        placeholder={placeholder}
        maxLength={maxLength}
        toolbarLabels={toolbarLabels}
      />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p id={helpId} className={settingsHelperClass}>
          {hint}
        </p>
        <p
          id={countId}
          className={
            overLimit ? `${settingsHelperClass} font-semibold text-danger` : settingsHelperClass
          }
          aria-live="polite"
        >
          {counterText}
        </p>
      </div>
      {error && (
        <p id={errorId} role="alert" className={settingsErrorClass}>
          {error}
        </p>
      )}
    </div>
  );
}

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
    const termsES = normalizeTermsContent(draft.terms_content_es);
    const termsEN = normalizeTermsContent(draft.terms_content_en);

    if (!isValidUrl(website)) {
      nextErrors.website = t("branding.legal.errorWebsite");
    }
    if (effectiveDate && Number.isNaN(new Date(effectiveDate).getTime())) {
      nextErrors.terms_effective_date = t("branding.legal.errorDate");
    }
    if (countVisibleCharacters(termsES) > TERMS_MAX_LENGTH) {
      nextErrors.terms_content_es = t("branding.legal.termsTooLong");
    }
    if (countVisibleCharacters(termsEN) > TERMS_MAX_LENGTH) {
      nextErrors.terms_content_en = t("branding.legal.termsTooLong");
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
        terms_content_es: termsES,
        terms_content_en: termsEN,
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

  const toolbarLabels = {
    bold: t("branding.legal.editor.bold"),
    italic: t("branding.legal.editor.italic"),
    underline: t("branding.legal.editor.underline"),
    heading: t("branding.legal.editor.heading"),
    orderedList: t("branding.legal.editor.orderedList"),
    bulletList: t("branding.legal.editor.bulletList"),
    link: t("branding.legal.editor.link"),
    clean: t("branding.legal.editor.clean"),
  };
  const termsEsCount = countVisibleCharacters(draft.terms_content_es);
  const termsEnCount = countVisibleCharacters(draft.terms_content_en);

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
            <TermsEditorField
              id="legal-terms-es"
              label={t("branding.legal.termsContentEs")}
              hint={t("branding.legal.termsContentEsHint")}
              placeholder={t("branding.legal.termsPlaceholder")}
              value={draft.terms_content_es || ""}
              onChange={(html) => updateField("terms_content_es", html || "")}
              error={errors.terms_content_es}
              count={termsEsCount}
              counterText={t("branding.legal.termsCharacters", {
                count: termsEsCount,
                max: TERMS_MAX_LENGTH,
              })}
              maxLength={TERMS_MAX_LENGTH}
              templateLabel={t("branding.legal.useDefaultTemplate")}
              onUseTemplate={() =>
                updateField("terms_content_es", buildDefaultTermsHtml("es"))
              }
              toolbarLabels={toolbarLabels}
            />

            <TermsEditorField
              id="legal-terms-en"
              label={t("branding.legal.termsContentEn")}
              hint={t("branding.legal.termsContentEnHint")}
              placeholder={t("branding.legal.termsPlaceholder")}
              value={draft.terms_content_en || ""}
              onChange={(html) => updateField("terms_content_en", html || "")}
              error={errors.terms_content_en}
              count={termsEnCount}
              counterText={t("branding.legal.termsCharacters", {
                count: termsEnCount,
                max: TERMS_MAX_LENGTH,
              })}
              maxLength={TERMS_MAX_LENGTH}
              templateLabel={t("branding.legal.useDefaultTemplate")}
              onUseTemplate={() =>
                updateField("terms_content_en", buildDefaultTermsHtml("en"))
              }
              toolbarLabels={toolbarLabels}
            />
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
