export const NEW_SELLER_SCORE = 100;

const normalize = (value) => {
  if (value === null || value === undefined || value === "") {
    return NEW_SELLER_SCORE;
  }
  const score = Number(value);
  return Number.isNaN(score) ? NEW_SELLER_SCORE : score;
};

export const isNewSellerScore = (value) =>
  value === null || value === undefined || value === "";

export const scoreLevel = (value) => {
  const score = normalize(value);
  if (score >= 85) return "high";
  if (score >= 60) return "medium";
  return "low";
};

export const scoreTone = (level) => {
  if (level === "high") return "success";
  if (level === "medium") return "warning";
  return "danger";
};

export const scoreLabel = (t, value) =>
  isNewSellerScore(value) ? t("score.new") : t(`score.${scoreLevel(value)}`);
