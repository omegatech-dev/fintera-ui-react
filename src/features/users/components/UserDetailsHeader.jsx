import { motion } from "framer-motion";
import { getInitials, getAvatarColor, getFullImageUrl } from "@/shared/utils/avatarUtils";
import { useLocale } from "@/contexts/LocaleContext";

function UserDetailsHeader({ user, toggleStatus, onEdit, showActions = true, showToggleStatus = false }) {
    const { t } = useLocale();
    // Safe-check if user is undefined
    const { full_name, role, status, id, email, profile_picture_thumb, profile_picture } = user || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full bg-white dark:bg-darkblack-600 rounded-2xl p-6 md:p-8 mb-8 shadow-xs overflow-hidden"
        >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* User Profile Section */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl ${!profile_picture && !profile_picture_thumb ? getAvatarColor(full_name) : ''} flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-white/5 overflow-hidden bg-white dark:bg-darkblack-500`}>
                            {profile_picture || profile_picture_thumb ? (
                                <img
                                    src={getFullImageUrl(profile_picture || profile_picture_thumb)}
                                    alt={full_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                />
                            ) : null}
                            <span className="text-white font-bold text-3xl md:text-4xl tracking-tight" style={{ display: profile_picture || profile_picture_thumb ? 'none' : 'block' }}>
                                {getInitials(full_name)}
                            </span>
                        </div>
                        {/* Status Dot */}
                        <motion.div
                            animate={{ scale: status === "active" ? [1, 1.2, 1] : 1 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white dark:border-darkblack-600 ${status === "active" ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-gray-400"
                                }`}
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-bgray-900 dark:text-white">
                                {full_name || t("personalInfo.unknownUser")}
                            </h1>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${role === 'admin' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                role === 'seller' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                }`}>
                                {role ? t(`users.${role}`) : t("users.user")}
                            </span>
                        </div>
                        <p className="text-bgray-500 dark:text-bgray-400 font-medium mb-3">
                            {email || "—"}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono bg-bgray-100 dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-400 px-2 py-1 rounded">
                                ID: {id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                {showActions && (
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        {showToggleStatus && (
                            <button
                                onClick={toggleStatus}
                                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${status === "active"
                                    ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
                                    }`}
                            >
                                {status === "active" ? t("personalInfo.deactivateUser") : t("personalInfo.activateUser")}
                            </button>
                        )}

                        <button
                            onClick={onEdit}
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 font-semibold group">
                            <span>{t("personalInfo.editProfile")}</span>
                            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default UserDetailsHeader;
