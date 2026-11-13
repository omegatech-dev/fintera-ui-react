import PropTypes from "prop-types";
import { Skeleton } from "@/shared/ui";

const VALUE_TONES = {
  default: "text-ink",
  brand: "text-brand-strong",
};

function ReferralMetrics({ items, loading = false, className = "" }) {
  if (loading) {
    return (
      <div
        className={`grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 ${className}`}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <Skeleton rows={2} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl
      className={`grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 ${className}`}
    >
      {items.map((item) => (
        <div key={item.key}>
          <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {item.label}
          </dt>
          <dd
            className={`mt-1 text-[22px] font-bold leading-tight tabular-nums ${
              VALUE_TONES[item.tone] || VALUE_TONES.default
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

ReferralMetrics.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.node,
      value: PropTypes.node,
      tone: PropTypes.oneOf(["default", "brand"]),
    })
  ).isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default ReferralMetrics;
