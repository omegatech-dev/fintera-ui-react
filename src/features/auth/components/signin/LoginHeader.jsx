import { BrandingLogo } from "@/shared/branding";
import { useLocale } from "@/contexts/LocaleContext";

function LoginHeader() {
  const { t } = useLocale();
  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <BrandingLogo variant="light" className="block h-14 w-auto dark:hidden" alt="logo" />
        <BrandingLogo variant="dark" className="hidden h-14 w-auto dark:block" alt="logo" />
      </div>

      <h1 className="text-page font-bold leading-tight text-ink">
        {t("signin.welcomeBack")}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-body text-ink-3">
        {t("signin.signInDescription")}
      </p>
    </div>
  );
}

export default LoginHeader;
