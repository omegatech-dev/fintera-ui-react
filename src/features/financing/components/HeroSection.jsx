import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';

function HeroSection({ balance, currency, userName }) {
    const { t } = useLocale();



    return (
        <div id="financing-hero" className="relative w-full overflow-hidden rounded-[2rem] bg-bgray-50 dark:bg-[#080B14] p-6 sm:p-10 transition-all duration-700 border border-bgray-100 dark:border-white/10 group shadow-lg dark:shadow-success-500/5">
            {/* Premium Dark Mode Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-success-500/[0.03] via-transparent to-indigo-500/[0.03] opacity-0 dark:opacity-100 transition-opacity duration-1000"></div>

            {/* Top Shine Effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-success-400/20 to-transparent opacity-0 dark:opacity-100"></div>

            {/* Refined Dynamic Background Blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-success-500/20 dark:bg-success-500/10 blur-[130px] rounded-full animate-pulse transition-all duration-1000 group-hover:scale-110"></div>
            <div className="absolute bottom-[-30%] left-[-15%] w-[70%] h-[130%] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[130px] rounded-full animate-pulse delay-700 transition-all duration-1000 group-hover:scale-105"></div>
            <div className="absolute top-[10%] left-[10%] w-[40%] h-[60%] bg-rose-500/10 dark:bg-rose-500/5 blur-[110px] rounded-full transition-all duration-1000"></div>

            {/* Subtle Grid Pattern for Dark Mode */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="text-center lg:text-left space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xs">
                        <span className="flex h-2 w-2 rounded-full bg-success-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        <span className="text-[10px] font-black text-bgray-900 dark:text-success-400 uppercase tracking-[0.2em]">
                            {t('payments.welcomeMessage', { name: userName?.split(' ')[0] || t('dashboard.user') })}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-bgray-900 dark:text-white leading-tight drop-shadow-xs">
                            {t('payments.balanceDashboard')}
                        </h1>
                        <p className="text-bgray-500 dark:text-slate-400 text-sm sm:text-base max-w-md font-medium leading-relaxed">
                            {t('payments.managePayments')}
                        </p>
                    </div>
                </div>

                {/* Glassmorphic Balance Card */}
                <div className="relative group/card">
                    <div className="absolute inset-0 bg-success-500/10 dark:bg-success-500/20 blur-3xl rounded-[2rem] opacity-0 group-hover/card:opacity-100 transition-all duration-700"></div>

                    <div className="relative bg-white/40 dark:bg-bgray-900/40 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/20 min-w-[300px] transform transition-all duration-500 hover:scale-[1.02] active:scale-95">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[9px] text-bgray-500 dark:text-success-400 uppercase tracking-[0.3em] font-black">
                                {t('payments.balance')}
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-success-500/10 dark:bg-success-400/20 flex items-center justify-center border border-success-500/20 shadow-inner">
                                <svg className="w-5 h-5 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="text-3xl sm:text-4xl font-black tracking-tighter text-bgray-900 dark:text-white mb-6 transition-colors">
                            <span className="opacity-30 mr-1 text-xl sm:text-2xl align-top">{currency}</span>
                            {Number(balance || 0).toLocaleString()}
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bgray-900 dark:bg-white/10 text-white dark:text-white shadow-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                {t('payments.statusOptions.approved')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;
