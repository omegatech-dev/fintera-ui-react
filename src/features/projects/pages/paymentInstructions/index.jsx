import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowLeft,
  faArrowUp,
  faEdit,
  faPlus,
  faTrashAlt,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { projectsApi } from "../../api";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useToast } from "../../../../contexts/ToastContext";
import { useGeneralSettings } from "@/contexts/generalSettings";
import { getDefaultCurrency } from "@/shared/utils/formatSettings";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import {
  Banner,
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  ErrorState,
  Skeleton,
  Tabs,
} from "@/shared/ui";
import BankAccountSheet from "../../components/BankAccountSheet";

const TYPE_KEYS = {
  savings: "paymentInstructions.typeSavings",
  checking: "paymentInstructions.typeChecking",
};

const CURRENCY_SYMBOLS = {
  HNL: "L",
  USD: "$",
};

function maskAccountNumber(value) {
  const digits = String(value || "").replace(/\s+/g, "");
  if (!digits) return "****";
  return `**** ${digits.slice(-4)}`;
}

function formatAmount(value, currency) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return symbol ? `${symbol} ${formatted}` : formatted;
}

export default function PaymentInstructionsPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { settings: generalSettings } = useGeneralSettings();
  const [project, setProject] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAccount, setSheetAccount] = useState(null);
  const [deleteBlocked, setDeleteBlocked] = useState(false);
  const [instructionsDraft, setInstructionsDraft] = useState("");
  const [savingInstructions, setSavingInstructions] = useState(false);

  const defaultCurrency =
    generalSettings.default_currency || getDefaultCurrency();
  const reservationAmount = Number(generalSettings.reservation_min_amount) || 0;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectResponse, instructionsResponse] = await Promise.all([
        projectsApi.get(id),
        projectsApi.listPaymentInstructions(id),
      ]);
      setProject(projectResponse?.project || projectResponse || null);
      setInstructions(instructionsResponse?.payment_instructions || []);
    } catch (err) {
      setError(err?.message || t("paymentInstructions.loadError"));
    } finally {
      setLoading(false);
    }
    // `t` only provides the fallback message; adding it would refetch on every
    // locale render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const defaultAccount = useMemo(() => {
    if (!instructions.length) return null;
    return instructions.find((account) => account.is_default) || instructions[0];
  }, [instructions]);

  useEffect(() => {
    setInstructionsDraft(defaultAccount?.notes || "");
  }, [defaultAccount?.id, defaultAccount?.notes]);

  const isDefaultAccount = (account) =>
    Boolean(account && defaultAccount && account.id === defaultAccount.id);

  const accountCurrency = (account) =>
    account?.currency || defaultCurrency;

  const openCreate = () => {
    setSheetAccount(null);
    setSheetOpen(true);
  };

  const openEdit = (account) => {
    setSheetAccount(account);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSheetAccount(null);
  };

  const handleSaveAccount = async (values) => {
    const payload = {
      bank_name: values.bank_name,
      beneficiary_name: values.beneficiary_name,
      account_number: values.account_number,
      account_type: values.account_type,
      currency: values.currency,
      is_default: Boolean(values.is_default),
    };

    try {
      if (sheetAccount) {
        await projectsApi.updatePaymentInstruction(
          id,
          sheetAccount.id,
          payload
        );
        showToast(t("paymentInstructions.updateSuccess"), "success");
      } else {
        await projectsApi.createPaymentInstruction(id, payload);
        showToast(t("paymentInstructions.createSuccess"), "success");
      }
      closeSheet();
      await load();
    } catch (err) {
      showToast(err?.message || t("paymentInstructions.saveError"), "error");
      throw err;
    }
  };

  const handleDelete = async (account) => {
    if (isDefaultAccount(account)) {
      setDeleteBlocked(true);
      return;
    }

    const confirmed = await confirmDialog({
      title: t("paymentInstructions.confirmDelete", {
        account: maskAccountNumber(account.account_number),
      }),
      confirmLabel: t("common.delete"),
    });
    if (!confirmed) {
      return;
    }
    try {
      await projectsApi.deletePaymentInstruction(id, account.id);
      showToast(t("paymentInstructions.deleteSuccess"), "success");
      await load();
    } catch (err) {
      showToast(err?.message || t("paymentInstructions.saveError"), "error");
    }
  };

  const handleMove = async (account, direction) => {
    const index = instructions.findIndex((item) => item.id === account.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const target = instructions[targetIndex];
    if (index < 0 || !target) return;
    try {
      await Promise.all([
        projectsApi.updatePaymentInstruction(id, account.id, {
          position: targetIndex,
        }),
        projectsApi.updatePaymentInstruction(id, target.id, {
          position: index,
        }),
      ]);
      await load();
    } catch (err) {
      showToast(err?.message || t("paymentInstructions.saveError"), "error");
    }
  };

  const handleSaveInstructions = async () => {
    if (!defaultAccount) return;
    setSavingInstructions(true);
    try {
      await projectsApi.updatePaymentInstruction(id, defaultAccount.id, {
        notes: instructionsDraft.trim(),
      });
      showToast(t("paymentInstructions.instructionsSaved"), "success");
      await load();
    } catch (err) {
      showToast(err?.message || t("paymentInstructions.saveError"), "error");
    } finally {
      setSavingInstructions(false);
    }
  };

  const tabs = [
    { value: "overview", label: t("projects.tabOverview") },
    { value: "lots", label: t("projects.tabLots") },
    { value: "media", label: t("projects.tabMedia") },
    {
      value: "instructions",
      label: t("projects.paymentInstructions"),
    },
    { value: "activity", label: t("projects.tabActivity") },
  ];

  const handleTabChange = (value) => {
    if (value === "instructions") return;
    if (value === "lots") {
      navigate(`/projects/${id}/lots`);
      return;
    }
    navigate(value === "overview" ? `/projects/${id}` : `/projects/${id}?tab=${value}`);
  };

  const instructionsDirty =
    instructionsDraft !== (defaultAccount?.notes || "");
  const publishedWarning =
    Boolean(project?.is_published) &&
    !loading &&
    !error &&
    instructions.length === 0;

  return (
    <main className="min-h-screen w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-label font-semibold text-ink-3 transition-colors hover:text-ink"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {t("paymentInstructions.backToProjects")}
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-page font-bold tracking-tight text-ink">
                {t("projects.paymentInstructions")}
              </h1>
              {project && (
                <Chip tone={project.is_published ? "success" : "warning"}>
                  {project.is_published
                    ? t("paymentInstructions.published")
                    : t("paymentInstructions.draft")}
                </Chip>
              )}
            </div>
            <p className="mt-1 text-body text-ink-3">
              {project?.name && <span>{project.name} · </span>}
              {t("paymentInstructions.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/projects/${id}/edit`)}
            >
              {t("paymentInstructions.viewProject")}
            </Button>
            <Button size="sm" onClick={openCreate}>
              <FontAwesomeIcon icon={faPlus} />
              {t("paymentInstructions.addAccount")}
            </Button>
          </div>
        </header>

        <Tabs
          items={tabs}
          value="instructions"
          onChange={handleTabChange}
        />

        {publishedWarning && (
          <Banner tone="warning">
            {t("paymentInstructions.publishedWarning")}
          </Banner>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card
              title={t("projects.accounts")}
              action={
                !loading && !error ? (
                  <span className="text-micro font-semibold text-ink-3">
                    {t("paymentInstructions.accountCount", {
                      count: instructions.length,
                    })}
                  </span>
                ) : undefined
              }
              bodyClassName="space-y-3 p-5"
            >
              {loading ? (
                <Skeleton rows={2} />
              ) : error ? (
                <ErrorState
                  title={t("paymentInstructions.loadError")}
                  description={error}
                  onRetry={load}
                />
              ) : instructions.length === 0 ? (
                <EmptyState
                  variant="empty"
                  icon={
                    <FontAwesomeIcon
                      icon={faUniversity}
                      className="text-2xl text-ink-3"
                    />
                  }
                  title={t("paymentInstructions.emptyTitle")}
                  description={t("paymentInstructions.emptyDescription")}
                />
              ) : (
                <ul className="space-y-3">
                  {instructions.map((account, index) => {
                    const isDefault = isDefaultAccount(account);
                    return (
                      <li
                        key={account.id}
                        className="rounded-card border border-line bg-surface-2 p-3.5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${
                                isDefault
                                  ? "bg-brand-soft text-brand-strong"
                                  : "bg-info-soft text-info"
                              }`}
                            >
                              <FontAwesomeIcon icon={faUniversity} />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-body font-bold text-ink">
                                  {account.bank_name}
                                </p>
                                {isDefault && (
                                  <Chip tone="success">
                                    {t("paymentInstructions.defaultAccount")}
                                  </Chip>
                                )}
                              </div>
                              <p className="text-micro text-ink-3">
                                {[
                                  t(TYPE_KEYS[account.account_type] || "paymentInstructions.typeSavings"),
                                  maskAccountNumber(account.account_number),
                                  accountCurrency(account),
                                ].join(" · ")}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-0.5">
                            <Button
                              variant="ghost"
                              iconOnly
                              aria-label={t("paymentInstructions.moveUp")}
                              title={t("paymentInstructions.moveUp")}
                              disabled={index === 0}
                              onClick={() => handleMove(account, "up")}
                              className="h-8 w-8 text-ink-3"
                            >
                              <FontAwesomeIcon icon={faArrowUp} />
                            </Button>
                            <Button
                              variant="ghost"
                              iconOnly
                              aria-label={t("paymentInstructions.moveDown")}
                              title={t("paymentInstructions.moveDown")}
                              disabled={index === instructions.length - 1}
                              onClick={() => handleMove(account, "down")}
                              className="h-8 w-8 text-ink-3"
                            >
                              <FontAwesomeIcon icon={faArrowDown} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(account)}
                              className="text-brand-strong"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                              {t("common.edit")}
                            </Button>
                            <Button
                              variant="ghost"
                              iconOnly
                              aria-label={t("paymentInstructions.delete")}
                              title={t("paymentInstructions.delete")}
                              onClick={() => handleDelete(account)}
                              className="h-8 w-8 text-ink-3 hover:text-danger"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </Button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card
              title={t("paymentInstructions.instructionsTitle")}
              bodyClassName="flex flex-col gap-3 p-5"
            >
              <p className="text-micro text-ink-3">
                {t("paymentInstructions.instructionsHint")}
              </p>
              <textarea
                aria-label={t("paymentInstructions.instructionsTitle")}
                value={instructionsDraft}
                onChange={(event) => setInstructionsDraft(event.target.value)}
                placeholder={t("paymentInstructions.instructionsPlaceholder")}
                disabled={!defaultAccount}
                className="min-h-[120px] w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-[16px] text-ink outline-none sm:text-body"
                maxLength={500}
              />
              {!defaultAccount && (
                <p className="text-micro text-ink-3">
                  {t("paymentInstructions.instructionsEmpty")}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveInstructions}
                  disabled={!defaultAccount || !instructionsDirty}
                  loading={savingInstructions}
                >
                  {t("paymentInstructions.saveInstructions")}
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <Card
              title={t("paymentInstructions.previewTitle")}
              bodyClassName="p-5"
            >
              {defaultAccount ? (
                <div className="flex flex-col gap-3 rounded-control border border-line bg-canvas p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-soft text-brand-strong">
                      <FontAwesomeIcon icon={faUniversity} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-micro font-bold text-ink">
                        {defaultAccount.bank_name}
                      </p>
                      <p className="truncate text-[10px] text-ink-3">
                        {[
                          t(
                            TYPE_KEYS[defaultAccount.account_type] ||
                              "paymentInstructions.typeSavings"
                          ),
                          maskAccountNumber(defaultAccount.account_number),
                          accountCurrency(defaultAccount),
                        ].join(" · ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-micro text-ink-3">
                      {t("paymentInstructions.reservationAmount")}
                    </span>
                    <span className="text-body font-bold tabular-nums text-ink">
                      {formatAmount(
                        reservationAmount,
                        accountCurrency(defaultAccount)
                      )}
                    </span>
                  </div>

                  <p className="whitespace-pre-line text-micro text-ink-3">
                    {instructionsDraft.trim() ||
                      t("paymentInstructions.instructionsPlaceholder")}
                  </p>

                  <Button size="sm" className="w-full" disabled>
                    {t("paymentInstructions.uploadReceipt")}
                  </Button>
                  <p className="text-center text-[10px] text-ink-3">
                    {t("paymentInstructions.uploadReceiptHint")}
                  </p>
                </div>
              ) : (
                <EmptyState
                  variant="empty"
                  title={t("paymentInstructions.previewEmpty")}
                />
              )}
            </Card>

            <Banner tone="warning">
              <p className="text-label font-bold">
                {t("paymentInstructions.defaultTipTitle")}
              </p>
              <p className="mt-1 text-micro">
                {t("paymentInstructions.defaultTipText")}
              </p>
            </Banner>
          </div>
        </div>
      </div>

      <BankAccountSheet
        open={sheetOpen}
        account={sheetAccount}
        isDefault={isDefaultAccount(sheetAccount)}
        defaultCurrency={defaultCurrency}
        defaultWhenNew={instructions.length === 0}
        onClose={closeSheet}
        onSubmit={handleSaveAccount}
      />

      <Dialog
        open={deleteBlocked}
        onClose={() => setDeleteBlocked(false)}
        title={t("paymentInstructions.defaultAccount")}
        description={t("paymentInstructions.defaultDeleteBlocked")}
        size="sm"
        footer={
          <Button onClick={() => setDeleteBlocked(false)}>
            {t("common.close")}
          </Button>
        }
      />
    </main>
  );
}
