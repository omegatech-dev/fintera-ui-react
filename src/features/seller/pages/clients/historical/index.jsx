import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Banner,
  Button,
  Card,
  Field,
  FileUpload,
  Input,
  Select,
} from "@/shared/ui";
import { sellerApi } from "../../../api";
import HistoricalEvidenceViewer from "@/features/commissions/components/HistoricalEvidenceViewer";
import { downloadHistoricalTemplate } from "../../../utils/historicalCsv";

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const EVIDENCE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const EVIDENCE_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  full_name: "",
  identity: "",
  phone: "",
  email: "",
  project_name: "",
  lot_label: "",
  area_m2: "",
  sale_price: "",
  sale_date: today(),
  payment_mode: "financed",
  sale_status: "installments",
  installments_paid: "",
  commission_rate: "",
  commission_amount: "",
  commission_status: "pending",
});

function SectionHeading({ title, hint }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-title font-bold text-ink">{title}</h2>
      {hint && <p className="text-micro text-ink-3">{hint}</p>}
    </div>
  );
}

function HistoricalClientPage() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const rateTouched = useRef(false);
  const [rulesRate, setRulesRate] = useState(5);
  const [form, setForm] = useState(emptyForm);
  const [evidence, setEvidence] = useState(null);
  const [existingEvidence, setExistingEvidence] = useState("");
  const [record, setRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  // Id of a record that was created but whose evidence upload failed; a
  // retry must upload against this record instead of creating a duplicate.
  const [pendingEvidenceSaleId, setPendingEvidenceSaleId] = useState(null);

  const locked =
    isEdit && record && record.validation_status !== "pending" && !isAdmin;

  useEffect(() => {
    let active = true;

    const loadRate = async () => {
      if (typeof sellerApi.getCommissionRules !== "function") return;
      try {
        const response = await sellerApi.getCommissionRules();
        const data = response?.rules ?? response?.commission_rules ?? response;
        const next = Number(
          data?.seller_rate ??
            data?.default_rate ??
            data?.commission_rate ??
            data?.rate
        );
        if (!active || !Number.isFinite(next) || next <= 0) return;
        setRulesRate(next);
        if (!isEdit) {
          setForm((previous) => {
            if (previous.commission_rate || rateTouched.current) {
              return previous;
            }
            const price = Number(previous.sale_price);
            const amount =
              Number.isFinite(price) && price > 0
                ? (Math.round(price * next) / 100).toFixed(2)
                : previous.commission_amount;
            return {
              ...previous,
              commission_rate: String(next),
              commission_amount: amount,
            };
          });
        }
      } catch {
        // Keep the fallback rate when the rules endpoint is unavailable.
      }
    };

    loadRate();
    return () => {
      active = false;
    };
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return undefined;
    let active = true;
    setLoadingRecord(true);

    const loadRecord = async () => {
      try {
        const data = await sellerApi.getHistoricalSale(id);
        const sale = data?.historical_sale || data;
        if (!active || !sale) return;
        setRecord(sale);
        setExistingEvidence(sale.evidence_file || "");
        const paymentMode = String(sale.payment_mode || "").toLowerCase();
        const saleStatus = String(sale.sale_status || "").toLowerCase();
        const paymentModes = {
          cash: "cash",
          contado: "cash",
          efectivo: "cash",
        };
        const saleStatuses = {
          deeded: "deeded",
          escriturado: "deeded",
          paid: "paid",
          pagado: "paid",
          pagada: "paid",
          installments: "installments",
          en_cuotas: "installments",
          cuotas: "installments",
        };
        setForm({
          full_name: sale.full_name || sale.client_name || "",
          identity: sale.identity || sale.client_identity || "",
          phone: sale.phone || sale.client_phone || "",
          email: sale.email || sale.client_email || "",
          project_name: sale.project_name || "",
          lot_label: sale.lot_label || "",
          area_m2: sale.area_m2 ?? "",
          sale_price: sale.sale_price ?? "",
          sale_date: sale.sale_date || today(),
          payment_mode: paymentModes[paymentMode] || "financed",
          sale_status: saleStatuses[saleStatus] || "installments",
          installments_paid: sale.installments_paid ?? "",
          commission_rate:
            sale.rate !== null && sale.rate !== undefined
              ? String(sale.rate)
              : "",
          commission_amount:
            sale.commission_amount !== null &&
            sale.commission_amount !== undefined
              ? String(sale.commission_amount)
              : "",
          commission_status: sale.commission_status || "pending",
        });
        setError(null);
      } catch (err) {
        if (active) {
          setError(
            err?.errors?.join(", ") || err?.message || t("historical.loadError")
          );
        }
      } finally {
        if (active) setLoadingRecord(false);
      }
    };

    loadRecord();
    return () => {
      active = false;
    };
  }, [id, isEdit, t]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSaved(false);
    if (name === "commission_rate") rateTouched.current = true;
    setForm((previous) => {
      const next = { ...previous, [name]: value };
      const price = Number(next.sale_price);
      if (name === "sale_price" || name === "commission_rate") {
        const rate =
          next.commission_rate === ""
            ? rulesRate
            : Number(next.commission_rate);
        if (
          Number.isFinite(price) &&
          price > 0 &&
          Number.isFinite(rate) &&
          rate >= 0
        ) {
          next.commission_amount = (Math.round(price * rate) / 100).toFixed(2);
        }
      }
      if (name === "commission_amount" && value !== "") {
        const amount = Number(value);
        if (
          Number.isFinite(price) &&
          price > 0 &&
          Number.isFinite(amount) &&
          amount >= 0
        ) {
          next.commission_rate = (
            Math.round((amount / price) * 10000) / 100
          ).toFixed(2);
        }
      }
      return next;
    });
  };

  const handleEvidence = (files) => {
    const file = files?.[0];
    if (!file) {
      setEvidence(null);
      return;
    }

    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();
    const allowedType =
      EVIDENCE_TYPES.includes(file.type) ||
      EVIDENCE_EXTENSIONS.includes(extension);

    if (!allowedType) {
      setError(t("historical.evidenceInvalidType"));
      return;
    }
    if (file.size > MAX_EVIDENCE_BYTES) {
      setError(t("historical.evidenceTooLarge"));
      return;
    }

    setError(null);
    setEvidence(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const fullName = form.full_name.trim();
    if (!fullName) {
      setError(t("historical.requiredName"));
      return;
    }
    if (!form.identity.trim()) {
      setError(t("historical.requiredIdentity"));
      return;
    }

    const price = Number(form.sale_price);
    if (!Number.isFinite(price) || price <= 0) {
      setError(t("historical.requiredPrice"));
      return;
    }
    if (!form.sale_date) {
      setError(t("historical.requiredDate"));
      return;
    }

    if (locked) {
      setError(t("historical.lockedError"));
      return;
    }

    const area = form.area_m2 === "" ? null : Number(form.area_m2);
    if (area !== null && (!Number.isFinite(area) || area < 0)) {
      setError(t("historical.requiredArea"));
      return;
    }

    const parsedRate = Number(form.commission_rate);
    const effectiveRate =
      Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : rulesRate;
    const fallbackAmount = Math.round(price * effectiveRate) / 100;
    const amount =
      form.commission_amount === ""
        ? fallbackAmount
        : Number(form.commission_amount);

    const payload = {
      full_name: fullName,
      identity: form.identity.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      project_name: form.project_name.trim(),
      lot_label: form.lot_label.trim() || null,
      area_m2: area,
      sale_price: price,
      sale_date: form.sale_date,
      payment_mode: form.payment_mode,
      sale_status: form.sale_status,
      installments_paid:
        form.sale_status === "installments"
          ? Number(form.installments_paid || 0)
          : null,
      rate: effectiveRate,
      amount: Number.isFinite(amount) ? amount : fallbackAmount,
      commission_status: form.commission_status,
      is_historical: true,
    };
    // New files are uploaded to the evidence endpoint after the save, which
    // persists the real storage path by itself. When editing without a new
    // file, send the current path back so the stored evidence survives until
    // the backend preserves it on its own.
    if (isEdit && !evidence) {
      payload.evidence_file = existingEvidence || null;
    }

    setSaving(true);
    try {
      let targetId = id;
      if (isEdit) {
        await sellerApi.updateHistoricalSale(id, payload);
      } else if (pendingEvidenceSaleId) {
        targetId = pendingEvidenceSaleId;
      } else {
        const data = await sellerApi.createHistoricalSale(payload);
        targetId = data?.historical_sale?.id ?? data?.id;
      }

      if (!evidence) {
        if (pendingEvidenceSaleId) {
          setPendingEvidenceSaleId(null);
          setSaved(true);
          showToast(t("historical.savedPending"), "success");
          return;
        }
        if (isEdit) {
          showToast(t("historical.updated"), "success");
          navigate(location.state?.from || "/vendedor/clientes");
          return;
        }
        setForm({ ...emptyForm(), commission_rate: String(rulesRate) });
        rateTouched.current = false;
        setSaved(true);
        showToast(t("historical.savedPending"), "success");
        return;
      }

      if (!targetId) {
        throw new Error(t("historical.evidenceUploadFailed"));
      }

      try {
        await sellerApi.uploadHistoricalEvidence(targetId, evidence);
      } catch (uploadErr) {
        setError(
          uploadErr?.status === 403
            ? t("historical.evidenceForbidden")
            : uploadErr?.message || t("historical.evidenceUploadFailed")
        );
        if (isEdit) {
          showToast(t("historical.updated"), "success");
        } else {
          setPendingEvidenceSaleId(targetId);
          setSaved(true);
          showToast(t("historical.savedPending"), "success");
        }
        // Keep the page open with the file still selected so the user can
        // retry the upload without recreating the record.
        return;
      }

      if (isEdit) {
        setEvidence(null);
        setExistingEvidence("");
        showToast(t("historical.updated"), "success");
        navigate(location.state?.from || "/vendedor/clientes");
        return;
      }
      setPendingEvidenceSaleId(null);
      setForm({ ...emptyForm(), commission_rate: String(rulesRate) });
      setEvidence(null);
      rateTouched.current = false;
      setSaved(true);
      showToast(t("historical.savedPending"), "success");
    } catch (err) {
      setError(
        err?.errors?.join(", ") || err?.message || t("historical.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  const whatHappens = [
    "whatHappensClient",
    "whatHappensNoReservation",
    "whatHappensCommission",
    "whatHappensScore",
    "whatHappensAdmin",
  ];

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-page font-bold tracking-tight text-ink">
              {isEdit
                ? t("historical.editTitle")
                : t("historical.addClientTitle")}
            </h1>
            <p className="mt-1 max-w-2xl text-body text-ink-3">
              {isEdit ? t("historical.editSubtitle") : t("historical.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isEdit && (
              <Button
                variant="secondary"
                onClick={() =>
                  navigate("/vendedor/clientes", {
                    state: { openHistoricalImport: true },
                  })
                }
                disabled={saving}
              >
                {t("historical.importCsv")}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="historical-form"
              loading={saving}
              disabled={saving || loadingRecord || locked}
            >
              {isEdit ? t("historical.saveChanges") : t("historical.save")}
            </Button>
          </div>
        </header>

        {loadingRecord && (
          <Banner tone="info">{t("historical.loadingRecord")}</Banner>
        )}

        {locked && <Banner tone="warning">{t("historical.lockedMessage")}</Banner>}

        {saved && (
          <Banner
            tone="success"
            action={
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate("/vendedor/clientes")}
              >
                {t("historical.viewClients")}
              </Button>
            }
          >
            <span className="font-semibold">{t("historical.savedPending")}</span>
            <span className="block text-label font-normal">
              {t("historical.savedDescription")}
            </span>
          </Banner>
        )}

        {error && <Banner tone="danger">{error}</Banner>}

        <form id="historical-form" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Card bodyClassName="space-y-5 p-5">
              <section className="space-y-4">
                <SectionHeading
                  title={t("historical.clientSection")}
                  hint={t("historical.clientSectionHint")}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                  <div className="md:col-span-4">
                    <Field label={t("historical.fullName")} required>
                      <Input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label={t("historical.identity")} required>
                      <Input
                        name="identity"
                        value={form.identity}
                        onChange={handleChange}
                        required
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-3">
                    <Field label={t("historical.phone")}>
                      <Input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-3">
                    <Field label={t("historical.email")}>
                      <Input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <div className="border-t border-line" />

              <section className="space-y-4">
                <SectionHeading
                  title={t("historical.saleSection")}
                  hint={t("historical.saleSectionHint")}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                  <div className="md:col-span-4">
                    <Field label={t("historical.project")}>
                      <Input
                        name="project_name"
                        value={form.project_name}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label={t("historical.lot")}>
                      <Input
                        name="lot_label"
                        value={form.lot_label}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label={t("historical.area")}>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        name="area_m2"
                        value={form.area_m2}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label={t("historical.salePrice")} required>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        name="sale_price"
                        value={form.sale_price}
                        onChange={handleChange}
                        required
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label={t("historical.saleDate")} required>
                      <Input
                        type="date"
                        name="sale_date"
                        value={form.sale_date}
                        onChange={handleChange}
                        required
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-3">
                    <Field label={t("historical.paymentMode")}>
                      <Select
                        name="payment_mode"
                        value={form.payment_mode}
                        onChange={handleChange}
                      >
                        <option value="cash">{t("historical.cash")}</option>
                        <option value="financed">
                          {t("historical.financed")}
                        </option>
                      </Select>
                    </Field>
                  </div>
                  <div className="md:col-span-3">
                    <Field label={t("historical.saleStatus")}>
                      <Select
                        name="sale_status"
                        value={form.sale_status}
                        onChange={handleChange}
                      >
                        <option value="deeded">{t("historical.deeded")}</option>
                        <option value="paid">{t("historical.paid")}</option>
                        <option value="installments">
                          {t("historical.installments")}
                        </option>
                      </Select>
                    </Field>
                  </div>
                  {form.sale_status === "installments" && (
                    <div className="md:col-span-3">
                      <Field label={t("historical.installmentsPaid")}>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          name="installments_paid"
                          value={form.installments_paid}
                          onChange={handleChange}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              </section>

              <div className="border-t border-line" />

              <section className="space-y-4">
                <SectionHeading
                  title={t("historical.commissionSection")}
                  hint={t("historical.commissionSectionHint")}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                  <div className="md:col-span-2">
                    <Field
                      label={t("historical.commissionRate")}
                      hint={t("historical.rateHint")}
                    >
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        inputMode="decimal"
                        name="commission_rate"
                        value={form.commission_rate}
                        onChange={handleChange}
                        aria-label={t("historical.commissionRate")}
                        disabled={locked}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label={t("historical.commissionAmount")}>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        name="commission_amount"
                        value={form.commission_amount}
                        onChange={handleChange}
                        disabled={locked}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label={t("historical.commissionStatus")}>
                      <Select
                        name="commission_status"
                        value={form.commission_status}
                        onChange={handleChange}
                      >
                        <option value="paid">
                          {t("historical.commissionPaid")}
                        </option>
                        <option value="pending">
                          {t("historical.commissionPending")}
                        </option>
                      </Select>
                    </Field>
                  </div>
                </div>
              </section>

              <div className="border-t border-line" />

              <section className="space-y-4">
                <SectionHeading
                  title={t("historical.evidence")}
                  hint={t("historical.evidenceHint")}
                />
                <FileUpload
                  label={t("historical.evidence")}
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  multiple={false}
                  files={evidence ? [evidence] : []}
                  onChange={handleEvidence}
                  hint={t("historical.evidenceDropHint")}
                />
                {isEdit && existingEvidence && (
                  <HistoricalEvidenceViewer
                    saleId={id}
                    evidencePath={existingEvidence}
                  />
                )}
              </section>

              <Banner tone="neutral">{t("historical.formNote")}</Banner>
            </Card>

            <aside className="space-y-3">
              <Card
                title={t("historical.whatHappens")}
                bodyClassName="space-y-3 p-4"
              >
                <ul className="space-y-2.5">
                  {whatHappens.map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        aria-hidden="true"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                      />
                      <span className="text-label leading-snug text-ink-2">
                        {t(`historical.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card bodyClassName="space-y-3 p-4">
                <h3 className="text-title font-bold text-ink">
                  {t("historical.bulkTitle")}
                </h3>
                <p className="text-label leading-snug text-ink-2">
                  {t("historical.bulkDescription")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadHistoricalTemplate()}
                  >
                    {t("historical.import.template")}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate("/vendedor/clientes", {
                        state: { openHistoricalImport: true },
                      })
                    }
                  >
                    {t("historical.importCsv")}
                  </Button>
                </div>
              </Card>

              <Card bodyClassName="p-4">
                <Banner tone="info">{t("historical.validationNote")}</Banner>
              </Card>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

export default HistoricalClientPage;
