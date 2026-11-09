import PropTypes from "prop-types";
import { useLocale } from "../../../../contexts/LocaleContext";

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  handleSubmit,
  loading,
  apiError,
  setModalOpen,
}) {
  const { t } = useLocale();
  return (
    <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl">
      <div
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xs rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 sm:p-10 relative overflow-hidden animate-fade-in-up"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20"></div>

        {/* Animated background shapes (subtle float, respects prefers-reduced-motion) */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float motion-reduce:animate-none"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-xl animate-float motion-reduce:animate-none animation-delay-1000"></div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                {t("auth.email")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-4 pl-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${errors.email
                      ? "border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-700"
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg backdrop-blur-xs`}
                  style={{
                    transitionProperty:
                      "box-shadow, border-color, background-color, transform",
                  }}
                  placeholder={t("auth.email")}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="current-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-4 pl-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${errors.password
                      ? "border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-700"
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg backdrop-blur-xs`}
                  style={{
                    transitionProperty:
                      "box-shadow, border-color, background-color, transform",
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="p-4 bg-red-50/80 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl backdrop-blur-xs">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-red-700 dark:text-red-300 font-medium">
                  {apiError}
                </p>
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-xs focus:border-blue-300 focus:ring-3 focus:ring-blue-200/50"
              />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {t("auth.rememberMe")}
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 disabled:from-blue-400 disabled:to-indigo-400 text-white font-semibold py-5 px-6 rounded-xl transition-all duration-300 focus:outline-hidden focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden group"
          >
            {/* Button shimmer effect (prefers-reduced-motion respected) */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-0 motion-reduce:translate-x-0 transition-transform duration-1000"
              aria-hidden="true"
            ></div>

            {loading ? (
              <div className="flex items-center justify-center relative z-10">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("common.loading")}
              </div>
            ) : (
              <div className="flex items-center justify-center relative z-10">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                {t("auth.signIn")}
              </div>
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {t("auth.needHelp")}
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-all duration-200 hover:underline focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 rounded-lg px-3 py-2 inline-flex items-center bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("auth.forgotPassword")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

LoginForm.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  apiError: PropTypes.string,
  setModalOpen: PropTypes.func.isRequired,
};

export default LoginForm;
