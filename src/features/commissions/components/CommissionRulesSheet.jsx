import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Button, Dialog, Field, Input, Select } from "@/shared/ui";
import { sellerApi } from "@/features/seller/api";
import {
  DEFAULT_RULES,
  buildExceptionChanges,
  buildRulesPayload,
  buildSellerRows,
  normalizeExceptions,
  normalizeRules,
  normalizeSellers,
} from "./rulesUtils";

function RateInput({
  label,
  value,
  onChange,
  disabled,
  suffix = "%",
  min = "0",
  max = "100",
  step = "0.1",
  width = "w-24",
}) {
  return (
    <div className={`relative shrink-0 ${width}`}>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
        className="h-9 pl-3 pr-10 text-right tabular-nums"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-micro text-ink-3">
        {suffix}
      </span>
    </div>
  );
}

RateInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  suffix: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  step: PropTypes.string,
  width: PropTypes.string,
};

function CommissionRulesSheet({ open = false, sellers = [], onClose, onSaved }) {
  const { t } = useLocale();
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const propSellersKey = sellers.join("|");

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    setLoading(true);
    setError(null);

    const requests = [
      sellerApi.getCommissionRules(),
      sellerApi.listCommissionExceptions(),
      sellerApi.listSellers({}),
    ];

    Promise.allSettled(requests)
      .then(([rulesResult, exceptionsResult, sellersResult]) => {
        if (!active) return;

        const loadedRules =
          rulesResult.status === "fulfilled"
            ? normalizeRules(rulesResult.value)
            : DEFAULT_RULES;
        const exceptions =
          exceptionsResult.status === "fulfilled"
            ? normalizeExceptions(exceptionsResult.value)
            : [];
        const sellerList =
          sellersResult.status === "fulfilled"
            ? normalizeSellers(sellersResult.value)
            : [];

        setRules(loadedRules);
        setRows(
          buildSellerRows({
            sellers: sellerList,
            exceptions,
            propSellers: propSellersKey
              ? propSellersKey.split("|")
              : [],
            defaultRate: loadedRules.defaultRate,
          })
        );

        if (rulesResult.status === "rejected") {
          setError(t("commissions.rulesLoadError"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, t, propSellersKey]);

  const updateRule = (field, value) => {
    setRules((current) => ({ ...current, [field]: value }));
    if (field === "defaultRate") {
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.exceptionId ? row : { ...row, rate: value }
        )
      );
    }
  };

  const updateRowRate = (key, value) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, rate: value } : row))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const payload = buildRulesPayload(rules);
    const invalidRate = rows.some((row) => {
      const rate = Number(row.rate);
      return row.rate !== "" && (Number.isNaN(rate) || rate < 0 || rate > 100);
    });
    if (
      Number.isNaN(payload.default_rate) ||
      payload.default_rate < 0 ||
      payload.default_rate > 100 ||
      Number.isNaN(payload.acceptance_window_hours) ||
      payload.acceptance_window_hours <= 0 ||
      Number.isNaN(payload.unassigned_rate) ||
      payload.unassigned_rate < 0 ||
      payload.unassigned_rate > 100 ||
      invalidRate
    ) {
      setError(t("commissions.rulesInvalid"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await sellerApi.updateCommissionRules(payload);
      const { upserts, deletes } = buildExceptionChanges(
        rows,
        rules.defaultRate
      );
      await Promise.all([
        ...upserts.map((exception) =>
          sellerApi.upsertCommissionException(exception)
        ),
        ...deletes.map((id) => sellerApi.deleteCommissionException(id)),
      ]);
      onSaved?.();
    } catch (err) {
      setError(err?.message || t("commissions.rulesSaveError"));
    } finally {
      setSaving(false);
    }
  };

  const disabled = loading || saving;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("commissions.rulesTitle")}
      description={t("commissions.rulesSubtitleGlobal")}
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
        {loading ? (
          <p className="text-body text-ink-3">{t("common.loading")}</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label={t("commissions.defaultRate")}
                hint={t("commissions.defaultRateHintGlobal")}
              >
                <RateInput
                  label={t("commissions.defaultRate")}
                  value={rules.defaultRate}
                  onChange={(event) =>
                    updateRule("defaultRate", event.target.value)
                  }
                  disabled={saving}
                />
              </Field>

              <Field
                label={t("commissions.acceptanceWindow")}
                hint={t("commissions.acceptanceWindowHint")}
              >
                <RateInput
                  label={t("commissions.acceptanceWindow")}
                  value={rules.acceptanceWindow}
                  onChange={(event) =>
                    updateRule("acceptanceWindow", event.target.value)
                  }
                  disabled={saving}
                  suffix={t("commissions.hours")}
                  min="1"
                  max="72"
                  step="1"
                  width="w-32"
                />
              </Field>
            </div>

            <Field
              label={t("commissions.paymentRule")}
              hint={t("commissions.paymentRuleHint")}
            >
              <Select
                value={rules.paymentRule}
                onChange={() => {}}
                disabled
              >
                <option value="contract_approval">
                  {t("commissions.approveTrigger")}
                </option>
              </Select>
            </Field>

            <div className="flex flex-col gap-2">
              <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                {t("commissions.sellerExceptions")}
              </p>

              <div className="flex flex-col gap-2">
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-body text-ink">
                        {row.sellerName}
                      </span>
                      <RateInput
                        label={`${row.sellerName} ${t("commissions.rate")}`}
                        value={row.rate}
                        onChange={(event) =>
                          updateRowRate(row.key, event.target.value)
                        }
                        disabled={saving || row.sellerId === null}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-micro text-ink-3">
                    {t("commissions.noSellers")}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface-2/60 px-3 py-2">
                  <span className="min-w-0 truncate text-body font-semibold text-ink">
                    {t("commissions.unassignedRate")}
                  </span>
                  <RateInput
                    label={t("commissions.unassignedRate")}
                    value={rules.unassignedRate}
                    onChange={(event) =>
                      updateRule("unassignedRate", event.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <p className="text-micro text-ink-3">
                {t("commissions.sellerExceptionsHintActive")}
              </p>
            </div>

            <p className="rounded-control bg-info-soft px-3 py-2 text-micro text-info">
              {t("commissions.rulesNote")}
            </p>
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
