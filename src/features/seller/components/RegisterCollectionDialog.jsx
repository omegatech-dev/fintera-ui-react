import PropTypes from "prop-types";
import { Banner, Button, Dialog, FileUpload } from "@/shared/ui";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate, money, paymentTypeLabel } from "../utils/format";

function DetailRow({ label, value }) {
  return (
    <div>
      <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
        {label}
      </dt>
      <dd className="text-body font-semibold text-ink">{value}</dd>
    </div>
  );
}

DetailRow.propTypes = {
  label: PropTypes.node,
  value: PropTypes.node,
};

function RegisterCollectionDialog({
  open,
  target,
  receipt,
  uploading,
  onReceiptChange,
  onClose,
  onSubmit,
}) {
  const { t } = useLocale();
  const contract = target?.contract;
  const row = target?.row;
  const payment = target?.payment;
  const clientName =
    contract?.applicant_name || row?.applicant_name || t("seller.unnamedClient");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("seller.registerCollection")}
      description={
        contract?.id ? `#${contract.id} · ${clientName}` : clientName
      }
      footer={
        <>
          <Button variant="ghost" disabled={uploading} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            loading={uploading}
            disabled={!payment?.id || !receipt}
            onClick={onSubmit}
          >
            {t("seller.registerCollection")}
          </Button>
        </>
      }
    >
      {target && (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-3 rounded-control border border-line bg-surface-2 p-4 sm:grid-cols-2">
            <DetailRow label={t("seller.client")} value={clientName} />
            <DetailRow label={t("seller.contract")} value={`#${contract?.id}`} />
            <DetailRow
              label={t("seller.paymentType")}
              value={
                payment
                  ? paymentTypeLabel(payment, t)
                  : t("seller.noPendingInstallmentShort")
              }
            />
            <DetailRow
              label={t("seller.dueDate")}
              value={formatDate(payment?.due_date)}
            />
            <DetailRow
              label={t("seller.amountToCollect")}
              value={payment ? money(payment.amount) : "—"}
            />
            <DetailRow
              label={t("seller.currentBalance")}
              value={money(Math.abs(Number(contract?.balance || 0)))}
            />
          </dl>

          {!payment && (
            <Banner tone="warning">{t("seller.noPendingInstallment")}</Banner>
          )}

          {payment && (
            <FileUpload
              label={t("seller.receipt")}
              accept="image/*,application/pdf"
              multiple={false}
              files={receipt ? [receipt] : []}
              onChange={(files) => onReceiptChange(files[0] || null)}
              hint={t("seller.receiptRequired")}
            />
          )}

          <Banner tone="info">{t("seller.collectionNotice")}</Banner>
        </div>
      )}
    </Dialog>
  );
}

RegisterCollectionDialog.propTypes = {
  open: PropTypes.bool,
  target: PropTypes.shape({
    contract: PropTypes.object,
    row: PropTypes.object,
    payment: PropTypes.object,
  }),
  receipt: PropTypes.instanceOf(File),
  uploading: PropTypes.bool,
  onReceiptChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RegisterCollectionDialog;
