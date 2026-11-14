export const formatStatus = (status, t) => {
  if (!status) return t && typeof t === 'function' ? t('filters.all') : "All";
  const s = String(status).toLowerCase().trim();

  // canonicalize to underscore-separated key
  const key = s.replace(/\s+/g, "_");

  const translations = {
    pending: t && typeof t === 'function' ? t('payments.pending') : "Pending",
    paid: t && typeof t === 'function' ? t('payments.statusOptions.paid') : "Paid",
    submitted: t && typeof t === 'function' ? t('payments.statusOptions.submitted') : "Submitted",
    processing: t && typeof t === 'function' ? t('payments.statusOptions.processing') : "Processing",
    approved: t && typeof t === 'function' ? t('payments.statusOptions.approved') : "Approved",
    rejected: t && typeof t === 'function' ? t('payments.statusOptions.rejected') : "Rejected",
    cancelled: t && typeof t === 'function' ? t('payments.statusOptions.cancelled') : "Cancelled",
    failed: t && typeof t === 'function' ? t('payments.statusOptions.failed') : "Failed",
    in_review: t && typeof t === 'function' ? t('payments.statusOptions.in_review') : "In Review",
    under_review: t && typeof t === 'function' ? t('payments.statusOptions.under_review') : "Under Review",
    in_process: t && typeof t === 'function' ? t('payments.statusOptions.in_process') : "In Process",
    adjustment: t && typeof t === 'function' ? t('payments.statusOptions.adjustment') : "Adjustment",
    refund: t && typeof t === 'function' ? t('payments.statusOptions.refund') : "Refund",
    reservation: t && typeof t === 'function' ? t('payments.statusOptions.reservation') : "Reservation",
    down_payment: t && typeof t === 'function' ? t('payments.statusOptions.down_payment') : "Down Payment",
    installment: t && typeof t === 'function' ? t('payments.statusOptions.installment') : "Installment",
    interest: t && typeof t === 'function' ? t('payments.statusOptions.interest') : "Interest",
    prepayment: t && typeof t === 'function' ? t('payments.statusOptions.prepayment') : "Prepayment",
    closed: t && typeof t === 'function' ? t('payments.statusOptions.closed') : "Closed",
    all: t && typeof t === 'function' ? t('filters.all') : "All",
  };

  const translated = translations[key];
  if (translated && typeof translated === 'string') return translated;

  // fallback: humanize (capitalize words)
  return key
    .split(/[_\-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};