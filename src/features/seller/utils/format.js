const LOCALE = "es-HN";

export const money = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return `L ${amount.toLocaleString(LOCALE, { maximumFractionDigits: 0 })}`;
};

export const formatDate = (value) => {
  if (!value) return "—";
  const raw = String(value);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "—";
  const dateOnly =
    /^\d{4}-\d{2}-\d{2}$/.test(raw) ||
    (date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0);
  return date.toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(dateOnly ? { timeZone: "UTC" } : {}),
  });
};

export const formatRate = (commission, amount) =>
  Number(amount || 0) > 0
    ? `${((Number(commission || 0) / Number(amount)) * 100).toFixed(1)}%`
    : "—";

// The API exposes next_payment as an object and, for backwards compatibility,
// as flat next_payment_* fields. Normalize both into one payment-shaped object.
export const nextPaymentOf = (row) => {
  if (!row) return null;
  if (row.next_payment) return row.next_payment;
  if (!row.next_payment_id && !row.next_payment_amount) return null;
  return {
    id: row.next_payment_id,
    amount: row.next_payment_amount,
    due_date: row.next_payment_date,
    payment_type: row.next_payment_type,
    label: row.next_payment_label,
    status: "pending",
    has_receipt: false,
  };
};

export const isPaymentOverdue = (payment) => {
  if (!payment) return false;
  if (payment.status === "overdue") return true;
  if (payment.status !== "pending" && payment.status !== "submitted") {
    return false;
  }
  if (!payment.due_date) return false;
  const due = new Date(payment.due_date);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Due dates are stored as date-only values and serialized at 00:00 UTC.
  // Compare the UTC calendar day so Honduras (UTC-6) does not show an
  // installment as overdue one day early.
  const dueDay = new Date(
    due.getUTCFullYear(),
    due.getUTCMonth(),
    due.getUTCDate()
  );
  return dueDay < today;
};

export const paymentTypeLabel = (payment, t) => {
  if (!payment) return t("seller.pendingInstallment");
  const type = String(payment.payment_type || "").toLowerCase();
  switch (type) {
    case "reservation":
      return t("seller.paymentTypes.reservation");
    case "down_payment":
      return t("seller.paymentTypes.downPayment");
    case "full":
      return t("seller.paymentTypes.full");
    case "advance":
    case "capital_repayment":
      return t("seller.paymentTypes.capitalRepayment");
    case "installment": {
      const match = String(payment.description || "").match(/cuota\s+(\d+)/i);
      if (match) {
        return t("seller.paymentTypes.installment", { number: match[1] });
      }
      return payment.label || t("seller.paymentTypes.installmentGeneric");
    }
    default:
      return payment.label || t("seller.pendingInstallment");
  }
};
