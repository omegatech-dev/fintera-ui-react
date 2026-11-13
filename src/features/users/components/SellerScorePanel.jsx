import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Button, Field, Input } from "@/shared/ui";
import { sellerApi } from "@/features/seller/api";
import ScoreBadge from "@/features/seller/components/ScoreBadge";
import { scoreLevel, scoreTone } from "@/features/seller/utils/score";
import {
  readSellerScore,
  scorePercent,
} from "@/features/seller/utils/scoreMetrics";

const TONE_TEXT = {
  success: "text-brand-strong",
  warning: "text-warning",
  danger: "text-danger",
};

function SellerScorePanel({ user, canEdit = false, onUpdated }) {
  const { t } = useLocale();
  const currentScore = readSellerScore(user);
  const [value, setValue] = useState(() =>
    String(scorePercent(currentScore))
  );
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const numericValue = Number(value);
  const valid =
    value !== "" && Number.isFinite(numericValue) &&
    numericValue >= 0 && numericValue <= 100;
  const tone = scoreTone(scoreLevel(valid ? numericValue : currentScore));
  const badgeValue =
    currentScore === null || currentScore === undefined || currentScore === ""
      ? numericValue === 100
        ? null
        : numericValue
      : numericValue;

  const levelText = useMemo(
    () => TONE_TEXT[tone] || TONE_TEXT.success,
    [tone]
  );

  const applyOverride = async () => {
    if (!canEdit || saving) return;
    setError(null);
    setSaved(false);

    if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 100) {
      setError(t("users.scoreInvalid"));
      return;
    }
    if (!reason.trim()) {
      setError(t("users.scoreReasonRequired"));
      return;
    }

    setSaving(true);
    try {
      const result = await sellerApi.overrideScore(user?.id, {
        score: numericValue,
        reason: reason.trim(),
      });
      const next =
        result?.user?.score ??
        result?.score ??
        result?.seller?.score ??
        numericValue;
      setValue(String(scorePercent(next)));
      setReason("");
      setSaved(true);
      onUpdated?.(next);
    } catch (err) {
      setError(err?.message || t("users.scoreSaveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
          {t("users.scoreTitle")}
        </p>
        <ScoreBadge value={badgeValue} showNew />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative w-24">
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setSaved(false);
              setError(null);
            }}
            disabled={!canEdit || saving}
            aria-label={t("users.scoreValue")}
            className={`h-10 pr-7 text-right font-semibold tabular-nums ${
              levelText
            }`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-micro text-ink-3">
            %
          </span>
        </div>
        <span className="text-micro text-ink-3">
          {t("users.scoreAdminOnly")}
        </span>
      </div>

      <p className="mt-2 text-micro leading-relaxed text-ink-3">
        {t("users.scoreHint")}
      </p>

      {canEdit && (
        <div className="mt-3 space-y-3">
          <Field label={t("users.scoreReason")}>
            <Input
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setSaved(false);
                setError(null);
              }}
              placeholder={t("users.scoreReasonPlaceholder")}
              disabled={saving}
            />
          </Field>

          <Button
            type="button"
            size="sm"
            onClick={applyOverride}
            loading={saving}
            disabled={saving || !valid}
          >
            {t("users.scoreApply")}
          </Button>

          {error && (
            <p role="alert" className="text-micro text-danger">
              {error}
            </p>
          )}
          {saved && !error && (
            <p role="status" className="text-micro font-semibold text-brand-strong">
              {t("users.scoreSaved")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

SellerScorePanel.propTypes = {
  user: PropTypes.object,
  canEdit: PropTypes.bool,
  onUpdated: PropTypes.func,
};

export default SellerScorePanel;
