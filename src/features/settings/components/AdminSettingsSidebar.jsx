import { NavLink } from "react-router-dom";
import { useLocale } from "../../../contexts/LocaleContext";

const ITEMS = [
  {
    to: "/settings/general",
    titleKey: "settings.admin.general",
    descriptionKey: "settings.admin.generalDescription",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h7M15 17h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: "/settings/branding",
    titleKey: "settings.admin.brandIdentity",
    descriptionKey: "settings.admin.brandIdentityDescription",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-13z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
        <path d="M5 17l4.5-4.5 3 3L16 12l3 5H5z" fill="currentColor" opacity=".4" />
      </svg>
    ),
  },
];

function AdminSettingsSidebar() {
  const { t } = useLocale();

  return (
    <aside className="border-b border-bgray-200 dark:border-darkblack-400 xl:col-span-3 xl:border-b-0 xl:border-r">
      <div className="px-4 py-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-bgray-500 dark:text-bgray-400">
          {t("settings.admin.organization")}
        </p>
        <nav
          aria-label={t("settings.admin.navLabel")}
          className="mt-3 flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0"
        >
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-w-[210px] items-start gap-3 rounded-xl p-3 transition-colors xl:min-w-0 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
                    : "text-bgray-600 hover:bg-bgray-100 dark:text-bgray-300 dark:hover:bg-darkblack-500"
                }`
              }
            >
              <span className="mt-0.5 shrink-0">{item.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{t(item.titleKey)}</span>
                <span className="mt-0.5 block text-xs font-medium text-bgray-500 dark:text-bgray-400">
                  {t(item.descriptionKey)}
                </span>
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-4 pb-6">
        <div className="flex items-start gap-2 rounded-xl bg-bgray-100 p-3 text-xs text-bgray-600 dark:bg-darkblack-500 dark:text-bgray-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
            aria-hidden="true"
          >
            <path
              d="M12 3l7 3v5c0 4.4-2.9 8.4-7 9.5-4.1-1.1-7-5.1-7-9.5V6l7-3z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t("settings.admin.adminOnly")}</span>
        </div>
      </div>
    </aside>
  );
}

export default AdminSettingsSidebar;
