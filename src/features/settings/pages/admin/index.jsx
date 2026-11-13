import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLocale } from "../../../../contexts/LocaleContext";
import AdminSettingsSidebar from "../../components/AdminSettingsSidebar";
import SettingsSaveBarProvider from "../../components/SettingsSaveBarProvider";

function AdminSettings() {
  const { t } = useLocale();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <main className="page-shell w-full px-6 pb-10 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-page font-bold text-ink">
            {t("settings.admin.title")}
          </h1>
          <p className="mt-1 text-body font-medium text-ink-3">
            {t("settings.page.adminSubtitle")}
          </p>
        </div>
        <Link
          to="/docs"
          className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-control border border-line-strong bg-surface px-3.5 text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2"
        >
          {t("settings.nav.guide")}
        </Link>
      </header>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <AdminSettingsSidebar />
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
              className="min-h-[520px] rounded-card border border-line bg-surface p-[22px]"
            >
              <SettingsSaveBarProvider>
                <Outlet />
              </SettingsSaveBarProvider>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </div>
    </main>
  );
}

export default AdminSettings;
