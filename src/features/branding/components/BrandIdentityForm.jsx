import { useEffect, useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useBranding } from "../../../contexts/branding";
import { useToast } from "../../../contexts/ToastContext";
import { brandingApi } from "../api";
import {
  getBundledLogo,
  resolveBrandingAssetUrl,
} from "../../../shared/branding/brandingUtils";
import { SettingsSaveBar } from "../../../shared/ui";
import { ACCEPTED_TYPES, getFileValidationError } from "../logoRules";
import LogoGuidance from "./LogoGuidance";
import LogoUploadCard from "./LogoUploadCard";
import BrandPreview from "./BrandPreview";

function BrandIdentityForm() {
  const { t } = useLocale();
  const { branding, refresh } = useBranding();
  const { showToast } = useToast();

  const [lightFile, setLightFile] = useState(null);
  const [darkFile, setDarkFile] = useState(null);
  const [removeLight, setRemoveLight] = useState(false);
  const [removeDark, setRemoveDark] = useState(false);
  const [errors, setErrors] = useState({ light: null, dark: null });
  const [saving, setSaving] = useState(false);

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

  const savedLightSrc = resolveBrandingAssetUrl(branding.logo_url);
  const savedDarkSrc = resolveBrandingAssetUrl(branding.logo_dark_url);
  const pendingLightSrc = lightFile ? previews.light : "";

  const effectiveLightSrc = removeLight || !savedLightSrc
    ? getBundledLogo("light")
    : savedLightSrc;
  const lightForDarkSrc = removeLight || (!savedLightSrc && !pendingLightSrc)
    ? getBundledLogo("dark")
    : pendingLightSrc || savedLightSrc;
  const effectiveDarkSrc = removeDark
    ? lightForDarkSrc
    : savedDarkSrc || lightForDarkSrc;

  const lightSrc = lightFile ? previews.light : effectiveLightSrc;
  const darkSrc = darkFile ? previews.dark : effectiveDarkSrc;
  const darkUsesFallback =
    !darkFile &&
    !removeDark &&
    !savedDarkSrc &&
    Boolean(pendingLightSrc || savedLightSrc) &&
    !removeLight;

  const hasChanges =
    removeLight || removeDark || lightFile !== null || darkFile !== null;

  const resetForm = () => {
    setLightFile(null);
    setDarkFile(null);
    setRemoveLight(false);
    setRemoveDark(false);
    setErrors({ light: null, dark: null });
  };

  const handleSelect = (variant, file) => {
    const validationError = getFileValidationError(file);
    if (validationError) {
      setErrors((current) => ({ ...current, [variant]: validationError }));
      showToast(
        validationError === "size"
          ? t("branding.errorFileSize")
          : t("branding.errorFileType"),
        "error"
      );
      return;
    }

    setErrors((current) => ({ ...current, [variant]: null }));
    if (variant === "dark") {
      setDarkFile(file);
      setRemoveDark(false);
    } else {
      setLightFile(file);
      setRemoveLight(false);
    }
  };

  const handleClear = (variant) => {
    setErrors((current) => ({ ...current, [variant]: null }));

    if (variant === "dark") {
      if (darkFile) {
        setDarkFile(null);
        setRemoveDark(false);
      } else {
        setRemoveDark((current) => !current);
      }
      return;
    }

    if (lightFile) {
      setLightFile(null);
      setRemoveLight(false);
    } else {
      setRemoveLight((current) => !current);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasChanges) return;

    setSaving(true);
    try {
      if (removeLight) await brandingApi.deleteLogo("light");
      if (removeDark) await brandingApi.deleteLogo("dark");
      if (lightFile) await brandingApi.uploadLogo(lightFile, "light");
      if (darkFile) await brandingApi.uploadLogo(darkFile, "dark");

      await refresh();
      resetForm();
      showToast(t("branding.success"), "success");
    } catch (error) {
      showToast(error?.message || t("branding.error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const slotLabels = {
    drop: t("branding.upload.drop"),
    dropActive: t("branding.upload.dropActive"),
    dropHint: t("branding.upload.dropHint"),
    undo: t("branding.undo"),
    remove: t("branding.remove"),
    errorType: t("branding.errorFileType"),
    errorSize: t("branding.errorFileSize"),
    qualityGood: t("branding.upload.qualityGood"),
    qualitySmall: t("branding.upload.qualitySmall"),
    qualityRatio: t("branding.upload.qualityRatio"),
    acceptedTypes: ACCEPTED_TYPES.join(","),
  };

  return (
    <div className="w-full">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-bgray-900 dark:text-white">
          {t("branding.brandIdentity.title")}
        </h2>
        <p className="mt-1 text-bgray-500 dark:text-bgray-400 font-medium">
          {t("branding.brandIdentity.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <LogoGuidance />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <LogoUploadCard
            label={t("branding.lightLogo")}
            hint={t("branding.lightLogoHint")}
            savedSrc={savedLightSrc}
            fallbackSrc={getBundledLogo("light")}
            pendingPreview={previews.light}
            pendingFile={lightFile}
            hasPendingFile={Boolean(lightFile)}
            markedForRemoval={removeLight}
            error={errors.light}
            onSelect={(file) => handleSelect("light", file)}
            onClear={() => handleClear("light")}
            labels={slotLabels}
          />
          <LogoUploadCard
            label={t("branding.darkLogo")}
            hint={t("branding.darkLogoHint")}
            savedSrc={savedDarkSrc}
            fallbackSrc={lightForDarkSrc}
            pendingPreview={previews.dark}
            pendingFile={darkFile}
            hasPendingFile={Boolean(darkFile)}
            markedForRemoval={removeDark}
            error={errors.dark}
            onSelect={(file) => handleSelect("dark", file)}
            onClear={() => handleClear("dark")}
            labels={slotLabels}
          />
        </div>

        <BrandPreview
          lightSrc={lightSrc}
          darkSrc={darkSrc}
          appName={branding.app_name}
          darkUsesFallback={darkUsesFallback}
        />

        <SettingsSaveBar
          visible={hasChanges}
          saving={saving}
          onDiscard={resetForm}
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

export default BrandIdentityForm;
