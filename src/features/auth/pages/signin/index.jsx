import Login from "../../components/signin";
import { BrandingLogo } from "@/shared/branding";
import { useLocale } from "@/contexts/LocaleContext";

function SignIn() {
  const { t } = useLocale();

  const bullets = [
    t("signin.bulletContracts") || "Un solo lugar para contratos y pagos",
    t("signin.bulletCollections") || "Cobros y mora bajo control",
    t("signin.bulletReports") || "Reportes listos para decidir",
  ];

  return (
    <section className="flex min-h-screen bg-surface">
      <aside className="hidden w-[520px] shrink-0 flex-col justify-between bg-[#0B3B24] p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <BrandingLogo
            variant="dark"
            className="h-9 w-auto"
            alt={t("common.appName") || "Fintera"}
          />
        </div>

        <div className="space-y-3">
          <h1 className="max-w-[420px] text-display font-bold leading-tight">
            {t("signin.heroTitle") || "Financiamiento inmobiliario, sin fricción."}
          </h1>
          <p className="max-w-[400px] text-body-lg font-medium text-[#BBF7D0]">
            {t("signin.heroSubtitle") ||
              "Proyectos, lotes, contratos y cobros en un solo lugar."}
          </p>
          <ul className="space-y-3 pt-1">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-2 text-body font-medium text-brand-soft"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 shrink-0 text-success-200"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M8.5 12.2l2.3 2.3 4.7-4.9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-micro font-medium text-brand-soft/70">
          © 2026 Fintera · Omegatech
        </p>
      </aside>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-10">
        <Login />
      </div>
    </section>
  );
}

export default SignIn;
