export const ASSIGNMENT_STATUS = {
  pending: "pending",
  accepted: "accepted",
  expired: "expired",
};

export const normalizeAssignmentStatus = (value) => {
  const status = String(value || "").toLowerCase();
  if (status === "accepted") return ASSIGNMENT_STATUS.accepted;
  if (status === "expired" || status === "rejected") {
    return ASSIGNMENT_STATUS.expired;
  }
  return ASSIGNMENT_STATUS.pending;
};

export const assignmentDeadline = (assignment) =>
  assignment?.accept_deadline_at ||
  assignment?.deadline ||
  assignment?.expires_at ||
  null;

export const secondsUntil = (deadline, now = Date.now()) => {
  if (!deadline) return null;
  const timestamp = new Date(deadline).getTime();
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, Math.floor((timestamp - now) / 1000));
};

export const formatCountdown = (seconds) => {
  if (seconds === null || seconds === undefined) return "--:--:--";
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  return [hours, minutes, rest]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export const assignmentContract = (assignment) => assignment?.contract || {};

export const assignmentLotName = (assignment) =>
  assignment?.lot_name || assignmentContract(assignment).lot_name || "";

export const assignmentProjectName = (assignment) =>
  assignment?.project_name || assignmentContract(assignment).project_name || "";

export const assignmentClientName = (assignment) =>
  assignment?.client_name ||
  assignment?.applicant_name ||
  assignmentContract(assignment).applicant_name ||
  "";

export const assignmentAmount = (assignment) =>
  assignment?.amount ??
  assignment?.sale_amount ??
  assignmentContract(assignment).amount ??
  null;

export const assignmentCommission = (assignment) =>
  assignment?.commission_amount ??
  assignment?.commission_estimate ??
  assignment?.estimated_commission ??
  assignmentContract(assignment).commission_amount ??
  null;

export const assignmentAcceptedAt = (assignment) =>
  assignment?.responded_at || assignment?.accepted_at || null;

export const sellerName = (seller) =>
  seller?.full_name || seller?.name || seller?.email || "";

export const sellerZone = (seller) => seller?.address || seller?.zone || "";

export const normalizeSellerList = (data) => {
  const root = data?.data ?? data;
  const list = Array.isArray(root)
    ? root
    : root?.sellers || root?.users || data?.sellers || data?.users || [];
  return Array.isArray(list) ? list.filter((seller) => seller?.id) : [];
};

export const normalizeAssignmentList = (data) => {
  const root = data?.data ?? data;
  const list = Array.isArray(root)
    ? root
    : root?.assignments ||
      root?.pending_assignments ||
      data?.assignments ||
      data?.pending_assignments ||
      [];
  return Array.isArray(list) ? list.filter((item) => item?.id) : [];
};
