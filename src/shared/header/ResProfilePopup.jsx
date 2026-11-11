import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";

function ResProfilePopup({ isActive }) {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const userId = user?.id;

  return (
    <div
      style={{
        filter: `drop-shadow(12px 12px 40px rgba(0, 0, 0, 0.08))`,
        zIndex: 999,
      }}
      className={`profile-box absolute right-0 top-[81px] w-[300px] overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 z-50 ${isActive ? "block" : "hidden"
        }`}
    >
      <div className="relative w-full px-3 py-2">
        <div>
          <ul>
            <li className="w-full">
              <Link to={userId ? `/settings/user/${userId}` : "#"} onClick={(e) => !userId && e.preventDefault()}>
                <div className="flex items-center space-x-[18px] rounded-lg p-[14px] text-bgray-600 hover:bg-bgray-100 hover:text-bgray-900 dark:text-bgray-50 dark:hover:bg-darkblack-500">
                  <div className="w-[20px]">
                    <span>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.1197 12.7805C12.0497 12.7705 11.9597 12.7705 11.8797 12.7805C10.1197 12.7205 8.71973 11.2805 8.71973 9.51047C8.71973 7.70047 10.1797 6.23047 11.9997 6.23047C13.8097 6.23047 15.2797 7.70047 15.2797 9.51047C15.2697 11.2805 13.8797 12.7205 12.1197 12.7805Z"
                          stroke="#111827"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.7398 19.3796C16.9598 21.0096 14.5998 21.9996 11.9998 21.9996C9.39977 21.9996 7.03977 21.0096 5.25977 19.3796C5.35977 18.4396 5.95977 17.5196 7.02977 16.7996C9.76977 14.9796 14.2498 14.9796 16.9698 16.7996C18.0398 17.5196 18.6398 18.4396 18.7398 19.3796Z"
                          stroke="#111827"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="#111827"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{t("profile.myProfile")}</span>
                  </div>
                </div>
              </Link>
            </li>
          </ul>
        </div>
        <div className="my-[14px] h-[1px] w-full bg-bgray-300"></div>
        <div>
          <ul>
            <li className="w-full">
              <Link to={userId ? `/settings/user/${userId}` : "#"} onClick={(e) => !userId && e.preventDefault()}>
                <div className="rounded-lg p-[14px] text-bgray-600 hover:bg-bgray-100 hover:text-bgray-900 dark:text-bgray-50 dark:hover:bg-darkblack-500">
                  <span className="text-sm font-semibold">{t("profile.accountSettings")}</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

ResProfilePopup.propTypes = {
  isActive: ProtoTypes.bool,
};

export default ResProfilePopup;
