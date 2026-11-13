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
      className="rounded-card border border-info/20 bg-info-soft/60 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-info-soft text-info">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3
            id="logo-guidance-title"
            className="text-[15px] font-bold text-ink"
          >
            {t("branding.guidance.title")}
          </h3>
          <p className="mt-0.5 text-label font-medium text-ink-3">
            {t("branding.guidance.description")}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SPECS.map((spec) => (
          <div
            key={spec.key}
            className="flex items-start gap-3 rounded-control bg-surface/80 p-3"
          >
            <span className="mt-0.5 text-info">{spec.icon}</span>
            <div>
              <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                {t(`branding.guidance.${spec.key}Label`)}
              </dt>
              <dd className="mt-0.5 text-label font-semibold text-ink">
                {t(`branding.guidance.${spec.key}Value`)}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <ul className="mt-4 space-y-2">
        {["tipWordmark", "tipBackground", "tipDarkVariant"].map((tip) => (
          <li
            key={tip}
            className="flex items-start gap-2 text-label font-medium text-ink-2"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="mt-0.5 h-4 w-4 shrink-0 text-brand"
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
            {t(`branding.guidance.${tip}`)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default LogoGuidance;
