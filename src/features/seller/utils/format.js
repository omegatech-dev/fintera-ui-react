const LOCALE = "es-HN";

export const money = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return `L ${amount.toLocaleString(LOCALE, { maximumFractionDigits: 0 })}`;
};

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatRate = (commission, amount) =>
  Number(amount || 0) > 0
    ? `${((Number(commission || 0) / Number(amount)) * 100).toFixed(1)}%`
    : "—";
