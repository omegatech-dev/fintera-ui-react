import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { Button, Chip, Skeleton } from "@/shared/ui";
import { formatCurrency, formatLargeNumber } from "@/shared/utils/formatters";
import ReferralMetrics from "./ReferralMetrics";
import {
  copyToClipboard,
  displayReferralUrl,
  referralMetrics,
  referralQrUrl,
  referralUrl,
  shareOrPrint,
} from "../utils/referral";

function CopyIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V5a2 2 0 012-2h9a2 2 0 012 2v9a2 2 0 01-2 2h-2M5 8h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2z"
      />
    </svg>
  );
}

function ShareIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.6 13.5l6.8 3.8M15.4 6.7L8.6 10.5M18 3a3 3 0 110 6 3 3 0 010-6zM6 9a3 3 0 110 6 3 3 0 010-6zm12 6a3 3 0 110 6 3 3 0 010-6z"
      />
    </svg>
  );
}

function SellerReferralCard({ referral, loading = false, error = false, onRetry }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => referralUrl(referral), [referral]);
  const displayUrl = useMemo(() => displayReferralUrl(url), [url]);
  const qrSrc = useMemo(() => referralQrUrl(referral, url), [referral, url]);
  const metrics = useMemo(() => referralMetrics(referral), [referral]);

  const metricItems = useMemo(
    () => [
      {
        key: "visits",
        label: t("sellerDashboard.referralVisits"),
        value: formatLargeNumber(metrics.visits),
      },
      {
        key: "reservations",
        label: t("sellerDashboard.referralReservations"),
        value: formatLargeNumber(metrics.reservations),
      },
      {
        key: "commission",
        label: t("sellerDashboard.referralCommission"),
        value: formatCurrency(metrics.commission),
        tone: "brand",
      },
    ],
    [metrics, t]
  );

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (!success) {
      showToast(t("sellerReferrals.copyError"), "error");
      return;
    }
    setCopied(true);
    showToast(t("common.copiedToClipboard"));
  };

  const handleShare = async () => {
    await shareOrPrint({ title: t("sellerDashboard.referralTitle"), url });
  };

  return (
    <section
      aria-labelledby="seller-referral-title"
      className="motion-fade-up rounded-card border border-line bg-surface p-5 [animation-delay:270ms]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="seller-referral-title"
              className="text-title font-bold text-ink"
            >
              {t("sellerDashboard.referralTitle")}
            </h2>
            {!error && referral && (
              <Chip tone="success">{t("sellerReferrals.active")}</Chip>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-label text-ink-3">
            {t("sellerDashboard.referralDescription")}
          </p>
        </div>
        <Link
          to="/vendedor/enlace"
          className="shrink-0 text-label font-semibold text-brand hover:underline"
        >
          {t("sellerDashboard.referralViewAll")} →
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px]">
          <Skeleton rows={4} />
          <div className="hidden lg:block">
            <Skeleton rows={3} />
          </div>
        </div>
      ) : error ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-control bg-surface-2 px-3 py-2">
          <p className="text-label text-ink-2">
            {t("sellerReferrals.loadErrorDescription")}
          </p>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px]">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-col gap-2 rounded-control bg-surface-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="truncate text-label font-semibold text-ink">
                {displayUrl || t("sellerReferrals.linkUnavailable")}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                disabled={!url}
                className="self-start sm:self-auto"
              >
                <CopyIcon />
                {copied
                  ? t("sellerReferrals.copied")
                  : t("sellerReferrals.copy")}
              </Button>
            </div>
            <ReferralMetrics items={metricItems} />
          </div>

          <div className="flex flex-col items-center gap-2 border-t border-line pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            {qrSrc ? (
              <img
                src={qrSrc}
                alt={t("sellerReferrals.qrAlt", {
                  name: referral?.seller_name || t("sellerReferrals.title"),
                })}
                width={192}
                height={192}
                loading="lazy"
                className="h-[96px] w-[96px] rounded-control border border-line bg-white p-1"
              />
            ) : null}
            <p className="text-micro text-ink-3">
              {t("sellerReferrals.qrCaption")}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              disabled={!url}
            >
              <ShareIcon />
              {t("sellerDashboard.referralShare")}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

SellerReferralCard.propTypes = {
  referral: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  onRetry: PropTypes.func,
};

export default SellerReferralCard;
