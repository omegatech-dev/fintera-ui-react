const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const amountOf = (credit) =>
  Number(
    firstDefined(
      credit?.amount,
      credit?.credit_amount,
      credit?.commission_amount,
      credit?.commission,
      0
    )
  );

const sellerOf = (credit) =>
  firstDefined(
    credit?.seller,
    credit?.seller_name,
    credit?.seller?.full_name,
    credit?.seller?.name,
    credit?.user?.full_name
  );

const contractOf = (credit) =>
  firstDefined(
    credit?.contract_id,
    credit?.contract?.id,
    credit?.contract?.contract_id
  );

const contractGuidOf = (credit) =>
  firstDefined(credit?.contract_guid, credit?.contract?.guid);

const creditIdOf = (credit) =>
  firstDefined(credit?.id, credit?.credit_id, credit?.credit?.id);

const statusOf = (credit) => {
  const status = String(
    firstDefined(credit?.status, credit?.state) ?? ""
  )
    .trim()
    .toLowerCase();
  if (status) return status;
  return credit?.settled_at ? "settled" : "pending";
};

export const normalizeCredit = (credit = {}) => ({
  ...credit,
  id: creditIdOf(credit),
  amount: amountOf(credit),
  seller: sellerOf(credit),
  contract_id: contractOf(credit),
  contract_guid: contractGuidOf(credit),
  status: statusOf(credit),
  created_at: firstDefined(credit?.created_at, credit?.date) || null,
  settled_at: credit?.settled_at || null,
});

export const readCommissionCredits = (data) => {
  const raw = firstDefined(
    data?.credits,
    data?.commission_credits,
    data?.seller_commission_credits
  );

  const entries = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? Object.entries(raw).map(([seller, value]) =>
          Array.isArray(value)
            ? { seller, credits: value }
            : { seller, ...(value || {}) }
        )
      : [];

  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];

    const nested = firstDefined(entry?.credits, entry?.items);
    if (Array.isArray(nested)) {
      const seller = sellerOf(entry);
      return nested.map((credit) =>
        normalizeCredit({
          seller: sellerOf(credit) || seller,
          ...credit,
        })
      );
    }

    return [normalizeCredit(entry)];
  });
};

export const creditStatusOf = (credit) => statusOf(credit);

export const isPendingCredit = (credit) => statusOf(credit) !== "settled";

export const summarizeCredits = (credits = []) =>
  credits.reduce(
    (acc, credit) => {
      const amount = Number(credit?.amount || 0);
      acc.total += amount;
      acc.count += 1;
      if (isPendingCredit(credit)) {
        acc.pending += amount;
      } else {
        acc.settled += amount;
      }
      return acc;
    },
    { total: 0, pending: 0, settled: 0, count: 0 }
  );

export const netPayable = (pendingCommissions, pendingCredits) =>
  Number(pendingCommissions || 0) - Number(pendingCredits || 0);
