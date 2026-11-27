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

const applicationsOf = (credit) =>
  (Array.isArray(credit?.applications) ? credit.applications : []).map(
    (application) => ({
      ...application,
      amount: Number(application?.amount || 0),
      applied_contract_id: firstDefined(
        application?.applied_contract_id,
        application?.contract_id
      ),
      applied_contract_guid: firstDefined(
        application?.applied_contract_guid,
        application?.contract_guid
      ),
    })
  );

const statusOf = (credit) => {
  const status = String(
    firstDefined(credit?.status, credit?.state) ?? ""
  )
    .trim()
    .toLowerCase();
  if (status) return status;
  return credit?.settled_at ? "settled" : "pending";
};

export const normalizeCredit = (credit = {}) => {
  const amount = amountOf(credit);
  const status = statusOf(credit);
  const appliedAmount = Number(
    firstDefined(credit?.applied_amount, status === "settled" ? amount : 0)
  );
  const remainingAmount = Number(
    firstDefined(credit?.remaining_amount, amount - appliedAmount)
  );
  const applications = applicationsOf(credit);

  return {
    ...credit,
    id: creditIdOf(credit),
    amount,
    applied_amount: appliedAmount,
    remaining_amount: remainingAmount,
    source: firstDefined(credit?.source, "legacy"),
    applications_total: Number(
      firstDefined(credit?.applications_total, applications.length)
    ),
    applications,
    seller: sellerOf(credit),
    contract_id: contractOf(credit),
    contract_guid: contractGuidOf(credit),
    status,
    created_at: firstDefined(credit?.created_at, credit?.date) || null,
    settled_at: credit?.settled_at || null,
  };
};

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
        acc.pending += Number(
          firstDefined(credit?.remaining_amount, amount)
        );
      } else {
        acc.settled += Number(
          firstDefined(credit?.applied_amount, amount)
        );
      }
      return acc;
    },
    { total: 0, pending: 0, settled: 0, count: 0 }
  );
