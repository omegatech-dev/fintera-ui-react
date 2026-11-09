import { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "../../../contexts/LocaleContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faPen,
    faTrash,
    faInfo,
    faUser,
    faFingerprint,
    faLaptopCode,
    faChevronDown
} from "@fortawesome/free-solid-svg-icons";

const formatEvent = (event, t) => {
    if (!event) return event;
    const lower = event.toLowerCase();
    switch (lower) {
        case "create":
        case "created":
            return { text: t("audits.events.create"), icon: faPlus, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" };
        case "update":
        case "updated":
            return { text: t("audits.events.update"), icon: faPen, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" };
        case "destroy":
        case "delete":
        case "deleted":
            return { text: t("audits.events.destroy"), icon: faTrash, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
        case "approve":
            return { text: t("audits.events.approve"), icon: faFingerprint, color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" };
        case "reject":
            return { text: t("audits.events.reject"), icon: faTrash, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" };
        case "cancel":
        case "cancelled":
        case "canceled":
            return { text: t("audits.events.cancel"), icon: faTrash, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" };
        case "close":
        case "closed":
            return { text: t("audits.events.close"), icon: faInfo, color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" };
        case "login":
            return { text: t("audits.events.login"), icon: faUser, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" };
        case "capital_repayment":
            return { text: t("audits.events.capital_repayment"), icon: faPlus, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" };
        default:
            return {
                text: t("audits.events." + lower) || (event.charAt(0).toUpperCase() + event.slice(1)),
                icon: faInfo,
                color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            };
    }
};

const renderValue = (v) => {
    if (v === null || v === undefined) return <span className="text-gray-400 italic">Empty</span>;
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
        return <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 dark:bg-black/20 p-1 rounded">{JSON.stringify(v, null, 2)}</pre>;
    } catch {
        return String(v);
    }
};

function AuditTimelineItem({ audit, isLast }) {
    const { t, locale } = useLocale();
    const [expanded, setExpanded] = useState(false);

    const {
        action: event,
        entity: model,
        entity_id: itemId,
        user: userObj,
        details: changes,
        created_at: dateStr,
        ip_address: ipAddress,
        user_agent: userAgent,
        parsed_changes: parsed
    } = audit;

    const dateStrUtc = dateStr?.includes('Z') || dateStr?.includes('+') || dateStr?.includes('-')
        ? dateStr
        : `${dateStr}Z`;
    const date = new Date(dateStrUtc);

    // Format time using the application's locale
    const localeCode = t('common.locale_code') || (locale === 'es' ? 'es-ES' : 'en-US');
    const timeString = date.toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const eventInfo = formatEvent(event, t);
    const userName = userObj ? (userObj.full_name || userObj.email || "System") : "System";

    const changedKeys = parsed ? Object.keys(parsed) : [];

    return (
        <div className="relative pl-8 sm:pl-12 py-2 group">
            {/* Timeline Line */}
            {!isLast && (
                <div
                    className="absolute left-[15px] sm:left-[23px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-white/10 group-last:hidden"
                />
            )}

            {/* Timeline Icon */}
            <div className={`absolute left-0 sm:left-2 top-3 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-darkblack-700 shadow-xs z-10 ${eventInfo.color}`}>
                <FontAwesomeIcon icon={eventInfo.icon} className="text-xs" />
            </div>

            {/* Content Card */}
            <motion.div
                layout
                className={`relative bg-white dark:bg-darkblack-600 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-xs hover:shadow-md transition-shadow duration-300 ${expanded ? 'ring-2 ring-blue-500/20 dark:ring-blue-500/10' : ''}`}
            >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-3">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <h4 className="text-gray-900 dark:text-white font-bold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                                <span>{eventInfo.text}</span>
                                <span className="text-gray-400 dark:text-gray-500 font-normal">in</span>
                                <span className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-lg text-xs font-semibold">{t("audits.models." + model) || model}</span>
                                <span className="text-gray-400 dark:text-gray-500 text-xs">#{itemId}</span>
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="text-xs opacity-70" />
                                {userName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-gray-400 shrink-0">
                        <span>{timeString}</span>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${expanded ? 'bg-blue-50 text-blue-500' : ''}`}
                        >
                            <FontAwesomeIcon icon={faChevronDown} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Change Preview */}
                {!expanded && changedKeys.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-black/20 rounded-lg px-3 py-2 border border-gray-100 dark:border-white/5">
                        <span className="text-gray-400 mr-2">Changed:</span>
                        {changedKeys.slice(0, 3).join(", ")}
                        {changedKeys.length > 3 && <span className="ml-1 opacity-60">+{changedKeys.length - 3} more</span>}
                    </div>
                )}

                {/* Details Section */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                                {/* Technical Details */}
                                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1.5" title="IP Address">
                                        <FontAwesomeIcon icon={faLaptopCode} />
                                        {ipAddress || "N/A"}
                                    </div>
                                    <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={userAgent}>
                                        <FontAwesomeIcon icon={faInfo} />
                                        {userAgent || "N/A"}
                                    </div>
                                </div>

                                {/* Changes Content */}
                                <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                    {parsed ? (
                                        <ul className="space-y-3 text-sm">
                                            {changedKeys.map((key) => (
                                                <li key={key} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300 break-words">{key}</span>
                                                    <div className="text-gray-600 dark:text-gray-400 break-words">
                                                        {renderValue(parsed[key])}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">{changes || "No details provided"}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

AuditTimelineItem.propTypes = {
    audit: PropTypes.object.isRequired,
    isLast: PropTypes.bool,
};

export default AuditTimelineItem;
