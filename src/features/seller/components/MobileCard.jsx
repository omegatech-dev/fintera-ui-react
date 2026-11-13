import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export function SellerLinkButton({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex h-[34px] shrink-0 items-center justify-center rounded-control border border-line-strong bg-surface px-3 text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2"
    >
      {children}
    </Link>
  );
}

SellerLinkButton.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node,
};

function MobileCard({ title, meta, detail, value, chip, caption, action }) {
  return (
    <div className="rounded-card border border-line bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-ink">{title}</p>
          {meta && (
            <p className="truncate text-micro text-ink-3">{meta}</p>
          )}
          {detail && (
            <p className="truncate text-micro text-ink-3">{detail}</p>
          )}
        </div>
        {value && (
          <p className="shrink-0 text-body font-bold tabular-nums text-brand-strong">
            {value}
          </p>
        )}
      </div>
      {(chip || caption || action) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {chip}
            {caption && (
              <span className="truncate text-micro text-ink-3">{caption}</span>
            )}
          </div>
          {action}
        </div>
      )}
    </div>
  );
}

MobileCard.propTypes = {
  title: PropTypes.node,
  meta: PropTypes.node,
  detail: PropTypes.node,
  value: PropTypes.node,
  chip: PropTypes.node,
  caption: PropTypes.node,
  action: PropTypes.node,
};

export default MobileCard;
