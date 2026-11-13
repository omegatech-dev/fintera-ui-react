import { useState, useEffect, useCallback } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { formatCurrency } from "../../../shared/utils/formatters";
import {
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  Skeleton,
} from "../../../shared/ui";

import { dashboardApi } from "../api";

const CommissionsModal = ({ isActive, handleClose, initialDate }) => {
  const { t } = useLocale();
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCommissions: 0,
    distinctProjectCount: 0,
  });

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get first and last day of selected month
      const year = selectedDate.getFullYear();
      const monthNumber = selectedDate.getMonth() + 1;
      const monthStr = monthNumber < 10 ? `0${monthNumber}` : monthNumber;

      const startDate = `${year}-${monthStr}-01`;
      // Calculate last day
      const lastDay = new Date(year, selectedDate.getMonth() + 1, 0).getDate();
      const endDate = `${year}-${monthStr}-${lastDay}`;

      const data = await dashboardApi.getCommissions(startDate, endDate);

      if (data) {
        const items = data.commissions || [];
        setCommissions(items);

        const total = items.reduce(
          (acc, curr) => acc + (curr.commission || 0),
          0
        );
        const projects = new Set(items.map((item) => item.project)).size;
        setStats({ totalCommissions: total, distinctProjectCount: projects });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (isActive) {
      fetchCommissions();
    }
  }, [isActive, selectedDate, fetchCommissions]);

  const handleDownloadCSV = async () => {
    try {
      const year = selectedDate.getFullYear();
      const monthNumber = selectedDate.getMonth() + 1;
      const monthStr = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
      const startDate = `${year}-${monthStr}-01`;
      const lastDay = new Date(year, selectedDate.getMonth() + 1, 0).getDate();
      const endDate = `${year}-${monthStr}-${lastDay}`;

      const blob = await dashboardApi.downloadCommissionsCsv(startDate, endDate);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `commissions-${startDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download CSV", error);
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const months = [
    t("months.january"),
    t("months.february"),
    t("months.march"),
    t("months.april"),
    t("months.may"),
    t("months.june"),
    t("months.july"),
    t("months.august"),
    t("months.september"),
    t("months.october"),
    t("months.november"),
    t("months.december"),
  ];

  if (!isActive) return null;

  return (
    <Dialog
      open={Boolean(isActive)}
      onClose={handleClose}
      size="lg"
      flush
      className="relative max-h-[90vh] max-w-4xl overflow-y-auto"
    >
      <div className="flex w-full flex-col overflow-hidden bg-surface">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-title font-bold text-ink">
              <span className="rounded-control bg-brand-soft p-2 text-brand-strong">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              {t("commissions.title") || "Commissions Report"}
            </h2>
            <p className="mt-1 text-body text-ink-3">
              {t("commissions.subtitle") ||
                "Track your earnings and sales performance"}
            </p>
          </div>

          <div className="flex items-center rounded-control border border-line bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label={t("common.previous")}
              className="rounded-chip p-2 text-ink-2 transition-colors hover:bg-surface"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="w-40 select-none text-center text-label font-bold text-ink">
              {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label={t("common.next")}
              className="rounded-chip p-2 text-ink-2 transition-colors hover:bg-surface"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-control p-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label={t("common.close")}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-line bg-surface p-6">
          <div className="rounded-card border border-line bg-surface-2 p-4">
            <p className="mb-1 text-label font-medium text-ink-3">
              {t("commissions.periodTotal") || "Total for Period"}
            </p>
            <p className="text-page font-bold tabular-nums text-ink">
              {formatCurrency(stats.totalCommissions)}
            </p>
          </div>
          <div className="rounded-card border border-line bg-surface-2 p-4">
            <p className="mb-1 text-label font-medium text-ink-3">
              {t("commissions.projectsActive") || "Active Projects"}
            </p>
            <p className="text-page font-bold tabular-nums text-ink">
              {stats.distinctProjectCount}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-canvas p-6">
          {error ? (
            <ErrorState
              title={t("commissions.loadErrorTitle")}
              description={t("commissions.loadError")}
              onRetry={fetchCommissions}
            />
          ) : loading ? (
            <div className="rounded-card border border-line bg-surface p-5">
              <Skeleton rows={6} />
            </div>
          ) : commissions.length > 0 ? (
            <div className="overflow-x-auto rounded-card border border-line bg-surface">
              <table className="w-full">
                <caption className="sr-only">
                  {t("commissions.title")}
                </caption>
                <thead className="border-b border-line bg-surface-2">
                  <tr className="text-left text-micro font-bold uppercase tracking-wide text-ink-3">
                    <th scope="col" className="px-4 py-3">
                      {t("commissions.date") || "Date"}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t("commissions.customer") || "Customer"}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t("commissions.project") || "Project"}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t("commissions.financingType") || "Financing Type"}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      {t("commissions.saleValue") || "Sale Value"}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      {t("commissions.amount") || "Commission"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((item, index) => (
                    <tr
                      key={`${item.contract_id}-${index}`}
                      className="border-b border-line/60 last:border-0 hover:bg-surface-2"
                    >
                      <td className="px-4 py-3 text-label text-ink-2">
                        {item.date}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-label font-semibold text-ink">
                          {item.client_name}
                        </div>
                        <div className="text-micro text-ink-3">
                          ID: {item.contract_id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-label text-ink">
                          {item.project}
                        </div>
                        <div className="text-micro text-brand">
                          {item.lot}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-label text-ink-2">
                        {item.financing_type}
                      </td>
                      <td className="px-4 py-3 text-right text-label tabular-nums text-ink-2">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-label font-bold tabular-nums text-brand-strong">
                        {formatCurrency(item.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={t("commissions.noData")}
              description={t("commissions.noDataHint")}
            />
          )}
        </div>

        <div className="flex justify-end border-t border-line bg-surface p-6">
          <Button
            onClick={handleDownloadCSV}
            disabled={loading || Boolean(error)}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t("commissions.downloadCSV") || "Download CSV"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default CommissionsModal;
