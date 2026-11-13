import PropTypes from "prop-types";
import { memo, useMemo } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { formatStatus } from "../../../shared/utils/formatStatus";
import { formatCurrency } from "../../../shared/utils/formatters";
import { Card, EmptyState, Skeleton, Table } from "@/shared/ui";

const LedgerEntriesTab = memo(function LedgerEntriesTab({ ledgerLoading, ledgerEntries }) {
  const { t } = useLocale();
  const entries = useMemo(
    () => (Array.isArray(ledgerEntries) ? ledgerEntries : []),
    [ledgerEntries]
  );

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, entry) => {
          const amount = Number(entry.amount || 0);
          if (amount < 0) acc.charges += Math.abs(amount);
          if (amount > 0) acc.payments += amount;
          acc.balance += amount;
          return acc;
        },
        { charges: 0, payments: 0, balance: 0 }
      ),
    [entries]
  );

  const columns = useMemo(
    () => [
      {
        key: "entry_date",
        header: t("contracts.dateRef"),
        render: (entry) => (
          <span className="text-body text-ink-2">
            {entry.entry_date
              ? new Date(entry.entry_date).toLocaleDateString("es-HN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        ),
      },
      {
        key: "description",
        header: t("contracts.description"),
        render: (entry) => (
          <div>
            <p className="text-body font-semibold text-ink">
              {entry.description || t("contracts.noMovements")}
            </p>
            <p className="text-micro uppercase tracking-wide text-ink-3">
              {formatStatus(entry.entry_type, t)}
              {entry.payment_id ? ` · #${entry.payment_id}` : ""}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        header: t("paymentSchedule.amount"),
        align: "right",
        render: (entry) => {
          const amount = Number(entry.amount || 0);
          return (
            <span
              className={`text-body font-bold ${
                amount < 0 ? "text-danger" : "text-brand-strong"
              }`}
            >
              {amount > 0 ? "+" : ""}
              {formatCurrency(amount)}
            </span>
          );
        },
      },
    ],
    [t]
  );

  if (ledgerLoading) {
    return (
      <Card bodyClassName="p-4">
        <Skeleton rows={5} />
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title={t("contracts.noMovements")}
        description={t("contracts.noMovementsDescription")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card bodyClassName="p-3.5">
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("contracts.totalCharges")}
          </p>
          <p className="text-title font-bold text-danger">
            {formatCurrency(totals.charges)}
          </p>
        </Card>
        <Card bodyClassName="p-3.5">
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("contracts.totalPayments")}
          </p>
          <p className="text-title font-bold text-brand-strong">
            {formatCurrency(totals.payments)}
          </p>
        </Card>
        <Card bodyClassName="p-3.5">
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("contracts.currentBalance")}
          </p>
          <p className="text-title font-bold text-ink">
            {formatCurrency(totals.balance)}
          </p>
        </Card>
      </div>

      <Card
        title={t("contracts.ledgerDetails")}
        action={
          <span className="rounded-chip bg-surface-2 px-2 py-1 text-micro font-semibold text-ink-3">
            {t("contracts.records", { count: entries.length })}
          </span>
        }
        bodyClassName="p-4 pt-3"
      >
        <Table
          columns={columns}
          rows={entries}
          getRowKey={(entry) =>
            entry.id ?? `${entry.entry_date || "entry"}-${entry.description || ""}`
          }
          mobileCard={(entry) => (
            <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-3">
              <div className="min-w-0">
                <p className="truncate text-body font-semibold text-ink">
                  {entry.description || "—"}
                </p>
                <p className="text-micro text-ink-3">
                  {entry.entry_date
                    ? new Date(entry.entry_date).toLocaleDateString("es-HN")
                    : "—"}
                </p>
              </div>
              <p className="text-body font-semibold text-ink">
                {formatCurrency(entry.amount)}
              </p>
            </div>
          )}
        />
      </Card>
    </div>
  );
});

LedgerEntriesTab.propTypes = {
  ledgerLoading: PropTypes.bool,
  ledgerEntries: PropTypes.array,
  fmt: PropTypes.func,
};

export default LedgerEntriesTab;
