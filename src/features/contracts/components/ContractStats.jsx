import PropTypes from "prop-types";
import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";

const pct = (value, total) =>
  total ? `${Math.round((Number(value || 0) / Number(total)) * 100)}%` : "0%";

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
  const { t } = useLocale();
  const total = Number(stats.total || 0);

  const cards = [
    {
      label: t("contracts.totalContracts"),
      value: total,
      caption: t("contracts.showingContracts", {
        count: stats.approved || 0,
        total,
      }),
    },
    {
      label: t("contracts.status.pending"),
      value: stats.pending || 0,
      caption: `${pct(stats.pending, total)} ${t("contracts.ofTotal")}`,
    },
    {
      label: t("contracts.status.approved"),
      value: stats.approved || 0,
      caption: `${pct(stats.approved, total)} ${t("contracts.ofTotal")}`,
    },
    {
      label: t("contracts.status.rejected"),
      value: stats.rejected || 0,
      caption: `${pct(stats.rejected, total)} ${t("contracts.ofTotal")}`,
      tone: "danger",
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
  }).isRequired,
};

export default ContractStats;
