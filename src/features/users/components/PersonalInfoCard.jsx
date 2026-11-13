import { motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

const InfoItem = ({ label, value, icon, copyable }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface-2 transition-colors group cursor-default">
        <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center shrink-0 text-brand-strong">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="mb-1 text-label font-medium text-ink-3">{label}</p>
            <p className="flex items-center gap-2 truncate text-body font-semibold text-ink">
                {value || "—"}
                {copyable && value && (
                    <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-2 rounded"
                        onClick={() => {
                            navigator.clipboard.writeText(value);
                            // Could add toast here
                        }}
                        title="Copy"
                    >
                        <svg className="w-3.5 h-3.5 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                )}
            </p>
        </div>
    </div>
);

function PersonalInfoCard({ user, delay = 0 }) {
    const { t } = useLocale();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className="h-full rounded-card border border-line bg-surface p-5 md:p-6"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[15px] font-bold text-ink">
                    {t('personalInfo.generalInfo') || "General Information"}
                </h3>
            </div>

            <div className="space-y-2">
                <InfoItem
                    label={t('personalInfo.phoneOptional') || "Phone Number"}
                    value={user?.phone}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    }
                    copyable
                />
                <InfoItem
                    label={t('personalInfo.email') || "Email Address"}
                    value={user?.email}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                    copyable
                />
                <InfoItem
                    label={t('personalInfo.identity') || "Identity Document"}
                    value={user?.identity}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883 3.918 1.6 6 1.6s6-.717 6-1.6M3 9c0 .883 3.918 1.6 6 1.6s6-.717 6-1.6" />
                        </svg>
                    }
                    copyable
                />
                <InfoItem
                    label={t('personalInfo.rtn') || "RTN"}
                    value={user?.rtn}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    copyable
                />
                <InfoItem
                    label={t('personalInfo.addressOptional') || "Address"}
                    value={user?.address}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 012.827 0l4.244 4.243a8 8 0 11-11.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                />
            </div>
        </motion.div>
    );
}

export default PersonalInfoCard;
