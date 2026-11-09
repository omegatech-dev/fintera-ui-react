import { useState } from "react";
import { useLocale } from "../../../../contexts/LocaleContext";
import LoginTermsModal from "@/shared/modals/LoginTermsModal";

function LoginFooter() {
  const { t } = useLocale();
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div className="mt-8 space-y-6 max-w-xl mx-auto">
      {/* Terms link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 rounded"
        >
          {t("auth.termsTitle")}
        </button>
      </div>

      <LoginTermsModal isActive={termsOpen} onClose={() => setTermsOpen(false)} />

      {/* Copyright */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-full border border-gray-200/50 dark:border-gray-700/50">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Fintera. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginFooter;