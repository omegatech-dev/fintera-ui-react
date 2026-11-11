import { useEffect, useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useBranding } from "../../../contexts/branding";
import { useToast } from "../../../contexts/ToastContext";
import { brandingApi } from "../api";
import { BrandingLogo } from "../../../shared/branding";
import { SettingsSaveBar } from "../../../shared/ui";

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
    <div className="w-full">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-bgray-900 dark:text-white">
          {t("branding.general.title")}
        </h2>
        <p className="mt-1 text-bgray-500 dark:text-bgray-400 font-medium">
          {t("branding.general.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="branding-app-name"
            className="mb-2 block text-sm font-semibold text-bgray-700 dark:text-bgray-300"
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
            className={`h-12 w-full rounded-xl border bg-bgray-50 px-4 transition-all focus:border-transparent focus:ring-2 dark:bg-darkblack-500 dark:text-white ${
              error
                ? "border-red-300 focus:ring-red-500 dark:border-red-900/60"
                : "border-bgray-200 focus:ring-blue-500 dark:border-darkblack-400"
            }`}
          />
          <div className="mt-2 flex items-start justify-between gap-4">
            <p
              id="branding-app-name-help"
              className="text-xs text-bgray-500 dark:text-bgray-400"
            >
              {t("branding.appNameHint")}
            </p>
            <span className="shrink-0 text-xs font-medium text-bgray-400 dark:text-bgray-500">
              {t("branding.general.characters", { count: name.length })}
            </span>
          </div>
          {error && (
            <p
              id="branding-app-name-error"
              role="alert"
              className="mt-2 text-sm font-medium text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>

        <section
          aria-labelledby="app-name-preview-title"
          className="rounded-2xl border border-bgray-200 p-5 dark:border-darkblack-400 sm:p-6"
        >
          <h3
            id="app-name-preview-title"
            className="text-base font-bold text-bgray-900 dark:text-white"
          >
            {t("branding.general.previewTitle")}
          </h3>
          <p className="mt-1 text-sm text-bgray-600 dark:text-bgray-300">
            {t("branding.general.previewDescription")}
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-bgray-200 bg-bgray-100 dark:border-darkblack-400 dark:bg-darkblack-500">
            <div className="flex items-center gap-1.5 border-b border-bgray-200 px-3 py-2 dark:border-darkblack-400">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-end gap-1 px-3 pt-2">
              <div className="flex max-w-[260px] items-center gap-2 rounded-t-lg bg-white px-3 py-2 dark:bg-darkblack-600">
                <BrandingLogo
                  variant="light"
                  className="h-4 w-4 object-contain"
                  alt=""
                />
                <span className="truncate text-xs font-medium text-bgray-700 dark:text-bgray-200">
                  {previewName}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-bgray-500 dark:text-bgray-400">
            {t("branding.general.appearsIn")}
          </p>
        </section>

        <SettingsSaveBar
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
    </div>
  );
}

export default AppNameForm;
