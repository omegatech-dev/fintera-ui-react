import PropTypes from "prop-types";
import { useState } from "react";

import { BrandingLogo } from "../branding";
import { getNavItems, isItemActive } from "../layout/nav";
import { formatChord } from "../layout/shortcuts";

import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../contexts/LocaleContext";
import { useBranding } from "../../contexts/branding";
import { getFullImageUrl, getInitials } from "../utils/avatarUtils";

const ROLE_KEYS = {
  admin: "header.administrator",
  seller: "users.sellerRole",
  user: "header.user",
};

function roleLabel(role, t) {
  return t(ROLE_KEYS[role] || "header.user");
}

function Sidebar({ handleActive, user, handleLogout }) {
  const { pathname: location } = useLocation();
  const { t } = useLocale();
  const { branding } = useBranding();
  const [hintKey, setHintKey] = useState(null);

  const brandName = branding?.app_name || "Fintera";
  const hasCustomLogo = Boolean(branding?.logo_url || branding?.logo_dark_url);
  const displayName = user.full_name || user.email || t("header.user");
  const avatarSrc = user.profile_picture_thumb || user.profile_picture;

  // Dashboard path by role: admin/seller → home, regular user → financial summary
  const dashboardPath =
    user.role === "user" && user?.id ? `/financing/user/${user.id}` : "/";

  const items = getNavItems(user);

  return (
    <aside className="sidebar-wrapper fixed top-0 z-50 flex h-full w-[264px] flex-col border-r border-line bg-surface">
      {/* Brand */}
      <div className="flex h-[82px] shrink-0 items-center gap-2.5 px-5 pb-[22px] pt-[26px]">
        <Link
          to={dashboardPath}
          className="flex min-w-0 items-center gap-2.5"
          aria-label={brandName}
        >
          {hasCustomLogo ? (
            <>
              <BrandingLogo
                variant="light"
                className="block h-8 w-auto dark:hidden"
                alt="logo"
              />
              <BrandingLogo
                variant="dark"
                className="hidden h-8 w-auto dark:block"
                alt="logo"
              />
            </>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-brand text-[18px] font-bold leading-none text-white"
              >
                {brandName.charAt(0).toUpperCase()}
              </span>
              <span className="truncate text-[20px] font-bold leading-6 text-ink">
                {brandName}
              </span>
            </>
          )}
        </Link>

        <button
          aria-label="Toggle sidebar"
          type="button"
          onClick={handleActive}
          title="Toggle sidebar (Ctrl+b)"
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-hidden"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 6L9 12l6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Workspace chip */}
      <div className="shrink-0 px-4 pb-[18px]">
        <div className="flex h-9 items-center rounded-[10px] bg-surface-2 px-3 text-label font-medium text-ink-2">
          <span className="truncate">
            {brandName} · {roleLabel(user.role, t)}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav
        aria-label={t("dashboard.menu")}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-1.5"
      >
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = isItemActive(item, user, location);
            const shortcut = item.shortcut
              ? formatChord(["g", item.shortcut])
              : null;
            const showHint = shortcut && hintKey === item.labelKey;
            return (
              <li key={item.labelKey} className={active ? "nav-active" : ""}>
                <Link
                  to={item.resolvedTo}
                  aria-current={active ? "page" : undefined}
                  aria-keyshortcuts={shortcut || undefined}
                  title={
                    shortcut
                      ? t("shortcuts.sidebarHint", { key: item.shortcut })
                      : undefined
                  }
                  onMouseEnter={
                    shortcut ? () => setHintKey(item.labelKey) : undefined
                  }
                  onMouseLeave={shortcut ? () => setHintKey(null) : undefined}
                  onFocus={
                    shortcut ? () => setHintKey(item.labelKey) : undefined
                  }
                  onBlur={shortcut ? () => setHintKey(null) : undefined}
                  className={`flex h-10 items-center gap-3 rounded-[10px] px-3 text-body-lg font-medium transition-colors ${
                    active
                      ? "bg-brand-soft text-brand-strong"
                      : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="h-[18px] w-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
                  {shortcut && (
                    <span
                      aria-hidden="true"
                      className="ml-auto flex w-9 shrink-0 justify-end"
                    >
                      {showHint && (
                        <kbd className="rounded-chip border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-ink-3">
                          {shortcut}
                        </kbd>
                      )}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="flex shrink-0 items-center gap-2.5 border-t border-line px-4 pb-[18px] pt-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-label font-bold text-brand-strong">
          {avatarSrc ? (
            <img
              src={getFullImageUrl(avatarSrc)}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="truncate text-label font-semibold text-ink">
            {displayName}
          </span>
          <span className="truncate text-micro font-medium text-ink-3">
            {roleLabel(user.role, t)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label={t("dashboard.logout")}
          title={t("dashboard.logout")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <FontAwesomeIcon
            icon={faArrowRightFromBracket}
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  handleActive: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.string.isRequired,
    full_name: PropTypes.string,
    email: PropTypes.string,
    profile_picture: PropTypes.string,
    profile_picture_thumb: PropTypes.string,
  }).isRequired,
  handleLogout: PropTypes.func,
};

export default Sidebar;
