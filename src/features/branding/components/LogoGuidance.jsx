import { useLocale } from "../../../contexts/LocaleContext";

const SPECS = [
  {
    key: "recommended",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-13z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M8 15l2.5-3 2 2.2L15 11l2 4H8z" fill="currentColor" opacity=".35" />
      </svg>
    ),
  },
  {
    key: "minimum",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M5 9V6.5A1.5 1.5 0 016.5 5H9M15 5h2.5A1.5 1.5 0 0119 6.5V9M19 15v2.5a1.5 1.5 0 01-1.5 1.5H15M9 19H6.5A1.5 1.5 0 015 17.5V15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "maxSize",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M7 18h10a3 3 0 100-6 5 5 0 00-9.58-1.94A4 4 0 007 18z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    key: "formats",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M6 3.75h7l5 5v11.5A1.75 1.75 0 0116.25 22h-10A1.75 1.75 0 014.5 20.25V5.5A1.75 1.75 0 016.25 3.75z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M13 4v5h5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

function LogoGuidance() {
  const { t } = useLocale();

  return (
    <section
      aria-labelledby="logo-guidance-title"
      className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 dark:border-blue-900/40 dark:bg-blue-950/20"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3
            id="logo-guidance-title"
            className="text-base font-bold text-bgray-900 dark:text-white"
          >
            {t("branding.guidance.title")}
          </h3>
          <p className="mt-1 text-sm text-bgray-600 dark:text-bgray-300">
            {t("branding.guidance.description")}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SPECS.map((spec) => (
          <div
            key={spec.key}
            className="flex items-start gap-3 rounded-xl bg-white/80 p-3.5 dark:bg-darkblack-600/60"
          >
            <span className="mt-0.5 text-blue-600 dark:text-blue-300">{spec.icon}</span>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-bgray-500 dark:text-bgray-400">
                {t(`branding.guidance.${spec.key}Label`)}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-bgray-900 dark:text-white">
                {t(`branding.guidance.${spec.key}Value`)}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <ul className="mt-4 space-y-2">
        <li className="flex items-start gap-2 text-sm text-bgray-600 dark:text-bgray-300">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
            aria-hidden="true"
          >
            <path
              d="M4 10.5l3.2 3.2L16 5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("branding.guidance.tipWordmark")}
        </li>
        <li className="flex items-start gap-2 text-sm text-bgray-600 dark:text-bgray-300">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
            aria-hidden="true"
          >
            <path
              d="M4 10.5l3.2 3.2L16 5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("branding.guidance.tipBackground")}
        </li>
        <li className="flex items-start gap-2 text-sm text-bgray-600 dark:text-bgray-300">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
            aria-hidden="true"
          >
            <path
              d="M4 10.5l3.2 3.2L16 5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("branding.guidance.tipDarkVariant")}
        </li>
      </ul>
    </section>
  );
}

export default LogoGuidance;
