export const AUDIT_MODELS = [
  "Contract",
  "Lot",
  "User",
  "Project",
  "Payment",
  "ProjectPhoto",
  "LotPhoto",
  "ProjectDrawing",
  "PaymentInstruction",
  "GeneralSettings",
  "Branding",
  "Notification",
];

const humanize = (value) =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatAuditModel = (model, t) => {
  if (!model) return "";
  const key = `audits.models.${model}`;
  const translated = typeof t === "function" ? t(key) : key;
  return translated === key ? humanize(model) : translated;
};

export const formatAuditEvent = (event, t) => {
  if (!event) return "";
  const key = `audits.events.${String(event).toLowerCase()}`;
  const translated = typeof t === "function" ? t(key) : key;
  return translated === key ? humanize(event) : translated;
};
