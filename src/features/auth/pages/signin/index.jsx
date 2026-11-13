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
    <section className="flex min-h-screen bg-surface-2">
      <aside className="hidden w-[520px] shrink-0 flex-col justify-between bg-[#0B3B24] p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <BrandingLogo
            variant="dark"
            className="h-10 w-auto"
            alt={t("common.appName") || "Fintera"}
          />
        </div>

        <div className="space-y-6">
          <h1 className="max-w-sm text-section font-bold leading-tight">
            {t("signin.heroTitle") || "Financiamiento inmobiliario, sin fricción."}
          </h1>
          <p className="max-w-sm text-body text-success-200">
            {t("signin.heroSubtitle") ||
              "Proyectos, lotes, contratos y cobros en un solo lugar."}
          </p>
          <ul className="space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2 text-body font-medium">
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-success-300/20 text-success-200"
                >
                  ✓
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-micro text-success-200/80">
          © 2026 Fintera · Omegatech
        </p>
      </aside>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Login />
      </div>
    </section>
  );
}

export default SignIn;
