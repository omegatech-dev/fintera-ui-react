import { NEW_SELLER_SCORE, scoreLevel, scoreTone } from "../../utils/score";
import { scorePercent } from "../../utils/scoreMetrics";
import { money } from "../../utils/format";

const TONE_TO_KPI = {
  success: "success",
  warning: "warning",
  danger: "danger",
};

export const summarizeCommissions = (rows = []) =>
  rows.reduce(
    (acc, item) => {
      const commission = Number(item?.commission || 0);
      acc.total += commission;
      acc.amount += Number(item?.amount || 0);
      acc.count += 1;
      if (item?.commission_paid_at) {
        acc.paid += commission;
        acc.paidCount += 1;
      } else {
        acc.pending += commission;
      }
      if (String(item?.origin || "").toLowerCase() === "historical") {
        acc.historical += commission;
        acc.historicalCount += 1;
      }
      return acc;
    },
    {
      total: 0,
      amount: 0,
      paid: 0,
      pending: 0,
      paidCount: 0,
      count: 0,
      historical: 0,
      historicalCount: 0,
    }
  );

export const buildCommissionKpis = ({ t, totals, score, metrics }) => {
  const level = scoreLevel(score);
  const hasHistory = Number(metrics?.total || 0) > 0;
  const accepted = Number(metrics?.accepted || 0);
  const total = Number(metrics?.total || 0);

  return [
    {
      label: t("seller.kpiMonthCommission"),
      value: money(totals?.total || 0),
      caption: t("seller.kpiMonthCommissionCaption"),
    },
    {
      label: t("seller.kpiPendingCommission"),
      value: money(totals?.pending || 0),
      caption: t("seller.kpiPendingCommissionCaption"),
      tone: "warning",
    },
    {
      label: t("seller.kpiPaidCommission"),
      value: money(totals?.paid || 0),
      caption: t("seller.kpiPaidCommissionCaption"),
      tone: "success",
    },
    {
      label: t("seller.kpiScore"),
      value: `${scorePercent(score ?? NEW_SELLER_SCORE)}%`,
      caption: hasHistory
        ? t("seller.kpiScoreCaption", { accepted, total })
        : t("seller.kpiScoreNew"),
      tone: TONE_TO_KPI[scoreTone(level)] || "success",
    },
  ];
};
