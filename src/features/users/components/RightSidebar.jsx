import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AuthContext from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useLocale } from "@/contexts/LocaleContext";
import { usersApi } from "@/features/users/api";
import { reportsApi } from "@/shared/api/reports";
import { getInitials, getAvatarColor, getFullImageUrl } from "@/shared/utils/avatarUtils";

// Helper to determine descriptor and color for FICO credit score (300–850)
const FICO_MIN = 300;
const FICO_MAX = 850;
const creditScoreInfo = (score, t) => {
  const s = Number(score);
  if (Number.isNaN(s) || score === null || score === undefined) return { scoreLabel: "N/A", descriptor: t ? t('creditScore.unknownDesc') : "Unknown", color: "gray" };
  const fico = Math.max(FICO_MIN, Math.min(FICO_MAX, Math.round(s)));
  if (fico >= 750) return { scoreLabel: String(fico), descriptor: t ? t('creditScore.excellentDesc') : "Excellent", color: "green" };
  if (fico >= 670) return { scoreLabel: String(fico), descriptor: t ? t('creditScore.goodDesc') : "Good", color: "emerald" };
  if (fico >= 580) return { scoreLabel: String(fico), descriptor: t ? t('creditScore.fairDesc') : "Fair", color: "yellow" };
  return { scoreLabel: String(fico), descriptor: t ? t('creditScore.poorDesc') : "Poor", color: "red" };
};

function RightSidebar({ user, onClose }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const { user: loggedUser } = useContext(AuthContext);

  const creditInfo = creditScoreInfo(user?.credit_score, t);
  const contactTextColor = {
    green: "text-emerald-600 dark:text-emerald-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    yellow: "text-amber-600 dark:text-amber-400",
    red: "text-rose-600 dark:text-rose-400",
    gray: "text-bgray-600 dark:text-bgray-400",
  }[creditInfo.color] || "text-bgray-700";

  useEffect(() => {
    if (!user) return;
    const userId = user?.id;
    if (!userId || user?.role === "admin" || user?.role === "seller") return;

    const fetchSummary = async () => {
      try {
        const data = await usersApi.getSummary(userId);
        setSummary(data);
      } catch (error) {
        console.error(error);
        setSummaryError("Error loading balance");
      }
    };

    fetchSummary();
  }, [user, user?.id, user?.role]);

  if (!user) return null;

  const downloadUserBalancePDF = async () => {
    if (!user?.id) return;
    try {
      const blob = await reportsApi.downloadUserBalancePDF(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user_balance_${user.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showToast("Failed to download PDF", "error");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.aside
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full 2xl:h-auto 2xl:w-[400px] w-full bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-xl border-l border-white/20 dark:border-white/10 shadow-2xl overflow-y-auto custom-scrollbar"
    >
      {/* Header with Background Pattern */}
      <div className="relative pt-12 pb-8 px-8 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/50 dark:bg-darkblack-500/50 text-bgray-500 dark:text-bgray-400 hover:text-bgray-900 dark:hover:text-white transition-all backdrop-blur-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className={`w-32 h-32 rounded-[2rem] ${(!user.profile_picture && !user.profile_picture_thumb) ? getAvatarColor(user.full_name) : ''} flex items-center justify-center shadow-2xl ring-4 ring-white/50 dark:ring-white/10 mb-6 overflow-hidden bg-white dark:bg-darkblack-500`}
          >
            {(user.profile_picture || user.profile_picture_thumb) ? (
              <img
                src={getFullImageUrl(user.profile_picture || user.profile_picture_thumb)}
                alt={user.full_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
              />
            ) : null}
            <span className="text-white font-bold text-5xl tracking-tighter" style={{ display: (user.profile_picture || user.profile_picture_thumb) ? 'none' : 'block' }}>
              {getInitials(user.full_name)}
            </span>
          </motion.div>

          <h3 className="text-2xl font-extrabold text-bgray-900 dark:text-white tracking-tight mb-2">
            {user.full_name}
          </h3>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20`}>
              {user?.role}
            </span>
            <span className="text-bgray-400 dark:text-bgray-500 text-xs font-bold tracking-widest">
              #{user.id}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-12 space-y-8">
        {/* Contact Info Group */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-bgray-400 dark:text-bgray-500 ml-1">
            {t('contracts.contactInformation')}
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {/* Info Items */}
            {[
              { icon: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: t('personalInfo.email'), value: user.email, color: "indigo" },
              { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", label: t('personalInfo.phone'), value: user.phone || "-", color: "emerald" },
              { icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2", label: t('personalInfo.identity'), value: user.identity || "-", color: "amber" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-bgray-50/50 dark:bg-darkblack-500/50 border border-transparent hover:border-indigo-500/10 dark:hover:border-indigo-500/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <svg className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-bgray-400 dark:text-bgray-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-bold text-bgray-900 dark:text-white truncate">{item.value}</p>
                </div>
              </div>
            ))}

            {/* Credit Score Item - Only visible for Admin viewing a regular user profile */}
            {loggedUser?.role === "admin" && user?.role === "user" && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-bgray-50/50 dark:bg-darkblack-500/50 border border-transparent transition-all">
                <div className={`w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0`}>
                  <svg className={`w-5 h-5 ${contactTextColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-bgray-400 dark:text-bgray-500 uppercase tracking-wider">{t('users.creditScore') || 'Credit Score'}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-extrabold ${contactTextColor}`}>{creditInfo.scoreLabel}</span>
                    <span className="text-[10px] font-bold text-bgray-400 dark:text-bgray-500 uppercase">{creditInfo.descriptor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Financial Section */}
        {user?.role === "user" && (
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-bgray-400 dark:text-bgray-500 ml-1">
              {t('contracts.balance')}
            </h4>
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <Link
                    to={`/financing/user/${user.id}`}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md"
                  >
                    {t('common.viewMore') || 'View More'}
                  </Link>
                </div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t('contracts.totalBalance') || 'Total Balance'}</p>
                <h3 className="text-2xl font-black text-white">
                  {summary ? `${(Number(summary.balance) || 0).toLocaleString()} ${summary.currency}` : summaryError || '...'}
                </h3>
              </div>
            </div>
          </motion.div>
        )}

        {/* Documents */}
        {user?.role === "user" && (
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-bgray-400 dark:text-bgray-500 ml-1">
              {t('contracts.documents')}
            </h4>
            <button
              onClick={downloadUserBalancePDF}
              className="w-full p-4 rounded-2xl bg-white dark:bg-darkblack-500 border border-bgray-100 dark:border-transparent hover:border-indigo-500 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-bgray-900 dark:text-white truncate max-w-[150px]">Balance_{user.id}.pdf</p>
                  <p className="text-[10px] font-bold text-bgray-400 dark:text-bgray-500 uppercase">{t('contracts.accountStatement')}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
            </button>
          </motion.div>
        )}

        {/* Note if exists */}
        {user?.note && (
          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">{t('contracts.note')}</p>
                <p className="text-xs text-amber-800 dark:text-amber-200/70 font-medium leading-relaxed">{user.note}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}

export default RightSidebar;
