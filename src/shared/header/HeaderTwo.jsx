import ProtoTypes from "prop-types";
import { useState, useContext } from "react";
import ResProfilePopup from "./ResProfilePopup";
import NotificationsBell from "./NotificationsBell";
import { useLocale } from "../../contexts/LocaleContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { getInitials, getAvatarColor, getFullImageUrl } from "@/shared/utils/avatarUtils";
import AuthContext from "@/contexts/AuthContext";

function HeaderTwo({ handleSidebar }) {
  const [activePopup, handleActivePopup] = useState(false);
  const { t } = useLocale();
  const { title, subtitle } = usePageTitle();
  const { user } = useContext(AuthContext);

  // Get user display information
  const displayName = user?.full_name || user?.email || t('header.user');
  const displayRole = user?.role === 'admin' ? t('header.admin') : t('header.user');
  return (
    <div>
      <header className="mobile-wrapper fixed z-50 block w-full md:hidden">
        <div className="flex h-[80px] w-full items-center justify-between bg-white dark:bg-darkblack-600 px-4">
          <div className="flex h-full w-full items-center space-x-3">
            <button
              aria-label="Toggle sidebar"
              type="button"
              className="drawer-btn flex h-11 w-11 shrink-0 rotate-180 transform items-center justify-center"
              onClick={handleSidebar}
            >
              <span>
                <svg
                  width="16"
                  height="40"
                  viewBox="0 0 16 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10C0 4.47715 4.47715 0 10 0H16V40H10C4.47715 40 0 35.5228 0 30V10Z"
                    fill="#22C55E"
                  />
                  <path
                    d="M10 15L6 20.0049L10 25.0098"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {/* Dynamic Title for Mobile */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-bgray-900 dark:text-white truncate">
                {title}
              </h3>
              <p className="text-xs font-medium text-bgray-600 dark:text-bgray-300 truncate">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="mr-1 flex items-center">
            <NotificationsBell />
          </div>

          {/* Profile Button */}
          <div className="mr-2">
            <button
              onClick={() => handleActivePopup(!activePopup)}
              aria-label="Profile menu"
              className="flex cursor-pointer space-x-0 lg:space-x-3 shrink-0"
            >
              <div className={`h-[52px] w-[52px] rounded-xl border border-bgray-300 ${(user?.profile_picture || user?.profile_picture_thumb) ? '' : getAvatarColor(displayName)} flex items-center justify-center overflow-hidden bg-white dark:bg-darkblack-500`}>
                {(user?.profile_picture || user?.profile_picture_thumb) ? (
                  <img
                    src={getFullImageUrl(user.profile_picture_thumb || user.profile_picture)}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <span className="text-white font-bold text-xl" style={{ display: (user?.profile_picture || user?.profile_picture_thumb) ? 'none' : 'block' }}>
                  {getInitials(displayName)}
                </span>
              </div>
              <div className="hidden 2xl:block">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-base font-bold leading-[28px] text-bgray-900 dark:text-white">
                    {displayName}
                  </h3>
                  <span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 10L12 14L17 10"
                        stroke="#28303F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <p className="text-sm font-medium leading-[20px] text-bgray-600 dark:text-white">
                  {displayRole}
                </p>
              </div>
            </button>


          </div>
        </div>
      </header>
      <ResProfilePopup isActive={activePopup} />
    </div>
  );
}

HeaderTwo.propTypes = {
  handleSidebar: ProtoTypes.func,
};

export default HeaderTwo;
