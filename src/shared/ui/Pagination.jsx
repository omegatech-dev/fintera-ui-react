import PropTypes from "prop-types";
import { useLocale } from "../../contexts/LocaleContext";

function Pagination({
  page = 1,
  pageCount = 1,
  total,
  perPage,
  onPageChange,
  className = "",
}) {
  const { t } = useLocale();
  const start = total != null && perPage ? (page - 1) * perPage + 1 : null;
  const end =
    total != null && perPage ? Math.min(page * perPage, total) : null;
  const maxVisible = 5;
  const lastVisible = Math.min(pageCount, Math.max(page + 2, maxVisible));
  const firstVisible = Math.max(1, lastVisible - maxVisible + 1);
  const pages = Array.from(
    { length: lastVisible - firstVisible + 1 },
    (_, i) => firstVisible + i
  );

  const go = (next) => {
    if (next < 1 || next > pageCount) return;
    onPageChange?.(next);
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 py-3 text-body text-ink-3 ${className}`}
    >
      <span aria-live="polite">
        {total != null
          ? t("pagination.showingRange", { start, end, total })
          : t("pagination.pageOf", { page, pageCount })}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label={t("pagination.previous")}
          className="flex h-8 w-8 items-center justify-center rounded-chip hover:bg-surface-2 disabled:opacity-40"
        >
          ‹
        </button>
        {pages.map((number) => (
          <button
            key={number}
            type="button"
            aria-current={number === page ? "page" : undefined}
            onClick={() => go(number)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-chip px-2 text-label font-semibold ${
              number === page
                ? "bg-brand-soft text-brand-strong"
                : "text-ink-2 hover:bg-surface-2"
            }`}
          >
            {number}
          </button>
        ))}
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= pageCount}
          aria-label={t("pagination.next")}
          className="flex h-8 w-8 items-center justify-center rounded-chip hover:bg-surface-2 disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number,
  pageCount: PropTypes.number,
  total: PropTypes.number,
  perPage: PropTypes.number,
  onPageChange: PropTypes.func,
  className: PropTypes.string,
};

export default Pagination;
