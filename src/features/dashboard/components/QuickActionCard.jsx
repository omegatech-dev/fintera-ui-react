import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function QuickActionCard({ title, description, icon, to, color = "blue", onClick }) {
    const CardContent = (
        <div className={`
      relative overflow-hidden group p-6 rounded-2xl h-full
      bg-white dark:bg-darkblack-600 
      border border-transparent hover:border-${color}-200 dark:hover:border-${color}-800/50
      shadow-xs hover:shadow-xl hover:shadow-${color}-500/10
      transition-all duration-300
    `}>
            {/* Background Gradient Effect */}
            <div className={`
        absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-all duration-500
        group-hover:scale-150 bg-${color}-500
      `} />

            <div className="relative z-10 flex flex-col h-full">
                {/* Icon Container */}
                <div className={`
          w-12 h-12 mb-4 rounded-xl flex items-center justify-center
          bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400
          group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300
        `}>
                    {icon}
                </div>

                {/* Text Content */}
                <h3 className="text-lg font-bold text-bgray-900 dark:text-white mb-2 group-hover:text-${color}-600 dark:group-hover:text-${color}-400 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-bgray-500 dark:text-bgray-400 leading-relaxed mb-4 grow">
                    {description}
                </p>

                {/* Action Arrow */}
                <div className={`
          flex items-center text-sm font-semibold text-${color}-600 dark:text-${color}-400
          group-hover:translate-x-2 transition-transform duration-300
        `}>
                    <span>Access</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </div>
    );

    if (onClick) {
        return (
            <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
                className="w-full text-left focus:outline-hidden"
            >
                {CardContent}
            </motion.button>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
        >
            <Link to={to} className="block h-full focus:outline-hidden">
                {CardContent}
            </Link>
        </motion.div>
    );
}

export default QuickActionCard;
