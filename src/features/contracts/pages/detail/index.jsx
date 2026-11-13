import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faEllipsisVertical,
  faLocationDot,
  faRotateLeft,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { sanitizeHtml } from "@/shared/utils/sanitizeHtml";
import { contractsApi } from "../../api";
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

const money = (value) =>
  `L ${Number(value || 0).toLocaleString("es-HN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const FINANCING = {
  direct: "Directo",
  bank: "Bancario",
  cash: "Contado",
};

const STATUS = {
  approved: { label: "Aprobado", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  submitted: { label: "En revisión", tone: "warning" },
  rejected: { label: "Rechazado", tone: "danger" },
  cancelled: { label: "Cancelado", tone: "danger" },
  closed: { label: "Cerrado", tone: "neutral" },
  paid: { label: "Pagada", tone: "success" },
  overdue: { label: "Vencida", tone: "danger" },
};

function StatusChip({ status }) {
  const config = STATUS[status] || { label: status || "—", tone: "neutral" };
  return <Chip tone={config.tone}>{config.label}</Chip>;
}

const isHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value || "");

function ContractDetail() {
  const { guid } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const { showToast } = useToast();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("resumen");
  const [noteDraft, setNoteDraft] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const tabs = useMemo(
    () => [
      { value: "resumen", label: "Resumen" },
      { value: "cronograma", label: "Cronograma" },
      { value: "pagos", label: "Pagos" },
      { value: "documentos", label: "Documentos" },
      { value: "notas", label: t("contracts.tabNotes") || "Notas" },
    ],
    [t]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await contractsApi.getByGuid(guid);
      setContract(response?.contract || response);
    } catch (err) {
      setError(err?.status === 404 ? "not-found" : "error");
    } finally {
      setLoading(false);
    }
  }, [guid]);

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

  const columns = useMemo(
    () => [
      {
        key: "description",
        header: "Concepto",
        render: (row) => row.description || "—",
      },
      {
        key: "due_date",
        header: "Vence",
        render: (row) => formatDate(row.due_date),
      },
      {
        key: "amount",
        header: "Monto",
        align: "right",
        render: (row) => money(row.amount),
      },
      {
        key: "status",
        header: "Estado",
        render: (row) => <StatusChip status={row.status} />,
      },
    ],
    []
  );

  const ledgerColumns = useMemo(
    () => [
      {
        key: "entry_date",
        header: "Fecha",
        render: (row) => formatDate(row.entry_date),
      },
      {
        key: "description",
        header: "Descripción",
        render: (row) => row.description || "—",
      },
      {
        key: "amount",
        header: "Monto",
        align: "right",
        render: (row) => (
          <span className={row.amount < 0 ? "text-danger" : "text-brand-strong"}>
            {money(row.amount)}
          </span>
        ),
      },
    ],
    []
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
      <main className="min-h-screen w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
        <div className="mx-auto max-w-6xl space-y-4">
          <Skeleton rows={2} />
          <div className="grid gap-4 sm:grid-cols-3">
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
      <main className="min-h-screen w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title="Contrato no encontrado"
            description="El enlace puede haber cambiado o el contrato fue eliminado."
            action={<Button onClick={() => navigate("/contracts")}>Volver a contratos</Button>}
          />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
        <div className="mx-auto max-w-2xl">
          <ErrorState
            title="No pudimos cargar el contrato"
            description="Revisa tu conexión e intenta de nuevo."
            onRetry={load}
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
  const canEditNote = isAdmin && Boolean(contract.project_id && contract.lot_id);

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

  if (contract.project_id) {
    actionItems.push({
      label: t("contracts.viewLot"),
      icon: <FontAwesomeIcon icon={faLocationDot} className="w-3.5" />,
      onSelect: () =>
        navigate(`/projects/${contract.project_id}/lots`, {
          state: {
            selectedLotId: contract.lot_id,
            selectedLotName: contract.lot_name,
            selectedLotAddress: contract.lot_address,
          },
        }),
    });
  }

  if (isAdmin && (isCancelled || isClosed)) {
    actionItems.push({
      label: t("paymentSchedule.reopenContract"),
      icon: <FontAwesomeIcon icon={faRotateLeft} className="w-3.5" />,
      onSelect: handleReopen,
    });
  }

  if (isAdmin && !isCancelled && !isClosed) {
    actionItems.push({
      label: t("contracts.cancelContract"),
      icon: <FontAwesomeIcon icon={faBan} className="w-3.5" />,
      tone: "danger",
      onSelect: handleCancelContract,
    });
  }

  return (
    <main className="min-h-screen w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to="/contracts" className="text-label font-semibold text-ink-3">
              ← Contratos
            </Link>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-page font-bold text-ink">
                Contrato #{contract.id}
              </h1>
              <StatusChip status={contract.status} />
            </div>
            <p className="text-body text-ink-3">
              {contract.lot_name} · {contract.project_name} ·{" "}
              {contract.applicant_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate("/contracts")}>
              Volver
            </Button>
            <Button onClick={() => navigate("/payments")}>Registrar pago</Button>
            {actionItems.length > 0 && (
              <Menu
                label={t("common.actions")}
                icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                items={actionItems}
              />
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card title="Total del contrato">
            <p className="text-page font-bold text-ink">{money(total)}</p>
            <p className="text-micro text-ink-3">
              {contract.payment_term} meses ·{" "}
              {FINANCING[contract.financing_type] || contract.financing_type || "—"}
            </p>
          </Card>
          <Card title="Pagado">
            <p className="text-page font-bold text-brand-strong">{money(paid)}</p>
            <p className="text-micro text-ink-3">
              {total ? Math.round((paid / total) * 100) : 0}% del total
            </p>
          </Card>
          <Card title={hasCredit ? "Saldo a favor" : "Saldo"}>
            <p className={`text-page font-bold ${hasCredit ? "text-brand-strong" : "text-ink"}`}>
              {money(Math.abs(balance))}
            </p>
            <p className="text-micro text-ink-3">
              {hasCredit ? "A favor del cliente" : "Saldo pendiente"}
            </p>
          </Card>
          <Card title="Próximo pago">
            <p className="text-page font-bold text-warning">
              {nextPayment ? formatDate(nextPayment.due_date) : "—"}
            </p>
            <p className="text-micro text-ink-3">
              {nextPayment
                ? `${money(nextPayment.amount)} · ${nextPayment.installment_number ? `cuota ${nextPayment.installment_number}` : "próxima cuota"}`
                : "Sin pagos pendientes"}
            </p>
          </Card>
        </div>

        <Tabs items={tabs} value={tab} onChange={setTab} />

        {tab === "resumen" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Solicitante">
              <dl className="space-y-2 text-body">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Nombre</dt>
                  <dd className="font-semibold text-ink">{contract.applicant_name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Teléfono</dt>
                  <dd className="font-semibold text-ink">{contract.applicant_phone || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Identidad</dt>
                  <dd className="font-semibold text-ink">{contract.applicant_identity || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Crédito</dt>
                  <dd className="font-semibold text-ink">{contract.applicant_credit_score ?? "—"}</dd>
                </div>
              </dl>
            </Card>
            <Card title="Lote y proyecto">
              <dl className="space-y-2 text-body">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Lote</dt>
                  <dd className="font-semibold text-ink">{contract.lot_name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Proyecto</dt>
                  <dd className="font-semibold text-ink">{contract.project_name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Área</dt>
                  <dd className="font-semibold text-ink">
                    {contract.lot_area} {contract.lot_measurement_unit || "m²"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Precio del lote</dt>
                  <dd className="font-semibold text-ink">{money(contract.lot_price)}</dd>
                </div>
              </dl>
            </Card>
          </div>
        )}

        {tab === "cronograma" && (
          <Card title="Cronograma de pagos">
            <Table
              columns={columns}
              rows={schedule}
              getRowKey={(row) => row.id}
              empty={<EmptyState title="Sin cronograma" description="Este contrato no tiene cuotas generadas." />}
              mobileCard={(row) => (
                <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-3">
                  <div>
                    <p className="text-body font-semibold text-ink">{row.description}</p>
                    <p className="text-micro text-ink-3">{formatDate(row.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-semibold text-ink">{money(row.amount)}</p>
                    <StatusChip status={row.status} />
                  </div>
                </div>
              )}
            />
          </Card>
        )}

        {tab === "pagos" && (
          <Card title="Libro mayor">
            <Table
              columns={ledgerColumns}
              rows={contract.ledger_entries || []}
              getRowKey={(row) => row.id}
              empty={<EmptyState title="Sin movimientos" description="Aún no hay movimientos en el libro mayor." />}
              mobileCard={(row) => (
                <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-3">
                  <div>
                    <p className="text-body font-semibold text-ink">{row.description}</p>
                    <p className="text-micro text-ink-3">{formatDate(row.entry_date)}</p>
                  </div>
                  <p className="text-body font-semibold text-ink">{money(row.amount)}</p>
                </div>
              )}
            />
          </Card>
        )}

        {tab === "documentos" && (
          <Card title="Documentos">
            <ul className="space-y-2">
              {(contract.payment_schedule || [])
                .filter((row) => row.has_receipt)
                .map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface-2 px-3 py-2 text-body"
                  >
                    <span className="text-ink-2">
                      Comprobante · {row.description}
                    </span>
                    <span className="text-micro text-ink-3">
                      {formatDate(row.paid_at || row.due_date)}
                    </span>
                  </li>
                ))}
              {!(contract.payment_schedule || []).some((row) => row.has_receipt) && (
                <li className="text-body text-ink-3">Sin comprobantes adjuntos.</li>
              )}
            </ul>
          </Card>
        )}

        {tab === "notas" && (
          <Card title={t("contracts.notes")}>
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
    </main>
  );
}

export default ContractDetail;
