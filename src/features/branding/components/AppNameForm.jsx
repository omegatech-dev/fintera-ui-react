import { useEffect, useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useBranding } from "../../../contexts/branding";
import { useToast } from "../../../contexts/ToastContext";
import { brandingApi } from "../api";
import { BrandingLogo } from "../../../shared/branding";
import SettingsSection from "../../settings/components/SettingsSection";
import BrandSaveBar from "./BrandSaveBar";

function AppNameForm() {
  const { t } = useLocale();
  const { branding, refresh } = useBranding();
  const { showToast } = useToast();

  const [name, setName] = useState(branding.app_name);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName((current) => (current === branding.app_name ? current : branding.app_name));
  }, [branding.app_name]);

  const trimmedName = name.trim();
  const hasChanges = trimmedName !== branding.app_name;
  const previewName = trimmedName || branding.app_name;

  const handleDiscard = () => {
    setName(branding.app_name);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!trimmedName) {
      setError(t("branding.errorNameRequired"));
      return;
    }

    setError("");
    if (!hasChanges) return;

    setSaving(true);
    try {
      await brandingApi.update(trimmedName);
      await refresh();
      showToast(t("branding.success"), "success");
    } catch (requestError) {
      showToast(requestError?.message || t("branding.error"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title={t("branding.general.identityTitle")}
      description={t("branding.general.appNameSubtitle")}
      divider={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="branding-app-name"
            className="mb-2 block text-label font-semibold text-ink-2"
          >
            {t("branding.appName")}
          </label>
          <input
            id="branding-app-name"
            type="text"
            value={name}
            maxLength={60}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            placeholder={t("branding.appNamePlaceholder")}
            aria-invalid={Boolean(error)}
            aria-describedby="branding-app-name-help branding-app-name-error"
            className={`h-11 w-full rounded-control border bg-surface px-3 text-body-lg text-ink outline-none transition-shadow focus:ring-2 ${
              error
                ? "border-danger focus:ring-danger/25"
                : "border-line-strong focus:ring-brand/20"
            }`}
          />
          <div className="mt-2 flex items-start justify-between gap-4">
            <p
              id="branding-app-name-help"
              className="text-micro text-ink-3"
            >
              {t("branding.appNameHint")}
            </p>
            <span className="shrink-0 text-micro font-medium text-ink-3">
              {t("branding.general.characters", { count: name.length })}
            </span>
          </div>
          {error && (
            <p
              id="branding-app-name-error"
              role="alert"
              className="mt-2 text-label font-medium text-danger"
            >
              {error}
            </p>
          )}
        </div>

        <section
          aria-labelledby="app-name-preview-title"
          className="rounded-control border border-line bg-surface-2 p-4"
        >
          <h3
            id="app-name-preview-title"
            className="text-label font-bold text-ink"
          >
            {t("branding.general.previewTitle")}
          </h3>
          <p className="mt-0.5 text-micro text-ink-3">
            {t("branding.general.previewDescription")}
          </p>

          <div className="mt-3 overflow-hidden rounded-control border border-[#E5E9F0] bg-[#F6F7F9]">
            <div className="flex items-center gap-1.5 border-b border-[#E5E9F0] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-danger/50" />
              <span className="h-2 w-2 rounded-full bg-warning/50" />
              <span className="h-2 w-2 rounded-full bg-brand/50" />
            </div>
            <div className="flex items-end gap-1 px-3 pt-2">
              <div className="flex max-w-[260px] items-center gap-2 rounded-t-lg bg-white px-3 py-2">
                <BrandingLogo
                  variant="light"
                  className="h-4 w-4 object-contain"
                  alt=""
                />
                <span className="truncate text-micro font-semibold text-[#0F172A]">
                  {previewName}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-micro text-ink-3">
            {t("branding.general.appearsIn")}
          </p>
        </section>

        <BrandSaveBar
          visible={hasChanges || Boolean(error)}
          saving={saving}
          disabled={!trimmedName}
          onDiscard={handleDiscard}
          labels={{
            unsaved: t("branding.saveBar.unsaved"),
            discard: t("branding.saveBar.discard"),
            save: t("branding.save"),
            saving: t("branding.saving"),
          }}
        />
      </form>
    </SettingsSection>
  );
}

export default AppNameForm;
