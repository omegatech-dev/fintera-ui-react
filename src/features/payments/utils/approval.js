/**
 * Reservation payments follow a strict review order: the contract must be
 * approved before its reservation payment can be accepted.
 */
export function reservationApprovalBlocked(payment) {
  const isReservation =
    String(payment?.payment_type || "").toLowerCase() === "reservation";
  if (!isReservation) return false;

  const contractStatus = String(payment?.contract?.status || "").toLowerCase();
  return contractStatus !== "approved";
}
