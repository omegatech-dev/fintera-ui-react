import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Skeleton,
  Table,
} from "@/shared/ui";
import {
  formatCurrency,
  formatDate,
  formatLargeNumber,
} from "@/shared/utils/formatters";
import { formatStatus } from "@/shared/utils/formatStatus";
import { sellerApi } from "../../api";
import ReferralMetrics from "../../components/ReferralMetrics";
import {
  copyToClipboard,
  displayReferralUrl,
  normalizeReferral,
  referralCode,
  referralMetrics,
  referralQrUrl,
  referralReservations,
  referralUrl,
  reservationAmount,
  reservationClientName,
  reservationCommission,
  reservationDate,
  reservationLotProject,
  reservationStatus,
  reservationStatusTone,
  reservationStatusTranslationKey,
  shareOrPrint,
} from "../../utils/referral";

const STEPS = [
  { key: "share", title: "steps.share.title", description: "steps.share.description" },
  {
    key: "reserve",
    title: "steps.reserve.title",
    description: "steps.reserve.description",
  },
  {
    key: "assign",
    title: "steps.assign.title",
    description: "steps.assign.description",
  },
];

const RULES = [
  "rules.closedSales",
  "rules.releasedOnApproval",
  "rules.linkOnly",
  "rules.unlimited",
];

function LinkIcon({ className = "h-4 w-4" }) {
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
        d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5"
      />
    </svg>
  );
}

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

function CheckIcon({ className = "h-4 w-4" }) {
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }) {
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
        d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
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

function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12.04 2a9.9 9.9 0 00-8.4 15.14L2 22l4.98-1.6A9.9 9.9 0 1012.04 2zm0 1.8a8.1 8.1 0 016.86 12.4l-.2.32.8 2.92-3-.8-.32.2A8.1 8.1 0 1112.04 3.8zm-3.7 4.1c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.1 2.81.14.18 1.87 2.98 4.62 4.05 2.28.9 2.75.72 3.24.67.5-.04 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.5z" />
    </svg>
  );
}

function readRate(referral) {
  const value = Number(
    referral?.commission_rate ?? referral?.rate ?? referral?.default_rate
  );
  if (!Number.isFinite(value) || value <= 0) return "5";
  const percent = value <= 1 ? value * 100 : value;
  return String(Number(percent.toFixed(2)));
}

