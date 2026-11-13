import { motion } from "framer-motion";
import {
  getInitials,
  getAvatarColor,
  getFullImageUrl,
} from "@/shared/utils/avatarUtils";
import { useLocale } from "@/contexts/LocaleContext";

function UserDetailsHeader({
  user,
  toggleStatus,
  onEdit,
  showActions = true,
  showToggleStatus = false,
}) {
  const { t } = useLocale();
  const {
    full_name,
    role,
    status,
    id,
    email,
    profile_picture_thumb,
    profile_picture,
  } = user || {};

  const roleTone =
    role === "admin"
      ? "bg-violet-soft text-violet"
      : role === "seller"
        ? "bg-info-soft text-info"
        : "bg-surface-2 text-ink-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative mb-6 w-full overflow-hidden rounded-card border border-line bg-surface p-5 md:p-6"
    >
      <div className="relative z-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-page font-bold text-white md:h-20 md:w-20 ${
                !profile_picture && !profile_picture_thumb
                  ? getAvatarColor(full_name)
                  : ""
              }`}
            >
              {profile_picture || profile_picture_thumb ? (
                <img
                  src={getFullImageUrl(
                    profile_picture || profile_picture_thumb
                  )}
                  alt={full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(full_name)
              )}
            </div>
            <span
              className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-surface ${
                status === "active" ? "bg-brand" : "bg-ink-3"
              }`}
            />
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-title font-bold text-ink">
                {full_name || t("personalInfo.unknownUser")}
              </h2>
              <span
                className={`rounded-chip px-2 py-1 text-micro font-bold uppercase tracking-wide ${roleTone}`}
              >
                {role ? t(`users.${role}`) : t("users.user")}
              </span>
            </div>
            <p className="mb-2 text-body text-ink-3">{email || "—"}</p>
            <span className="rounded-chip bg-surface-2 px-2 py-1 text-micro font-medium text-ink-3">
              ID: {id}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="mt-2 flex w-full flex-wrap items-center gap-2 md:mt-0 md:w-auto">
            {showToggleStatus && (
              <button
                type="button"
                onClick={toggleStatus}
                className={`inline-flex flex-1 items-center justify-center rounded-control px-4 py-2.5 text-label font-semibold transition-colors md:flex-none ${
                  status === "active"
                    ? "bg-danger-soft text-danger hover:bg-danger-soft"
                    : "bg-brand-soft text-brand-strong hover:bg-brand-soft"
                }`}
              >
                {status === "active"
                  ? t("personalInfo.deactivateUser")
                  : t("personalInfo.activateUser")}
              </button>
            )}

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-label font-bold text-white transition-colors hover:bg-brand-strong md:flex-none"
            >
              <span>{t("personalInfo.editProfile")}</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default UserDetailsHeader;
