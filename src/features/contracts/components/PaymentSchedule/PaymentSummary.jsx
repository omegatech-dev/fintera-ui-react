import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCoins,
  faIdCard,
  faPhone,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Card, Chip } from "@/shared/ui";
import CreditScoreCard from "../CreditScoreCard";
import { areaUnitLabel } from "../../../../shared/utils/units";

const PaymentSummary = ({
  summary,
  paidAmount,
  displayBalance,
  progressPercent,
  activeMonths,
  currentContract,
  activeUser,
  t,
  fmt,
}) => {
  const canSeeCredit = activeUser?.role === "admin" || activeUser?.role === "seller";

  return (
    <div className="space-y-4 py-4">
      <Card bodyClassName="p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("contracts.totalValue")}
            </p>
            <p className="text-display font-bold leading-tight text-ink">
              {fmt(summary?.price)}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-micro font-bold uppercase tracking-wide text-brand">
                {t("contracts.paid")}
              </p>
              <p className="text-title font-bold text-ink">{fmt(paidAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-micro font-bold uppercase tracking-wide text-danger">
                {t("contracts.balance")}
              </p>
              <p className="text-title font-bold text-ink">
                {fmt(Math.abs(Number(displayBalance || 0)))}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-brand"
            />
          </div>
          <div className="flex items-center justify-between text-micro font-semibold text-ink-3">
            <span>
              {Math.round(progressPercent)}% {t("contracts.completed")}
            </span>
            <span>
              {activeMonths} {t("contracts.months").toLowerCase()}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid gap-3.5 md:grid-cols-2">
        <Card title={t("contracts.clientCard")} bodyClassName="p-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-info-soft text-title font-bold uppercase text-info">
              {currentContract?.applicant_name?.charAt(0) || (
                <FontAwesomeIcon icon={faUser} />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-lg font-bold text-ink">
                {currentContract?.applicant_name || t("contracts.client")}
              </p>
              <p className="truncate text-micro text-ink-3">
                {t("contracts.contractNumber", { id: currentContract?.id ?? "—" })}
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-label text-ink-2">
            {currentContract?.applicant_phone && (
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="text-ink-3" />
                <span className="truncate">{currentContract.applicant_phone}</span>
              </p>
            )}
            {currentContract?.applicant_identity && (
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faIdCard} className="text-ink-3" />
                <span className="truncate">{currentContract.applicant_identity}</span>
              </p>
            )}
          </div>
          {canSeeCredit && (
            <div className="mt-3">
              <CreditScoreCard creditScore={currentContract?.applicant_credit_score} />
            </div>
          )}
        </Card>

        <Card title={t("contracts.lotInformation")} bodyClassName="p-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-title text-brand-strong">
              <FontAwesomeIcon icon={faBuilding} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-lg font-bold text-ink">
                {currentContract?.lot_name || t("contracts.lot")}
              </p>
              <p className="truncate text-micro text-ink-3">
                {currentContract?.project_name || "—"}
              </p>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-body">
            <div>
              <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
                {t("projects.area")}
              </dt>
              <dd className="font-semibold text-ink">
                {currentContract?.lot_area || "—"}{" "}
                {areaUnitLabel(currentContract?.lot_measurement_unit)}
              </dd>
            </div>
            <div>
              <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
                {t("projects.dimensions")}
              </dt>
              <dd className="font-semibold text-ink">
                {currentContract?.lot_width && currentContract?.lot_length
                  ? `${currentContract.lot_width} x ${currentContract.lot_length}`
                  : "—"}
              </dd>
            </div>
          </dl>
          {currentContract?.lot_address && (
            <p className="mt-2 truncate text-label text-ink-3">
              {currentContract.lot_address}
            </p>
          )}
        </Card>
      </div>

      <Card title={t("contracts.termsCard")} bodyClassName="p-4 pt-2">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("contracts.months")}
            </p>
            <p className="text-title font-bold text-ink">{summary?.term || 0}</p>
          </div>
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("contracts.rate")}
            </p>
            <Chip tone="warning">{summary?.interestRate || 0}%</Chip>
          </div>
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("contracts.reserve")}
            </p>
            <p className="text-body font-semibold text-ink">{fmt(summary?.reserve)}</p>
          </div>
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("contracts.downPayment")}
            </p>
            <p className="text-body font-semibold text-ink">{fmt(summary?.downPayment)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3 text-body">
          <span className="inline-flex items-center gap-2 text-ink-3">
            <FontAwesomeIcon icon={faCoins} className="text-brand" />
            {t("contracts.financed")}:{" "}
            <strong className="text-ink">{fmt(summary?.financed)}</strong>
          </span>
        </div>
      </Card>
    </div>
  );
};

PaymentSummary.propTypes = {
  summary: PropTypes.object,
  paidAmount: PropTypes.number,
  displayBalance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  progressPercent: PropTypes.number,
  activeMonths: PropTypes.number,
  currentContract: PropTypes.object,
  activeUser: PropTypes.object,
  t: PropTypes.func.isRequired,
  fmt: PropTypes.func.isRequired,
};

export default PaymentSummary;
