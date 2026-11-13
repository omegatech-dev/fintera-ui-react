import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";
import { useContext } from "react";
import AuthContext from "../../contexts/AuthContext";

const itemClass =
  "flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-body font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink";

function ProfilePopup({ active, user, handleLogout, handlePopup }) {
  const { t } = useLocale();
  const { user: authUser } = useContext(AuthContext);

  // Get the user ID from either the passed user prop or auth context
  const userId = user?.id || authUser?.id;

  return (
    <div
      role="menu"
      aria-label={t("profile.myProfile")}
      className={`absolute right-0 top-12 z-50 w-[280px] overflow-hidden rounded-card border border-line bg-surface p-1.5 shadow-pop ${
        active ? "block" : "hidden"
      }`}
    >
      <Link
        to={userId ? `/settings/user/${userId}` : "#"}
        onClick={(event) => !userId && event.preventDefault()}
        className={itemClass}
        role="menuitem"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px] text-ink-3">
          <path
            d="M12.12 12.78a3.4 3.4 0 1 0-.24 0M18.74 19.38A8.96 8.96 0 0 1 12 22a8.96 8.96 0 0 1-6.74-2.62c.1-.94.7-1.86 1.77-2.58 2.74-1.82 7.22-1.82 9.94 0 1.07.72 1.67 1.64 1.77 2.58Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {t("profile.myProfile")}
      </Link>

      <Link
        to={userId ? `/settings/user/${userId}` : "#"}
        onClick={(event) => !userId && event.preventDefault()}
        className={itemClass}
        role="menuitem"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px] text-ink-3">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t("profile.accountSettings")}
      </Link>

      <button
        type="button"
        onClick={() => {
          handlePopup("profile");
          window.dispatchEvent(new CustomEvent("start-onboarding-tour"));
        }}
        className={`${itemClass} text-left`}
        role="menuitem"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px] text-ink-3">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("onboarding.restartTour")}
      </button>

      <div className="my-1 h-px bg-line" />

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-left text-body font-semibold text-danger transition-colors hover:bg-danger-soft"
        role="menuitem"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
          <path
            d="M15 10l-1.3 1.3a1 1 0 0 0 0 1.4L15 14m-1-2h8M6 20a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4m0 16a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4m0 16h8a4 4 0 0 0 4-4M6 4h8a4 4 0 0 1 4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {t("profile.logout")}
      </button>
    </div>
  );
}

ProfilePopup.propTypes = {
  active: PropTypes.bool,
  handlePopup: PropTypes.func,
  user: PropTypes.object,
  handleLogout: PropTypes.func,
};

export default ProfilePopup;
