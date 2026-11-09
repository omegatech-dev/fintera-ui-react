import PropTypes from 'prop-types';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReceipt,
  faArrowDown,
  faArrowUp,
  faMoneyBillWave,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useLocale } from '../../../contexts/LocaleContext';
import { formatStatus } from '../../../shared/utils/formatStatus';

const LedgerEntriesTab = memo(function LedgerEntriesTab({ ledgerLoading, ledgerEntries }) {
  const { t } = useLocale();

  // Calculate totals
  const totals = (Array.isArray(ledgerEntries) ? ledgerEntries : []).reduce(
    (acc, entry) => {
      const amount = Number(entry.amount || 0);
      if (amount < 0) acc.charges += Math.abs(amount); // Debt/Charges are negative
      if (amount > 0) acc.payments += amount;          // Payments are positive
      acc.balance += amount;
      return acc;
    },
    { charges: 0, payments: 0, balance: 0 }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (ledgerLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
        <div className="text-bgray-500 dark:text-bgray-400 font-medium">Cargando movimientos...</div>
      </div>
    );
  }

  if (!Array.isArray(ledgerEntries) || ledgerEntries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 bg-bgray-100 dark:bg-darkblack-500 rounded-full flex items-center justify-center mb-4">
          <FontAwesomeIcon icon={faReceipt} className="text-2xl text-bgray-400" />
        </div>
        <h3 className="text-lg font-semibold text-bgray-900 dark:text-white mb-2">Sin movimientos registados</h3>
        <p className="text-bgray-500 dark:text-bgray-400 max-w-sm">
          No hay asientos contables asociados a este contrato todavía.
        </p>
      </motion.div>
    );
  }

  // Compute cumulative balances
  const cumulativeBalances = ledgerEntries.reduce((acc, entry, idx) => {
    const amount = Number(entry.amount || 0);
    const previous = idx === 0 ? 0 : acc[idx - 1];
    acc.push(previous + amount);
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-darkblack-600 rounded-xl p-4 border border-bgray-200 dark:border-darkblack-400 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-bgray-500 dark:text-bgray-400">Total Cargos</span>
            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowUp} className="text-red-500 text-sm" />
            </div>
          </div>
          <div className="text-xl font-bold text-bgray-900 dark:text-white">
            {totals.charges.toLocaleString('es-HN', { style: 'currency', currency: 'HNL' })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-darkblack-600 rounded-xl p-4 border border-bgray-200 dark:border-darkblack-400 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-bgray-500 dark:text-bgray-400">Total Abonos</span>
            <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowDown} className="text-green-500 text-sm" />
            </div>
          </div>
          <div className="text-xl font-bold text-bgray-900 dark:text-white">
            {totals.payments.toLocaleString('es-HN', { style: 'currency', currency: 'HNL' })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-darkblack-600 rounded-xl p-4 border border-bgray-200 dark:border-darkblack-400 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-bgray-500 dark:text-bgray-400">Saldo Actual</span>
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-indigo-500 text-sm" />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {totals.balance.toLocaleString('es-HN', { style: 'currency', currency: 'HNL' })}
          </div>
        </motion.div>
      </div>

      {/* Ledger Feed */}
      <div className="bg-white dark:bg-darkblack-600 rounded-xl border border-bgray-200 dark:border-darkblack-400 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-bgray-200 dark:border-darkblack-400 bg-bgray-50 dark:bg-darkblack-500 flex items-center justify-between">
          <h3 className="font-bold text-bgray-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faReceipt} className="text-bgray-500" />
            Movimientos Detallados
          </h3>
          <span className="text-xs font-medium text-bgray-500 bg-bgray-200 dark:bg-darkblack-400 px-2 py-1 rounded-md">
            {ledgerEntries.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bgray-50/50 dark:bg-darkblack-500/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-bgray-500 uppercase tracking-wider">Fecha / Ref</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-bgray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bgray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bgray-500 uppercase tracking-wider">Saldo</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-bgray-100 dark:divide-darkblack-400"
            >
              {ledgerEntries.map((entry, idx) => {
                const amount = Number(entry.amount || 0);
                const runningBalance = cumulativeBalances[idx];
                const isCharge = amount < 0; // Debt/Charges are negative, Payments are positive

                return (
                  <motion.tr
                    key={entry.id || idx}
                    variants={itemVariants}
                    className="hover:bg-bgray-50 dark:hover:bg-darkblack-500 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm font-medium text-bgray-900 dark:text-white">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-bgray-400 text-xs" />
                          {entry.entry_date ? new Date(entry.entry_date).toLocaleDateString('es-HN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          }) : '—'}
                        </div>
                        <div className="text-xs text-bgray-500 mt-1 pl-5">
                          #{String(idx + 1).padStart(3, '0')}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isCharge ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          <span className="text-sm font-medium text-bgray-900 dark:text-white">
                            {entry.description || "Movimiento contable"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 pl-3.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wide bg-bgray-100 dark:bg-darkblack-400 text-bgray-600 dark:text-bgray-400 border border-bgray-200 dark:border-darkblack-300">
                            {formatStatus(entry.entry_type, t)}
                          </span>
                          {entry.payment_id && (
                            <span className="text-xs text-bgray-400 flex items-center gap-1">
                              Pago #{entry.payment_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-bold ${isCharge ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {isCharge ? '' : '+'}{amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HNL
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-bgray-900 dark:text-white">
                        {runningBalance.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HNL
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

LedgerEntriesTab.propTypes = {
  ledgerLoading: PropTypes.bool,
  ledgerEntries: PropTypes.array,
  fmt: PropTypes.func.isRequired
};

export default LedgerEntriesTab;