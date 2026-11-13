import { BrandingLogo } from "@/shared/branding";
import { useLocale } from "@/contexts/LocaleContext";

function LoginHeader() {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-6 flex lg:hidden">
        <BrandingLogo variant="light" className="block h-10 w-auto dark:hidden" alt="logo" />
        <BrandingLogo variant="dark" className="hidden h-10 w-auto dark:block" alt="logo" />
      </div>

      <h1 className="text-page font-bold leading-tight text-ink">
        {t("auth.signIn")}
      </h1>
      <p className="mt-1 text-body font-medium text-ink-3">
        {t("signin.signInDescription")}
      </p>
    </div>
  );
}

export default LoginHeader;
