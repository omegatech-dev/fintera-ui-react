import PropTypes from "prop-types";

function Table({
  columns,
  rows,
  getRowKey,
  sort,
  onSortChange,
  mobileCard,
  onRowClick,
  empty = null,
}) {
  if (!rows?.length) return empty;

  const handleRowKeyDown = (event, row) => {
    if (!onRowClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className="w-full">
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => {
              const active = sort?.field === column.key;
              const ariaSort = active
                ? sort.direction === "asc"
                  ? "ascending"
                  : "descending"
                : "none";

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.sortable ? ariaSort : undefined}
                  className={`px-3 py-2.5 text-left text-micro font-bold uppercase tracking-wide text-ink-3 ${
                    column.align === "right" ? "text-right" : ""
                  }`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(column.key)}
                      className="inline-flex items-center gap-1 uppercase tracking-wide"
                    >
                      {column.header}
                      {active ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick ? (event) => handleRowKeyDown(event, row) : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              className={`border-b border-line/70 last:border-0 ${
                onRowClick ? "cursor-pointer hover:bg-surface-2" : ""
              }`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3 py-3 text-body text-ink ${
                    column.align === "right" ? "text-right" : ""
                  }`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <div
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={onRowClick ? "cursor-pointer" : undefined}
          >
            {mobileCard ? mobileCard(row) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node,
      sortable: PropTypes.bool,
      align: PropTypes.oneOf(["left", "right"]),
      render: PropTypes.func,
    })
  ).isRequired,
  rows: PropTypes.array,
  getRowKey: PropTypes.func.isRequired,
  sort: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(["asc", "desc"]),
  }),
  onSortChange: PropTypes.func,
  mobileCard: PropTypes.func,
  onRowClick: PropTypes.func,
  empty: PropTypes.node,
};

export default Table;
