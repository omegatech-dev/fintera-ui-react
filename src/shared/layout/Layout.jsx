import ProtoTypes from "prop-types";
import { Suspense, useCallback, useContext, useState } from "react";
import { Sidebar } from "../sidebar";
import { Overlay, OnboardingTour } from "../overlays";
import { HeaderOne } from "../header";
import { ShortcutsDialog } from "../ui";
import BottomNav from "./BottomNav";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

import { ThemeContext } from "../../contexts/ThemeContext";

function Layout({ bg, overlay, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Settings keeps its own nested AnimatePresence, so it only fades once per
  // section instead of remounting on every settings tab.
  const pageKey = location.pathname.startsWith("/settings")
    ? "/settings"
    : location.pathname;
  const { user, logout } = useContext(AuthContext);
  const [sidebar, setSidebar] = useState(
    typeof window !== "undefined" && window.innerWidth > 1024
  );
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);
  const { shortcuts } = useKeyboardShortcuts({
    user,
    navigate,
    onOpenHelp: openShortcuts,
    enabled: Boolean(user) && !shortcutsOpen,
  });
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "" || storedTheme ? storedTheme : "";
  });

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`layout-wrapper ${sidebar ? "active" : ""} w-full bg-canvas`}>
        <div className="relative flex w-full">
          {user ? (
            <Sidebar
              handleActive={() => setSidebar(!sidebar)}
              user={user}
              handleLogout={handleLogout}
            />
          ) : (
            <div>Sidebar render ...</div>
          )}
          {/* Only show overlay on mobile when sidebar is active */}
          {overlay ? overlay : sidebar && <Overlay handleClick={() => setSidebar(false)} />}
          <div
            className={`body-wrapper min-h-screen flex-1 overflow-x-hidden bg-canvas pb-[72px] md:pb-0 ${
              bg || ""
            }`}
          >
            <HeaderOne handleSidebar={() => setSidebar(!sidebar)} sidebarOpen={sidebar} />
            <Suspense
              fallback={
                <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
                </div>
              }
            >
              <div key={pageKey} className="motion-page">
                <Outlet />
              </div>
            </Suspense>
            <OnboardingTour />
            {children}
          </div>
          {user && (
            <BottomNav role={user.role} onOpenMenu={() => setSidebar(true)} />
          )}
          {user && shortcutsOpen && (
            <ShortcutsDialog
              open
              shortcuts={shortcuts}
              onClose={closeShortcuts}
            />
          )}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

Layout.propTypes = {
  bg: ProtoTypes.string,
  overlay: ProtoTypes.node,
  children: ProtoTypes.node,
};

export default Layout;
