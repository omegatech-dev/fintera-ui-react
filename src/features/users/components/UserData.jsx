import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { usersApi } from "../api";
import { getInitials, getAvatarColor, getFullImageUrl } from "@/shared/utils/avatarUtils";

function UserData({ userInfo, index, onClick, showStatusToggle = true, showEditButton = true, showDeleteButton = false, onDelete }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { id, full_name, phone, email, status: initialStatus, role, created_at, creator } = userInfo;
  const [status, setStatus] = useState(initialStatus);

  const toggleUserStatus = async () => {
    try {
      await usersApi.toggleStatus(id);
      const newStatus = status === "active" ? "inactive" : "active";
      setStatus(newStatus);
      showToast(t(`users.statusUpdatedTo_${newStatus}`) || `User status updated to ${newStatus}`, "success");
    } catch (error) {
      console.error("Error:", error);
      showToast("Error updating status", "error");
    }
  };

  const resendConfirmation = async () => {
    try {
      await usersApi.resendConfirmation(id);
      showToast(t('users.confirmationSent') || 'Confirmation email sent successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      showToast(`${t('users.failureConfirmation') || 'Failed to send confirmation email'}: ${error.message}`, 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('users.confirmDelete', { name: full_name }))) return;

    try {
      await usersApi.delete(id);
      showToast(t('users.deleteSuccess'), 'success');
      if (onDelete) onDelete(id);
    } catch (error) {
      console.error('Error:', error);
      // Handle generic or specific errors (apiClient typically throws with message)
      if (error.status === 409 || error.message?.includes("cannot delete user with active contracts")) {
        showToast(t('users.deleteActiveContractsError'), 'error');
      } else {
        showToast(error.message || t('users.deleteError'), 'error');
      }
    }
  };

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "-";

  const creatorLabel = creator?.full_name || "—";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
    },
    hover: {
      y: -5,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };

  const roleColors = {
    admin: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    seller: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    user: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
  };

  return (
    <motion.div
      id={index === 0 ? "first-user-card" : undefined}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={() => onClick(userInfo)}
      className="group relative bg-white/70 dark:bg-darkblack-600/70 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl ${getAvatarColor(full_name)} flex items-center justify-center shadow-lg ring-2 ring-white/50 dark:ring-white/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
                {userInfo.profile_picture_thumb ? (
                  <img
                    src={getFullImageUrl(userInfo.profile_picture_thumb)}
                    alt={full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    loading="lazy"
                  />
                ) : (
                  <span className="text-white font-bold text-xl tracking-tight">
                    {getInitials(full_name)}
                  </span>
                )}
              </div>
              <motion.div
                animate={{ scale: status === "active" ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-darkblack-600 ${status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-400"
                  }`}
              />
            </div>
            <div>
              <h4 className="font-bold text-lg text-bgray-900 dark:text-white mb-0.5 line-clamp-1">
                {full_name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-bgray-500 dark:text-bgray-400 font-medium tracking-wider">
                  #{id}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${roleColors[role] || roleColors.user}`}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          {showStatusToggle && (
            <div className="flex items-center gap-2">
              <button
                id={index === 0 ? "user-status-toggle" : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUserStatus();
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-hidden ${status === "active" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                  }`}
              >
                <motion.span
                  animate={{ x: status === "active" ? 18 : 2 }}
                  className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all shadow-xs"
                />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-bgray-600 dark:text-bgray-400">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-darkblack-500 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors duration-300">
              <svg className="w-4 h-4 text-bgray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm truncate font-medium">{email}</span>
          </div>

          {phone && (
            <div className="flex items-center gap-3 text-bgray-600 dark:text-bgray-400">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-darkblack-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors duration-300">
                <svg className="w-4 h-4 text-bgray-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-sm truncate font-medium">{phone}</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-bgray-500 dark:text-bgray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-bgray-500 dark:text-bgray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium truncate max-w-[80px]">{creatorLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showEditButton && (
            <Link
              to={`/settings/user/${id}`}
              id={index === 0 ? "user-edit-btn" : undefined}
              onClick={(e) => e.stopPropagation()}
              title={t('common.edit')}
              className="inline-flex items-center justify-center w-10 h-10 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
          )}
          <button
            id={index === 0 ? "user-invite-btn" : undefined}
            onClick={(e) => {
              e.stopPropagation();
              resendConfirmation();
            }}
            title={t('users.invite')}
            className="inline-flex items-center justify-center w-10 h-10 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all duration-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </button>
          {showDeleteButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              title={t('users.delete')}
              className="inline-flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Selection Overlay */}
      <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/10 rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </motion.div>
  );
}

UserData.propTypes = {
  userInfo: PropTypes.object.isRequired,
  index: PropTypes.number,

  onClick: PropTypes.func,
  showStatusToggle: PropTypes.bool,
  showEditButton: PropTypes.bool,
  showDeleteButton: PropTypes.bool,
  onDelete: PropTypes.func,
};

export default UserData;
