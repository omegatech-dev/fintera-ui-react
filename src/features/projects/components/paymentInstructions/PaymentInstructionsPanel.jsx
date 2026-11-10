import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faEdit,
  faPlus,
  faSave,
  faTimes,
  faTrashAlt,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../../../contexts/LocaleContext";

const LIMITS = {
  bank_name: 120,
  beneficiary_name: 160,
  account_number: 60,
  notes: 500,
};

const EMPTY_FORM = {
  bank_name: "",
  beneficiary_name: "",
  account_number: "",
  account_type: "savings",
  notes: "",
};

const inputClass =
  "w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 px-3 py-2.5 text-sm font-semibold text-bgray-900 dark:text-white outline-none focus:border-indigo-500";
const labelClass =
  "mb-1 block text-[10px] font-black uppercase tracking-widest text-bgray-500";
const errorClass = "mt-1 text-[11px] font-semibold text-red-500";

function toForm(account) {
  return {
    bank_name: account?.bank_name || "",
    beneficiary_name: account?.beneficiary_name || "",
    account_number: account?.account_number || "",
    account_type: account?.account_type || "savings",
    notes: account?.notes || "",
  };
}

export default function PaymentInstructionsPanel({
  instructions = [],
  loading = false,
  error = null,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
  onMove,
  canManage = false,
  publishedWarning = false,
}) {
  const { t } = useLocale();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEditingNew = editing === "new";

  const startCreate = () => {
    setEditing("new");
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const startEdit = (account) => {
    setEditing(account.id);
    setForm(toForm(account));
    setErrors({});
  };

  const cancel = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

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
    if (String(form.notes || "").trim().length > LIMITS.notes) {
      next.notes = t("paymentInstructions.tooLong", { max: LIMITS.notes });
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = {
      bank_name: form.bank_name.trim(),
      beneficiary_name: form.beneficiary_name.trim(),
      account_number: form.account_number.trim(),
      account_type: form.account_type,
      notes: form.notes.trim() || null,
    };
    setSaving(true);
    try {
      if (isEditingNew) await onCreate(payload);
      else await onUpdate(editing, payload);
      cancel();
    } catch {
      // The page shows the error toast; keep the form open.
    } finally {
      setSaving(false);
    }
  };

  const accountTypeLabel = (type) =>
    type === "checking"
      ? t("paymentInstructions.checking")
      : t("paymentInstructions.savings");

  return (
    <section className="rounded-[2.5rem] border border-bgray-200 bg-white p-8 shadow-sm dark:border-darkblack-400 dark:bg-darkblack-600 lg:p-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-bgray-900 dark:text-white">
            {t("paymentInstructions.title")}
          </h2>
          <p className="mt-1 text-xs font-semibold text-bgray-500">
            {t("paymentInstructions.description")}
          </p>
        </div>
        {canManage && !editing && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-indigo-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t("paymentInstructions.addAccount")}
          </button>
        )}
      </div>

      {publishedWarning && (
        <div
          role="status"
          className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800"
        >
          {t("paymentInstructions.publishedWarning")}
        </div>
      )}

      {loading && (
        <p className="py-6 text-sm font-semibold text-bgray-500">
          {t("common.loading")}
        </p>
      )}

      {error && !loading && (
        <div className="space-y-2 py-6">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-black uppercase tracking-widest text-indigo-600"
          >
            {t("paymentInstructions.retry")}
          </button>
        </div>
      )}

      {!loading && !error && instructions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-bgray-300 p-8 text-center dark:border-darkblack-400">
          <FontAwesomeIcon
            icon={faUniversity}
            className="mb-3 text-2xl text-bgray-300"
          />
          <h3 className="text-sm font-black text-bgray-700 dark:text-bgray-100">
            {t("paymentInstructions.emptyTitle")}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs font-semibold text-bgray-500">
            {t("paymentInstructions.emptyDescription")}
          </p>
        </div>
      )}

      {!loading && !error && instructions.length > 0 && (
        <ul className="space-y-3">
          {instructions.map((account, index) => (
            <li
              key={account.id}
              className="flex flex-col gap-4 rounded-2xl border border-bgray-100 bg-bgray-50/40 p-4 dark:border-darkblack-400 dark:bg-darkblack-500/40 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FontAwesomeIcon icon={faUniversity} />
                  </span>
                  <h3 className="text-sm font-black text-bgray-900 dark:text-white">
                    {account.bank_name}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-bgray-500 dark:bg-darkblack-400">
                    {accountTypeLabel(account.account_type)}
                  </span>
                </div>
                <p className="font-mono text-sm font-black tracking-wider text-bgray-900 dark:text-white">
                  {account.account_number}
                </p>
                <p className="text-xs font-semibold text-bgray-600 dark:text-bgray-300">
                  {account.beneficiary_name}
                </p>
                {account.notes && (
                  <p className="text-[11px] text-bgray-500">{account.notes}</p>
                )}
              </div>

              {canManage && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={t("paymentInstructions.moveUp")}
                    title={t("paymentInstructions.moveUp")}
                    disabled={index === 0}
                    onClick={() => onMove(account, "up")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-bgray-600 transition-colors hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 dark:bg-darkblack-400 dark:text-bgray-300"
                  >
                    <FontAwesomeIcon icon={faArrowUp} />
                  </button>
                  <button
                    type="button"
                    aria-label={t("paymentInstructions.moveDown")}
                    title={t("paymentInstructions.moveDown")}
                    disabled={index === instructions.length - 1}
                    onClick={() => onMove(account, "down")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-bgray-600 transition-colors hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 dark:bg-darkblack-400 dark:text-bgray-300"
                  >
                    <FontAwesomeIcon icon={faArrowDown} />
                  </button>
                  <button
                    type="button"
                    aria-label={t("paymentInstructions.edit")}
                    title={t("paymentInstructions.edit")}
                    onClick={() => startEdit(account)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-bgray-600 transition-colors hover:bg-indigo-600 hover:text-white dark:bg-darkblack-400 dark:text-bgray-300"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    type="button"
                    aria-label={t("paymentInstructions.delete")}
                    title={t("paymentInstructions.delete")}
                    onClick={() => onDelete(account)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-bgray-600 transition-colors hover:bg-red-500 hover:text-white dark:bg-darkblack-400 dark:text-bgray-300"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing && canManage && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5"
        >
          <h3 className="text-sm font-black text-bgray-900 dark:text-white">
            {isEditingNew
              ? t("paymentInstructions.newAccount")
              : t("paymentInstructions.editAccount")}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pi-bank-name" className={labelClass}>
                {t("paymentInstructions.bankName")} *
              </label>
              <input
                id="pi-bank-name"
                value={form.bank_name}
                onChange={(event) => updateField("bank_name", event.target.value)}
                placeholder={t("paymentInstructions.enterBankName")}
                aria-invalid={Boolean(errors.bank_name)}
                className={inputClass}
              />
              {errors.bank_name && <p className={errorClass}>{errors.bank_name}</p>}
            </div>

            <div>
              <label htmlFor="pi-account-type" className={labelClass}>
                {t("paymentInstructions.accountType")}
              </label>
              <select
                id="pi-account-type"
                value={form.account_type}
                onChange={(event) => updateField("account_type", event.target.value)}
                className={inputClass}
              >
                <option value="savings">{t("paymentInstructions.savings")}</option>
                <option value="checking">{t("paymentInstructions.checking")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="pi-account-number" className={labelClass}>
                {t("paymentInstructions.accountNumber")} *
              </label>
              <input
                id="pi-account-number"
                value={form.account_number}
                onChange={(event) => updateField("account_number", event.target.value)}
                placeholder={t("paymentInstructions.enterAccountNumber")}
                aria-invalid={Boolean(errors.account_number)}
                className={inputClass}
              />
              {errors.account_number && (
                <p className={errorClass}>{errors.account_number}</p>
              )}
            </div>

            <div>
              <label htmlFor="pi-beneficiary" className={labelClass}>
                {t("paymentInstructions.beneficiary")} *
              </label>
              <input
                id="pi-beneficiary"
                value={form.beneficiary_name}
                onChange={(event) => updateField("beneficiary_name", event.target.value)}
                placeholder={t("paymentInstructions.enterBeneficiary")}
                aria-invalid={Boolean(errors.beneficiary_name)}
                className={inputClass}
              />
              {errors.beneficiary_name && (
                <p className={errorClass}>{errors.beneficiary_name}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="pi-notes" className={labelClass}>
                {t("paymentInstructions.notes")}
              </label>
              <textarea
                id="pi-notes"
                rows={2}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder={t("paymentInstructions.enterNotes")}
                aria-invalid={Boolean(errors.notes)}
                className={inputClass}
              />
              {errors.notes && <p className={errorClass}>{errors.notes}</p>}
            </div>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-bgray-400">
            {t("paymentInstructions.limitHint")}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} />
              {saving
                ? t("paymentInstructions.saving")
                : t("paymentInstructions.save")}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="flex items-center gap-2 rounded-xl border border-bgray-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-bgray-600 dark:border-darkblack-400 dark:text-bgray-300"
            >
              <FontAwesomeIcon icon={faTimes} />
              {t("paymentInstructions.cancel")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
