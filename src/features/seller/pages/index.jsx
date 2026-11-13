import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sellerApi } from "../api";
import { commissionsApi } from "@/features/commissions/api";
import { contractsApi } from "@/features/contracts/api";
import { paymentsApi } from "@/features/payments/api";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Banner,
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  ErrorState,
  FileUpload,
  Skeleton,
  Table,
  Tabs,
} from "@/shared/ui";

const money = (value) =>
  `L ${Number(value || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;

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

const formatRate = (commission, amount) =>
  Number(amount || 0) > 0
    ? `${((Number(commission || 0) / Number(amount)) * 100).toFixed(1)}%`
    : "—";

const monthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

const monthEnd = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
};

const TABS = [
  { value: "clientes", path: "/vendedor/clientes" },
  { value: "cobros", path: "/vendedor/cobros" },
  { value: "documentos", path: "/vendedor/documentos" },
  { value: "comisiones", path: "/vendedor/comisiones" },
];

const tabFromPath = (pathname) =>
  TABS.find((tab) => pathname.startsWith(tab.path))?.value || "clientes";

const ACTIVE_STATUSES = ["approved", "signed", "closed"];

function SellerWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLocale();
  const tab = tabFromPath(location.pathname);
  const { showToast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [collecting, setCollecting] = useState(null);
  const [collectTarget, setCollectTarget] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(() => new Set());
  const [stats, setStats] = useState({ pending: 0, overdue: 0, collected: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const [commissionsError, setCommissionsError] = useState(null);

  const loadContracts = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await sellerApi.contracts();
      setContracts(data?.contracts || []);
    } catch {
      setError("No pudimos cargar tus contratos.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await paymentsApi.getStats();
      setStats({
        pending: data?.pending_this_month || 0,
        overdue: data?.total_overdue || 0,
        collected: data?.collected_this_month || 0,
      });
    } catch {
      setStats({ pending: 0, overdue: 0, collected: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCommissions = async () => {
    setCommissionsLoading(true);
    setCommissionsError(null);
    try {
      const data = await commissionsApi.list(monthStart(), monthEnd());
      setCommissions(data?.commissions || []);
    } catch {
      setCommissionsError("No pudimos cargar tus comisiones.");
    } finally {
      setCommissionsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
    loadStats();
    loadCommissions();
  }, []);

  const openCollect = async (row) => {
    setCollecting(row.guid);
    try {
      const response = await contractsApi.getByGuid(row.guid);
      const contract = response?.contract || response;
      const payment =
        [...(contract.payment_schedule || [])]
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .find(
            (item) =>
              ["pending", "overdue", "submitted"].includes(
                String(item.status || "").toLowerCase()
              ) && !item.has_receipt
          ) || null;

      setCollectTarget({ contract, row, payment });
      setReceipt(null);
    } catch {
      showToast("No pudimos abrir el contrato.", "error");
    } finally {
      setCollecting(null);
    }
  };

  const submitCollection = async () => {
    const paymentId = collectTarget?.payment?.id;
    if (!paymentId || !receipt) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", receipt);
      await paymentsApi.uploadReceipt(paymentId, formData);

      const guid = collectTarget.contract?.guid || collectTarget.row?.guid;
      if (guid) {
        setSubmitted((prev) => new Set(prev).add(guid));
      }

      showToast("Comprobante enviado. El cobro queda en revisión.");
      setCollectTarget(null);
      setReceipt(null);

      await loadContracts({ silent: true });
      loadStats();
    } catch (err) {
      showToast(err?.message || "No pudimos enviar el comprobante.", "error");
    } finally {
      setUploading(false);
    }
  };

  const clients = useMemo(() => {
    const map = new Map();
    for (const contract of contracts) {
      const key = contract.applicant_user_id || contract.applicant_name;
      if (!key) continue;
      const current = map.get(key) || {
        key,
        name: contract.applicant_name || "Sin nombre",
        phone: contract.applicant_phone || "—",
        identity: contract.applicant_identity || "—",
        contracts: 0,
        active: 0,
        amount: 0,
        last: contract.created_at,
      };
      current.contracts += 1;
      current.amount += Number(contract.amount || 0);
      if (ACTIVE_STATUSES.includes(contract.status)) current.active += 1;
      if (new Date(contract.created_at) > new Date(current.last)) {
        current.last = contract.created_at;
      }
      map.set(key, current);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [contracts]);

  const searchTerm = search.trim().toLowerCase();
  const filteredClients = useMemo(
    () =>
      searchTerm
        ? clients.filter(
            (client) =>
              client.name.toLowerCase().includes(searchTerm) ||
              client.phone.toLowerCase().includes(searchTerm) ||
              client.identity.toLowerCase().includes(searchTerm)
          )
        : clients,
    [clients, searchTerm]
  );

  const allCollections = useMemo(
    () =>
      contracts
        .filter(
          (contract) =>
            Number(contract.balance || 0) !== 0 &&
            ACTIVE_STATUSES.includes(contract.status)
        )
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)),
    [contracts]
  );

  const collections = useMemo(
    () =>
      allCollections.filter(
        (contract) =>
          !searchTerm ||
          [contract.applicant_name, contract.project_name, contract.lot_name]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(searchTerm))
      ),
    [allCollections, searchTerm]
  );

  const allDocuments = useMemo(
    () =>
      contracts.filter(
        (contract) =>
          ACTIVE_STATUSES.includes(contract.status) ||
          contract.status === "submitted"
      ),
    [contracts]
  );

  const documents = useMemo(
    () =>
      allDocuments.filter(
        (contract) =>
          !searchTerm ||
          [contract.applicant_name, contract.project_name, contract.lot_name]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(searchTerm))
      ),
    [allDocuments, searchTerm]
  );

  const filteredCommissions = useMemo(
    () =>
      searchTerm
        ? commissions.filter((row) =>
            [
              row.client_name,
              row.project,
              row.lot,
              row.seller,
              row.contract_id != null ? `#${row.contract_id}` : "",
            ]
              .filter(Boolean)
              .some((value) =>
                String(value).toLowerCase().includes(searchTerm)
              )
          )
        : commissions,
    [commissions, searchTerm]
  );

  const commissionTotals = useMemo(
    () =>
      commissions.reduce(
        (acc, item) => {
          const commission = Number(item.commission || 0);
          acc.total += commission;
          if (item.commission_paid_at) {
            acc.paid += commission;
          } else {
            acc.pending += commission;
          }
          return acc;
        },
        { total: 0, paid: 0, pending: 0 }
      ),
    [commissions]
  );

  const tabLabel = (label, count) => (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <span className="rounded-chip bg-surface-2 px-1.5 text-micro font-bold text-ink-3">
        {count}
      </span>
    </span>
  );

  const tabItems = [
    {
      value: "clientes",
      label: tabLabel("Mis clientes", clients.length),
      path: "/vendedor/clientes",
    },
    {
      value: "cobros",
      label: tabLabel("Cobros", allCollections.length),
      path: "/vendedor/cobros",
    },
    {
      value: "documentos",
      label: tabLabel("Documentos", allDocuments.length),
      path: "/vendedor/documentos",
    },
    {
      value: "comisiones",
      label: tabLabel(t("seller.tabCommissions"), commissions.length),
      path: "/vendedor/comisiones",
    },
  ];

  const collectionKpis = [
    {
      label: "Por cobrar hoy",
      value: money(stats.pending),
      caption: "cuotas del mes en curso",
      tone: "text-ink",
    },
    {
      label: "Vencido",
      value: money(stats.overdue),
      caption: "saldo vencido",
      tone: "text-danger",
    },
    {
      label: "Cobrado este mes",
      value: money(stats.collected),
      caption: "pagos aprobados",
      tone: "text-brand-strong",
    },
  ];

  const commissionKpis = [
    {
      label: "Comisiones del periodo",
      value: money(commissionTotals.total),
      caption: "según tus ventas del mes",
      tone: "text-ink",
    },
    {
      label: "Pendientes",
      value: money(commissionTotals.pending),
      caption: "por pagar",
      tone: "text-warning",
    },
    {
      label: "Pagadas",
      value: money(commissionTotals.paid),
      caption: "historial del mes",
      tone: "text-brand-strong",
    },
  ];

  const clientColumns = [
    {
      key: "name",
      header: "Cliente",
      render: (row) => (
        <div>
          <p className="font-semibold text-ink">{row.name}</p>
          <p className="text-micro text-ink-3">{row.identity}</p>
        </div>
      ),
    },
    { key: "phone", header: "Teléfono", render: (row) => row.phone },
    {
      key: "contracts",
      header: "Contratos",
      align: "right",
      render: (row) => `${row.active} activos / ${row.contracts}`,
    },
    {
      key: "amount",
      header: "Monto",
      align: "right",
      render: (row) => money(row.amount),
    },
    { key: "last", header: "Último", render: (row) => formatDate(row.last) },
  ];

  const collectionColumns = [
    {
      key: "contract",
      header: "Cliente / contrato",
      render: (row) => (
        <div>
          <Link
            to={`/contracts/${row.guid}?tab=pagos`}
            className="font-semibold text-brand"
          >
            {row.applicant_name || "Sin nombre"}
          </Link>
          <p className="text-micro text-ink-3">
            #{row.id} · {row.project_name || "—"} · {row.lot_name || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Saldo",
      align: "right",
      render: (row) => money(Math.abs(row.balance)),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) =>
        submitted.has(row.guid) ? (
          <Chip tone="info">{t("seller.inReview")}</Chip>
        ) : (
          <Chip tone="warning">{row.status}</Chip>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) =>
        submitted.has(row.guid) ? (
          <span className="text-micro font-semibold text-ink-3">
            Comprobante enviado
          </span>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            loading={collecting === row.guid}
            onClick={() => openCollect(row)}
          >
            Cobrar
          </Button>
        ),
    },
  ];

  const documentColumns = [
    {
      key: "contract",
      header: "Contrato",
      render: (row) => `#${row.id}`,
    },
    {
      key: "client",
      header: "Cliente",
      render: (row) => row.applicant_name || "—",
    },
    {
      key: "project",
      header: "Proyecto / lote",
      render: (row) => `${row.project_name || "—"} · ${row.lot_name || "—"}`,
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => <Chip tone="neutral">{row.status}</Chip>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Link to={`/contracts/${row.guid}?tab=documentos`}>
          <Button size="sm" variant="secondary">
            Ver documentos
          </Button>
        </Link>
      ),
    },
  ];

  const commissionColumns = [
    {
      key: "contract_id",
      header: "Contrato",
      render: (row) =>
        row.contract_guid ? (
          <Link
            to={`/contracts/${row.contract_guid}`}
            className="font-semibold text-brand"
          >
            #{row.contract_id}
          </Link>
        ) : (
          `#${row.contract_id}`
        ),
    },
    {
      key: "client_name",
      header: "Cliente",
      render: (row) => row.client_name || "—",
    },
    {
      key: "amount",
      header: "Monto",
      align: "right",
      render: (row) => money(row.amount),
    },
    {
      key: "rate",
      header: "%",
      align: "right",
      render: (row) => formatRate(row.commission, row.amount),
    },
    {
      key: "commission",
      header: "Comisión",
      align: "right",
      render: (row) => (
        <span className="font-semibold text-brand-strong">
          {money(row.commission)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) =>
        row.commission_paid_at ? (
          <Chip tone="success">Pagada</Chip>
        ) : (
          <Chip tone="warning">Pendiente</Chip>
        ),
    },
    { key: "date", header: "Fecha", render: (row) => formatDate(row.date) },
  ];

  const renderDefaultMobileCard = (row) => (
    <div className="rounded-card border border-line bg-surface p-3">
      <p className="text-body font-semibold text-ink">
        {row.name || `#${row.id} · ${row.applicant_name || ""}`}
      </p>
      <p className="text-micro text-ink-3">
        {row.phone || `${row.project_name || ""} · ${row.lot_name || ""}`}
      </p>
      <p className="mt-2 text-body font-bold text-brand-strong">
        {row.amount != null
          ? money(row.amount)
          : row.balance != null
            ? money(Math.abs(row.balance))
            : formatDate(row.last)}
      </p>
    </div>
  );

  const collectionMobileCard = (row) => {
    const inReview = submitted.has(row.guid);
    return (
      <div className="rounded-card border border-line bg-surface p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-body font-semibold text-ink">
              {row.applicant_name || "Sin nombre"}
            </p>
            <p className="text-micro text-ink-3">
              #{row.id} · {row.project_name || "—"} · {row.lot_name || "—"}
            </p>
          </div>
          <p className="text-body font-bold text-brand-strong">
            {money(Math.abs(row.balance))}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          {inReview ? (
            <Chip tone="info">{t("seller.inReview")}</Chip>
          ) : (
            <Chip tone="warning">{row.status}</Chip>
          )}
          {!inReview && (
            <Button
              size="sm"
              variant="secondary"
              loading={collecting === row.guid}
              onClick={() => openCollect(row)}
            >
              Cobrar
            </Button>
          )}
        </div>
      </div>
    );
  };

  const documentMobileCard = (row) => (
    <div className="rounded-card border border-line bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body font-semibold text-ink">
            #{row.id} · {row.applicant_name || "—"}
          </p>
          <p className="text-micro text-ink-3">
            {row.project_name || "—"} · {row.lot_name || "—"}
          </p>
        </div>
        <Chip tone="neutral">{row.status}</Chip>
      </div>
      <Link
        to={`/contracts/${row.guid}?tab=documentos`}
        className="mt-3 inline-flex"
      >
        <Button size="sm" variant="secondary">
          Ver documentos
        </Button>
      </Link>
    </div>
  );

  const commissionMobileCard = (row) => (
    <div className="rounded-card border border-line bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body font-semibold text-ink">
            #{row.contract_id} · {row.client_name || "—"}
          </p>
          <p className="text-micro text-ink-3">
            {row.project || "—"} · {formatDate(row.date)}
          </p>
        </div>
        <p className="text-body font-bold text-brand-strong">
          {money(row.commission)}
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {row.commission_paid_at ? (
          <Chip tone="success">Pagada</Chip>
        ) : (
          <Chip tone="warning">Pendiente</Chip>
        )}
        <span className="text-micro text-ink-3">
          {formatRate(row.commission, row.amount)}
        </span>
      </div>
    </div>
  );

  const bodyFor = (rows, columns, empty, mobileCard = renderDefaultMobileCard) => (
    <Table
      columns={columns}
      rows={rows}
      getRowKey={(row) =>
        row.key ||
        row.id ||
        `${row.contract_id}-${row.seller || ""}-${row.date || ""}`
      }
      empty={empty}
      mobileCard={mobileCard}
    />
  );

  const kpis = tab === "comisiones" ? commissionKpis : collectionKpis;
  const kpisLoading = tab === "comisiones" ? commissionsLoading : statsLoading;

  const heading = {
    clientes: {
      title: "Mis clientes",
      subtitle: "Tus clientes activos y el estado de sus contratos.",
    },
    cobros: {
      title: "Cobros",
      subtitle: "Registra comprobantes y revisa el estado de tus cobros.",
    },
    documentos: {
      title: "Documentos",
      subtitle: "Documentos de tus ventas y comprobantes de pago.",
    },
    comisiones: {
      title: t("seller.tabCommissions"),
      subtitle: "Comisiones del periodo. Consulta únicamente, sin acciones.",
    },
  }[tab];

  return (
    <main className="min-h-screen w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="text-page font-bold text-ink">{heading.title}</h1>
          <p className="text-body text-ink-3">{heading.subtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {kpisLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <Skeleton rows={2} />
                </Card>
              ))
            : kpis.map((kpi) => (
                <Card key={kpi.label}>
                  <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                    {kpi.label}
                  </p>
                  <p className={`mt-1 text-page font-bold ${kpi.tone}`}>
                    {kpi.value}
                  </p>
                  <p className="text-micro text-ink-3">{kpi.caption}</p>
                </Card>
              ))}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <Tabs
            items={tabItems.map(({ value, label }) => ({ value, label }))}
            value={tab}
            onChange={(next) =>
              navigate(
                tabItems.find((item) => item.value === next)?.path ||
                  "/vendedor/clientes"
              )
            }
            className="min-w-64 flex-1"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cliente, proyecto o lote"
            className="h-11 w-full rounded-control border border-line-strong bg-surface px-3 text-body-lg text-ink sm:w-72"
          />
        </div>

        {error && tab !== "comisiones" && (
          <ErrorState
            title="No pudimos cargar tu espacio"
            description={error}
            onRetry={() => loadContracts()}
          />
        )}

        {tab === "comisiones" ? (
          commissionsError ? (
            <ErrorState
              title="No pudimos cargar tus comisiones"
              description={commissionsError}
              onRetry={loadCommissions}
            />
          ) : commissionsLoading ? (
            <Card>
              <Skeleton rows={5} />
            </Card>
          ) : (
            <Card title="Detalle de comisiones" bodyClassName="p-0">
              {bodyFor(
                filteredCommissions,
                commissionColumns,
                <div className="p-5">
                  <EmptyState
                    title="Sin comisiones en el periodo"
                    description="Tus comisiones aparecen cuando se aprueba una venta."
                  />
                </div>,
                commissionMobileCard
              )}
            </Card>
          )
        ) : loading ? (
          <Card>
            <Skeleton rows={5} />
          </Card>
        ) : (
          <>
            {tab === "clientes" &&
              bodyFor(
                filteredClients,
                clientColumns,
                <EmptyState
                  title="Sin clientes todavía"
                  description="Cuando registres una venta, el cliente aparecerá aquí."
                />
              )}
            {tab === "cobros" &&
              bodyFor(
                collections,
                collectionColumns,
                <EmptyState
                  title="Sin saldos pendientes"
                  description="Tus contratos activos están al día."
                />,
                collectionMobileCard
              )}
            {tab === "documentos" &&
              bodyFor(
                documents,
                documentColumns,
                <EmptyState
                  title="Sin documentos"
                  description="Los comprobantes aparecen cuando se registran pagos."
                />,
                documentMobileCard
              )}
          </>
        )}
      </div>

      <Dialog
        open={Boolean(collectTarget)}
        onClose={() => {
          if (!uploading) {
            setCollectTarget(null);
            setReceipt(null);
          }
        }}
        title={t("seller.registerCollection")}
        description={
          collectTarget
            ? `#${collectTarget.contract.id} · ${
                collectTarget.contract.applicant_name ||
                collectTarget.row?.applicant_name ||
                ""
              }`
            : undefined
        }
        footer={
          <>
            <Button
              variant="ghost"
              disabled={uploading}
              onClick={() => {
                setCollectTarget(null);
                setReceipt(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              loading={uploading}
              disabled={!collectTarget?.payment?.id || !receipt}
              onClick={submitCollection}
            >
              {t("seller.registerCollection")}
            </Button>
          </>
        }
      >
        {collectTarget && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 rounded-control border border-line bg-surface-2 p-4">
              <div>
                <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                  Cliente
                </dt>
                <dd className="text-body font-semibold text-ink">
                  {collectTarget.contract.applicant_name ||
                    collectTarget.row?.applicant_name ||
                    "—"}
                </dd>
              </div>
              <div>
                <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                  Contrato
                </dt>
                <dd className="text-body font-semibold text-ink">
                  #{collectTarget.contract.id}
                </dd>
              </div>
              <div>
                <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                  Cuota
                </dt>
                <dd className="text-body font-semibold text-ink">
                  {collectTarget.payment?.description || "Cuota pendiente"}
                </dd>
              </div>
              <div>
                <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                  Vence
                </dt>
                <dd className="text-body font-semibold text-ink">
                  {formatDate(collectTarget.payment?.due_date)}
                </dd>
              </div>
              <div>
                <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                  Monto
                </dt>
                <dd className="text-body font-semibold text-ink">
                  {collectTarget.payment
                    ? money(collectTarget.payment.amount)
                    : money(Math.abs(collectTarget.contract.balance || 0))}
                </dd>
              </div>
              <div>
                <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                  Saldo actual
                </dt>
                <dd className="text-body font-semibold text-ink">
                  {money(Math.abs(collectTarget.contract.balance || 0))}
                </dd>
              </div>
            </dl>

            {!collectTarget.payment && (
              <Banner tone="warning">
                Este contrato no tiene una cuota pendiente por cobrar.
              </Banner>
            )}

            <FileUpload
              label="Comprobante"
              accept="image/*,application/pdf"
              multiple={false}
              files={receipt ? [receipt] : []}
              onChange={(files) => setReceipt(files[0] || null)}
              hint={t("seller.receiptRequired")}
            />

            <Banner tone="info">{t("seller.collectionNotice")}</Banner>
          </div>
        )}
      </Dialog>
    </main>
  );
}

export default SellerWorkspace;
