export const DEFAULT_RULES = {
  defaultRate: "5.0",
  paymentRule: "contract_approval",
  acceptanceWindow: "2",
  unassignedRate: "3.0",
};

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const asText = (value, fallback) => {
  const found = firstDefined(value);
  if (found === undefined) return fallback;
  const numeric = Number(found);
  return Number.isNaN(numeric) ? String(found) : String(numeric);
};

const unwrap = (data, keys = []) => {
  if (!data) return {};
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (data[key] !== undefined) return data[key];
  }
  return data.data ?? data;
};

export const normalizeRules = (data) => {
  const rules = unwrap(data, ["rules", "commission_rules"]) || {};
  return {
    defaultRate: asText(
      firstDefined(
        rules.default_rate,
        rules.defaultRate,
        rules.commission_rate,
        rules.rate
      ),
      DEFAULT_RULES.defaultRate
    ),
    paymentRule:
      String(
        firstDefined(rules.payment_rule, rules.paymentRule) ||
          DEFAULT_RULES.paymentRule
      ) === "contract_approval"
        ? "contract_approval"
        : DEFAULT_RULES.paymentRule,
    acceptanceWindow: asText(
      firstDefined(
        rules.acceptance_window_hours,
        rules.acceptance_window,
        rules.assignment_window_hours,
        rules.acceptanceWindowHours
      ),
      DEFAULT_RULES.acceptanceWindow
    ),
    unassignedRate: asText(
      firstDefined(
        rules.unassigned_rate,
        rules.unassignedRate,
        rules.no_seller_rate
      ),
      DEFAULT_RULES.unassignedRate
    ),
  };
};

export const normalizeExceptions = (data) => {
  const list = unwrap(data, ["exceptions", "commission_exceptions"]);
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      const sellerId =
        item.seller_id ?? item.user_id ?? item.seller?.id ?? null;
      const sellerName =
        item.seller_name ??
        item.seller?.full_name ??
        item.seller?.name ??
        item.name ??
        "";
      const rate = Number(
        firstDefined(item.rate, item.commission_rate, item.percentage) || 0
      );
      return { id: item.id ?? null, sellerId, sellerName, rate };
    })
    .filter((item) => item.sellerId !== null || item.sellerName !== "");
};

export const normalizeSellers = (data) => {
  const list = unwrap(data, ["sellers", "users"]);
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      sellerId: item.id ?? item.seller_id ?? item.user_id ?? null,
      sellerName: item.full_name ?? item.name ?? item.seller_name ?? "",
    }))
    .filter((item) => item.sellerId !== null && item.sellerName);
};

const sameSeller = (row, seller) => {
  if (
    row.sellerId !== null &&
    row.sellerId !== undefined &&
    seller.sellerId !== null &&
    seller.sellerId !== undefined
  ) {
    return String(row.sellerId) === String(seller.sellerId);
  }
  return Boolean(
    row.sellerName &&
      seller.sellerName &&
      row.sellerName.trim().toLowerCase() ===
        seller.sellerName.trim().toLowerCase()
  );
};

export const buildSellerRows = ({
  sellers = [],
  exceptions = [],
  propSellers = [],
  defaultRate,
}) => {
  const pool = [
    ...sellers.map((seller) => ({ ...seller, rate: undefined, id: undefined })),
    ...exceptions.map((exception) => ({
      sellerId: exception.sellerId,
      sellerName: exception.sellerName,
      rate: exception.rate,
      id: exception.id,
    })),
    ...propSellers.map((name) => ({ sellerId: null, sellerName: name })),
  ].filter((seller) => seller.sellerId !== null || seller.sellerName);

  const rows = [];

  pool.forEach((seller) => {
    const existing = rows.find((row) => sameSeller(row, seller));
    if (!existing) {
      rows.push({
        key: `seller-${rows.length}`,
        sellerId: seller.sellerId ?? null,
        sellerName: seller.sellerName || "",
        exceptionId: seller.id ?? null,
        rate: String(
          seller.rate !== undefined
            ? seller.rate
            : Number(defaultRate || 0)
        ),
      });
      return;
    }

    if (existing.sellerId === null && seller.sellerId !== null) {
      existing.sellerId = seller.sellerId;
    }
    if (!existing.sellerName && seller.sellerName) {
      existing.sellerName = seller.sellerName;
    }
    if (seller.id !== undefined && seller.id !== null) {
      existing.exceptionId = seller.id;
      existing.rate = String(seller.rate);
    }
  });

  return rows;
};

export const buildRulesPayload = (rules) => ({
  default_rate: Number(rules.defaultRate || 0),
  payment_rule: rules.paymentRule || DEFAULT_RULES.paymentRule,
  acceptance_window_hours: Number(rules.acceptanceWindow || 0),
  unassigned_rate: Number(rules.unassignedRate || 0),
});

export const buildExceptionChanges = (rows = [], defaultRate) => {
  const target = Number(defaultRate);
  const upserts = [];
  const deletes = [];

  rows.forEach((row) => {
    if (row.sellerId === null || row.sellerId === undefined) return;
    const rate = Number(row.rate);
    if (Number.isNaN(rate)) return;
    if (rate === target) {
      if (row.exceptionId !== null && row.exceptionId !== undefined) {
        deletes.push(row.exceptionId);
      }
      return;
    }
    upserts.push({ seller_id: row.sellerId, rate });
  });

  return { upserts, deletes };
};
