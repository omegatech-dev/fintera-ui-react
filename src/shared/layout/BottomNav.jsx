import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBuilding,
  faFileAlt,
  faHome,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { getNavItems, isItemActive, isRouteActive } from "./nav";
import { useLocale } from "../../contexts/LocaleContext";

const ADMIN_ITEMS = [
  { to: "/", label: "Inicio", icon: faHome, roles: ["admin"] },
  {
    to: "/contracts",
    label: "Contratos",
    icon: faFileAlt,
    roles: ["admin"],
  },
  {
    to: "/payments",
    label: "Pagos",
    icon: faWallet,
    roles: ["admin"],
  },
  {
    to: "/projects",
    label: "Proyectos",
    icon: faBuilding,
    roles: ["admin"],
  },
];

function BottomNav({ role, onOpenMenu }) {
  const { pathname } = useLocation();
  const { t } = useLocale();

  if (role === "seller") {
    const sellerItems = getNavItems({ role: "seller" });

    return (
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {sellerItems.map((item) => {
          const active = isItemActive(item, { role: "seller" }, pathname);
          const label = t(item.labelKey);
          return (
            <Link
              key={item.to}
              to={item.resolvedTo}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[10px] font-semibold leading-tight ${
                active ? "text-brand" : "text-ink-3"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="h-4 w-4 shrink-0" />
              <span className="w-full truncate text-center">{label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  const items = ADMIN_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {items.map((item) => {
        const active = isRouteActive(pathname, item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold ${
              active ? "text-brand" : "text-ink-3"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold text-ink-3"
      >
        <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
        <span>Más</span>
      </button>
    </nav>
  );
}

BottomNav.propTypes = {
  role: PropTypes.string,
  onOpenMenu: PropTypes.func,
};

export default BottomNav;
