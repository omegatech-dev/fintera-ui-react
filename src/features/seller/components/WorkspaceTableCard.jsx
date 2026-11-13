import PropTypes from "prop-types";
import { Card, Pagination, Skeleton, Table } from "@/shared/ui";

function WorkspaceTableCard({
  columns,
  rows,
  getRowKey,
  mobileCard,
  empty,
  loading,
  page,
  pageCount,
  total,
  perPage,
  onPageChange,
}) {
  return (
    <Card bodyClassName="p-0">
      {loading ? (
        <div className="p-5">
          <Skeleton rows={6} />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            rows={rows}
            getRowKey={getRowKey}
            empty={empty}
            mobileCard={mobileCard}
          />
          {rows.length > 0 && (
            <div className="border-t border-line px-5">
              <Pagination
                page={page}
                pageCount={pageCount}
                total={total}
                perPage={perPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

WorkspaceTableCard.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  getRowKey: PropTypes.func.isRequired,
  mobileCard: PropTypes.func,
  empty: PropTypes.node,
  loading: PropTypes.bool,
  page: PropTypes.number,
  pageCount: PropTypes.number,
  total: PropTypes.number,
  perPage: PropTypes.number,
  onPageChange: PropTypes.func,
};

export default WorkspaceTableCard;
