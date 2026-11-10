import { BrandingLogo } from "@/shared/branding";
import { useLocale } from "@/contexts/LocaleContext";

function LoginHeader() {
  const { t } = useLocale();
  return (
    <div className="text-center mb-12">
      {/* Plain Logo (subtle animation) */}
      <div className="flex justify-center mb-8">
        <div className="inline-block transform-gpu motion-reduce:transform-none animate-fade-in-up animate-float motion-reduce:animate-none hover:scale-105 transition-transform duration-500">
          <BrandingLogo variant="light" className="block dark:hidden h-14 w-auto" alt="logo" />
          <BrandingLogo variant="dark" className="hidden dark:block h-14 w-auto" alt="logo" />
        </div>
      </div>

      {/* Title and Subtitle */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-blue-600 dark:text-white leading-tight">
          {t('signin.welcomeBack')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
          {t('signin.signInDescription')}
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="flex justify-center mt-8 space-x-2">
        <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
        <div className="w-4 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
        <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
      </div>

      {/* Trust indicators */}
      <div className="flex justify-center items-center mt-8 space-x-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t('signin.secureTrust')}
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          {t('signin.encryptedTrust')}
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
          {t('signin.reliableTrust')}
        </div>
      </div>
    </div>
  );
}

export default LoginHeader;