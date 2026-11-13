import { NEW_SELLER_SCORE, isNewSellerScore } from "./score";

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null);

export const readSellerScore = (source) => {
  if (!source) return null;
  const value = firstDefined(
    source.score,
    source.acceptance_score,
    source.seller_score,
    source.seller?.score
  );
  return value === undefined ? null : value;
};

export const readSellerScoreMetrics = (source) => {
  const metrics =
    source?.score_metrics ||
    source?.acceptance_metrics ||
    source?.seller?.score_metrics ||
    {};
  const accepted = Number(
    firstDefined(
      metrics.accepted_count,
      source?.accepted_assignments,
      source?.accepted_count
    ) || 0
  );
  const expired = Number(
    firstDefined(
      metrics.expired_count,
      source?.expired_assignments,
      source?.expired_count
    ) || 0
  );
  const windowDays = Number(
    firstDefined(metrics.window_days, source?.score_window_days) || 90
  );
  return {
    accepted,
    expired,
    total: accepted + expired,
    windowDays,
    isNew: accepted + expired === 0,
  };
};

export const scorePercent = (value) => {
  if (isNewSellerScore(value)) return NEW_SELLER_SCORE;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? NEW_SELLER_SCORE : Math.round(numeric);
};

export const readScoreOverride = (source) => {
  if (!source) return null;
  const by = firstDefined(
    source.score_override_by_name,
    source.score_override_by,
    source.score_updated_by,
    source.score_override?.by
  );
  const at = firstDefined(
    source.score_override_at,
    source.score_override_date,
    source.score_updated_at,
    source.score_override?.at
  );
  const reason = firstDefined(
    source.score_override_reason,
    source.score_override?.reason
  );
  const name =
    by && typeof by === "object"
      ? firstDefined(by.full_name, by.name)
      : typeof by === "string"
        ? by
        : null;
  if (!name && !at && !reason) return null;
  return { name: name || null, at: at || null, reason: reason || null };
};
