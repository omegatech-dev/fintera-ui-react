import PropTypes from "prop-types";
import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faClock,
    faFileContract,
    faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const StatCard = ({ title, value, icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white dark:bg-darkblack-600 rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-darkblack-500 flex items-center space-x-4"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} text-white text-xl`}>
            <FontAwesomeIcon icon={icon} />
        </div>
        <div>
            <p className="text-bgray-500 dark:text-bgray-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-bgray-900 dark:text-white leading-none mt-1">{value}</h3>
        </div>
    </motion.div>
);

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.any.isRequired,
    color: PropTypes.string.isRequired,
    delay: PropTypes.number.isRequired,
};

const ContractStats = memo(function ContractStats({ stats }) {
    const { t } = useLocale();

    const cards = [
        {
            title: t("contracts.allStatuses"),
            value: stats.total || 0,
            icon: faFileContract,
            color: "bg-blue-500",
        },
        {
            title: t("contracts.status.pending"),
            value: stats.pending || 0,
            icon: faClock,
            color: "bg-yellow-500",
        },
        {
            title: t("contracts.status.approved"),
            value: stats.approved || 0,
            icon: faCheckCircle,
            color: "bg-green-500",
        },
        {
            title: t("contracts.status.rejected"),
            value: stats.rejected || 0,
            icon: faTimesCircle,
            color: "bg-red-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
                <StatCard
                    key={card.title}
                    {...card}
                    delay={index * 0.1}
                />
            ))}
        </div>
    );
});

ContractStats.propTypes = {
    stats: PropTypes.shape({
        total: PropTypes.number,
        pending: PropTypes.number,
        approved: PropTypes.number,
        rejected: PropTypes.number,
    }).isRequired,
};

export default ContractStats;
