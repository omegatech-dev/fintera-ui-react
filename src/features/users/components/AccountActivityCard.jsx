import { motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

const ActivityItem = ({ label, value, color, icon }) => (
    <div className="flex items-center justify-between p-4 bg-bgray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-white/10 transition-colors">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <span className="text-sm font-medium text-bgray-600 dark:text-bgray-300">
                {label}
            </span>
        </div>
        <span className="text-sm font-bold text-bgray-900 dark:text-white">
            {value}
        </span>
    </div>
);

function AccountActivityCard({ user, delay = 0.1, showCreditScore = true }) {
    const { t } = useLocale();

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className="bg-white dark:bg-darkblack-600 rounded-2xl p-6 md:p-8 shadow-xs h-full"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-bgray-900 dark:text-white">
                    {t("personalInfo.accountActivity")}
                </h3>
            </div>

            <div className="space-y-4">
                {/* Credit Score Display - Conditionally visible */}
                {showCreditScore && (() => {
                    const FICO_MIN = 300, FICO_MAX = 850;
                    const score = Math.round(Math.max(FICO_MIN, Math.min(FICO_MAX, user?.credit_score ?? 0)));
                    const progressPercent = ((score - FICO_MIN) / (FICO_MAX - FICO_MIN)) * 100;
                    return (
                        <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <p className="text-indigo-100 text-sm font-medium mb-1">{t("personalInfo.creditScore")}</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold">{score}</span>
                                <span className="text-indigo-100 text-sm mb-1.5 font-medium">/ {FICO_MAX}</span>
                            </div>

                            {/* FICO progress bar (300–850) */}
                            <div className="mt-4 h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                                    transition={{ duration: 1, delay: delay + 0.2 }}
                                    className="h-full bg-white/90 rounded-full"
                                />
                            </div>
                        </div>
                    );
                })()}

                <ActivityItem
                    label={t("personalInfo.memberSince")}
                    value={formatDate(user?.created_at)}
                    color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                />

                <ActivityItem
                    label={t("personalInfo.lastConfirmed")}
                    value={formatDate(user?.confirmed_at)}
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <ActivityItem
                    label={t("personalInfo.preferredLanguage")}
                    value={user?.locale === 'es' ? t("personalInfo.spanish") : t("personalInfo.english")}
                    color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                    }
                />
            </div>
        </motion.div>
    );
}

export default AccountActivityCard;
