import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";

function NotificationPopup({
  active,
  loading,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onClose,
}) {
  const { t } = useLocale();

  return (
    <div className="notification-popup-wrapper text-left">
      <div
        id="notification-box"
        style={{
          filter: `drop-shadow(12px 12px 40px rgba(0, 0, 0, 0.08))`,
        }}
        className={`absolute right-[0px] top-[81px] w-[400px] transition-all origin-top rounded-lg bg-white dark:bg-darkblack-600 z-50 ${active ? "block introAnimation" : "hidden"
          }`}
      >
        <div className="relative w-full">
          {/* Header - Fixed at top */}
          <div className="flex h-[66px] w-full items-center justify-between px-8 border-b border-bgray-200 dark:border-darkblack-400">
            <h3 className="text-xl font-bold text-bgray-900 dark:text-white">
              {t("notifications.title")}
            </h3>
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center justify-center w-8 h-8 rounded-full bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800/30 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
              aria-label="Close notifications"
            >
              <svg
                className="w-4 h-4 stroke-bgray-400 dark:stroke-bgray-400 group-hover:stroke-red-500 dark:group-hover:stroke-red-400 transition-colors duration-200"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6L18 18" />
              </svg>
            </button>
          </div>

          {/* Tab section */}
          <div className="flex items-center border-b border-bgray-200 dark:border-darkblack-400">
            <button
              aria-label="none"
              type="button"
              className="flex space-x-2 border-b-2 border-success-300 px-6 py-4 text-sm font-semibold capitalize text-success-300"
            >
              <span>{t("notifications.all")}</span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-50 text-[10px] text-success-300">
                {notifications.length}
              </span>
            </button>
          </div>

          {/* Notification List - Scrollable area */}
          <ul className="max-h-[400px] w-full overflow-y-auto scroll-style-1">
            {loading && (
              <li className="py-4 pl-6 pr-[50px] text-sm text-bgray-600 dark:text-bgray-50">
                {t("notifications.loading")}
              </li>
            )}

            {!loading && notifications.length === 0 && (
              <li className="py-4 pl-6 pr-[50px] text-sm text-bgray-600 dark:text-bgray-50">
                {t("notifications.noNotifications")}
              </li>
            )}

            {!loading &&
              notifications.map((n) => (
                <li
                  key={n.id}
                  className="group/item border-b border-bgray-200 py-4 pl-6 pr-4 hover:bg-bgray-100 dark:border-darkblack-400 dark:hover:bg-darkblack-500 transition-colors duration-150 flex items-start gap-3"
                >
                  <div className="noti-item flex-1 min-w-0">
                    <Link to="#" className="block">
                      {/* Show the title if present */}
                      {n.title && (
                        <strong className="text-bgray-900 dark:text-white block">
                          {n.title}
                        </strong>
                      )}
                      <p className="mb-1 text-sm font-medium text-bgray-600 dark:text-bgray-50">
                        {n.message}
                      </p>
                      <span className="text-xs font-medium text-bgray-500">
                        {n.created_at
                          ? new Date(n.created_at).toLocaleString()
                          : ""}
                      </span>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMarkAsRead(n.id);
                    }}
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-bgray-400 hover:text-success-300 hover:bg-success-50 dark:hover:bg-success-900/20 transition-colors duration-150 mt-0.5"
                    aria-label={t("notifications.markAsRead")}
                    title={t("notifications.markAsRead")}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17L4 12" stroke="currentColor" />
                    </svg>
                  </button>
                </li>
              ))}
          </ul>

          {/* Footer Action - Fixed at bottom */}
          <div className="flex h-[75px] w-full items-center justify-between px-8 bg-white dark:bg-darkblack-600 border-t border-bgray-200 dark:border-darkblack-400">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAllAsRead();
              }}
              disabled={notifications.length === 0}
              className="flex items-center space-x-2 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
            >
              <span>
                <svg
                  width="22"
                  height="12"
                  viewBox="0 0 22 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-150 group-hover:translate-x-1"
                >
                  <path
                    d="M6 6L11 11L21 1M1 6L6 11M11 6L16 1"
                    stroke="#0CAF60"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm font-semibold text-success-300 group-hover:text-success-400 transition-colors duration-150">
                {t("notifications.markAllAsRead")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

NotificationPopup.propTypes = {
  active: PropTypes.bool,
  loading: PropTypes.bool,
  notifications: PropTypes.array,
  onMarkAllAsRead: PropTypes.func.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotificationPopup;
