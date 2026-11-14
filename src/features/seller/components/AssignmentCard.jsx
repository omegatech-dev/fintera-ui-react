import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/shared/ui";
import { sellerApi } from "../api";
import { money } from "../utils/format";
import { useAssignmentCountdown } from "../hooks/useAssignmentCountdown";
import {
  assignmentAcceptedAt,
  assignmentAmount,
  assignmentClientName,
  assignmentCommission,
  assignmentDeadline,
  assignmentLotName,
  assignmentProjectName,
  formatCountdown,
  normalizeAssignmentStatus,
} from "../utils/assignment";

const elapsedLabel = (value, t) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 0) return null;
  if (minutes < 1) return t("common.justNow");
  if (minutes < 60) return t("common.timeAgo.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("common.timeAgo.hours", { count: hours });
  return t("common.timeAgo.days", { count: Math.floor(hours / 24) });
};

function AssignmentCard({
  assignment,
  onAccept,
  onReject,
  onAccepted,
  onRejected,
  className = "",
  compact = false,
}) {
  const { t } = useLocale();
  const [status, setStatus] = useState(() =>
    normalizeAssignmentStatus(assignment?.status)
  );
  const [acting, setActing] = useState(null);
  const [error, setError] = useState(null);

  const deadline = assignmentDeadline(assignment);
  const remaining = useAssignmentCountdown(deadline);

  useEffect(() => {
    setStatus(normalizeAssignmentStatus(assignment?.status));
  }, [assignment?.id, assignment?.status]);

  const clockExpired = remaining === 0;
  const effectiveStatus =
    status === "pending" && clockExpired ? "expired" : status;

  const run = async (action) => {
    if (!assignment?.id) return;
    setActing(action);
    setError(null);
    try {
      const result =
        action === "accept"
          ? onAccept
            ? await onAccept(assignment)
            : await sellerApi.acceptAssignment(assignment.id)
          : onReject
            ? await onReject(assignment)
            : await sellerApi.rejectAssignment(assignment.id);
      setStatus(action === "accept" ? "accepted" : "expired");
      if (action === "accept") onAccepted?.(result);
      else onRejected?.(result);
    } catch {
      setError(
        t(
          action === "accept"
            ? "sellerAssignments.acceptError"
            : "sellerAssignments.rejectError"
        )
      );
    } finally {
      setActing(null);
    }
  };

  const lot = assignmentLotName(assignment) || t("sellerAssignments.unknownLot");
  const project = assignmentProjectName(assignment);
  const amount = assignmentAmount(assignment);
  const client = assignmentClientName(assignment);
  const line = client
    ? t("notifications.assignmentLine", {
        lot,
        amount: amount !== null && amount !== undefined ? money(amount) : "—",
        client,
      })
    : [lot, project, amount !== null && amount !== undefined ? money(amount) : null]
        .filter(Boolean)
        .join(" · ");

  const acceptedAt = assignmentAcceptedAt(assignment);
  const acceptedTime = elapsedLabel(acceptedAt, t);
  const commission = assignmentCommission(assignment);

  const state = {
    pending: {
      label: t("sellerAssignments.pendingLabel"),
      title: t("sellerAssignments.pendingTitle"),
      note: t("sellerAssignments.pendingNote"),
    },
    accepted: {
      label: t("sellerAssignments.acceptedLabel"),
      title: acceptedTime
        ? t("sellerAssignments.acceptedAgo", { time: acceptedTime })
        : t("sellerAssignments.acceptedTitle"),
      note: t("sellerAssignments.acceptedNote"),
    },
    expired: {
      label: t("sellerAssignments.expiredLabel"),
      title: t("sellerAssignments.expiredTitle"),
      note: t("sellerAssignments.expiredNote"),
    },
  }[effectiveStatus];

  return (
    <article
      className={
        compact
          ? `border-b border-line/60 bg-surface p-3 last:border-0 ${className}`
          : `rounded-card border border-line bg-surface p-4 ${className}`
      }
    >
      <p className="text-micro font-bold uppercase tracking-[0.6px] text-ink-3">
        {state.label}
      </p>
      <p className="mt-3 text-title font-bold text-ink">{state.title}</p>
      <p className="mt-1 truncate text-micro font-medium text-ink-3">{line}</p>

      {effectiveStatus === "pending" && (
        <div className="mt-3 rounded-control bg-warning-soft px-3 py-2">
          <p className="text-micro font-bold uppercase tracking-[0.6px] text-warning">
            {t("sellerAssignments.timeToAccept")}
          </p>
          <p
            className="mt-0.5 font-mono text-[24px] font-bold leading-tight tabular-nums text-warning"
            aria-live="polite"
          >
            {formatCountdown(remaining)}
          </p>
        </div>
      )}

      {effectiveStatus === "accepted" && (
        <div className="mt-3 rounded-control bg-brand-soft px-3 py-2">
          <p className="text-micro font-bold uppercase tracking-[0.6px] text-brand-strong">
            {t("sellerAssignments.commissionEstimate")}
          </p>
          <p className="mt-0.5 text-[24px] font-bold leading-tight tabular-nums text-brand-strong">
            {commission !== null && commission !== undefined
              ? money(commission)
              : "—"}
          </p>
        </div>
      )}

      {effectiveStatus === "expired" && (
        <div className="mt-3 rounded-control bg-danger-soft px-3 py-2">
          <p className="text-micro font-bold uppercase tracking-[0.6px] text-danger">
            {t("sellerAssignments.expiredBadge")}
          </p>
          <p className="mt-0.5 font-mono text-[24px] font-bold leading-tight tabular-nums text-danger">
            {formatCountdown(0)}
          </p>
        </div>
      )}

      <p className="mt-3 text-micro font-medium text-ink-3">{state.note}</p>

      {effectiveStatus === "pending" && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            loading={acting === "reject"}
            disabled={acting === "accept"}
            onClick={() => run("reject")}
          >
            {t("sellerAssignments.reject")}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            loading={acting === "accept"}
            disabled={acting === "reject"}
            onClick={() => run("accept")}
          >
            {t("sellerAssignments.accept")}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-micro font-medium text-danger">
          {error}
        </p>
      )}
    </article>
  );
}

AssignmentCard.propTypes = {
  assignment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    accept_deadline_at: PropTypes.string,
    responded_at: PropTypes.string,
    lot_name: PropTypes.string,
    project_name: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    commission_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    contract: PropTypes.object,
  }),
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  onAccepted: PropTypes.func,
  onRejected: PropTypes.func,
  className: PropTypes.string,
  compact: PropTypes.bool,
};

export default AssignmentCard;
