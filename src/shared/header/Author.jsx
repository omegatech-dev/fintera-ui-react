import PropTypes from "prop-types";
import { getFullImageUrl, getInitials } from "@/shared/utils/avatarUtils";
import { useLocale } from "../../contexts/LocaleContext";

const ROLE_KEYS = {
  admin: "header.administrator",
  seller: "users.sellerRole",
  user: "header.user",
};

function Author({ showProfile, user }) {
  const { t } = useLocale();
  const displayName = user.full_name || user.email || t("header.user");
  const avatarSrc = user.profile_picture_thumb || user.profile_picture;
  const role = t(ROLE_KEYS[user.role] || "header.user");

  return (
    <button
      type="button"
      onClick={() => showProfile("profile")}
      id="profile-trigger"
      aria-label={displayName}
      className="flex h-10 items-center gap-2 rounded-control text-left transition-colors hover:bg-surface-2"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-label font-bold text-brand-strong">
        {avatarSrc ? (
          <img
            src={getFullImageUrl(avatarSrc)}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(displayName)
        )}
      </span>
      <span className="hidden min-w-0 flex-col gap-px pr-1 2xl:flex">
        <span className="truncate text-label font-semibold leading-4 text-ink">
          {displayName}
        </span>
        <span className="truncate text-micro font-medium leading-3 text-ink-3">
          {role}
        </span>
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="hidden h-4 w-4 shrink-0 text-ink-3 sm:block"
      >
        <path
          d="m7 10 5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

Author.propTypes = {
  showProfile: PropTypes.func,
  user: PropTypes.shape({
    full_name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    profile_picture: PropTypes.string,
    profile_picture_thumb: PropTypes.string,
  }),
};

export default Author;
