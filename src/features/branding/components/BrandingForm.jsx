import React, { useEffect, useRef, useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useBranding } from "../../../contexts/BrandingContext";
import { useToast } from "../../../contexts/ToastContext";
import { brandingApi } from "../api";
import { getBundledLogo, resolveBrandingAssetUrl } from "../../../shared/branding/brandingUtils";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB, mirrors the API limit
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * One logo slot: preview, upload button, and a remove/undo button.
 *
 * States:
 * - pending file selected  -> preview the file; button reverts it (undo)
 * - saved logo marked for removal -> preview the bundled fallback; button undoes
 * - saved logo             -> preview it; button marks it for removal
 * - nothing                -> bundled fallback; upload only
 */
function LogoSlot({
  variant,
  label,
  hint,
  savedSrc,
  pendingPreview,
  hasPendingFile,
  markedForRemoval,
  onSelect,
  onClear,
  labels,
}) {
  const inputRef = useRef(null);

  const displaySrc = hasPendingFile
    ? pendingPreview
    : markedForRemoval || !savedSrc
      ? getBundledLogo(variant)
      : savedSrc;

  const showUndo = hasPendingFile || markedForRemoval;
  const showRemove = !showUndo && Boolean(savedSrc);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
          {label}
        </label>
        {hint && <p className="text-xs text-bgray-500 dark:text-bgray-400 mb-3">{hint}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-28 h-28 shrink-0 rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-bgray-50 dark:bg-darkblack-500 flex items-center justify-center overflow-hidden">
          <img src={displaySrc} alt={label} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-bgray-700 dark:text-bgray-200 border border-bgray-200 dark:border-darkblack-400 hover:bg-bgray-100 dark:hover:bg-darkblack-500 transition-colors"
          >
            {labels.upload}
          </button>
          {showUndo && (
            <button
              type="button"
              onClick={onClear}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-bgray-700 dark:text-bgray-200 border border-bgray-200 dark:border-darkblack-400 hover:bg-bgray-100 dark:hover:bg-darkblack-500 transition-colors"
            >
              {labels.undo}
            </button>
          )}
          {showRemove && (
            <button
              type="button"
              onClick={onClear}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              {labels.remove}
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function BrandingForm() {
  const { t } = useLocale();
  const { branding, refresh } = useBranding();
  const { showToast } = useToast();

  const [name, setName] = useState(branding.app_name);
  const [lightFile, setLightFile] = useState(null);
  const [darkFile, setDarkFile] = useState(null);
  const [removeLight, setRemoveLight] = useState(false);
  const [removeDark, setRemoveDark] = useState(false);
  const [saving, setSaving] = useState(false);

  // Keep the form in sync when branding loads/changes externally
  useEffect(() => {
    setName((current) => (current === branding.app_name ? current : branding.app_name));
  }, [branding.app_name]);

  // Object URL previews, revoked on change/unmount
  const [previews, setPreviews] = useState({ light: "", dark: "" });
  useEffect(() => {
    const light = lightFile ? URL.createObjectURL(lightFile) : "";
    const dark = darkFile ? URL.createObjectURL(darkFile) : "";
    setPreviews({ light, dark });
    return () => {
      if (light) URL.revokeObjectURL(light);
      if (dark) URL.revokeObjectURL(dark);
    };
  }, [lightFile, darkFile]);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES) {
      showToast(t("branding.errorFile"), "error");
      return false;
    }
    return true;
  };

  const handleSelect = (variant, file) => {
    if (!validateFile(file)) return;
    if (variant === "dark") {
      setDarkFile(file);
      setRemoveDark(false);
    } else {
      setLightFile(file);
      setRemoveLight(false);
    }
  };

  const handleClear = (variant) => {
    if (variant === "dark") {
      if (darkFile) {
        setDarkFile(null);
        setRemoveDark(false);
      } else {
        setRemoveDark(true);
      }
    } else if (lightFile) {
      setLightFile(null);
      setRemoveLight(false);
    } else {
      setRemoveLight(true);
    }
  };

  const hasChanges =
    removeLight ||
    removeDark ||
    lightFile !== null ||
    darkFile !== null ||
    name.trim() !== branding.app_name;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast(t("branding.errorNameRequired"), "error");
      return;
    }
    if (!hasChanges) return;

    setSaving(true);
    try {
      // Order matters: removals first, then uploads (which replace whatever is
      // stored and clear any pending removal), then the name change.
      if (removeLight) await brandingApi.deleteLogo("light");
      if (removeDark) await brandingApi.deleteLogo("dark");
      if (lightFile) await brandingApi.uploadLogo(lightFile, "light");
      if (darkFile) await brandingApi.uploadLogo(darkFile, "dark");
      if (trimmedName !== branding.app_name) await brandingApi.update(trimmedName);

      await refresh();
      setLightFile(null);
      setDarkFile(null);
      setRemoveLight(false);
      setRemoveDark(false);
      showToast(t("branding.success"), "success");
    } catch (error) {
      showToast(error?.message || t("branding.error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const slotLabels = {
    upload: t("branding.upload"),
    remove: t("branding.remove"),
    undo: t("branding.undo"),
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-darkblack-600 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8"
    >
      {/* Application name */}
      <div>
        <label
          htmlFor="branding-app-name"
          className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2"
        >
          {t("branding.appName")}
        </label>
        <input
          id="branding-app-name"
          type="text"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("branding.appNamePlaceholder")}
          className="w-full h-12 px-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
        />
      </div>

      {/* Logos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <LogoSlot
          variant="light"
          label={t("branding.lightLogo")}
          hint={t("branding.supportedFormats")}
          savedSrc={resolveBrandingAssetUrl(branding.logo_url)}
          pendingPreview={previews.light}
          hasPendingFile={Boolean(lightFile)}
          markedForRemoval={removeLight}
          onSelect={(file) => handleSelect("light", file)}
          onClear={() => handleClear("light")}
          labels={slotLabels}
        />
        <LogoSlot
          variant="dark"
          label={t("branding.darkLogo")}
          hint={t("branding.darkLogoHint")}
          savedSrc={resolveBrandingAssetUrl(branding.logo_dark_url || branding.logo_url)}
          pendingPreview={previews.dark}
          hasPendingFile={Boolean(darkFile)}
          markedForRemoval={removeDark}
          onSelect={(file) => handleSelect("dark", file)}
          onClear={() => handleClear("dark")}
          labels={slotLabels}
        />
      </div>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving || !hasChanges}
          className={`
            px-12 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center
            ${saving || !hasChanges ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20"}
          `}
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("branding.saving")}
            </>
          ) : (
            t("branding.save")
          )}
        </button>
      </div>
    </form>
  );
}

export default BrandingForm;
