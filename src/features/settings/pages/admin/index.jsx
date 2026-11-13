import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { useLocale } from "../../../../contexts/LocaleContext";
import AdminSettingsSidebar from "../../components/AdminSettingsSidebar";

function AdminSettings() {
  const { t } = useLocale();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <main className="w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M12 3l7 3v5c0 4.4-2.9 8.4-7 9.5-4.1-1.1-7-5.1-7-9.5V6l7-3z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {t("settings.admin.badge")}
        </span>
        <p className="text-sm text-bgray-500 dark:text-bgray-400">
          {t("settings.admin.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 rounded-xl bg-white dark:bg-darkblack-600 xl:grid-cols-12">
        <AdminSettingsSidebar />
        <div className="min-w-0 px-6 py-8 sm:px-10 xl:col-span-9">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

export default AdminSettings;
