// src/components/header/HeaderOne.jsx

import PropTypes from "prop-types";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import Author from "./Author";
import NotificationsBell from "./NotificationsBell";
import ProfilePopup from "./ProfilePopup";
import ModeToggler from "./ModeToggler";
import { usePageTitle } from "../../hooks/usePageTitle";

function HeaderOne({ handleSidebar }) {
  const [popup, setPopup] = useState(false);
  const navigate = useNavigate();

  // Get dynamic page title and subtitle
  const { title, subtitle } = usePageTitle();
  const { user, logout } = useContext(AuthContext);

  const handlePopup = (name) => {
    setPopup((prevPopup) => ({
      [name]: !prevPopup?.[name],
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <header className="header-wrapper fixed z-50 hidden w-full md:block">
      <div className="relative flex h-[108px] w-full items-center justify-between bg-white px-10 dark:bg-darkblack-600 2xl:px-[76px]">
        {/* Sidebar Toggle Button */}
        <button
          aria-label="Toggle sidebar"
          onClick={handleSidebar}
          title="Toggle sidebar (Ctrl+b)"
          type="button"
          className="group drawer-btn absolute left-0 top-auto rotate-180 transform transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-success-300 focus:ring-offset-2 dark:focus:ring-offset-darkblack-600"
        >
          <span className="block transition-all duration-300 group-hover:drop-shadow-lg">
            <svg
              width="16"
              height="40"
              viewBox="0 0 16 40"
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
                className="transition-all duration-300 group-hover:stroke-white group-hover:translate-x-0.5"
              />
            </svg>
          </span>
        </button>

        {/* Dynamic Page Title */}
        <div className="flex-1 ml-10">
          <h3 className="text-xl font-bold text-bgray-900 dark:text-white lg:text-3xl lg:leading-[36.4px] truncate">
            {title}
          </h3>
          <p className="text-xs font-medium text-bgray-600 dark:text-bgray-300 lg:text-sm lg:leading-[25.2px] truncate">
            {subtitle}
          </p>
        </div>

        {/* Right Section: Notifications + Profile */}
        <div className="quick-access-wrapper relative shrink-0">
          <div className="flex items-center space-x-[43px]">
            {/* Some hidden items + Toggles */}
            <div className="flex items-center space-x-3">
              <div className="hidden xl:block">
                <ModeToggler />
              </div>
              <NotificationsBell />
            </div>

            {/* Vertical Divider */}
            <div className="hidden h-[48px] w-[1px] bg-bgray-300 dark:bg-darkblack-400 xl:block"></div>

            {/* User Profile */}
            {user ? (
              <Author showProfile={handlePopup} user={user} />
            ) : (
              <div className="text-sm text-bgray-600 dark:text-bgray-300">
                Por favor inicia sesión
              </div>
            )}
          </div>

          {/* Profile Popup */}
          {user && (
            <ProfilePopup
              active={popup?.profile}
              handlePopup={handlePopup}
              user={user}
              handleLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}

HeaderOne.propTypes = {
  handleSidebar: PropTypes.func,
};

export default HeaderOne;
