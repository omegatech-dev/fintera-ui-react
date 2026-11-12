/**
 * Reservation payments follow a strict review order: the contract must be
 * approved before its reservation payment can be accepted.
 */
export function reservationApprovalBlocked(payment) {
  const isReservation =
    String(payment?.payment_type || "").toLowerCase() === "reservation";
  if (!isReservation) return false;

  // The payments list returns the contract state as a flat `contract_status`
  // field; other payloads may nest the contract, so accept both shapes.
  const contractStatus = String(
    payment?.contract_status || payment?.contract?.status || ""
  ).toLowerCase();
  return contractStatus !== "approved";
}
