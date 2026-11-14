import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { user } = useContext(AuthContext);
  const userRate = Number(
    user?.commission_rate_override ?? user?.commission_rate
  );
  const [rulesRate, setRulesRate] = useState(5);
  const [form, setForm] = useState(emptyForm);
  const [evidence, setEvidence] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const currentRate = useMemo(() => {
    const value = Number.isFinite(userRate) && userRate > 0 ? userRate : rulesRate;
    return value > 0 ? value : 5;
  }, [rulesRate, userRate]);

  useEffect(() => {
    if (Number.isFinite(userRate) && userRate > 0) return undefined;
    let active = true;

    const loadRate = async () => {
      if (typeof sellerApi.getCommissionRules !== "function") return;
      try {
        const data = await sellerApi.getCommissionRules();
        const next = Number(
          data?.default_rate ?? data?.commission_rate ?? data?.rate
        );
        if (active && Number.isFinite(next) && next > 0) setRulesRate(next);
      } catch {
        // Keep the fallback rate when the rules endpoint is unavailable.
      }
    };

    loadRate();
    return () => {
      active = false;
    };
  }, [userRate]);

  useEffect(() => {
    setForm((previous) => {
      if (!previous.sale_price) return previous;
      const price = Number(previous.sale_price);
      if (!Number.isFinite(price) || price <= 0) return previous;
      const amount = (Math.round(price * currentRate) / 100).toFixed(2);
      return previous.commission_amount === amount
        ? previous
        : { ...previous, commission_amount: amount };
    });
  }, [currentRate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSaved(false);
    setForm((previous) => {
      const next = { ...previous, [name]: value };
      if (name === "sale_price") {
        const price = Number(value);
        next.commission_amount =
          Number.isFinite(price) && price > 0
            ? (Math.round(price * currentRate) / 100).toFixed(2)
            : "";
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

    const area = form.area_m2 === "" ? null : Number(form.area_m2);
    if (area !== null && (!Number.isFinite(area) || area < 0)) {
      setError(t("historical.requiredArea"));
      return;
    }

    const fallbackAmount = Math.round(price * currentRate) / 100;
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
      rate: currentRate,
      amount: Number.isFinite(amount) ? amount : fallbackAmount,
      commission_status: form.commission_status,
      evidence_file: evidence?.name || null,
      is_historical: true,
    };

    setSaving(true);
    try {
      await sellerApi.createHistoricalSale(payload);
      setForm(emptyForm());
      setEvidence(null);
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
              {t("historical.addClientTitle")}
            </h1>
            <p className="mt-1 max-w-2xl text-body text-ink-3">
              {t("historical.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
              disabled={saving}
            >
              {t("historical.save")}
            </Button>
          </div>
        </header>

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
                      hint={t("historical.commissionSectionHint")}
                    >
                      <Input
                        readOnly
                        name="commission_rate"
                        value={currentRate}
                        aria-label={t("historical.commissionRate")}
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
