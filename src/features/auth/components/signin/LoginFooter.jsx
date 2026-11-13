import { useState } from "react";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useBranding } from "../../../../contexts/branding";
import LoginTermsModal from "@/shared/modals/LoginTermsModal";

function LoginFooter() {
  const { t } = useLocale();
  const { branding } = useBranding();
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          className="rounded text-label font-semibold text-brand hover:text-brand-strong hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
          {t("auth.termsTitle")}
        </button>
      </div>

      <LoginTermsModal isActive={termsOpen} onClose={() => setTermsOpen(false)} />

      <p className="text-center text-micro font-medium text-ink-3">
        © {new Date().getFullYear()} {branding.app_name}. Todos los derechos reservados.
      </p>
    </div>
  );
}

export default LoginFooter;
