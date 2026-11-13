import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faBan,
  faBell,
  faCheckCircle,
  faDownload,
  faEllipsisVertical,
  faExclamationTriangle,
  faLocationDot,
  faReceipt,
  faRotateLeft,
  faUser,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { sanitizeHtml } from "@/shared/utils/sanitizeHtml";
import { formatStatus } from "@/shared/utils/formatStatus";
import { formatDate } from "@/shared/utils/formatters";
import { areaUnitLabel, linearUnitLabel } from "@/shared/utils/units";
import { contractsApi } from "../../api";
import { projectsApi } from "@/features/projects/api";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Menu,
  Skeleton,
  Table,
  Tabs,
} from "@/shared/ui";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import CreditScoreCard from "../../components/CreditScoreCard";
import DocumentsTab from "../../components/ContractDetails/tabs/DocumentsTab";
import PaymentSchedulePanel from "../../components/PaymentSchedulePanel";
import RejectionModal from "../../components/RejectionModal";
import LotDetailsModal from "@/features/projects/components/lots/LotDetailsModal";

const money = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return `L ${Number(value || 0).toLocaleString("es-HN", {
    maximumFractionDigits: 2,
  })}`;
};

const STATUS_TONES = {
  approved: "success",
  pending: "warning",
  submitted: "warning",
  rejected: "danger",
  cancelled: "danger",
  canceled: "danger",
  closed: "neutral",
  paid: "success",
  overdue: "danger",
};

const LOT_TONES = {
  available: "success",
  reserved: "warning",
  pending: "warning",
  financed: "info",
  fully_paid: "info",
  sold: "neutral",
};

const BANNER_TONES = {
  approved: {
    wrap: "border-brand/25 bg-brand-soft",
    title: "text-brand-strong",
    icon: "text-brand",
  },
  pending: {
    wrap: "border-warning/25 bg-warning-soft",
    title: "text-warning",
    icon: "text-warning",
  },
  submitted: {
    wrap: "border-warning/25 bg-warning-soft",
    title: "text-warning",
    icon: "text-warning",
  },
  rejected: {
    wrap: "border-danger/25 bg-danger-soft",
    title: "text-danger",
    icon: "text-danger",
  },
  cancelled: {
    wrap: "border-danger/25 bg-danger-soft",
    title: "text-danger",
    icon: "text-danger",
  },
  canceled: {
    wrap: "border-danger/25 bg-danger-soft",
    title: "text-danger",
    icon: "text-danger",
  },
  closed: {
    wrap: "border-line bg-surface-2",
    title: "text-ink-2",
    icon: "text-ink-3",
  },
};

const isHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value || "");

function StatusChip({ status, t }) {
  return (
    <Chip tone={STATUS_TONES[status] || "neutral"}>
      {formatStatus(status, t)}
    </Chip>
  );
}

function KpiCard({ label, value, caption, valueClassName = "text-ink", index = 0 }) {
  return (
    <div
      className="motion-fade-up flex min-h-[96px] flex-col justify-center gap-1 rounded-card border border-line bg-surface px-4 py-3.5"
      style={{ animationDelay: `${45 + index * 45}ms` }}
    >
      <p className="text-micro font-bold uppercase tracking-wide text-ink-3">{label}</p>
      <p className={`text-[21px] font-bold leading-tight tabular-nums ${valueClassName}`}>
        {value}
      </p>
      <p className="text-micro font-medium text-ink-3">{caption}</p>
    </div>
  );
}

