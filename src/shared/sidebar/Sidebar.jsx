import PropTypes from "prop-types";

import { BrandingLogo } from "../branding";
import { getNavItems, isItemActive } from "../layout/nav";

import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../contexts/LocaleContext";

function Sidebar({ handleActive, user, handleLogout }) {
  const { pathname: location } = useLocation();
  const { t } = useLocale();

  // Dashboard path by role: admin/seller → home, regular user → financial summary
  const dashboardPath =
    user.role === "user" && user?.id ? `/financing/user/${user.id}` : "/";

  const items = getNavItems(user);

  return (
    <aside className="sidebar-wrapper fixed top-0 z-50 block h-full w-[280px] lg:w-[308px] bg-white dark:bg-darkblack-600">
      {/* Header */}
      <div className="sidebar-header relative z-30 flex h-[80px] sm:h-[108px] w-full items-center border-b border-r border-b-[#F7F7F7] border-r-[#F7F7F7] pl-[30px] sm:pl-[50px] dark:border-darkblack-400">
        <Link to={dashboardPath} className="flex items-center">
          <BrandingLogo
            variant="light"
            className="block dark:hidden h-8 sm:h-auto"
            alt="logo"
          />
          <BrandingLogo
            variant="dark"
            className="hidden dark:block h-8 sm:h-auto"
            alt="logo"
          />
        </Link>
        <button
          aria-label="Toggle sidebar"
          type="button"
          onClick={handleActive}
          className="group drawer-btn absolute right-0 top-auto flex h-11 w-11 items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-success-300 focus:ring-offset-2 dark:focus:ring-offset-darkblack-600"
          title="Toggle sidebar (Ctrl+b)"
        >
          <span className="block transition-all duration-300 group-hover:drop-shadow-lg">
            <svg
              width="20"
              height="40"
              viewBox="0 0 20 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-all duration-300 group-hover:brightness-110"
            >
              <path
                d="M0 10C0 4.47715 4.47715 0 10 0H16V40H10C4.47715 40 0 35.5228 0 30V10Z"
                fill="#22C55E"
                className="transition-colors duration-300 group-hover:fill-success-400"
              />
              <path
                d="M10 15L6 20.0049L10 25.0098"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 group-hover:stroke-white group-hover:-translate-x-0.5"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Body */}
      <div className="sidebar-body overflow-style-none relative z-30 h-screen w-full overflow-y-scroll pb-[200px] pl-[30px] sm:pl-[48px] pt-[14px]">
        <div className="nav-wrapper mb-[24px] sm:mb-[36px] pr-[30px] sm:pr-[50px]">
          {/* Menu */}
          <div className="item-wrapper mb-5">
            <h4 className="border-b border-bgray-200 text-xs sm:text-sm font-medium leading-7 text-bgray-700 dark:border-darkblack-400 dark:text-bgray-50">
              {t("dashboard.menu")}
            </h4>
            <ul className="mt-2 sm:mt-2.5">
              {items.map((item) => {
                const active = isItemActive(item, user, location);
                return (
                  <li
                    key={item.labelKey}
                    className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${
                      active ? "nav-active" : ""
                    }`}
                  >
                    <Link to={item.resolvedTo}>
                      <div className="flex items-center space-x-2 sm:space-x-2.5">
                        <span className="item-ico w-4 h-4 sm:w-5 sm:h-5 shrink-0">
                          <FontAwesomeIcon
                            icon={item.icon}
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                          {t(item.labelKey)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Others */}
          <div className="item-wrapper mb-4 sm:mb-5">
            <h4 className="border-b border-bgray-200 text-xs sm:text-sm font-medium leading-7 text-bgray-700 dark:border-darkblack-400 dark:text-bgray-50"></h4>
            <ul className="mt-2 sm:mt-2.5">
              {/* Logout */}
              <li className="item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white">
                <Link to="/#" onClick={handleLogout}>
                  <div className="flex items-center space-x-2 sm:space-x-2.5">
                    <span className="item-ico w-4 h-4 sm:w-5 sm:h-5 shrink-0">
                      <FontAwesomeIcon
                        icon={faArrowRightFromBracket}
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                      {t("dashboard.logout")}
                    </span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Footer */}
        <div className="copy-write-text px-3 sm:px-0">
          <p className="text-xs sm:text-sm text-[#969BA0]">
            {t("footer.copyright")}
          </p>
          <p className="text-xs sm:text-sm font-medium text-bgray-700">
            {t("footer.madeBy")}{" "}
            <a
              href="https://omegatech.dev/"
              target="_blank"
              rel="noreferrer"
              className="border-b font-semibold hover:text-brand-strong"
            >
              {t("footer.company")}
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  handleActive: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default Sidebar;
