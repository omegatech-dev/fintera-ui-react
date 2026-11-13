import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Button, Dialog, Field, Input, Select } from "@/shared/ui";
import { commissionsApi } from "../api";

const EMPTY_RATES = { direct: "", bank: "", cash: "" };

const projectPayload = (project, rates) => ({
  name: project.name,
  guid: project.guid,
  description: project.description ?? "",
  address: project.address ?? "",
  city: project.city ?? null,
  code: project.code ?? null,
  lot_count: Number(project.lot_count ?? 0),
  price_per_square_unit: Number(project.price_per_square_unit ?? 0),
  measurement_unit: project.measurement_unit || "m2",
  interest_rate: Number(project.interest_rate ?? 0),
  commission_rate_direct: Number(rates.direct || 0),
  commission_rate_bank: Number(rates.bank || 0),
  commission_rate_cash: Number(rates.cash || 0),
  delivery_date: project.delivery_date
    ? String(project.delivery_date).slice(0, 10)
    : null,
  project_type: project.project_type || "residential",
});

function CommissionRulesSheet({ open = false, sellers = [], onClose, onSaved }) {
  const { t } = useLocale();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState(null);
  const [rates, setRates] = useState(EMPTY_RATES);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    setLoadingProjects(true);
    setError(null);

    commissionsApi
      .listProjects()
      .then((data) => {
        if (!active) return;
        const list = data?.projects || data?.data?.projects || [];
        setProjects(list);
        setProjectId((current) =>
          list.some((item) => String(item.id) === String(current))
            ? current
            : String(list[0]?.id ?? "")
        );
      })
      .catch(() => {
        if (active) {
          setProjects([]);
          setProjectId("");
          setProject(null);
          setRates(EMPTY_RATES);
          setError(t("projects.failedToLoadProject"));
        }
      })
      .finally(() => {
        if (active) setLoadingProjects(false);
      });

    return () => {
      active = false;
    };
  }, [open, t]);

  useEffect(() => {
    if (!open || !projectId) {
      setProject(null);
      setRates(EMPTY_RATES);
      return undefined;
    }

    let active = true;
    setLoadingProject(true);
    setError(null);

    commissionsApi
      .getProject(projectId)
      .then((data) => {
        if (!active) return;
        const loaded = data?.project || data?.data || data;
        setProject(loaded || null);
        setRates({
          direct: loaded?.commission_rate_direct ?? 0,
          bank: loaded?.commission_rate_bank ?? 0,
          cash: loaded?.commission_rate_cash ?? 0,
        });
      })
      .catch(() => {
        if (active) setError(t("projects.failedToLoadProject"));
      })
      .finally(() => {
        if (active) setLoadingProject(false);
      });

    return () => {
      active = false;
    };
  }, [open, projectId, t]);

  const updateRate = (field, value) => {
    setRates((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!project || saving) return;

    setSaving(true);
    setError(null);
    try {
      await commissionsApi.updateProject(
        project.id || projectId,
        projectPayload(project, rates)
      );
      onSaved?.();
    } catch (err) {
      setError(err?.message || t("commissions.rulesSaveError"));
    } finally {
      setSaving(false);
    }
  };

  const disabled = loadingProjects || loadingProject || saving || !project;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("commissions.rulesTitle")}
      description={t("commissions.rulesSubtitle")}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="commission-rules-form"
            loading={saving}
            disabled={disabled}
          >
            {saving ? t("common.saving") : t("commissions.saveRules")}
          </Button>
        </>
      }
    >
      <form
        id="commission-rules-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {loadingProjects ? (
          <p className="text-body text-ink-3">{t("common.loading")}</p>
        ) : projects.length === 0 ? (
          <p className="text-body text-ink-3">{t("commissions.noProjects")}</p>
        ) : (
          <>
            <Field label={t("commissions.projectLabel")}>
              <Select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                disabled={saving}
                autoFocus
              >
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>

            {loadingProject ? (
              <p className="text-body text-ink-3">
                {t("projects.loadingProject")}
              </p>
            ) : project ? (
              <>
                <div className="rounded-control border border-line bg-surface-2/60 p-3">
                  <p className="text-label font-semibold text-ink-2">
                    {t("commissions.defaultRate")}
                  </p>
                  <p className="text-micro text-ink-3">
                    {t("commissions.defaultRateHint")}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Field label={t("projects.commissionRateDirect")}>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                        value={rates.direct}
                        onChange={(event) =>
                          updateRate("direct", event.target.value)
                        }
                        disabled={saving}
                      />
                    </Field>
                    <Field label={t("projects.commissionRateBank")}>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                        value={rates.bank}
                        onChange={(event) => updateRate("bank", event.target.value)}
                        disabled={saving}
                      />
                    </Field>
                    <Field label={t("projects.commissionRateCash")}>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                        value={rates.cash}
                        onChange={(event) => updateRate("cash", event.target.value)}
                        disabled={saving}
                      />
                    </Field>
                  </div>
                </div>

                <Field
                  label={t("commissions.paymentRule")}
                  hint={t("commissions.paymentRuleHint")}
                >
                  <Select defaultValue="approval" disabled>
                    <option value="approval">
                      {t("commissions.approveTrigger")}
                    </option>
                  </Select>
                </Field>

                <div className="flex flex-col gap-2">
                  <p className="text-label font-semibold text-ink-2">
                    {t("commissions.sellerExceptions")}
                  </p>
                  {sellers.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {sellers.map((seller) => (
                        <div
                          key={seller}
                          className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2"
                        >
                          <span className="min-w-0 truncate text-body text-ink">
                            {seller}
                          </span>
                          <Input
                            type="number"
                            value=""
                            readOnly
                            placeholder="—"
                            aria-label={`${seller} ${t(
                              "commissions.defaultRate"
                            )}`}
                            className="w-24 text-right"
                            disabled
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-micro text-ink-3">
                      {t("commissions.noSellers")}
                    </p>
                  )}
                  <p className="text-micro text-ink-3">
                    {t("commissions.sellerExceptionsHint")}
                  </p>
                </div>

                <p className="rounded-control bg-info-soft px-3 py-2 text-micro text-info">
                  {t("commissions.rulesNote")}
                </p>
              </>
            ) : null}
          </>
        )}

        {error && (
          <p role="alert" className="text-micro text-danger">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}

CommissionRulesSheet.propTypes = {
  open: PropTypes.bool,
  sellers: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
};

export default CommissionRulesSheet;
