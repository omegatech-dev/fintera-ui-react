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
        exit={{ opacity: 0 }}
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

  const themes = [
    { value: "light", label: t("branding.preview.light") },
    { value: "dark", label: t("branding.preview.dark") },
  ];

  return (
    <section
      aria-labelledby="brand-preview-title"
      className="border-t border-line pt-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="brand-preview-title"
            className="text-[15px] font-bold text-ink"
          >
            {t("branding.preview.title")}
          </h3>
          <p className="mt-0.5 text-label font-medium text-ink-3">
            {t("branding.preview.description")}
          </p>
        </div>
        <div
          className="inline-flex rounded-control border border-line bg-surface-2 p-1"
          role="group"
          aria-label={t("branding.preview.themeLabel")}
        >
          {themes.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
              className={`rounded-chip px-3 py-1 text-micro font-semibold transition-colors ${
                theme === option.value
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        className={`mt-3 flex min-h-[130px] flex-col items-center justify-center gap-2.5 rounded-[12px] border ${
          isDark ? "border-[#1F2937] bg-[#0B3B24]" : "border-[#E5E9F0] bg-[#F6F7F9]"
        }`}
      >
        <PreviewImage
          src={logoSrc}
          alt={t("branding.preview.signInAlt")}
          className="h-8 w-auto max-w-[170px] object-contain"
        />
        <p
          className={`text-[18px] font-bold ${
            isDark ? "text-white" : "text-[#0F172A]"
          }`}
        >
          {appName}
        </p>
        {isDark && darkUsesFallback && (
          <p className="text-micro font-medium text-brand-soft/80">
            {t("branding.preview.darkFallback")}
          </p>
        )}
      </motion.div>
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
