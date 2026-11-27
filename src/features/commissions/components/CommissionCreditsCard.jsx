import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, Chip, Pagination, Table } from "@/shared/ui";
import { isPendingCredit, summarizeCredits } from "../utils/credits";

const money = (value) =>
  `L ${Number(value || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TILE_TONES = {
  default: "border-line bg-surface-2",
  warning: "border-warning-soft bg-warning-soft/40",
};

const TILE_VALUE_TONES = {
  default: "text-ink",
  warning: "text-warning",
};

function SummaryTile({ label, value, caption, tone = "default", loading }) {
  return (
    <div className={`rounded-control border p-4 ${TILE_TONES[tone]}`}>
      <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
        {label}
      </p>
      <p
        className={`mt-1 text-title font-bold tabular-nums ${TILE_VALUE_TONES[tone]}`}
      >
        {loading ? "—" : value}
      </p>
      {caption && <p className="mt-1 text-micro text-ink-3">{caption}</p>}
    </div>
  );
}

function CommissionCreditsCard({
  credits = [],
  sellerBalance = null,
  showSeller = false,
  loading = false,
  creditsPagination = null,
  onCreditsPageChange,
  className = "",
}) {
  const { t } = useLocale();
  const summary = summarizeCredits(credits);
  const balance = sellerBalance ?? summary.pending;

  const applicationList = (row) =>
    row.applications?.length ? (
      <ul className="space-y-1">
        {row.applications.map((application) => (
          <li key={application.id} className="text-micro text-ink-2">
            {application.applied_contract_guid ? (
              <Link
                to={`/contracts/${application.applied_contract_guid}`}
                className="font-semibold hover:text-brand-strong hover:underline"
              >
                #{application.applied_contract_id}
              </Link>
            ) : (
              <span className="font-semibold">
                #{application.applied_contract_id || "—"}
              </span>
            )}{" "}
            · {money(application.amount)}
          </li>
        ))}
        {row.applications_total > row.applications.length && (
          <li className="text-micro text-ink-3">
            {t("commissions.creditMoreApplications", {
              count: row.applications_total - row.applications.length,
            })}
          </li>
        )}
      </ul>
    ) : (
      <span className="text-ink-3">—</span>
    );

  const columns = [
    ...(showSeller
      ? [
          {
            key: "seller",
            header: t("commissions.seller"),
            render: (row) => (
              <span className="font-semibold text-ink">{row.seller || "—"}</span>
            ),
          },
        ]
      : []),
    {
      key: "contract_id",
      header: t("commissions.contract"),
      render: (row) =>
        row.contract_id ? (
          <span className="font-semibold text-ink">#{row.contract_id}</span>
        ) : (
          <span className="text-ink-3">—</span>
        ),
    },
    {
      key: "amount",
      header: t("commissions.creditAmount"),
      align: "right",
      render: (row) => (
        <span className="font-semibold tabular-nums text-ink">
          {money(row.amount)}
        </span>
      ),
    },
    {
      key: "applied_amount",
      header: t("commissions.creditApplied"),
      align: "right",
      render: (row) => (
        <span className="tabular-nums text-ink-2">
          {money(row.applied_amount)}
        </span>
      ),
    },
    {
      key: "remaining_amount",
      header: t("commissions.creditRemaining"),
      align: "right",
      render: (row) => (
        <span className="font-semibold tabular-nums text-ink">
          {money(row.remaining_amount)}
        </span>
      ),
    },
    {
      key: "source",
      header: t("commissions.creditSource"),
      render: (row) => (
        <span className="text-ink-2">
          {t(`commissions.creditSources.${row.source}`)}
        </span>
      ),
    },
    {
      key: "applications",
      header: t("commissions.creditApplications"),
      render: applicationList,
    },
    {
      key: "status",
      header: t("common.status"),
      render: (row) =>
        isPendingCredit(row) ? (
          <Chip tone="warning">{t("commissions.creditPendingStatus")}</Chip>
        ) : (
          <Chip tone="success">{t("commissions.creditSettled")}</Chip>
        ),
    },
    {
      key: "created_at",
      header: t("commissions.creditDate"),
      render: (row) => (
        <span className="text-ink-2">{formatDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <Card
      title={t("commissions.creditTitle")}
      className={className}
      bodyClassName="p-0"
    >
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <SummaryTile
          label={t("commissions.sellerCreditBalance")}
          value={money(balance)}
          caption={t("commissions.sellerCreditBalanceCaption")}
          tone="warning"
          loading={loading}
        />
      </div>

      {!loading && credits.length === 0 ? (
        <p className="border-t border-line px-5 py-4 text-body text-ink-3">
          {t("commissions.creditEmpty")}
        </p>
      ) : (
        <div className="border-t border-line px-2 pb-2">
          <Table
            columns={columns}
            rows={credits}
            getRowKey={(row) =>
              row.id ??
              `${row.contract_id}-${row.seller}-${row.created_at}`
            }
            mobileCard={(row) => (
              <div className="mb-2 rounded-card border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-ink">
                      {row.contract_id ? `#${row.contract_id}` : "—"}
                      {showSeller && row.seller ? ` · ${row.seller}` : ""}
                    </p>
                    <p className="text-micro text-ink-3">
                      {formatDate(row.created_at)}
                    </p>
                  </div>
                  <p className="text-body font-bold tabular-nums text-ink">
                    {money(row.amount)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  {isPendingCredit(row) ? (
                    <Chip tone="warning">
                      {t("commissions.creditPendingStatus")}
                    </Chip>
                  ) : (
                    <Chip tone="success">{t("commissions.creditSettled")}</Chip>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-micro">
                  <dt className="text-ink-3">{t("commissions.creditApplied")}</dt>
                  <dd className="text-right font-semibold">{money(row.applied_amount)}</dd>
                  <dt className="text-ink-3">{t("commissions.creditRemaining")}</dt>
                  <dd className="text-right font-semibold">{money(row.remaining_amount)}</dd>
                  <dt className="text-ink-3">{t("commissions.creditSource")}</dt>
                  <dd className="text-right">{t(`commissions.creditSources.${row.source}`)}</dd>
                </dl>
                {row.applications?.length > 0 && (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="mb-1 text-micro font-bold uppercase tracking-wide text-ink-3">
                      {t("commissions.creditApplications")}
                    </p>
                    {applicationList(row)}
                  </div>
                )}
              </div>
            )}
          />
          {creditsPagination && credits.length > 0 && (
            <div className="px-3">
              <Pagination
                page={creditsPagination.page}
                pageCount={creditsPagination.total_pages || 1}
                total={creditsPagination.total}
                perPage={creditsPagination.per_page}
                onPageChange={onCreditsPageChange}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

SummaryTile.propTypes = {
  label: PropTypes.node,
  value: PropTypes.node,
  caption: PropTypes.node,
  tone: PropTypes.oneOf(["default", "warning"]),
  loading: PropTypes.bool,
};

CommissionCreditsCard.propTypes = {
  credits: PropTypes.arrayOf(PropTypes.object),
  sellerBalance: PropTypes.number,
  showSeller: PropTypes.bool,
  loading: PropTypes.bool,
  creditsPagination: PropTypes.shape({
    page: PropTypes.number,
    per_page: PropTypes.number,
    total: PropTypes.number,
    total_pages: PropTypes.number,
  }),
  onCreditsPageChange: PropTypes.func,
  className: PropTypes.string,
};

export default CommissionCreditsCard;
