import {
  faBookOpen,
  faBuilding,
  faChartColumn,
  faClipboardList,
  faFileAlt,
  faHandHoldingDollar,
  faHome,
  faPercent,
  faSliders,
  faStar,
  faUsers,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";

// Single source of truth for navigation and active-state matching.
// `to` may be a string or a (user) => string resolver. `match` extends the
// active prefixes beyond `to`; `exclude` removes prefixes from the match.
export const NAV_ITEMS = [
  { to: "/", labelKey: "dashboard.dashboard", icon: faHome, roles: ["admin", "seller"], exact: true },
  { to: "/", labelKey: "dashboard.payments", icon: faWallet, roles: ["admin"] },
  {
    to: "/commissions",
    labelKey: "dashboard.commissions",
    icon: faPercent,
    roles: ["admin", "seller"],
    toFor: (user) => (user?.role === "seller" ? "/vendedor/comisiones" : "/commissions"),
    match: ["/commissions", "/vendedor/comisiones"],
  },
  {
    to: "/vendedor/clientes",
    labelKey: "dashboard.workspace",
    icon: faStar,
    roles: ["seller"],
    match: ["/vendedor"],
    exclude: ["/vendedor/comisiones"],
  },
  { to: "/contracts", labelKey: "dashboard.contracts", icon: faFileAlt, roles: ["admin", "seller"] },
  { to: "/projects", labelKey: "dashboard.projects", icon: faBuilding, roles: ["admin", "seller"] },
  { to: "/users", labelKey: "dashboard.users", icon: faUsers, roles: ["admin"] },
  { to: "/analytics", labelKey: "dashboard.analytics", icon: faChartColumn, roles: ["admin"] },
  { to: "/audits", labelKey: "dashboard.audits", icon: faClipboardList, roles: ["admin"] },
  { to: "/docs", labelKey: "docs.title", icon: faBookOpen, roles: ["admin", "seller"] },
  {
    to: "/settings",
    labelKey: "settings.admin.nav",
    icon: faSliders,
    roles: ["admin"],
    match: ["/settings"],
    exclude: ["/settings/user/"],
  },
];

// Regular users land on their own financial summary instead of the admin menu.
export const USER_NAV_ITEMS = [
  {
    to: (user) => `/financing/user/${user?.id}`,
    labelKey: "dashboard.financialDashboard",
    icon: faHandHoldingDollar,
    roles: ["user"],
    match: ["/financing/user"],
  },
];

export function isRouteActive(pathname, to) {
  if (!pathname) return false;
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function resolveTo(item, user) {
  if (typeof item.toFor === "function") return item.toFor(user);
  if (typeof item.to === "function") return item.to(user);
  return item.to;
}

export function isItemActive(item, user, pathname) {
  if (item.exact) return pathname === item.to;
  const prefixes = item.match || [resolveTo(item, user)];
  const excluded = item.exclude || [];
  return (
    prefixes.some((prefix) => isRouteActive(pathname, prefix)) &&
    !excluded.some((prefix) => isRouteActive(pathname, prefix))
  );
}

export function getNavItems(user) {
  const role = user?.role;
  const source = role === "user" ? USER_NAV_ITEMS : NAV_ITEMS;
  return source
    .filter((item) => item.roles.includes(role))
    .map((item) => ({ ...item, resolvedTo: resolveTo(item, user) }));
}
