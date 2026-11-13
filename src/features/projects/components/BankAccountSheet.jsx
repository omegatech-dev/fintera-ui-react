import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Button, Dialog, Field, Input, Select, Toggle } from "@/shared/ui";

const LIMITS = {
  bank_name: 120,
  beneficiary_name: 160,
  account_number: 60,
};

const EMPTY_FORM = {
  bank_name: "",
  account_type: "savings",
  currency: "HNL",
  account_number: "",
  beneficiary_name: "",
  is_default: false,
};

function toForm(account, defaultCurrency, isDefault) {
  if (!account) {
    return {
      ...EMPTY_FORM,
      currency: defaultCurrency || EMPTY_FORM.currency,
      is_default: isDefault,
    };
  }
  return {
    bank_name: account.bank_name || "",
    account_type: account.account_type || "savings",
    currency: account.currency || defaultCurrency || EMPTY_FORM.currency,
    account_number: account.account_number || "",
    beneficiary_name: account.beneficiary_name || "",
    is_default: isDefault,
  };
}

export default function BankAccountSheet({
  open = false,
  account = null,
  isDefault = false,
  defaultCurrency = "HNL",
  defaultWhenNew = false,
  onClose,
  onSubmit,
}) {
  const { t } = useLocale();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(toForm(account, defaultCurrency, isDefault || (!account && defaultWhenNew)));
    setErrors({});
  }, [open, account, defaultCurrency, isDefault, defaultWhenNew]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    ["bank_name", "beneficiary_name", "account_number"].forEach((field) => {
      const value = String(form[field] || "").trim();
      if (!value) next[field] = t("paymentInstructions.required");
      else if (value.length > LIMITS[field]) {
        next[field] = t("paymentInstructions.tooLong", { max: LIMITS[field] });
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      bank_name: form.bank_name.trim(),
      account_type: form.account_type,
      currency: form.currency,
      account_number: form.account_number.trim(),
      beneficiary_name: form.beneficiary_name.trim(),
      is_default: Boolean(form.is_default),
    };

    setSaving(true);
    try {
      await onSubmit?.(payload);
    } catch {
      // The page shows the error toast; keep the sheet open.
    } finally {
      setSaving(false);
    }
  };

  const isEditingDefault = Boolean(account && isDefault);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        account
          ? t("paymentInstructions.editAccount")
          : t("paymentInstructions.newAccount")
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t("paymentInstructions.cancel")}
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {saving
              ? t("paymentInstructions.saving")
              : t("paymentInstructions.save")}
          </Button>
        </>
      }
    >
      <form
        id="bank-account-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-3.5"
      >
        <Field
          label={t("paymentInstructions.bankName")}
          required
          error={errors.bank_name}
        >
          <Input
            value={form.bank_name}
            onChange={(event) => updateField("bank_name", event.target.value)}
            placeholder={t("paymentInstructions.enterBankName")}
            invalid={Boolean(errors.bank_name)}
            autoFocus
          />
        </Field>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label={t("paymentInstructions.accountType")}>
            <Select
              value={form.account_type}
              onChange={(event) =>
                updateField("account_type", event.target.value)
              }
            >
              <option value="savings">
                {t("paymentInstructions.typeSavings")}
              </option>
              <option value="checking">
                {t("paymentInstructions.typeChecking")}
              </option>
            </Select>
          </Field>

          <Field label={t("projects.currency")}>
            <Select
              value={form.currency}
              onChange={(event) => updateField("currency", event.target.value)}
            >
              <option value="HNL">HNL</option>
              <option value="USD">USD</option>
            </Select>
          </Field>
        </div>

        <Field
          label={t("paymentInstructions.number")}
          required
          error={errors.account_number}
        >
          <Input
            value={form.account_number}
            onChange={(event) =>
              updateField("account_number", event.target.value)
            }
            placeholder={t("paymentInstructions.enterAccountNumber")}
            invalid={Boolean(errors.account_number)}
          />
        </Field>

        <Field
          label={t("paymentInstructions.holder")}
          required
          error={errors.beneficiary_name}
        >
          <Input
            value={form.beneficiary_name}
            onChange={(event) =>
              updateField("beneficiary_name", event.target.value)
            }
            placeholder={t("paymentInstructions.enterBeneficiary")}
            invalid={Boolean(errors.beneficiary_name)}
          />
        </Field>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-label font-semibold text-ink-2">
              {t("paymentInstructions.defaultAccount")}
            </span>
            <Toggle
              checked={Boolean(form.is_default)}
              onChange={(value) => updateField("is_default", value)}
              label={t("paymentInstructions.defaultAccount")}
              disabled={isEditingDefault}
            />
          </div>
          <p className="text-micro text-ink-3">
            {t("paymentInstructions.defaultAccountHint")}
          </p>
        </div>

        <p className="rounded-control bg-info-soft px-3 py-2 text-micro text-info">
          {t("paymentInstructions.accountSheetNote")}
        </p>
      </form>
    </Dialog>
  );
}

BankAccountSheet.propTypes = {
  open: PropTypes.bool,
  account: PropTypes.object,
  isDefault: PropTypes.bool,
  defaultCurrency: PropTypes.string,
  defaultWhenNew: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
