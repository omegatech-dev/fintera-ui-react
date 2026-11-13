import PropTypes from "prop-types";

function Pagination({
  page = 1,
  pageCount = 1,
  total,
  perPage,
  onPageChange,
  className = "",
}) {
  const start = total != null && perPage ? (page - 1) * perPage + 1 : null;
  const end =
    total != null && perPage ? Math.min(page * perPage, total) : null;
  const pages = Array.from({ length: Math.min(pageCount, 5) }, (_, i) => i + 1);

  const go = (next) => {
    if (next < 1 || next > pageCount) return;
    onPageChange?.(next);
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 py-3 text-body text-ink-3 ${className}`}
    >
      <span>
        {total != null
          ? `Mostrando ${start}–${end} de ${total}`
          : `Página ${page} de ${pageCount}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
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
          aria-label="Página siguiente"
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