function ContractDetail() {
  const { guid } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const { showToast } = useToast();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const validTabs = ["resumen", "cronograma", "pagos", "documentos", "notas"];
  const tab = validTabs.includes(requestedTab) ? requestedTab : "resumen";
  const setTab = (next) =>
    setSearchParams(
      (previous) => {
        previous.set("tab", next);
        return previous;
      },
      { replace: true }
    );
  const [noteDraft, setNoteDraft] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [paymentRequestToken, setPaymentRequestToken] = useState(0);
  const [lotDetails, setLotDetails] = useState(null);
  const [lotLoading, setLotLoading] = useState(false);

  const tabs = useMemo(
    () => [
      { value: "resumen", label: t("common.overview") },
      { value: "cronograma", label: t("contracts.scheduleTab") },
      { value: "pagos", label: t("contracts.paymentsTab") },
      { value: "documentos", label: t("contracts.documents") },
      { value: "notas", label: t("contracts.tabNotes") },
    ],
    [t]
  );

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await contractsApi.getByGuid(guid);
      const loaded = response?.contract || response;
      setContract(loaded);
      return loaded;
    } catch (err) {
      setError(err?.status === 404 ? "not-found" : "error");
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [guid]);

  const refreshContract = useCallback(() => load({ silent: true }), [load]);

  useEffect(() => {
    load();
  }, [load]);

  const schedule = useMemo(
    () =>
      [...(contract?.payment_schedule || [])].sort(
        (a, b) => new Date(a.due_date) - new Date(b.due_date)
      ),
    [contract]
  );

  const nextPayment = useMemo(
    () => schedule.find((item) => item.status !== "paid"),
    [schedule]
  );

  const pendingInstallments = useMemo(
    () =>
      schedule.filter(
        (item) =>
          item.status !== "paid" &&
          (item.number ||
            item.type === "installment" ||
            item.payment_type === "installment" ||
            /cuota/i.test(item.description || ""))
      ).length,
    [schedule]
  );

  const ledgerRows = useMemo(() => {
    let running = 0;
    return (contract?.ledger_entries || []).map((entry) => {
      running += Number(entry.amount || 0);
      return { ...entry, running_balance: running };
    });
  }, [contract]);

  const ledgerTotals = useMemo(
    () =>
      ledgerRows.reduce(
        (acc, entry) => {
          const amount = Number(entry.amount || 0);
          if (amount < 0) acc.charges += Math.abs(amount);
          if (amount > 0) acc.payments += amount;
          acc.balance += amount;
          return acc;
        },
        { charges: 0, payments: 0, balance: 0 }
      ),
    [ledgerRows]
  );

  const ledgerColumns = useMemo(
    () => [
      {
        key: "entry_date",
        header: t("paymentSchedule.date"),
        render: (row) => formatDate(row.entry_date),
      },
      {
        key: "description",
        header: t("contracts.description"),
        render: (row) => row.description || "—",
      },
      {
        key: "amount",
        header: t("paymentSchedule.amount"),
        align: "right",
        render: (row) => (
          <span className={row.amount < 0 ? "text-danger" : "text-brand-strong"}>
            {money(row.amount)}
          </span>
        ),
      },
      {
        key: "running_balance",
        header: t("contracts.balance"),
        align: "right",
        render: (row) => (
          <span className="text-body text-ink-2">
            {money(Math.abs(row.running_balance))}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleSaveNote = async () => {
    if (!contract?.id || !contract?.project_id || !contract?.lot_id) return;
    setSavingNote(true);
    try {
      await contractsApi.updateNotes(
        contract.project_id,
        contract.lot_id,
        contract.id,
        noteDraft.trim()
      );
      setContract((current) => ({ ...current, note: noteDraft.trim() }));
      setEditingNote(false);
      showToast(t("contractNotes.notesUpdated"), "success");
    } catch (err) {
      showToast(`${t("contractNotes.updateError")}: ${err.message}`, "error");
    } finally {
      setSavingNote(false);
    }
  };

  const handleReopen = async () => {
    if (actionLoading) return;
    if (!contract?.id || !contract?.project_id || !contract?.lot_id) return;
    setActionLoading(true);
    try {
      await contractsApi.reopen(
        contract.project_id,
        contract.lot_id,
        contract.id
      );
      showToast(t("paymentSchedule.contractReopenedSuccess"), "success");
      await load();
    } catch (err) {
      showToast(
        `${t("paymentSchedule.errorReopeningContract")}: ${err.message}`,
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (actionLoading) return;
    if (!contract?.id) {
      showToast(t("contracts.approveError"), "error");
      return;
    }
    setActionLoading(true);
    try {
      await contractsApi.approve(
        contract.project_id,
        contract.lot_id,
        contract.id
      );
      showToast(t("contracts.approvedSuccess"), "success");
      await refreshContract();
    } catch (err) {
      const refreshed = await load({ silent: true });
      if (String(refreshed?.status || "").toLowerCase() === "approved") {
        showToast(t("contracts.approvedSuccess"), "success");
        return;
      }
      const detail =
        err?.message && err.message !== "Something went wrong"
          ? ` ${err.message}`
          : "";
      showToast(`${t("contracts.approveError")}${detail}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (actionLoading) return;
    if (!contract?.id) return;
    setActionLoading(true);
    try {
      await contractsApi.reject(
        contract.project_id,
        contract.lot_id,
        contract.id,
        reason
      );
      showToast(t("contracts.rejectedSuccess"), "success");
      setRejectionOpen(false);
      await refreshContract();
    } catch (err) {
      showToast(err?.message || t("contracts.rejectError"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!contract?.id) return;
    try {
      const blob = await contractsApi.downloadPdf(contract.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato-${contract.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err?.message || t("contracts.pdfError"), "error");
    }
  };

  const openLotDetails = useCallback(async () => {
    if (!contract?.project_id || !contract?.lot_id) return;
    setLotLoading(true);
    try {
      const response = await projectsApi.getLot(contract.project_id, contract.lot_id);
      const lot = response?.lot || response?.data || response;
      setLotDetails(lot || null);
    } catch (err) {
      showToast(err?.message || t("contracts.lotLoadError"), "error");
    } finally {
      setLotLoading(false);
    }
  }, [contract?.lot_id, contract?.project_id, showToast, t]);

  const handleSendReminder = async () => {
    if (!contract?.guid) return;
    try {
      await contractsApi.sendReminder(contract.guid);
      showToast(t("contracts.reminderSent"), "success");
    } catch (err) {
      showToast(err?.message || t("contracts.reminderError"), "error");
    }
  };

  const handleCancelContract = async () => {
    if (actionLoading) return;
    if (!contract?.id || !contract?.project_id || !contract?.lot_id) return;
    const confirmed = await confirmDialog({
      title: t("contracts.cancelTitle", { id: contract.id }),
      description: t("contracts.cancelDescription"),
      confirmLabel: t("contracts.cancelContract"),
      cancelLabel: t("common.cancel"),
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await contractsApi.cancel(
        contract.project_id,
        contract.lot_id,
        contract.id,
        t("contracts.cancelNote")
      );
      showToast(t("contracts.cancelSuccess"), "success");
      await load();
    } catch (err) {
      showToast(`${t("contracts.cancelError")} ${err.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell min-h-screen w-full bg-canvas px-4 pb-8 sm:px-6 xl:px-[48px] xl:pb-[48px]">
        <div className="mx-auto w-full max-w-[1600px] space-y-4">
          <Skeleton rows={2} />
          <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
            <Skeleton rows={3} />
            <Skeleton rows={3} />
            <Skeleton rows={3} />
            <Skeleton rows={3} />
          </div>
        </div>
      </main>
    );
  }

  if (error === "not-found") {
    return (
      <main className="page-shell min-h-screen w-full bg-canvas px-4 pb-8 sm:px-6 xl:px-[48px] xl:pb-[48px]">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title={t("contracts.notFoundTitle")}
            description={t("contracts.notFoundDescription")}
            action={
              <Button onClick={() => navigate("/contracts")}>
                {t("contracts.backToContracts")}
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell min-h-screen w-full bg-canvas px-4 pb-8 sm:px-6 xl:px-[48px] xl:pb-[48px]">
        <div className="mx-auto max-w-2xl">
          <ErrorState
            title={t("contracts.loadErrorTitle")}
            description={t("contracts.loadErrorDescription")}
            onRetry={() => load()}
          />
        </div>
      </main>
    );
  }

  const total = contract.total_amount ?? contract.amount ?? 0;
  const paid = contract.total_paid ?? 0;
  // The API exposes balance as paid - total: negative means an outstanding
  // debt, positive means the client overpaid (credit in their favor).
  const balance = Number(contract.balance ?? paid - total);
  const hasCredit = balance > 0;
  const rawNote = contract.note ?? contract.notes ?? "";
  const noteContent = typeof rawNote === "string" ? rawNote : "";
  const status = contract.status?.toLowerCase();
  const isCancelled = status === "cancelled" || status === "canceled";
  const isClosed = status === "closed";
  const isAdmin = user?.role === "admin";
  const canApprove =
    isAdmin && ["pending", "submitted", "rejected"].includes(status);
  const canReject = isAdmin && ["pending", "submitted"].includes(status);
  const canEditNote = isAdmin && Boolean(contract.project_id && contract.lot_id);
  const canRegisterPayment =
    user?.role !== "seller" &&
    !isCancelled &&
    !isClosed &&
    status !== "rejected";
  const hasLot = Boolean(contract.project_id && contract.lot_id);
  const lotStatus = String(contract.lot_status || "").toLowerCase();
  const lotArea = contract.lot_area ?? contract.lot_effective_area;
  const lotPrice = contract.lot_price ?? contract.lot_effective_price;
  const lotUnit = areaUnitLabel(contract.lot_measurement_unit);
  const lotDimensions =
    contract.lot_width && contract.lot_length
      ? `${contract.lot_width} × ${contract.lot_length} ${linearUnitLabel(
          contract.lot_measurement_unit
        )}`
      : "—";
  const lotStatusKey = lotStatus ? `status.${lotStatus}` : "";
  const lotStatusLabel = lotStatusKey
    ? t(lotStatusKey) === lotStatusKey
      ? lotStatus
      : t(lotStatusKey)
    : "—";
  const banner = BANNER_TONES[status] || BANNER_TONES.closed;
  const bannerTitle = isCancelled
    ? t("contracts.status.cancelled")
    : isClosed
      ? t("contracts.status.closed")
      : status === "approved"
        ? t("contracts.approvedWelcome")
        : status === "rejected"
          ? t("contracts.rejectedNotice")
          : t("contracts.pendingReview");

  const actionItems = [];

  if (isAdmin) {
    actionItems.push({
      label: t("contracts.viewApplicant"),
      icon: <FontAwesomeIcon icon={faUser} className="w-3.5" />,
      onSelect: () =>
        navigate("/users", {
          state: {
            selectedUserId: contract.applicant_identity,
            selectedUserName: contract.applicant_name,
            selectedUserPhone: contract.applicant_phone,
          },
        }),
    });
  }

  if (contract.project_id && contract.lot_id) {
    actionItems.push({
      label: t("contracts.viewLot"),
      icon: <FontAwesomeIcon icon={faLocationDot} className="w-3.5" />,
      onSelect: openLotDetails,
    });
  }

  actionItems.push({
    label: t("contracts.downloadPdf"),
    icon: <FontAwesomeIcon icon={faDownload} className="w-3.5" />,
    onSelect: handleDownloadPdf,
  });

  if (isAdmin && !isCancelled && !isClosed) {
    actionItems.push({
      label: t("contracts.sendReminder"),
      icon: <FontAwesomeIcon icon={faBell} className="w-3.5" />,
      onSelect: handleSendReminder,
    });
  }

  if (isAdmin && (isCancelled || isClosed)) {
    actionItems.push({
      label: t("paymentSchedule.reopenContract"),
      icon: <FontAwesomeIcon rotate={180} icon={faRotateLeft} className="w-3.5" />,
      onSelect: handleReopen,
    });
  }

  if (canReject) {
    actionItems.push({ separator: true });
    actionItems.push({
      label: t("contracts.reject"),
      icon: <FontAwesomeIcon icon={faBan} className="w-3.5" />,
      tone: "danger",
      onSelect: () => setRejectionOpen(true),
    });
  }

  if (isAdmin && !isCancelled && !isClosed) {
    if (actionItems[actionItems.length - 1]?.separator !== true) {
      actionItems.push({ separator: true });
    }
    actionItems.push({
      label: t("contracts.cancelContract"),
      icon: <FontAwesomeIcon icon={faBan} className="w-3.5" />,
      tone: "danger",
      onSelect: handleCancelContract,
    });
  }

  const recentEntries = (contract.ledger_entries || []).slice(0, 4);
  const upcoming = schedule.filter((item) => item.status !== "paid").slice(0, 4);

  const registerPayment = () => {
    setTab("cronograma");
    setPaymentRequestToken((value) => value + 1);
  };

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-4 pb-8 sm:px-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <div className="motion-fade-up flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to="/contracts"
              className="inline-flex items-center gap-2 text-label font-semibold text-ink-3 hover:text-ink-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {t("contracts.backToContracts")}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-page font-bold text-ink">
                {t("contracts.contractNumber", { id: contract.id })}
              </h1>
              <StatusChip status={status} t={t} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-body text-ink-3">
              <span className="truncate">{contract.applicant_name || "—"}</span>
              {hasLot && (
                <>
                  <span aria-hidden="true">·</span>
                  <Link
                    to={`/projects/${contract.project_id}/lots`}
                    state={{
                      selectedLotId: contract.lot_id,
                      selectedLotName: contract.lot_name,
                      selectedLotAddress: contract.lot_address,
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      openLotDetails();
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-brand-strong hover:underline"
                  >
                    {t("contracts.viewLotShort")}
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      className="text-[10px]"
                    />
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex w-full max-w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <Button
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={handleDownloadPdf}
            >
              <FontAwesomeIcon icon={faDownload} />
              {t("contracts.downloadPdf")}
            </Button>
            {canApprove && (
              <Button
                className="grow sm:grow-0"
                loading={actionLoading}
                disabled={actionLoading}
                onClick={handleApprove}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                {t("contracts.approve")}
              </Button>
            )}
            {canRegisterPayment && nextPayment && (
              <Button
                variant={canApprove ? "secondary" : "primary"}
                className="grow sm:grow-0"
                onClick={registerPayment}
              >
                <FontAwesomeIcon icon={faWallet} />
                {t("contracts.registerPayment")}
              </Button>
            )}
            {actionItems.length > 0 && (
              <Menu
                label={t("common.actions")}
                icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                items={actionItems}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
          <KpiCard
            label={t("contracts.totalValue")}
            value={money(total)}
            caption={`${contract.payment_term || 0} ${t("contracts.months").toLowerCase()} · ${contract.interest_rate ?? 0}%`}
            index={0}
          />
          <KpiCard
            label={t("contracts.paid")}
            value={money(paid)}
            valueClassName="text-brand-strong"
            caption={`${total ? Math.round((paid / total) * 100) : 0}% ${t("contracts.ofTotal")}`}
            index={1}
          />
          <KpiCard
            label={hasCredit ? t("contracts.balanceInFavor") : t("contracts.balance")}
            value={money(Math.abs(balance))}
            caption={
              hasCredit
                ? t("contracts.balanceInFavor")
                : t("contracts.installmentsRemaining", { count: pendingInstallments })
            }
            index={2}
          />
          <KpiCard
            label={t("contracts.nextPayment")}
            value={nextPayment ? formatDate(nextPayment.due_date) : "—"}
            valueClassName={nextPayment ? "text-warning" : "text-ink"}
            caption={
              nextPayment
                ? `${money(nextPayment.amount)}${nextPayment.installment_number ? ` · ${t("contracts.installmentOf", { current: nextPayment.installment_number, total: contract.payment_term || schedule.length })}` : ""}`
                : t("contracts.noNextPayment")
            }
            index={3}
          />
        </div>

        <Tabs
          items={tabs}
          value={tab}
          onChange={setTab}
          className="motion-fade-up [animation-delay:225ms]"
        />

        {tab === "resumen" && (
          <div className="motion-fade-up grid gap-4 [animation-delay:60ms] xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-3.5">
              <div className={`rounded-card border p-4 ${banner.wrap}`}>
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon
                    icon={
                      status === "approved"
                        ? faCheckCircle
                        : status === "rejected" || isCancelled
                          ? faExclamationTriangle
                          : faReceipt
                    }
                    className={`mt-0.5 ${banner.icon}`}
                  />
                  <div>
                    <p className={`text-body-lg font-bold ${banner.title}`}>
                      {bannerTitle}
                    </p>
                    <p className="mt-1 text-label text-ink-2">
                      {nextPayment
                        ? `${t("contracts.nextPayment")}: ${formatDate(nextPayment.due_date)} · ${money(nextPayment.amount)}`
                        : t("contracts.noNextPayment")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line/60 pt-3 text-micro text-ink-3">
                  <span>
                    {t("contracts.paid")}: {money(paid)}
                  </span>
                  <span>
                    {contract.payment_term || 0} {t("contracts.months").toLowerCase()}
                  </span>
                  {contract.created_at && (
                    <span>
                      {t("contracts.created")}: {formatDate(contract.created_at)}
                    </span>
                  )}
                </div>
              </div>

              <Card
                title={t("contracts.upcomingPayments")}
                action={
                  <button
                    type="button"
                    onClick={() => setTab("cronograma")}
                    className="text-label font-semibold text-brand-strong hover:underline"
                  >
                    {t("common.viewAll")}
                  </button>
                }
                bodyClassName="px-5 pb-2 pt-3"
              >
                {upcoming.length === 0 ? (
                  <p className="py-4 text-body text-ink-3">{t("contracts.noScheduleDescription")}</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {upcoming.map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-body font-semibold text-ink">
                            {row.description || t("contracts.installment")}
                          </p>
                          <p className="text-label text-ink-3">{formatDate(row.due_date)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-body font-semibold text-ink">
                            {money(row.amount)}
                          </span>
                          <StatusChip status={row.status} t={t} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card
                title={t("contracts.recentActivity")}
                action={
                  <button
                    type="button"
                    onClick={() => setTab("pagos")}
                    className="text-label font-semibold text-brand-strong hover:underline"
                  >
                    {t("common.viewAll")}
                  </button>
                }
                bodyClassName="px-5 pb-2 pt-3"
              >
                {recentEntries.length === 0 ? (
                  <p className="py-4 text-body text-ink-3">{t("contracts.activityEmpty")}</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {recentEntries.map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-label font-semibold text-ink-2">
                            {row.description || "—"}
                          </p>
                          <p className="text-micro text-ink-3">{formatDate(row.entry_date)}</p>
                        </div>
                        <span
                          className={`text-label font-semibold ${
                            row.amount < 0 ? "text-danger" : "text-brand-strong"
                          }`}
                        >
                          {money(Math.abs(Number(row.amount || 0)))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="space-y-3.5">
              <Card title={t("contracts.clientCard")} bodyClassName="px-5 pb-5 pt-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-info-soft text-title font-bold uppercase text-info">
                    {contract.applicant_name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-body-lg font-bold text-ink">
                      {contract.applicant_name || "—"}
                    </p>
                    <p className="truncate text-micro text-ink-3">
                      {contract.applicant_identity || "—"}
                    </p>
                  </div>
                </div>
                <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-label">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">{t("contractDetailsModal.phone")}</dt>
                    <dd className="font-semibold text-ink">
                      {contract.applicant_phone || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">{t("contractDetailsModal.identity")}</dt>
                    <dd className="font-semibold text-ink">
                      {contract.applicant_identity || "—"}
                    </dd>
                  </div>
                </dl>
                {contract.applicant_credit_score !== undefined &&
                  contract.applicant_credit_score !== null && (
                    <div className="mt-3">
                      <CreditScoreCard creditScore={contract.applicant_credit_score} />
                    </div>
                  )}
              </Card>

              <Card
                title={t("contracts.lotCard")}
                action={
                  lotStatus ? (
                    <Chip tone={LOT_TONES[lotStatus] || "neutral"}>
                      {lotStatusLabel}
                    </Chip>
                  ) : null
                }
                bodyClassName="px-5 pb-5 pt-3"
              >
                {hasLot ? (
                  <>
                    <div className="min-w-0">
                      <p className="truncate text-body-lg font-bold text-ink">
                        {contract.lot_name || "—"}
                      </p>
                      <p className="truncate text-micro text-ink-3">
                        {contract.project_name || "—"}
                      </p>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line pt-3 text-label">
                      <div>
                        <dt className="text-micro text-ink-3">
                          {t("projects.area")}
                        </dt>
                        <dd className="font-semibold text-ink">
                          {lotArea ? `${lotArea} ${lotUnit}` : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-micro text-ink-3">
                          {t("projects.dimensions")}
                        </dt>
                        <dd className="font-semibold text-ink">{lotDimensions}</dd>
                      </div>
                      <div>
                        <dt className="text-micro text-ink-3">
                          {t("contracts.unit")}
                        </dt>
                        <dd className="font-semibold text-ink">{lotUnit}</dd>
                      </div>
                      <div>
                        <dt className="text-micro text-ink-3">
                          {t("contracts.price")}
                        </dt>
                        <dd className="font-semibold text-ink">
                          {money(lotPrice)}
                        </dd>
                      </div>
                    </dl>
                    {contract.lot_address && (
                      <p className="mt-3 text-label text-ink-3">
                        {contract.lot_address}
                      </p>
                    )}
                    <Button
                      variant="secondary"
                      className="mt-3 w-full"
                      onClick={openLotDetails}
                      loading={lotLoading}
                    >
                      <FontAwesomeIcon icon={faLocationDot} />
                      {t("contracts.viewLotShort")}
                    </Button>
                  </>
                ) : (
                  <p className="text-body text-ink-3">{t("contracts.lotUnavailable")}</p>
                )}
              </Card>

              <Card title={t("contracts.termsCard")} bodyClassName="px-5 pb-5 pt-3">
                <dl className="space-y-1.5 text-label">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">{t("contracts.financingType")}</dt>
                    <dd className="font-bold capitalize text-ink">
                      {contract.financing_type
                        ? t(`contracts.financingTypes.${contract.financing_type.toLowerCase()}`) ||
                          contract.financing_type
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">{t("contracts.months")}</dt>
                    <dd className="font-bold text-ink">
                      {contract.payment_term || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">{t("contracts.rate")}</dt>
                    <dd className="font-bold text-ink">
                      {contract.interest_rate ?? 0}%
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">{t("contracts.reserve")}</dt>
                    <dd className="font-bold text-ink">
                      {money(contract.reserve_amount)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">{t("contracts.downPayment")}</dt>
                    <dd className="font-bold text-ink">
                      {money(contract.down_payment)}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card title={t("contracts.documentsCard")} bodyClassName="px-5 pb-5 pt-3">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="flex w-full items-center justify-between gap-3 rounded-control border border-line px-3 py-2 text-left hover:bg-surface-2"
                  >
                    <span className="text-label font-semibold text-ink">
                      {t("contracts.downloadPdf")}
                    </span>
                    <FontAwesomeIcon icon={faDownload} className="text-ink-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("documentos")}
                    className="flex w-full items-center justify-between gap-3 rounded-control border border-line px-3 py-2 text-left hover:bg-surface-2"
                  >
                    <span className="text-label font-semibold text-ink">
                      {t("contracts.documents")}
                    </span>
                    <span className="text-micro text-ink-3">
                      {
                        (contract.payment_schedule || []).filter((row) => row.has_receipt)
                          .length
                      }
                    </span>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "cronograma" && (
          <section
            id="contract-payment-schedule"
            className="motion-fade-up [animation-delay:60ms]"
          >
            <PaymentSchedulePanel
              contract={contract}
              openNextPaymentToken={paymentRequestToken}
              onRequestHandled={() => setPaymentRequestToken(0)}
              onChanged={refreshContract}
              title={t("contracts.paymentSchedule")}
              subtitle={t("contracts.installmentsRemaining", {
                count: pendingInstallments,
              })}
            />
          </section>
        )}

        {tab === "pagos" && (
          <div className="motion-fade-up grid gap-3.5 [animation-delay:60ms] xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card title={t("contracts.ledgerEntries")} bodyClassName="p-4 pt-3">
            <Table
              columns={ledgerColumns}
              rows={ledgerRows}
              getRowKey={(row) => row.id}
              empty={
                <EmptyState
                  title={t("contracts.noLedgerTitle")}
                  description={t("contracts.noLedgerDescription")}
                />
              }
              mobileCard={(row) => (
                <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-3">
                  <div className="min-w-0">
                    <p className="truncate text-body font-semibold text-ink">
                      {row.description}
                    </p>
                    <p className="text-micro text-ink-3">{formatDate(row.entry_date)}</p>
                  </div>
                  <p className="text-body font-semibold text-ink">{money(row.amount)}</p>
                </div>
              )}
            />
          </Card>
          <div className="space-y-3.5">
            <Card title={t("contracts.accountSummary")} bodyClassName="px-5 pb-5 pt-3">
              <dl className="space-y-2 text-body">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">{t("contracts.totalCharges")}</dt>
                  <dd className="font-semibold text-danger">{money(ledgerTotals.charges)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">{t("contracts.totalPayments")}</dt>
                  <dd className="font-semibold text-brand-strong">{money(ledgerTotals.payments)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-line pt-2">
                  <dt className="font-semibold text-ink">{t("contracts.balance")}</dt>
                  <dd className="font-bold text-ink">{money(Math.abs(ledgerTotals.balance))}</dd>
                </div>
              </dl>
            </Card>
            <Card title={t("contracts.notes")} bodyClassName="px-5 pb-5 pt-3">
              <p className="line-clamp-6 text-body text-ink-2">
                {noteContent ? noteContent.replace(/<[^>]*>/g, " ") : t("contracts.noNotes")}
              </p>
            </Card>
          </div>
          </div>
        )}

        {tab === "documentos" && (
          <div className="motion-fade-up space-y-3.5 [animation-delay:60ms]">
            <DocumentsTab contract={contract} />
            <Card title={t("contracts.receipts")} bodyClassName="px-5 pb-5 pt-3">
              <ul className="space-y-2">
                {(contract.payment_schedule || [])
                  .filter((row) => row.has_receipt)
                  .map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface-2 px-3 py-2 text-body"
                    >
                      <span className="text-ink-2">
                        {t("paymentSchedule.paid")} · {row.description}
                      </span>
                      <span className="text-micro text-ink-3">
                        {formatDate(row.paid_at || row.due_date)}
                      </span>
                    </li>
                  ))}
                {!(contract.payment_schedule || []).some((row) => row.has_receipt) && (
                  <li className="text-body text-ink-3">{t("contracts.noReceipts")}</li>
                )}
              </ul>
            </Card>
          </div>
        )}

        {tab === "notas" && (
          <Card
            title={t("contracts.notes")}
            bodyClassName="px-5 pb-5 pt-3"
            className="motion-fade-up [animation-delay:60ms]"
          >
            {editingNote ? (
              <div className="space-y-3">
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  rows={8}
                  placeholder={t("contracts.notesPlaceholder")}
                  className="w-full rounded-control border border-line bg-surface px-3 py-2 text-body text-ink outline-none focus:border-brand-strong"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingNote(false);
                      setNoteDraft("");
                    }}
                    disabled={savingNote}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    loading={savingNote}
                    disabled={noteDraft.trim() === noteContent}
                  >
                    {t("contractNotes.save")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {noteContent ? (
                  isHtml(noteContent) ? (
                    <div
                      className="space-y-2 text-body text-ink-2"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(noteContent),
                      }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-body text-ink-2">
                      {noteContent}
                    </p>
                  )
                ) : (
                  <p className="text-body text-ink-3">{t("contracts.noNotes")}</p>
                )}
                {canEditNote && (
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setNoteDraft(noteContent);
                        setEditingNote(true);
                      }}
                    >
                      {t("contractNotes.edit")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      <RejectionModal
        isOpen={rejectionOpen}
        onClose={() => setRejectionOpen(false)}
        onSubmit={handleReject}
        loading={actionLoading}
      />

      {lotDetails && (
        <LotDetailsModal
          lot={lotDetails}
          onClose={() => setLotDetails(null)}
          isAdmin={isAdmin}
        />
      )}
    </main>
  );
}

export default ContractDetail;
