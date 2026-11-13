// Single source of truth for navigation and active-state matching.
// Items are role-filtered; `match` extends the active prefix beyond `to`.

export const NAV_ITEMS = [
  { to: "/", labelKey: "dashboard.dashboard", roles: ["admin", "seller"], exact: true },
  { to: "/payments", labelKey: "dashboard.payments", roles: ["admin", "seller"] },
  { to: "/contracts", labelKey: "dashboard.contracts", roles: ["admin", "seller"] },
  { to: "/vendedor/clientes", labelKey: "dashboard.workspace", roles: ["seller"] },
  { to: "/projects", labelKey: "dashboard.projects", roles: ["admin", "seller"] },
  { to: "/users", labelKey: "dashboard.users", roles: ["admin"] },
  { to: "/analytics", labelKey: "dashboard.analytics", roles: ["admin"] },
  { to: "/audits", labelKey: "dashboard.audits", roles: ["admin"] },
  { to: "/docs", labelKey: "docs.title", roles: ["admin", "seller"] },
  { to: "/settings/general", labelKey: "settings.admin.nav", roles: ["admin"] },
];

export function isRouteActive(pathname, to) {
  if (!pathname) return false;
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
