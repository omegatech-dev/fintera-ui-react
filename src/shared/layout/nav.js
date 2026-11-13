import {
  faBookOpen,
  faBuilding,
  faChartColumn,
  faClipboardList,
  faFileAlt,
  faHandHoldingDollar,
  faHome,
  faLink,
  faPercent,
  faSliders,
  faSun,
  faUsers,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";

// Single source of truth for navigation and active-state matching.
// `to` may be a string or a (user) => string resolver. `match` extends the
// active prefixes beyond `to`; `exclude` removes prefixes from the match.
export const NAV_ITEMS = [
  {
    to: "/",
    labelKey: "dashboard.dashboard",
    icon: faHome,
    roles: ["admin"],
    exact: true,
    shortcut: "d",
  },
  {
    to: "/payments",
    labelKey: "dashboard.payments",
    icon: faWallet,
    roles: ["admin"],
    shortcut: "p",
  },
  {
    to: "/commissions",
    labelKey: "dashboard.commissions",
    icon: faPercent,
    roles: ["admin"],
    match: ["/commissions"],
    shortcut: "m",
  },
  {
    to: "/contracts",
    labelKey: "dashboard.contracts",
    icon: faFileAlt,
    roles: ["admin"],
    shortcut: "c",
  },
  {
    to: "/projects",
    labelKey: "dashboard.projects",
    icon: faBuilding,
    roles: ["admin"],
    shortcut: "r",
  },
  {
    to: "/users",
    labelKey: "dashboard.users",
    icon: faUsers,
    roles: ["admin"],
    shortcut: "u",
  },
  {
    to: "/analytics",
    labelKey: "dashboard.analytics",
    icon: faChartColumn,
    roles: ["admin"],
    shortcut: "a",
  },
  {
    to: "/audits",
    labelKey: "dashboard.audits",
    icon: faClipboardList,
    roles: ["admin"],
    shortcut: "l",
  },
  {
    to: "/docs",
    labelKey: "docs.title",
    icon: faBookOpen,
    roles: ["admin"],
    shortcut: "g",
  },
  {
    to: "/settings",
    labelKey: "settings.admin.nav",
    icon: faSliders,
    roles: ["admin"],
    match: ["/settings"],
    exclude: ["/settings/user/"],
    shortcut: "s",
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

// Sellers get a focused workspace: day overview, clients, collections,
// commissions and documents. Admin-only sections are intentionally absent.
export const SELLER_NAV_ITEMS = [
  {
    to: "/",
    labelKey: "seller.myDay",
    icon: faSun,
    roles: ["seller"],
    exact: true,
    shortcut: "d",
  },
  {
    to: "/vendedor/enlace",
    labelKey: "nav.myLink",
    icon: faLink,
    roles: ["seller"],
  },
  {
    to: "/vendedor/clientes",
    labelKey: "seller.myClients",
    icon: faUsers,
    roles: ["seller"],
    match: ["/vendedor/clientes"],
    shortcut: "c",
  },
  {
    to: "/vendedor/cobros",
    labelKey: "seller.collections",
    icon: faWallet,
    roles: ["seller"],
    match: ["/vendedor/cobros"],
    shortcut: "b",
  },
  {
    to: "/vendedor/comisiones",
    labelKey: "seller.tabCommissions",
    icon: faPercent,
    roles: ["seller"],
    match: ["/vendedor/comisiones"],
    shortcut: "m",
  },
  {
    to: "/vendedor/documentos",
    labelKey: "seller.documents",
    icon: faBookOpen,
    roles: ["seller"],
    match: ["/vendedor/documentos"],
    shortcut: "o",
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
  const source =
    role === "user"
      ? USER_NAV_ITEMS
      : role === "seller"
        ? SELLER_NAV_ITEMS
        : NAV_ITEMS;
  return source
    .filter((item) => item.roles.includes(role))
    .map((item) => ({ ...item, resolvedTo: resolveTo(item, user) }));
}

// Action shortcuts use a separate `n` chord so they never collide with the
// navigation map. They are resolved by role like the sidebar.
export const ACTION_SHORTCUTS = [
  {
    id: "new-project",
    labelKey: "shortcuts.newProject",
    keys: ["n", "p"],
    to: "/projects/create",
    roles: ["admin"],
  },
  {
    id: "new-user",
    labelKey: "shortcuts.newUser",
    keys: ["n", "u"],
    to: "/users/create",
    roles: ["admin"],
  },
];

export function getActionShortcuts(user) {
  const role = user?.role;
  return ACTION_SHORTCUTS.filter((item) => item.roles.includes(role)).map(
    ({ id, labelKey, keys, to }) => ({ id, labelKey, keys, to })
  );
}

// Chord shortcuts (g + letter) resolved from the same source as the sidebar so
// routes and roles can never drift from the visible navigation.
export function getNavShortcuts(user) {
  return getNavItems(user)
    .filter((item) => Boolean(item.shortcut))
    .map((item) => ({
      keys: ["g", item.shortcut],
      labelKey: item.labelKey,
      to: item.resolvedTo,
    }));
}
