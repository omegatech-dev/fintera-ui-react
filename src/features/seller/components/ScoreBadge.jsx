import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Chip } from "@/shared/ui";
import { isNewSellerScore, scoreLevel, scoreTone } from "../utils/score";
import { scorePercent } from "../utils/scoreMetrics";

const DOT_TONES = {
  success: "bg-brand",
  warning: "bg-warning",
  danger: "bg-danger",
};

function ScoreBadge({ value, showNew = false, className = "" }) {
  const { t } = useLocale();
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    !Number.isNaN(Number(value));

  if (!hasValue && !showNew) return null;

  const level = scoreLevel(value);
  const tone = scoreTone(level);
  const label = isNewSellerScore(value)
    ? t("score.new")
    : `${scorePercent(value)}%`;

  return (
    <Chip
      tone={tone}
      className={`shrink-0 gap-1.5 tabular-nums ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-[5px] w-[5px] rounded-full ${DOT_TONES[tone]}`}
      />
      {label}
    </Chip>
  );
}

ScoreBadge.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showNew: PropTypes.bool,
  className: PropTypes.string,
};

export default ScoreBadge;
