import PropTypes from "prop-types";
import { Skeleton } from "@/shared/ui";

const KPI_TONES = {
  default: "border-line bg-surface",
  danger: "border-danger/30 bg-danger-soft/40",
  warning: "border-warning/30 bg-warning-soft/50",
  info: "border-info/30 bg-info-soft/40",
  success: "border-line bg-surface",
};

const KPI_VALUE_TONES = {
  default: "text-ink",
  danger: "text-danger",
  warning: "text-warning",
  info: "text-info",
  success: "text-brand-strong",
};

const KPI_CAPTION_TONES = {
  danger: "text-danger",
  warning: "text-warning",
  info: "text-info",
};

const GRID_COLUMNS = {
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

function StatCard({ label, value, caption, tone = "default" }) {
  return (
    <div className={`rounded-card border p-5 ${KPI_TONES[tone]}`}>
      <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
        {label}
      </p>
      <p
        className={`mt-2 text-page font-bold tabular-nums ${KPI_VALUE_TONES[tone]}`}
      >
        {value}
      </p>
      {caption && (
        <p
          className={`mt-1 text-micro ${
            KPI_CAPTION_TONES[tone] || "text-ink-3"
          }`}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

function SellerKpis({ items = [], loading }) {
  const count = items.length || 3;
  const columns = GRID_COLUMNS[count] || GRID_COLUMNS[3];

  return (
    <div className={`grid grid-cols-1 gap-4 ${columns}`}>
      {loading
        ? Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="rounded-card border border-line bg-surface p-5"
            >
              <Skeleton rows={2} />
            </div>
          ))
        : items.map((kpi) => <StatCard key={kpi.label} {...kpi} />)}
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.node,
  value: PropTypes.node,
  caption: PropTypes.node,
  tone: PropTypes.oneOf(["default", "danger", "warning", "info", "success"]),
};

SellerKpis.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
};

export default SellerKpis;
