import PropTypes from "prop-types";

import { BrandingLogo } from "../branding";

import { Link, useLocation } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";

function Sidebar({ handleActive, user, handleLogout }) {

  const { pathname: location } = useLocation();
  const { t } = useLocale();

  // A small helper to check user role
  const isAdmin = user.role === "admin";
  const isSeller = user.role === "seller";
  const isUser = user.role === "user";

  // Dashboard path by role: admin/seller → home, regular user → financial summary
  const dashboardPath =
    isUser && user?.id ? `/financing/user/${user.id}` : "/";

  return (
    <aside className="sidebar-wrapper fixed top-0 z-50 block h-full w-[280px] sm:w-[308px] bg-white dark:bg-darkblack-600 sm:hidden lg:block">
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
          className="group drawer-btn absolute right-0 top-auto transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-success-300 focus:ring-offset-2 dark:focus:ring-offset-darkblack-600"
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
              {/* Dashboard: Admin or Seller */}
              {(isAdmin || isSeller) && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/" ? "nav-active" : ""
                    }`}
                >
                  <Link to="/">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <svg
                        width="18"
                        height="21"
                        viewBox="0 0 18 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                      >
                        <path
                          d="M0 8.84719C0 7.99027 0.366443 7.17426 1.00691 6.60496L6.34255 1.86217C7.85809 0.515019 10.1419 0.515019 11.6575 1.86217L16.9931 6.60496C17.6336 7.17426 18 7.99027 18 8.84719V17C18 19.2091 16.2091 21 14 21H4C1.79086 21 0 19.2091 0 17V8.84719Z"
                          fill="#1A202C"
                        />
                        <path
                          d="M5 17C5 14.7909 6.79086 13 9 13C11.2091 13 13 14.7909 13 17V21H5V17Z"
                          fill="#22C55E"
                        />
                      </svg>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("dashboard.dashboard")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Financial Dashboard: Regular user */}
              {isUser && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location.includes("/financing/user") ? "nav-active" : ""
                    }`}
                >
                  <Link to={`/financing/user/${user.id}`}>
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <svg
                        width="18"
                        height="21"
                        viewBox="0 0 18 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                      >
                        <path
                          d="M0 8.84719C0 7.99027 0.366443 7.17426 1.00691 6.60496L6.34255 1.86217C7.85809 0.515019 10.1419 0.515019 11.6575 1.86217L16.9931 6.60496C17.6336 7.17426 18 7.99027 18 8.84719V17C18 19.2091 16.2091 21 14 21H4C1.79086 21 0 19.2091 0 17V8.84719Z"
                          fill="#1A202C"
                        />
                        <path
                          d="M5 17C5 14.7909 6.79086 13 9 13C11.2091 13 13 14.7909 13 17V21H5V17Z"
                          fill="#22C55E"
                        />
                      </svg>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("dashboard.financialDashboard")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}



              {/* Transactions: Only Admin */}
              {isAdmin && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/payments" ? "nav-active" : ""
                    }`}
                >
                  <Link to="/payments">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <span className="item-ico w-4 h-4 sm:w-5 sm:h-5 shrink-0">
                        <svg
                          width="22"
                          height="20"
                          viewBox="0 0 22 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          role="img"
                          aria-hidden="true"
                          className="w-full h-full"
                        >
                          <rect
                            x="1"
                            y="4"
                            width="20"
                            height="12"
                            rx="2.5"
                            fill="#22C55E"
                            stroke="#1A202C"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M2 7C4 5 8 5 11 7C14 9 18 9 20 7"
                            stroke="#1A202C"
                            strokeWidth="1.1"
                            strokeLinecap="round"
                            fill="none"
                          />
                          <circle
                            cx="11"
                            cy="10"
                            r="2.2"
                            fill="#fff"
                            stroke="#1A202C"
                            strokeWidth="1"
                          />
                          <text
                            x="11"
                            y="12"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="Inter, Arial, sans-serif"
                            fontWeight="700"
                            fill="#22C55E"
                          >
                            $
                          </text>
                        </svg>
                      </span>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("dashboard.payments")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Contracts: Admin or Seller */}
              {(isAdmin || isSeller) && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/contracts" ? "nav-active" : ""
                    }`}
                >
                  <Link to="/contracts">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <span className="item-ico w-4 h-4 sm:w-5 sm:h-5 shrink-0">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-full h-full"
                        >
                          <path
                            d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"
                            fill="#1A202C"
                          />
                          <path
                            d="M14 9C12.8954 9 12 9.89543 12 11L12 13C12 14.1046 12.8954 15 14 15C15.1046 15 16 14.1046 16 13V11C16 9.89543 15.1046 9 14 9Z"
                            fill="#22C55E"
                          />
                          <path
                            d="M6 5C4.89543 5 4 5.89543 4 7L4 13C4 14.1046 4.89543 15 6 15C7.10457 15 8 14.1046 8 13L8 7C8 5.89543 7.10457 5 6 5Z"
                            fill="#22C55E"
                          />
                        </svg>
                      </span>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("dashboard.contracts")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Projects: Admin or Seller */}
              {(isAdmin || isSeller) && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/projects" ? "nav-active" : ""
                    }`}
                >
                  <Link to="/projects">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <span className="item-ico w-4 h-4 sm:w-5 sm:h-5 shrink-0">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-full h-full"
                        >
                          <path
                            d="M1.57666 3.61499C1.57666 2.51042 2.47209 1.61499 3.57666 1.61499H8.5C9.60456 1.61499 10.5 2.51042 10.5 3.61499V8.53833C10.5 9.64289 9.60456 10.5383 8.49999 10.5383H3.57666C2.47209 10.5383 1.57666 9.64289 1.57666 8.53832V3.61499Z"
                            fill="#1A202C"
                          />
                          <path
                            d="M13.5 15.5383C13.5 14.4338 14.3954 13.5383 15.5 13.5383H20.4233C21.5279 13.5383 22.4233 14.4338 22.4233 15.5383V20.4617C22.4233 21.5662 21.5279 22.4617 20.4233 22.4617H15.5C14.3954 22.4617 13.5 21.5662 13.5 20.4617V15.5383Z"
                            fill="#1A202C"
                          />
                          <circle
                            cx="6.03832"
                            cy="18"
                            r="4.46166"
                            fill="#1A202C"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18 2C18.4142 2 18.75 2.33579 18.75 2.75V5.25H21.25C21.6642 5.25 22 5.58579 22 6C22 6.41421 21.6642 6.75 21.25 6.75H18.75V9.25C18.75 9.66421 18.4142 10 18 10C17.5858 10 17.25 9.66421 17.25 9.25V6.75H14.75C14.3358 6.75 14 6.41421 14 6C14 5.58579 14.3358 5.25 14.75 5.25H17.25V2.75C17.25 2.33579 17.5858 2 18 2Z"
                            fill="#22C55E"
                          />
                        </svg>
                      </span>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("dashboard.projects")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Users: Admin or Seller */}
              {(isAdmin || isSeller) && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/users" ? "nav-active" : ""
                    }`}
                >
                  <Link to="/users">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                      >
                        <ellipse
                          cx="11.7778"
                          cy="17.5555"
                          rx="7.77778"
                          ry="4.44444"
                          fill="#1A202C"
                        />
                        <circle
                          cx="11.7778"
                          cy="6.44444"
                          r="4.44444"
                          fill="#22C55E"
                        />
                      </svg>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("users.title")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Analytics: Admin only */}
              {isAdmin && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/analytics" ? "nav-active" : ""
                    }`}
                >
                  <Link to="/analytics">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                      >
                        <path
                          d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M7 16V12M11 16V8M15 16V13M19 16V10"
                          stroke="#1A202C"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("dashboard.analytics")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Audits: Only Admin */}
              {isAdmin && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/audits" ? "nav-active" : ""
                    }`}
                >
                  <Link to="/audits">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <svg
                        width="18"
                        height="21"
                        viewBox="0 0 18 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                      >
                        <path
                          d="M17.5 12.5C17.5 17.1944 13.6944 21 9 21C4.30558 21 0.5 17.1944 0.5 12.5C0.5 7.80558 4.30558 4 9 4C13.6944 4 17.5 7.80558 17.5 12.5Z"
                          fill="#1A202C"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.99995 1.75C8.02962 1.75 7.09197 1.88462 6.20407 2.13575C5.80549 2.24849 5.39099 2.01676 5.27826 1.61818C5.16553 1.21961 5.39725 0.805108 5.79583 0.692376C6.81525 0.404046 7.89023 0.25 8.99995 0.25C10.1097 0.25 11.1846 0.404046 12.2041 0.692376C12.6026 0.805108 12.8344 1.21961 12.7216 1.61818C12.6089 2.01676 12.1944 2.24849 11.7958 2.13575C10.9079 1.88462 9.97028 1.75 8.99995 1.75Z"
                          fill="#22C55E"
                        />
                        <path
                          d="M11 13C11 14.1046 10.1046 15 9 15C7.89543 15 7 14.1046 7 13C7 11.8954 7.89543 11 9 11C10.1046 11 11 11.8954 11 13Z"
                          fill="#22C55E"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9 7.25C9.41421 7.25 9.75 7.58579 9.75 8V12C9.75 12.4142 9.41421 12.75 9 12.75C8.58579 12.75 8.25 12.4142 8.25 12V8C8.25 7.58579 8.58579 7.25 9 7.25Z"
                          fill="#22C55E"
                        />
                      </svg>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("dashboard.audits")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Branding: Only Admin */}
              {isAdmin && (
                <li
                  className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/settings/branding" ? "nav-active" : ""
                    }`}
                >
                  <Link to="/settings/branding">
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      <svg
                        width="18"
                        height="21"
                        viewBox="0 0 18 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                      >
                        <path
                          d="M2 3.5C2 2.11929 3.11929 1 4.5 1H13.5C14.8807 1 16 2.11929 16 3.5V17.5C16 18.8807 14.8807 20 13.5 20H4.5C3.11929 20 2 18.8807 2 17.5V3.5Z"
                          fill="#1A202C"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.75 7.5C7.57843 7.5 8.25 6.82843 8.25 6C8.25 5.17157 7.57843 4.5 6.75 4.5C5.92157 4.5 5.25 5.17157 5.25 6C5.25 6.82843 5.92157 7.5 6.75 7.5Z"
                          fill="#22C55E"
                        />
                        <path
                          d="M3 17.5L7.25 12L10.5 15L13 11.5L15.5 17.5H3Z"
                          fill="#22C55E"
                        />
                      </svg>
                      <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                        {t("branding.nav")}
                      </span>
                    </div>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Others */}
          <div className="item-wrapper mb-4 sm:mb-5">
            <h4 className="border-b border-bgray-200 text-xs sm:text-sm font-medium leading-7 text-bgray-700 dark:border-darkblack-400 dark:text-bgray-50"></h4>
            <ul className="mt-2 sm:mt-2.5">
              {/* Signin: All roles can see or you can hide if already signed in */}
              <li
                className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white ${location === "/signin" ? "nav-active" : ""
                  }`}
              >
                <Link to="/signin">
                  <div className="flex items-center space-x-2 sm:space-x-2.5">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                    >
                      <ellipse
                        cx="11.7778"
                        cy="17.5555"
                        rx="7.77778"
                        ry="4.44444"
                        fill="#1A202C"
                      />
                      <circle
                        cx="11.7778"
                        cy="6.44444"
                        r="4.44444"
                        fill="#22C55E"
                      />
                    </svg>
                    <span className="item-text text-sm sm:text-base lg:text-lg font-medium leading-none min-w-0 truncate">
                      {t("dashboard.signIn")}
                    </span>
                  </div>
                </Link>
              </li>

              {/* Logout */}
              <li
                className={`item py-[9px] sm:py-[11px] text-bgray-900 dark:text-white`}
              >
                <Link to="/#" onClick={handleLogout}>
                  <div className="flex items-center space-x-2 sm:space-x-2.5">
                    <svg
                      width="21"
                      height="18"
                      viewBox="0 0 21 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M17.1464 10.4394C16.8536 10.7323 16.8536 11.2072 17.1464 11.5001C17.4393 11.7929 17.9142 11.7929 18.2071 11.5001L19.5 10.2072C20.1834 9.52375 20.1834 8.41571 19.5 7.73229L18.2071 6.4394C17.9142 6.1465 17.4393 6.1465 17.1464 6.4394C16.8536 6.73229 16.8536 7.20716 17.1464 7.50006L17.8661 8.21973H11.75C11.3358 8.21973 11 8.55551 11 8.96973C11 9.38394 11.3358 9.71973 11.75 9.71973H17.8661L17.1464 10.4394Z"
                        fill="#22C55E"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.75 17.75H12C14.6234 17.75 16.75 15.6234 16.75 13C16.75 12.5858 16.4142 12.25 16 12.25C15.5858 12.25 15.25 12.5858 15.25 13C15.25 14.7949 13.7949 16.25 12 16.25H8.21412C7.34758 17.1733 6.11614 17.75 4.75 17.75ZM8.21412 1.75H12C13.7949 1.75 15.25 3.20507 15.25 5C15.25 5.41421 15.5858 5.75 16 5.75C16.4142 5.75 16.75 5.41421 16.75 5C16.75 2.37665 14.6234 0.25 12 0.25H4.75C6.11614 0.25 7.34758 0.82673 8.21412 1.75Z"
                        fill="#1A202C"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 5C0 2.37665 2.12665 0.25 4.75 0.25C7.37335 0.25 9.5 2.37665 9.5 5V13C9.5 15.6234 7.37335 17.75 4.75 17.75C2.12665 17.75 0 15.6234 0 13V5Z"
                        fill="#1A202C"
                      />
                    </svg>
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
            {t("footer.madeBy")}
            <a
              href="http://www.securexapp.com"
              target="_blank"
              rel="noreferrer"
              className="border-b font-semibold hover:text-blue-600 ml-1"
            >
              {t("footer.securex")}
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
