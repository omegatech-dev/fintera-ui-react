import PropTypes from "prop-types";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";

import AuthContext from "../../contexts/AuthContext";
import Author from "./Author";
import GlobalSearch from "./GlobalSearch";
import ModeToggler from "./ModeToggler";
import NotificationsBell from "./NotificationsBell";
import ProfilePopup from "./ProfilePopup";

function HeaderBar({ handleSidebar, sidebarOpen = false, onOpenShortcuts }) {
  const [popup, setPopup] = useState(false);
  const { t } = useLocale();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handlePopup = (name) => {
    setPopup((previous) => ({ [name]: !previous?.[name] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <header className="header-wrapper fixed z-50 w-full">
      <div className="relative flex h-14 w-full items-center gap-3 border-b border-line bg-surface px-4 md:h-16 md:px-6 xl:px-8">
        <button
          aria-label={t("header.toggleSidebar")}
          aria-controls="app-sidebar"
          aria-expanded={sidebarOpen}
          type="button"
          onClick={handleSidebar}
          className="drawer-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {!sidebarOpen && (
          <button
            aria-label={t("header.toggleSidebar")}
            aria-controls="app-sidebar"
            aria-expanded={sidebarOpen}
            type="button"
            onClick={handleSidebar}
            className="drawer-btn hidden h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:flex"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M9 4v16" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </button>
        )}

        <div className="min-w-0 flex-1" />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <GlobalSearch compact />
          <GlobalSearch />
          <ModeToggler />
          <button
            type="button"
            onClick={onOpenShortcuts}
            aria-label={`${t("shortcuts.title")} (?)`}
            title={`${t("shortcuts.title")} (?)`}
            className="flex h-10 w-10 items-center justify-center rounded-control border border-line bg-surface text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M7 14h.01M10 14h4M16 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <NotificationsBell />
          {user ? (
            <Author showProfile={handlePopup} user={user} />
          ) : (
            <span className="text-body text-ink-3">{t("dashboard.signIn")}</span>
          )}
        </div>

        {user && (
          <ProfilePopup
            active={popup?.profile}
            handlePopup={handlePopup}
            user={user}
            handleLogout={handleLogout}
          />
        )}
      </div>
    </header>
  );
}

HeaderBar.propTypes = {
  handleSidebar: PropTypes.func,
  sidebarOpen: PropTypes.bool,
  onOpenShortcuts: PropTypes.func,
};

export default HeaderBar;
