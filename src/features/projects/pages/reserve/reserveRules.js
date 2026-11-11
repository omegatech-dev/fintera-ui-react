export const validateReserveAmount = (value, minimum, t, currency) => {
  const amount = Number(value);
  if (!value || !Number.isFinite(amount) || amount <= 0) {
    return t("reservations.reserveAmountRequired");
  }
  if (minimum > 0 && amount < minimum) {
    return t("reservations.minReserveAmount", {
      amount: minimum,
      currency,
    });
  }
  return "";
};
