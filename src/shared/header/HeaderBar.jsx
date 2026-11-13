import PropTypes from "prop-types";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthContext from "../../contexts/AuthContext";
import Author from "./Author";
import GlobalSearch from "./GlobalSearch";
import ModeToggler from "./ModeToggler";
import NotificationsBell from "./NotificationsBell";
import ProfilePopup from "./ProfilePopup";

function HeaderBar({ handleSidebar, sidebarOpen = false }) {
  const [popup, setPopup] = useState(false);
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
          aria-label="Toggle sidebar"
          type="button"
          onClick={handleSidebar}
          className="drawer-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
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
            aria-label="Toggle sidebar"
            type="button"
            onClick={handleSidebar}
            className="drawer-btn hidden h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink md:flex"
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
          <NotificationsBell />
          {user ? (
            <Author showProfile={handlePopup} user={user} />
          ) : (
            <span className="text-body text-ink-3">Inicia sesión</span>
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
};

export default HeaderBar;
