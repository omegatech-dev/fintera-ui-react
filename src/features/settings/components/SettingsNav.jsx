import { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";

const icons = {
  general: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h7M15 17h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="15" cy="7" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="13" cy="17" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-13z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="9" cy="9" r="1.4" fill="currentColor" />
      <path d="M5 17l4.5-4.5 3 3L16 12l3 5H5z" fill="currentColor" opacity=".35" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 20c.8-3.2 3.6-5 7-5s6.2 1.8 7 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7.5a4 4 0 118 0V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  terms: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5V8h4M9.5 12h5M9.5 15.5h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function NavItem({ to, label, icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex h-[38px] shrink-0 items-center gap-2.5 rounded-[8px] px-2.5 text-[13px] transition-colors lg:w-full ${
          isActive
            ? "bg-brand-soft font-semibold text-brand-strong"
            : "font-medium text-ink-2 hover:bg-surface-2"
        }`
      }
    >
      {icon}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function SettingsNav({ showOrganization = false, ariaLabel }) {
  const { t } = useLocale();
  const { user } = useContext(AuthContext);
  const userId = user?.id ?? user?.ID;

  const accountItems = userId
    ? [
        {
          to: `/settings/user/${userId}`,
          label: t("settings.nav.profile"),
          icon: icons.profile,
          end: true,
        },
        {
          to: `/settings/user/${userId}/security`,
          label: t("settings.security"),
          icon: icons.security,
        },
      ]
    : [];

  const legalItems = userId
    ? [
        {
          to: `/settings/user/${userId}/terms&conditions`,
          label: t("settings.nav.terms"),
          icon: icons.terms,
        },
      ]
    : [];

  const groups = [
    ...(showOrganization
      ? [
          {
            label: t("settings.admin.organization"),
            items: [
              {
                to: "/settings/general",
                label: t("settings.admin.general"),
                icon: icons.general,
              },
              {
                to: "/settings/branding",
                label: t("settings.admin.brandIdentity"),
                icon: icons.brand,
              },
            ],
          },
        ]
      : []),
    { label: t("settings.nav.account"), items: accountItems },
    { label: t("settings.nav.legal"), items: legalItems },
  ].filter((group) => group.items.length > 0);

  return (
    <nav
      aria-label={ariaLabel || t("settings.admin.navLabel")}
      className="grid grid-cols-2 gap-2 pb-1 lg:flex lg:w-[220px] lg:flex-col lg:gap-4 lg:pb-0"
    >
      {groups.map((group) => (
        <div key={group.label} className="flex min-w-0 flex-col gap-1 lg:shrink">
          <p className="hidden px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-3 lg:block">
            {group.label}
          </p>
          <div className="grid grid-cols-2 gap-1 lg:flex lg:flex-col lg:gap-0.5">
            {group.items.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.end}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default SettingsNav;
