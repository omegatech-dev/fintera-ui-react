import PropTypes from "prop-types";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLocale } from "../../../contexts/LocaleContext";
import SettingsSidebar from "../components/SettingsSidebar";
import SettingsSaveBarProvider from "../components/SettingsSaveBarProvider";

function Settings({ children }) {
  const { t } = useLocale();
  const { pathname } = useLocation();
  const isSecurity = pathname.endsWith("/security");
  const isTerms = pathname.endsWith("/terms&conditions");
  const subtitle = isSecurity
    ? t("settings.page.accountSubtitle")
    : isTerms
      ? t("settings.page.termsSubtitle")
      : t("settings.page.profileSubtitle");

  return (
    <main className="page-shell w-full px-6 pb-10 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-page font-bold text-ink">
            {t("settings.admin.title")}
          </h1>
          <p className="mt-1 text-body font-medium text-ink-3">
            {subtitle}
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
        <SettingsSidebar />
        <div className="min-w-0 rounded-card border border-line bg-surface p-[22px]">
          <SettingsSaveBarProvider>
            <Outlet />
            {children}
          </SettingsSaveBarProvider>
        </div>
      </div>
      </div>
    </main>
  );
}

Settings.propTypes = {
  children: PropTypes.node,
};

export default Settings;
