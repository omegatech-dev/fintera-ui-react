import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Chip } from "@/shared/ui";

const ORIGIN_TONES = {
  referral: "info",
  direct: "success",
  historical: "neutral",
};

function OriginChip({ origin }) {
  const { t } = useLocale();
  const key = String(origin || "").toLowerCase();

  if (!ORIGIN_TONES[key]) {
    return <span className="text-ink-3">—</span>;
  }

  return <Chip tone={ORIGIN_TONES[key]}>{t(`origin.${key}`)}</Chip>;
}

OriginChip.propTypes = {
  origin: PropTypes.string,
};

export default OriginChip;
