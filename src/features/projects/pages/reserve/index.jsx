import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { projectsApi } from "../../api";
import { useToast } from "@/contexts/ToastContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useGeneralSettings } from "@/contexts/generalSettings";
import { getDefaultCurrency } from "@/shared/utils/formatSettings";
import { Chip } from "@/shared/ui";
import ReserveWizard from "./ReserveWizard";

function Reserve() {
  const { t } = useLocale();
  const { settings: generalSettings } = useGeneralSettings();
  const { id, lot_id } = useParams();
  const minReserveAmount = Number(generalSettings.reservation_min_amount) || 0;
  const defaultCurrency =
    generalSettings.default_currency || getDefaultCurrency();

  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Global toast
  const { showToast } = useToast();

  // Header details
  const [lotName, setLotName] = useState(null);
  const [lotPrice, setLotPrice] = useState(0); // This will hold the EFFECTIVE price for calculations
  const [lotOriginalPrice, setLotOriginalPrice] = useState(0); // For display relative to discount
  const [lotLength, setLotLength] = useState(null);
  const [lotWidth, setLotWidth] = useState(null);
  const [lotArea, setLotArea] = useState(null);
  const [lotStatus, setLotStatus] = useState("");
  const [lotMeasurementUnit, setLotMeasurementUnit] = useState("m2");
  const [lotAddress, setLotAddress] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectInterestRate, setProjectInterestRate] = useState(null);
  const [projectAddress, setProjectAddress] = useState("");
  const [projectDeliveryDate, setProjectDeliveryDate] = useState(null);
  const [projectCommissionRateDirect, setProjectCommissionRateDirect] = useState(0);
  const [projectCommissionRateBank, setProjectCommissionRateBank] = useState(0);
  const [projectCommissionRateCash, setProjectCommissionRateCash] = useState(0);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [generatedGuid, setGeneratedGuid] = useState("");

  useEffect(() => {
    setGeneratedGuid(crypto.randomUUID());
  }, []);

  const navigate = useNavigate();

  // --- Fetch lot + project extra details (replaces earlier simple lot fetch if present) ---
  useEffect(() => {
    let cancelled = false;
    async function fetchHeader() {
      if (!id || !lot_id) return;
      setHeaderLoading(true);
      try {
        const [lotDataRaw, projDataRaw] = await Promise.all([
          projectsApi.getLot(id, lot_id),
          projectsApi.get(id),
        ]);

        if (cancelled) return;

        const lotData = lotDataRaw.lot || lotDataRaw.data || lotDataRaw || {};
        const projData = projDataRaw.project || projDataRaw.data || projDataRaw || {};

        setLotName(lotData.name || t("reservations.lotNumber", { id: lot_id }));
        // Use effective_price if available and > 0, otherwise normal price
        const effective = (lotData.effective_price && Number(lotData.effective_price) > 0)
          ? Number(lotData.effective_price)
          : Number(lotData.price);

        setLotPrice(effective);
        setLotOriginalPrice(Number(lotData.price));

        setLotLength(lotData.length);
        setLotWidth(lotData.width);
        setLotArea(lotData.area); // Capture explicit area from API
        setLotStatus(lotData.status || "");
        setLotAddress(lotData.address || "");
        setLotMeasurementUnit(
          lotData.measurement_unit ||
          lotData.unit ||
          projData.measurement_unit ||
          "m2"
        );

        setProjectName(projData.name || "");
        setProjectInterestRate(projData.interest_rate);
        setProjectAddress(projData.address || "");
        setProjectDeliveryDate(projData.delivery_date);
        setProjectCommissionRateDirect(Number(projData.commission_rate_direct) || 0);
        setProjectCommissionRateBank(Number(projData.commission_rate_bank) || 0);
        setProjectCommissionRateCash(Number(projData.commission_rate_cash) || 0);
      } catch (e) {
        // silently keep old minimal header if failure
        console.error(e);
      } finally {
        if (!cancelled) setHeaderLoading(false);
      }
    }
    fetchHeader();
    return () => {
      cancelled = true;
    };
  }, [id, lot_id, t]);

  const handleSubmit = async (payload) => {
    setFormSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("contract[payment_term]", payload.paymentTerm);
    formData.append("contract[financing_type]", payload.financingType);
    formData.append("contract[reserve_amount]", payload.reserveAmount);
    formData.append("contract[down_payment]", payload.downPayment || "0");
    formData.append("contract[guid]", generatedGuid);
    if (
      (payload.financingType === "bank" || payload.financingType === "cash") &&
      payload.maxPaymentDate &&
      payload.maxPaymentDate.trim()
    ) {
      formData.append("contract[max_payment_date]", payload.maxPaymentDate.trim());
    }
    formData.append("contract[note]", payload.note);
    formData.append("contract[applicant_user_id]", payload.applicantUserId || "");
    formData.append("user[full_name]", payload.user.full_name);
    formData.append("user[phone]", payload.user.phone);
    formData.append("user[identity]", payload.user.identity);
    formData.append("user[rtn]", payload.user.rtn);
    formData.append("user[email]", payload.user.email);

    payload.documents.forEach((doc, index) => {
      formData.append(`documents[${index}]`, doc);
    });

    try {
      await projectsApi.createContract(id, lot_id, formData);

      showToast(t("reservations.contractCreatedSuccess"), "success");
      // Navigate immediately - global toast will persist
      navigate(`/projects/${id}/lots`);
    } catch (err) {
      setError(err.message || t("reservations.errorCreatingContract"));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Derived lot area (raw) for header only
  const headerArea = useMemo(() => {
    if (!lotLength || !lotWidth) return null;
    return Number(lotLength) * Number(lotWidth);
  }, [lotLength, lotWidth]);

  // Helper formatters
  const fmtNum = (v) =>
    v === null || v === undefined || v === ""
      ? "—"
      : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatDate = (v) => {
    if (!v || v === "TBD") return "TBD";
    try {
      return new Date(v).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return v;
    }
  };

  const fmtPerc = (v) =>
    v === null || v === undefined
      ? "—"
      : `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
  const statusBadge = (s) => {
    if (!s) return <Chip tone="neutral">—</Chip>;
    const normalized = s.toLowerCase();
    const tone =
      {
        available: "success",
        reserved: "warning",
        financed: "info",
        fully_paid: "neutral",
        sold: "neutral",
      }[normalized] || "neutral";
    const key = `status.${normalized}`;
    const translated = t(key);
    return <Chip tone={tone}>{translated === key ? s : translated}</Chip>;
  };

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
        <header className="flex flex-col gap-1">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-label font-medium text-ink-3"
          >
            <Link to="/projects" className="transition-colors hover:text-ink">
              {t("projectsPage.title")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={`/projects/${id}`}
              className="truncate transition-colors hover:text-ink"
            >
              {projectName || t("reservations.project")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-ink-2">
              {lotName || t("reservations.lotNumber", { id: lot_id })}
            </span>
          </nav>
          <h1 className="text-page font-bold tracking-tight text-ink">
            {t("reservations.newReservation")}
          </h1>
          <p className="text-body font-medium text-ink-3">
            {t("reservations.reservationSubtitle")}
          </p>
        </header>

        {!headerLoading && (
          <section className="rounded-card border border-line bg-surface p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {[
                {
                  label: t("reservations.lot"),
                  value: lotName || t("reservations.lotNumber", { id: lot_id }),
                },
                {
                  label: t("reservations.dimensions"),
                  value:
                    lotLength && lotWidth && lotLength > 0 && lotWidth > 0
                      ? `${fmtNum(lotWidth)} × ${fmtNum(lotLength)} ${lotMeasurementUnit}`
                      : "—",
                },
                {
                  label: t("reservations.area"),
                  value:
                    lotArea != null
                      ? `${fmtNum(lotArea)} ${lotMeasurementUnit}`
                      : headerArea != null
                        ? `${fmtNum(headerArea)} ${lotMeasurementUnit}`
                        : "—",
                },
                {
                  label: t("reservations.lotPrice"),
                  custom: (
                    <div className="flex flex-col">
                      {lotOriginalPrice > lotPrice && (
                        <span className="text-micro text-ink-3 line-through">
                          {fmtNum(lotOriginalPrice)} {defaultCurrency}
                        </span>
                      )}
                      <span
                        className={`text-body font-bold tabular-nums tracking-tight ${
                          lotOriginalPrice > lotPrice
                            ? "text-brand-strong"
                            : "text-ink"
                        }`}
                      >
                        {lotPrice != null
                          ? `${fmtNum(lotPrice)} ${defaultCurrency}`
                          : "—"}
                      </span>
                    </div>
                  ),
                },
                {
                  label: t("reservations.status"),
                  custom: statusBadge(lotStatus),
                },
                {
                  label: t("reservations.deliveryDate"),
                  value: formatDate(projectDeliveryDate),
                },
                {
                  label: t("reservations.interest"),
                  value: fmtPerc(projectInterestRate),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-control border border-line bg-surface-2 p-3.5"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.6px] text-ink-3">
                    {item.label}
                  </p>
                  {item.custom ? (
                    item.custom
                  ) : (
                    <p className="truncate text-body font-bold tracking-tight text-ink">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {(projectAddress || lotAddress || generatedGuid) && (
              <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:items-center lg:justify-between">
                {(projectAddress || lotAddress) && (
                  <p className="min-w-0 text-label text-ink-2">
                    <span className="mr-2 text-micro font-bold uppercase tracking-wide text-ink-3">
                      {t("reservations.address")}
                    </span>
                    {lotAddress && (
                      <span className="font-semibold text-ink">{lotAddress}</span>
                    )}
                    {lotAddress && projectAddress && (
                      <span className="mx-2 opacity-30">•</span>
                    )}
                    <span>{projectAddress}</span>
                  </p>
                )}

                {generatedGuid && (
                  <div className="flex shrink-0 items-center gap-2 rounded-control border border-line bg-surface-2 px-3 py-1.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-ink-3">
                        {t("reservations.systemGuid")}
                      </span>
                      <span className="font-mono text-micro font-semibold text-ink-2">
                        {generatedGuid}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedGuid);
                        showToast(t("common.copiedToClipboard"), "success");
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-chip text-ink-3 transition-colors hover:bg-surface hover:text-brand-strong"
                      title={t("common.copy")}
                      aria-label={t("common.copy")}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ReserveWizard
            lot={{
              name: lotName,
              projectName,
              status: lotStatus,
              dimensions:
                lotLength && lotWidth && lotLength > 0 && lotWidth > 0
                  ? `${fmtNum(lotWidth)} × ${fmtNum(lotLength)} ${lotMeasurementUnit}`
                  : null,
              area:
                lotArea != null
                  ? `${fmtNum(lotArea)} ${lotMeasurementUnit}`
                  : headerArea != null
                    ? `${fmtNum(headerArea)} ${lotMeasurementUnit}`
                    : null,
              measurementUnit: lotMeasurementUnit,
              price: lotPrice,
              commissionRates: {
                direct: projectCommissionRateDirect,
                bank: projectCommissionRateBank,
                cash: projectCommissionRateCash,
              },
            }}
            minReserveAmount={minReserveAmount}
            currency={defaultCurrency}
            submitting={formSubmitting}
            submitError={error}
            onSubmit={handleSubmit}
          />
        </motion.div>
      </div>
    </main>
  );
}

export default Reserve;
