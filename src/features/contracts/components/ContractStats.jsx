import PropTypes from "prop-types";
import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";

const pct = (value, total) =>
  total ? `${Math.round((Number(value || 0) / Number(total)) * 100)}%` : "0%";

const money = (value, locale) => {
  const amount = Number(value);
  if (value === null || value === undefined || !Number.isFinite(amount)) {
    return "—";
  }
  return `L ${amount.toLocaleString(locale === "en" ? "en-US" : "es-HN", {
    maximumFractionDigits: 0,
  })}`;
};

const StatCard = ({ label, value, caption, tone = "default" }) => {
  const isDanger = tone === "danger";
  return (
    <div
      className={`flex min-h-[96px] flex-col justify-center gap-1 rounded-xl border p-3.5 ${
        isDanger
          ? "border-danger/25 bg-danger-soft"
          : "border-line bg-surface"
      }`}
    >
      <p
        className={`text-micro font-bold uppercase tracking-wide ${
          isDanger ? "text-danger" : "text-ink-3"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-[21px] font-bold leading-tight ${
          isDanger ? "text-danger" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p
        className={`text-micro font-medium ${
          isDanger ? "text-danger/80" : "text-ink-3"
        }`}
      >
        {caption}
      </p>
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  caption: PropTypes.string,
  tone: PropTypes.oneOf(["default", "danger"]),
};

const ContractStats = memo(function ContractStats({ stats }) {
  const { t, locale } = useLocale();
  const total = Number(stats.total || 0);
  const active = Number(stats.active ?? stats.approved ?? 0);
  const cancelled = Number(stats.cancelled || 0);
  const overdueCount = Number(stats.overdue_count || 0);
  const hasBalance =
    stats.pending_balance !== null && stats.pending_balance !== undefined;

  const cards = [
    {
      label: t("contracts.activeContracts"),
      value: active,
      caption: `${pct(active, total)} ${t("contracts.ofTotal")}`,
    },
    {
      label: t("contracts.pendingBalance"),
      value: hasBalance ? money(stats.pending_balance, locale) : "—",
      caption: `${active} ${t("contracts.activeContracts").toLowerCase()}`,
    },
    {
      label: t("contracts.moratory"),
      value: money(stats.overdue, locale),
      caption: t("payments.kpiOverdue", { count: overdueCount }),
      tone: "danger",
    },
    {
      label: t("contracts.status.cancelled"),
      value: cancelled,
      caption: `${pct(cancelled, total)} ${t("contracts.ofTotal")}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
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
    cancelled: PropTypes.number,
    active: PropTypes.number,
    pending_balance: PropTypes.number,
    overdue: PropTypes.number,
    overdue_count: PropTypes.number,
  }).isRequired,
};

export default ContractStats;
