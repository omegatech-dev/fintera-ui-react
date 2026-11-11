import { useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "../../../contexts/LocaleContext";

function PreviewImage({ src, alt, className }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.img
        key={src}
        src={src}
        alt={alt}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        className={className}
      />
    </AnimatePresence>
  );
}

PreviewImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

function BrandPreview({ lightSrc, darkSrc, appName, darkUsesFallback }) {
  const { t } = useLocale();
  const [theme, setTheme] = useState("light");
  const reduceMotion = useReducedMotion();

  const isDark = theme === "dark";
  const logoSrc = isDark ? darkSrc : lightSrc;
  const surface = isDark
    ? "border-darkblack-500 bg-darkblack-600 text-white"
    : "border-bgray-200 bg-white text-bgray-900";
  const muted = isDark ? "bg-darkblack-400" : "bg-bgray-200";
  const subtle = isDark ? "bg-darkblack-500" : "bg-bgray-100";

  const themes = [
    { value: "light", label: t("branding.preview.light") },
    { value: "dark", label: t("branding.preview.dark") },
  ];

  return (
    <section
      aria-labelledby="brand-preview-title"
      className="rounded-2xl border border-bgray-200 p-5 dark:border-darkblack-400 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3
            id="brand-preview-title"
            className="text-base font-bold text-bgray-900 dark:text-white"
          >
            {t("branding.preview.title")}
          </h3>
          <p className="mt-1 text-sm text-bgray-600 dark:text-bgray-300">
            {t("branding.preview.description")}
          </p>
        </div>
        <div
          className="inline-flex rounded-xl border border-bgray-200 bg-bgray-50 p-1 dark:border-darkblack-400 dark:bg-darkblack-500"
          role="group"
          aria-label={t("branding.preview.themeLabel")}
        >
          {themes.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                theme === option.value
                  ? "bg-white text-bgray-900 shadow-sm dark:bg-darkblack-300 dark:text-white"
                  : "text-bgray-500 hover:text-bgray-800 dark:text-bgray-400 dark:hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bgray-500 dark:text-bgray-400">
            {t("branding.preview.sidebar")}
          </p>
          <motion.div
            layout
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className={`overflow-hidden rounded-xl border p-3 ${surface}`}
          >
            <div className="mx-auto flex w-full max-w-[230px] flex-col overflow-hidden rounded-lg border border-black/5 shadow-sm dark:border-white/10">
              <div
                className={`flex h-[72px] items-center px-4 ${
                  isDark ? "bg-darkblack-600" : "bg-white"
                }`}
              >
                <PreviewImage
                  src={logoSrc}
                  alt={t("branding.preview.sidebarAlt")}
                  className="h-8 w-auto max-w-[150px] object-contain"
                />
              </div>
              <div className={`space-y-2 p-4 ${isDark ? "bg-darkblack-500" : "bg-bgray-50"}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-4 w-4 rounded ${subtle}`} />
                  <span className={`h-2 w-20 rounded-full ${muted}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-4 w-4 rounded ${subtle}`} />
                  <span className={`h-2 w-14 rounded-full ${muted}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-4 w-4 rounded ${subtle}`} />
                  <span className={`h-2 w-24 rounded-full ${muted}`} />
                </div>
              </div>
            </div>
            {isDark && darkUsesFallback && (
              <p className="mt-2 text-center text-xs text-amber-200">
                {t("branding.preview.darkFallback")}
              </p>
            )}
          </motion.div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bgray-500 dark:text-bgray-400">
            {t("branding.preview.signIn")}
          </p>
          <motion.div
            layout
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className={`flex min-h-[188px] flex-col items-center justify-center gap-4 rounded-xl border p-5 ${
              isDark
                ? "border-darkblack-500 bg-gradient-to-br from-darkblack-600 to-darkblack-500"
                : "border-bgray-200 bg-gradient-to-br from-blue-50 to-white"
            }`}
          >
            <PreviewImage
              src={logoSrc}
              alt={t("branding.preview.signInAlt")}
              className="h-12 w-auto max-w-[210px] object-contain"
            />
            <div className="space-y-1.5 text-center">
              <p
                className={`text-sm font-bold ${
                  isDark ? "text-white" : "text-bgray-900"
                }`}
              >
                {appName}
              </p>
              <div
                className={`mx-auto h-2 w-24 rounded-full ${
                  isDark ? "bg-white/20" : "bg-bgray-200"
                }`}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bgray-500 dark:text-bgray-400">
          {t("branding.preview.browserTab")}
        </p>
        <div className="overflow-hidden rounded-xl border border-bgray-200 bg-bgray-100 dark:border-darkblack-400 dark:bg-darkblack-500">
          <div className="flex items-center gap-1.5 border-b border-bgray-200 px-3 py-2 dark:border-darkblack-400">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-end gap-1 px-3 pt-2">
            <div className="flex max-w-[220px] items-center gap-2 rounded-t-lg bg-white px-3 py-2 dark:bg-darkblack-600">
              <PreviewImage
                src={lightSrc}
                alt=""
                className="h-4 w-4 object-contain"
              />
              <span className="truncate text-xs font-medium text-bgray-700 dark:text-bgray-200">
                {appName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

BrandPreview.propTypes = {
  lightSrc: PropTypes.string,
  darkSrc: PropTypes.string,
  appName: PropTypes.string,
  darkUsesFallback: PropTypes.bool,
};

export default BrandPreview;