function SellerReferralPage() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [referral, setReferral] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loadingReferral, setLoadingReferral] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [referralError, setReferralError] = useState(false);
  const [reservationsError, setReservationsError] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadReferral = useCallback(async () => {
    setLoadingReferral(true);
    setReferralError(false);
    try {
      const data = await sellerApi.getReferral();
      setReferral(normalizeReferral(data));
    } catch {
      setReferralError(true);
    } finally {
      setLoadingReferral(false);
    }
  }, []);

  const loadReservations = useCallback(async () => {
    setLoadingReservations(true);
    setReservationsError(false);
    try {
      const data = await sellerApi.getReferralReservations();
      setReservations(referralReservations(data));
    } catch {
      setReservationsError(true);
    } finally {
      setLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    loadReferral();
    loadReservations();
  }, [loadReferral, loadReservations]);

  const url = useMemo(() => referralUrl(referral), [referral]);
  const displayUrl = useMemo(() => displayReferralUrl(url), [url]);
  const qrSrc = useMemo(() => referralQrUrl(referral, url), [referral, url]);
  const metrics = useMemo(() => referralMetrics(referral), [referral]);
  const rate = readRate(referral);

  const metricItems = useMemo(
    () => [
      {
        key: "visits",
        label: t("sellerReferrals.metrics.visits"),
        value: formatLargeNumber(metrics.visits),
      },
      {
        key: "reservations",
        label: t("sellerReferrals.metrics.reservations"),
        value: formatLargeNumber(metrics.reservations),
      },
      {
        key: "conversion",
        label: t("sellerReferrals.metrics.conversion"),
        value: `${metrics.conversion.toFixed(1)}%`,
      },
      {
        key: "commission",
        label: t("sellerReferrals.metrics.commission"),
        value: formatCurrency(metrics.commission),
        tone: "brand",
      },
    ],
    [metrics, t]
  );

  const rows = useMemo(
    () =>
      reservations.map((row, index) => ({
        ...row,
        __key: row?.id ?? row?.guid ?? row?.reservation_id ?? `row-${index}`,
      })),
    [reservations]
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

  const handleDownloadQr = () => {
    if (!qrSrc) return;
    const link = document.createElement("a");
    link.href = qrSrc;
    link.download = `fintera-qr-${referralCode(referral) || "referido"}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleShare = async () => {
    if (!url) return;
    await shareOrPrint({
      title: t("sellerReferrals.title"),
      url,
    });
  };

  const statusLabel = (row) => {
    const status = reservationStatus(row);
    if (!status) return t("common.notAvailable");
    const key = reservationStatusTranslationKey(row);
    return key ? t(key) : formatStatus(status, t);
  };

  const columns = [
    {
      key: "client",
      header: t("sellerReferrals.columns.client"),
      render: (row) => (
        <span className="font-semibold text-ink">
          {reservationClientName(row) || t("common.notAvailable")}
        </span>
      ),
    },
    {
      key: "lotProject",
      header: t("sellerReferrals.columns.lotProject"),
      render: (row) =>
        reservationLotProject(row) || t("common.notAvailable"),
    },
    {
      key: "amount",
      header: t("sellerReferrals.columns.amount"),
      align: "right",
      render: (row) => (
        <span className="font-semibold tabular-nums text-ink">
          {formatCurrency(reservationAmount(row))}
        </span>
      ),
    },
    {
      key: "commission",
      header: t("sellerReferrals.columns.commission"),
      align: "right",
      render: (row) => (
        <span className="font-semibold tabular-nums text-brand-strong">
          {formatCurrency(reservationCommission(row))}
        </span>
      ),
    },
    {
      key: "status",
      header: t("sellerReferrals.columns.status"),
      render: (row) => {
        const status = reservationStatus(row);
        if (!status) return t("common.notAvailable");
        return (
          <Chip tone={reservationStatusTone(row)} className="h-5 px-1.5">
            {statusLabel(row)}
          </Chip>
        );
      },
    },
    {
      key: "date",
      header: t("sellerReferrals.columns.date"),
      align: "right",
      render: (row) => (
        <span className="text-ink-3">{formatDate(reservationDate(row))}</span>
      ),
    },
  ];

  const mobileCard = (row) => (
    <div className="mx-5 mb-2 rounded-card border border-line bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-ink">
            {reservationClientName(row) || t("common.notAvailable")}
          </p>
          <p className="mt-0.5 truncate text-micro text-ink-3">
            {reservationLotProject(row) || t("common.notAvailable")}
          </p>
        </div>
        <Chip tone={reservationStatusTone(row)} className="h-5 shrink-0 px-1.5">
          {statusLabel(row)}
        </Chip>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div>
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("sellerReferrals.columns.amount")}
          </p>
          <p className="mt-0.5 text-label font-semibold tabular-nums text-ink">
            {formatCurrency(reservationAmount(row))}
          </p>
        </div>
        <div>
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("sellerReferrals.columns.commission")}
          </p>
          <p className="mt-0.5 text-label font-semibold tabular-nums text-brand-strong">
            {formatCurrency(reservationCommission(row))}
          </p>
        </div>
        <div>
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("sellerReferrals.columns.date")}
          </p>
          <p className="mt-0.5 text-label text-ink-3">
            {formatDate(reservationDate(row))}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-4 pb-6 sm:px-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-page font-bold tracking-tight text-ink">
              {t("sellerReferrals.title")}
            </h1>
            <p className="mt-1 max-w-2xl text-body text-ink-3">
              {t("sellerReferrals.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              disabled={!url}
            >
              <CopyIcon />
              {t("sellerReferrals.copyLink")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadQr}
              disabled={!qrSrc}
            >
              <DownloadIcon />
              {t("sellerReferrals.downloadQr")}
            </Button>
          </div>
        </header>

        {loadingReferral && (
          <span role="status" className="sr-only">
            {t("common.loading")}
          </span>
        )}

        {referralError ? (
          <ErrorState
            title={t("sellerReferrals.loadErrorTitle")}
            description={t("sellerReferrals.loadErrorDescription")}
            onRetry={loadReferral}
          />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                    {t("sellerReferrals.publicLabel")}
                  </p>
                  {referral && (
                    <Chip tone="success">{t("sellerReferrals.active")}</Chip>
                  )}
                </div>

                {loadingReferral ? (
                  <div className="mt-4">
                    <Skeleton rows={4} />
                  </div>
                ) : (
                  <>
                    <p className="mt-2 break-all text-[24px] font-bold leading-tight text-ink">
                      {displayUrl || t("sellerReferrals.linkUnavailable")}
                    </p>
                    <p className="mt-1 text-label text-ink-3">
                      {t("sellerReferrals.linkDescription", { rate })}
                    </p>

                    <div className="mt-3 flex flex-col gap-2 rounded-control bg-surface-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <LinkIcon className="h-4 w-4 shrink-0 text-brand" />
                        <p className="truncate text-label font-semibold text-ink">
                          {displayUrl || t("common.notAvailable")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCopy}
                          disabled={!url}
                        >
                          <CopyIcon />
                          {copied
                            ? t("sellerReferrals.copied")
                            : t("sellerReferrals.copy")}
                        </Button>
                        <a
                          href={
                            url
                              ? `https://wa.me/?text=${encodeURIComponent(
                                  t("sellerReferrals.whatsappMessage", { url })
                                )}`
                              : undefined
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={!url}
                          className={`inline-flex h-[34px] items-center justify-center gap-2 rounded-control border border-line-strong bg-surface px-3 text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2 ${
                            url ? "" : "pointer-events-none opacity-60"
                          }`}
                        >
                          <WhatsAppIcon />
                          {t("sellerReferrals.whatsapp")}
                        </a>
                      </div>
                    </div>

                    <div className="my-3 h-px w-full bg-line" />
                    <ReferralMetrics items={metricItems} />
                  </>
                )}
              </Card>

              <Card className="flex flex-col items-center justify-center text-center">
                {loadingReferral ? (
                  <div className="w-full py-6">
                    <Skeleton rows={4} />
                  </div>
                ) : (
                  <>
                    <p className="text-title font-bold text-ink">
                      {t("sellerReferrals.qrTitle")}
                    </p>
                    {qrSrc ? (
                      <img
                        src={qrSrc}
                        alt={t("sellerReferrals.qrAlt", {
                          name:
                            referral?.seller_name ||
                            referral?.name ||
                            t("sellerReferrals.title"),
                        })}
                        width={280}
                        height={280}
                        loading="lazy"
                        className="mt-2 h-[140px] w-[140px] rounded-control border border-line bg-white p-1.5"
                      />
                    ) : (
                      <div className="mt-2 flex h-[140px] w-[140px] items-center justify-center rounded-control border border-dashed border-line-strong bg-surface-2 p-3 text-micro text-ink-3">
                        {t("sellerReferrals.linkUnavailable")}
                      </div>
                    )}
                    <p className="mt-2 text-micro text-ink-3">
                      {t("sellerReferrals.qrCaption")}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleShare}
                      disabled={!url}
                      className="mt-2"
                    >
                      <ShareIcon />
                      {t("sellerDashboard.referralShare")}
                    </Button>
                  </>
                )}
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <h2 className="text-title font-bold text-ink">
                  {t("sellerReferrals.howTitle")}
                </h2>
                <ol className="mt-3 grid gap-4 sm:grid-cols-3">
                  {STEPS.map((step, index) => (
                    <li key={step.key} className="flex gap-2.5">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-label font-bold text-brand-strong"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-body font-bold text-ink">
                          {t(`sellerReferrals.${step.title}`)}
                        </p>
                        <p className="mt-0.5 text-label text-ink-3">
                          {t(`sellerReferrals.${step.description}`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card>
                <h2 className="text-title font-bold text-ink">
                  {t("sellerReferrals.rulesTitle")}
                </h2>
                <ul className="mt-2 space-y-2">
                  {RULES.map((rule, index) => (
                    <li
                      key={rule}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-1.5 text-label text-ink-2">
                        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
                        {t(`sellerReferrals.${rule}`)}
                      </span>
                      {index === 0 && (
                        <Chip tone="success" className="h-[22px]">
                          {rate}%
                        </Chip>
                      )}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/vendedor/comisiones"
                  className="mt-3 inline-block text-label font-semibold text-brand hover:underline"
                >
                  {t("sellerReferrals.rulesNote")}
                </Link>
              </Card>
            </div>

            <Card
              title={t("sellerReferrals.tableTitle")}
              action={
                <Link
                  to="/vendedor/clientes"
                  className="shrink-0 text-label font-semibold text-brand hover:underline"
                >
                  {t("sellerReferrals.viewAll")} →
                </Link>
              }
              bodyClassName="p-0 pt-3"
            >
              {reservationsError ? (
                <div className="px-5 pb-5">
                  <ErrorState
                    title={t("sellerReferrals.reservationsErrorTitle")}
                    description={t(
                      "sellerReferrals.reservationsErrorDescription"
                    )}
                    onRetry={loadReservations}
                  />
                </div>
              ) : loadingReservations ? (
                <div className="px-5 pb-5">
                  <Skeleton rows={5} />
                </div>
              ) : (
                <Table
                  columns={columns}
                  rows={rows}
                  getRowKey={(row) => row.__key}
                  mobileCard={mobileCard}
                  empty={
                    <div className="px-5 pb-5">
                      <EmptyState
                        title={t("sellerReferrals.emptyTitle")}
                        description={t("sellerReferrals.emptyDescription")}
                      />
                    </div>
                  }
                />
              )}
            </Card>
          </>
        )}
      </div>
    </main>
  );
}

export default SellerReferralPage;
