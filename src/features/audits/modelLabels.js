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

const ACTION_ALIASES = {
  created: "create",
  updated: "update",
  deleted: "destroy",
  destroy: "destroy",
  approved: "approve",
  rejected: "reject",
  cancelled: "cancel",
  canceled: "cancel",
  closed: "close",
};

const humanize = (value) =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const translate = (key, t) => {
  const translated = typeof t === "function" ? t(key) : key;
  return translated === key ? null : translated;
};

export const formatAuditModel = (model, t) => {
  if (!model) return "";
  const key = `audits.models.${model}`;
  return translate(key, t) ?? humanize(model);
};

export const formatAuditEvent = (event, t) => {
  if (!event) return "";
  const key = `audits.events.${String(event).toLowerCase()}`;
  return translate(key, t) ?? humanize(event);
};

export const normalizeAuditAction = (action) => {
  const value = String(action || "").toLowerCase();
  return ACTION_ALIASES[value] ?? value;
};

export const formatAuditActionPast = (action, t) => {
  if (!action) return "";
  const normalized = normalizeAuditAction(action);
  return translate(`audits.past.${normalized}`, t) ?? formatAuditEvent(action, t);
};

export const formatAuditEntityPhrase = (model, t) => {
  if (!model) return "";
  return translate(`audits.entityPhrases.${model}`, t) ?? formatAuditModel(model, t);
};
