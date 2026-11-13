import { CUSTOMER_PORTAL_URL } from "@config";

const REFERRAL_PATH = "r";

const firstValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
};

const firstNumber = (source, keys) => {
  const value = firstValue(source, keys);
  if (value === null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const withProtocol = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const trimTrailingSlashes = (value) =>
  String(value ?? "").trim().replace(/\/+$/, "");

const trimLeadingSlashes = (value) =>
  String(value ?? "").trim().replace(/^\/+/, "");

export const normalizeReferral = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload.referral && typeof payload.referral === "object") {
    return payload.referral;
  }
  return payload;
};

export const referralCode = (referral) =>
  firstValue(referral, ["referral_guid", "guid", "slug", "referral_slug"]);

export const referralUrl = (referral) => {
  const code = referralCode(referral);
  if (code) {
    const raw = String(code).trim();
    if (/^https?:\/\//i.test(raw)) return trimTrailingSlashes(raw);
    const base = trimTrailingSlashes(CUSTOMER_PORTAL_URL);
    if (base) {
      return `${base}/${REFERRAL_PATH}/${trimLeadingSlashes(raw)}`;
    }
  }

  const direct = firstValue(referral, [
    "url",
    "public_url",
    "referral_url",
    "link",
  ]);
  if (direct) return trimTrailingSlashes(withProtocol(direct));

  return "";
};

export const displayReferralUrl = (url) =>
  String(url || "")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

export const referralMetrics = (referral) => {
  const visits = firstNumber(referral, [
    "visits",
    "visits_count",
    "total_visits",
  ]);
  const reservations =
    firstNumber(referral, [
      "attributed_reservations",
      "reservations_count",
      "attributed_reservations_count",
    ]) ??
    (typeof referral?.reservations === "number"
      ? referral.reservations
      : null);
  const commission =
    firstNumber(referral, [
      "generated_commission",
      "commission_generated",
      "commission_amount",
    ]) ?? (typeof referral?.commission === "number" ? referral.commission : null);
  const explicitConversion = firstNumber(referral, [
    "conversion_rate",
    "conversion",
    "conversion_percent",
  ]);

  const safeVisits = visits ?? 0;
  const safeReservations = reservations ?? 0;
  const computedConversion =
    safeVisits > 0 ? (safeReservations / safeVisits) * 100 : 0;
  const conversion = Math.min(
    100,
    Math.max(0, explicitConversion ?? computedConversion)
  );

  return {
    visits: safeVisits,
    reservations: safeReservations,
    conversion,
    commission: commission ?? 0,
  };
};

export const referralQrUrl = (referral, url) => {
  const provided = firstValue(referral, ["qr_url", "qr_code_url", "qr"]);
  if (provided && typeof provided === "string") return withProtocol(provided);
  if (!url) return "";
  const target = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=0&data=${target}`;
};

export const referralReservations = (payload) => {
  if (Array.isArray(payload)) return payload;
  const nested = payload?.data;
  const list =
    payload?.reservations ??
    (Array.isArray(nested) ? nested : nested?.reservations) ??
    payload?.items;
  return Array.isArray(list) ? list : [];
};

const textValue = (value) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  return "";
};

export const reservationClientName = (row) =>
  textValue(row?.client_name) ||
  textValue(row?.customer_name) ||
  textValue(row?.client?.full_name) ||
  textValue(row?.client?.name) ||
  textValue(row?.customer?.name) ||
  textValue(row?.name);

const reservationLot = (row) => {
  const value =
    row?.lot_label ??
    (typeof row?.lot === "string" ? row.lot : row?.lot?.label) ??
    row?.lot?.name ??
    row?.lot_number;
  return textValue(value);
};

const reservationProject = (row) => {
  const value =
    row?.project_name ??
    (typeof row?.project === "string" ? row.project : row?.project?.name);
  return textValue(value);
};

export const reservationLotProject = (row) =>
  [reservationLot(row), reservationProject(row)].filter(Boolean).join(" · ");

export const reservationAmount = (row) =>
  firstNumber(row, [
    "amount",
    "sale_price",
    "total_amount",
    "price",
    "lot_price",
  ]) ?? 0;

export const reservationCommission = (row) =>
  firstNumber(row, [
    "commission",
    "commission_amount",
    "seller_commission",
  ]) ?? 0;

export const reservationDate = (row) =>
  firstValue(row, [
    "date",
    "reservation_date",
    "created_at",
    "sold_at",
  ]);

export const reservationStatus = (row) =>
  String(
    firstValue(row, ["status", "reservation_status", "assignment_status"]) ??
      ""
  ).trim();

export const reservationStatusKey = (row) => {
  const status = reservationStatus(row);
  return status ? status.toLowerCase().replace(/\s+/g, "_") : "";
};

const STATUS_TONES = {
  approved: "success",
  accepted: "success",
  closed: "success",
  paid: "success",
  signed: "success",
  pending: "warning",
  in_review: "info",
  under_review: "info",
  submitted: "info",
  in_process: "info",
  expired: "danger",
  rejected: "danger",
  cancelled: "danger",
  canceled: "danger",
};

export const reservationStatusTone = (row) =>
  STATUS_TONES[reservationStatusKey(row)] || "neutral";

export const reservationStatusTranslationKey = (row) => {
  const key = reservationStatusKey(row);
  return STATUS_TONES[key] ? `sellerReferrals.status.${key}` : "";
};

export const copyToClipboard = async (value) => {
  if (!value) return false;
  try {
    if (!navigator?.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};

export const shareOrPrint = async ({ title, url }) => {
  if (navigator?.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  if (typeof window?.print === "function") {
    window.print();
    return "printed";
  }
  return "unavailable";
};
