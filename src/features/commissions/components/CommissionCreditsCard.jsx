import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Button, Card, Chip, Table } from "@/shared/ui";
import {
  isPendingCredit,
  netPayable,
  summarizeCredits,
} from "../utils/credits";

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
  pendingCommissions = 0,
  showSeller = false,
  isAdmin = false,
  applying = null,
  onApply,
  loading = false,
  className = "",
}) {
  const { t } = useLocale();
  const summary = summarizeCredits(credits);
  const net = netPayable(pendingCommissions, summary.pending);

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
    ...(isAdmin
      ? [
          {
            key: "actions",
            header: "",
            align: "right",
            render: (row) =>
              isPendingCredit(row) && row.id ? (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={applying === row.id}
                  onClick={() => onApply?.(row)}
                >
                  {t("commissions.creditApply")}
                </Button>
              ) : (
                <span className="text-micro text-ink-3">—</span>
              ),
          },
        ]
      : []),
  ];

  return (
    <Card
      title={t("commissions.creditTitle")}
      className={className}
      bodyClassName="p-0"
    >
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <SummaryTile
          label={t("commissions.creditPending")}
          value={money(summary.pending)}
          caption={t("commissions.creditPendingCaption")}
          tone="warning"
          loading={loading}
        />
        <SummaryTile
          label={t("commissions.netPayable")}
          value={money(net)}
          caption={t("commissions.netPayableCaption")}
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
                  {isAdmin && isPendingCredit(row) && row.id ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={applying === row.id}
                      onClick={() => onApply?.(row)}
                    >
                      {t("commissions.creditApply")}
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          />
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
  pendingCommissions: PropTypes.number,
  showSeller: PropTypes.bool,
  isAdmin: PropTypes.bool,
  applying: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onApply: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default CommissionCreditsCard;
