const startOfDay = (value) => {
  // Due dates are calendar dates (YYYY-MM-DD). Parsing them as UTC would shift
  // them to the previous day in western timezones, so keep the date prefix.
  const match =
    typeof value === "string" ? value.match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getWeekRange = (reference = new Date()) => {
  const day = new Date(reference);
  day.setHours(0, 0, 0, 0);
  const offset = (day.getDay() + 6) % 7;
  const start = new Date(day);
  start.setDate(day.getDate() - offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const toDateParam = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const paymentDueWithin = (payment, range) => {
  const due = startOfDay(payment?.due_date);
  if (!due) return false;
  return due >= range.start && due <= range.end;
};

export { startOfDay };
