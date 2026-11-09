import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useLocale } from "../../../contexts/LocaleContext";
import AuditTimelineItem from "./AuditTimelineItem";
import { format, isToday, isYesterday } from "date-fns";
import { es, enUS } from "date-fns/locale";

function AuditTimeline({ items }) {
    const { locale } = useLocale();
    const dateLocale = locale === "es" ? es : enUS;

    // Group items by date (YYYY-MM-DD)
    const groupedItems = useMemo(() => {
        const groups = {};
        items.forEach((item) => {
            // Ensure date is treated as UTC if it doesn't have a timezone suffix
            const dateStr = item.created_at?.includes('Z') || item.created_at?.includes('+') || item.created_at?.includes('-')
                ? item.created_at
                : `${item.created_at}Z`;
            const date = new Date(dateStr);
            const dateKey = format(date, "yyyy-MM-dd");
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        // Sort groups by date descending
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [items]);

    const formatDateHeader = (dateStr) => {
        const date = new Date(dateStr);
        if (isToday(date)) return locale === 'es' ? 'Hoy' : 'Today';
        if (isYesterday(date)) return locale === 'es' ? 'Ayer' : 'Yesterday';
        return format(date, "EEEE, d MMMM yyyy", { locale: dateLocale });
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (items.length === 0) {
        return null; // Handle empty state in parent
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 relative"
        >
            {groupedItems.map(([dateKey, groupItems]) => (
                <motion.div key={dateKey} variants={itemAnim} className="relative">
                    {/* Date Header sticky */}
                    <div className="sticky top-[80px] z-20 mb-6 pl-2">
                        <span className="inline-block bg-white/90 dark:bg-darkblack-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 shadow-xs">
                            {formatDateHeader(dateKey)}
                        </span>
                    </div>

                    {/* Timeline Group */}
                    <div className="relative">
                        {groupItems.map((item, index) => (
                            <AuditTimelineItem
                                key={item.id || index}
                                audit={item}
                                isLast={index === groupItems.length - 1}
                            />
                        ))}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}

AuditTimeline.propTypes = {
    items: PropTypes.array.isRequired,
};

export default AuditTimeline;
