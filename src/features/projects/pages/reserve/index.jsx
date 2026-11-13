import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { projectsApi } from "../../api";
import { useToast } from "@/contexts/ToastContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useGeneralSettings } from "@/contexts/generalSettings";
import { getDefaultCurrency } from "@/shared/utils/formatSettings";
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
  const [projectType, setProjectType] = useState("");
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

        setLotName(lotData.name || `Lote ${lot_id}`);
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
        setProjectType(projData.project_type || "");
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
    const base = "px-2 py-0.5 rounded text-xs font-semibold";
    if (!s)
      return <span className={`${base} bg-gray-100 text-gray-600`}>—</span>;
    const normalized = s.toLowerCase();
    if (normalized === "available")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          {t("lots.available")}
        </span>
      );
    if (normalized === "reserved")
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          {t("lots.reserved")}
        </span>
      );
    return <span className={`${base} bg-gray-100 text-gray-600`}>{s}</span>;
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell dark:bg-darkblack-700 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="rounded-card border border-line bg-surface p-6 shadow-pop lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h2 className="text-page font-bold tracking-tight text-ink">
                {t("reservations.title")}
              </h2>

              {!headerLoading && (
                <div className="mt-4 space-y-4">
                  <div>
                    {projectType && (
                      <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-brand-strong">
                        {projectType}
                      </span>
                    )}
                    <h3 className="text-section font-black leading-tight text-ink">
                      {projectName || "—"}
                    </h3>
                  </div>

                  {(projectAddress || lotAddress) && (
                    <div className="flex items-start gap-3 rounded-control border border-line bg-surface-2 p-3">
                      <p className="leading-snug">
                        <span className="block text-micro font-bold uppercase tracking-wide text-ink-3">
                          {t("reservations.address")}
                        </span>
                        {lotAddress && <span className="font-semibold text-ink">{lotAddress}</span>}
                        {lotAddress && projectAddress && <span className="mx-2 opacity-30">•</span>}
                        <span className="text-ink-2">{projectAddress}</span>
                      </p>
                    </div>
                  )}

                  {generatedGuid && (
                    <div className="flex items-center gap-3 self-start rounded-control border border-line bg-surface-2 px-4 py-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-3">
                          {t("reservations.systemGuid") || "SYSTEM GUID"}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-ink-2">
                          {generatedGuid}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedGuid);
                          showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
                        }}
                        className="rounded-lg border border-transparent p-1.5 text-ink-3 transition-all hover:border-line hover:text-brand active:scale-90"
                        title={t("common.copy") || "Copiar"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid w-full grid-cols-2 gap-4 lg:w-auto md:grid-cols-3 xl:grid-cols-4">
              {[
                { label: t("reservations.lot"), value: lotName || `Lote ${lot_id}` },
                {
                  label: t("reservations.dimensions"),
                  value: (lotLength && lotWidth && lotLength > 0 && lotWidth > 0)
                    ? `${fmtNum(lotWidth)} × ${fmtNum(lotLength)} ${lotMeasurementUnit}`
                    : "—",
                },
                {
                  label: t("reservations.area"),
                  value: lotArea != null
                    ? `${fmtNum(lotArea)} ${lotMeasurementUnit}`
                    : (headerArea != null ? `${fmtNum(headerArea)} ${lotMeasurementUnit}` : "—"),
                },
                {
                  label: t("reservations.lotPrice"),
                  custom: (
                    <div className="flex flex-col">
                      {lotOriginalPrice > lotPrice && (
                        <span className="text-[10px] text-ink-3 line-through">
                          {fmtNum(lotOriginalPrice)} {defaultCurrency}
                        </span>
                      )}
                      <span className={`text-body font-bold tabular-nums tracking-tight ${lotOriginalPrice > lotPrice ? 'text-brand-strong' : 'text-ink'}`}>
                        {lotPrice != null ? `${fmtNum(lotPrice)} ${defaultCurrency}` : "—"}
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
                  className="rounded-control border border-line bg-surface-2 p-4 shadow-xs transition-colors hover:border-brand"
                >
                  <p className="mb-1 text-[9px] font-extrabold uppercase tracking-widest text-ink-3">
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
          </div>
        </div>

        {/* Wizard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ReserveWizard
            lot={{
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
