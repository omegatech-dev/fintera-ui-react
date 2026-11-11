import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";
import { auditsApi } from "../../audits/api";
import { formatAuditEvent } from "../../audits/modelLabels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faInfo, faBan, faUser, faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

export const formatTimeAgo = (dateString, now, t) => {
    const date = new Date(dateString);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t("common.justNow") || "Just now";
    if (minutes < 60) return t("common.timeAgo.minutes", { count: minutes });
    if (hours < 24) return t("common.timeAgo.hours", { count: hours });
    return t("common.timeAgo.days", { count: days });
};

export const resolveActivityUser = (activity, t) => {
    const nested = activity?.user && typeof activity.user === "object" ? activity.user : null;

    const name = activity?.user_full_name || activity?.user_name || nested?.full_name || nested?.name;
    if (name) return name;

    const email = activity?.user_email || nested?.email;
    if (email) return email;

    const rawId = activity?.user_id ?? nested?.id;
    if (rawId !== undefined && rawId !== null && String(rawId).trim() !== "") {
        return t("dashboard.activityUserNumber", { id: rawId });
    }

    return t("audits.system");
};

function RecentActivity() {
    const { t } = useLocale();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await auditsApi.list({ page: 1, limit: 5 });

                // The backend returns { audits: [...] } or { data: [...] } ?
                // Based on Audits page: const newItems = data.audits || [];
                const logs = data.audits || data.data || data || [];

                setActivities(logs.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch recent activity", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const getActionIcon = (action) => {
        const lowerAction = action?.toLowerCase() || "";
        let icon = faInfo;
        let colorClass = "bg-gray-100 dark:bg-darkblack-500 text-gray-600 dark:text-gray-400";

        if (lowerAction.includes("create")) {
            icon = faPlus;
            colorClass = "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400";
        } else if (lowerAction.includes("update") || lowerAction.includes("edit")) {
            icon = faPen;
            colorClass = "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
        } else if (lowerAction.includes("delete") || lowerAction.includes("destroy")) {
            icon = faTrash;
            colorClass = "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400";
        } else if (lowerAction.includes("approve")) {
            icon = faFingerprint;
            colorClass = "bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400";
        } else if (lowerAction.includes("reject") || lowerAction.includes("cancel")) {
            icon = faBan;
            colorClass = "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400";
        } else if (lowerAction.includes("login")) {
            icon = faUser;
            colorClass = "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400";
        }

        return (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                <FontAwesomeIcon icon={icon} className="text-xs" />
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-darkblack-600 rounded-2xl shadow-xs border border-gray-100 dark:border-darkblack-500 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-darkblack-500 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-darkblack-600 dark:to-darkblack-600">
                <div>
                    <h3 className="text-xl font-bold text-bgray-900 dark:text-white">
                        {t("dashboard.recentActivity") || "Recent Activity"}
                    </h3>
                    <p className="text-sm text-bgray-500 dark:text-bgray-400 mt-1">
                        {t("dashboard.recentActivityDesc") || "Latest system events and updates"}
                    </p>
                </div>
                <Link
                    to="/audits"
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                    {t("common.viewAll") || "View All"} &rarr;
                </Link>
            </div>

            <div className="grow overflow-auto p-0 custom-scrollbar">
                {loading ? (
                    <div className="space-y-4 p-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex items-start space-x-4">
                                <div className="rounded-lg bg-gray-200 dark:bg-darkblack-500 h-10 w-10"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-200 dark:bg-darkblack-500 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-darkblack-500 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-bgray-500 dark:text-bgray-400">
                        <div className="bg-gray-100 dark:bg-darkblack-500 p-4 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p>{t("dashboard.noActivity") || "No recent activity found"}</p>
                    </div>
                ) : (
                    <div className="relative pl-4">
                        {/* Vertical Line */}
                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100 dark:bg-darkblack-500 z-0"></div>

                        <div className="space-y-6 relative z-10 py-2">
                            {(() => {
                                const now = new Date();
                                return activities.map((activity, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={activity.id || index}
                                        className="group flex items-start space-x-4"
                                    >
                                        <div className="shrink-0 bg-white dark:bg-darkblack-600 py-1">
                                            {getActionIcon(activity.action)}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1.5 pr-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <p
                                                    className="text-sm font-bold text-gray-800 dark:text-white truncate"
                                                    title={resolveActivityUser(activity, t)}
                                                >
                                                    {resolveActivityUser(activity, t)}
                                                </p>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                                                    {formatTimeAgo(activity.created_at, now, t)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {formatAuditEvent(activity.action, t)}
                                                </span>
                                                <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                                                {activity.details || activity.entity_type}
                                            </p>
                                        </div>
                                    </motion.div>
                                ));
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

export default RecentActivity;
