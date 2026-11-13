import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sellerApi } from "../api";
import { contractsApi } from "@/features/contracts/api";
import { paymentsApi } from "@/features/payments/api";
import { useToast } from "@/contexts/ToastContext";
import {
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  ErrorState,
  Skeleton,
  Table,
  Tabs,
} from "@/shared/ui";

const money = (value) =>
  `L ${Number(value || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-HN");
};

const TABS = [
  { value: "clientes", label: "Mis clientes", path: "/vendedor/clientes" },
  { value: "cobros", label: "Cobros", path: "/vendedor/cobros" },
  { value: "documentos", label: "Documentos", path: "/vendedor/documentos" },
];

const tabFromPath = (pathname) =>
  TABS.find((tab) => pathname.startsWith(tab.path))?.value || "clientes";

const ACTIVE_STATUSES = ["approved", "signed", "closed"];

function SellerWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = tabFromPath(location.pathname);
  const [contracts, setContracts] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [collecting, setCollecting] = useState(null);
  const [collectTarget, setCollectTarget] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(() => new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sellerApi.contracts();
      setContracts(data?.contracts || []);
    } catch {
      setError("No pudimos cargar tus contratos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCollect = async (row) => {
    setCollecting(row.guid);
    try {
      const response = await contractsApi.getByGuid(row.guid);
      const contract = response?.contract || response;
      const payment = (contract.payment_schedule || []).find(
        (item) =>
          ["pending", "overdue", "submitted"].includes(item.status) &&
          !item.has_receipt
      );
      if (!payment) {
        showToast("No hay cuotas pendientes para este contrato.", "error");
        return;
      }
      setCollectTarget({ contract, payment });
      setReceipt(null);
    } catch {
      showToast("No pudimos abrir el contrato.", "error");
    } finally {
      setCollecting(null);
    }
  };

  const submitCollection = async () => {
    if (!collectTarget?.payment?.id || !receipt) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", receipt);
      await paymentsApi.uploadReceipt(collectTarget.payment.id, formData);
      setSubmitted((prev) => new Set(prev).add(collectTarget.contract.guid));
      showToast("Comprobante enviado. El cobro queda en revisión.");
      setCollectTarget(null);
      setReceipt(null);
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

  const collections = useMemo(
    () =>
      contracts
        .filter(
          (contract) =>
            Number(contract.balance || 0) !== 0 &&
            ACTIVE_STATUSES.includes(contract.status)
        )
        .filter(
          (contract) =>
            !searchTerm ||
            [contract.applicant_name, contract.project_name, contract.lot_name]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(searchTerm))
        )
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)),
    [contracts, searchTerm]
  );

  const documents = useMemo(
    () =>
      contracts
        .filter(
          (contract) =>
            ACTIVE_STATUSES.includes(contract.status) || contract.status === "submitted"
        )
        .filter(
          (contract) =>
            !searchTerm ||
            [contract.applicant_name, contract.project_name, contract.lot_name]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(searchTerm))
        ),
    [contracts, searchTerm]
  );

  const totals = useMemo(() => {
    const pending = collections.reduce(
      (sum, contract) => sum + Math.abs(Number(contract.balance || 0)),
      0
    );
    return {
      clients: clients.length,
      contracts: contracts.length,
      pending,
    };
  }, [clients.length, collections, contracts.length]);

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
      header: "Contrato",
      render: (row) => (
        <Link
          to={`/contracts/${row.guid}?tab=pagos`}
          className="font-semibold text-brand"
        >
          #{row.id} · {row.applicant_name}
        </Link>
      ),
    },
    {
      key: "project",
      header: "Proyecto / lote",
      render: (row) => `${row.project_name || "—"} · ${row.lot_name || "—"}`,
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
          <Chip tone="info">En revisión</Chip>
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
            Registrar cobro
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

  const bodyFor = (rows, columns, empty) => (
    <Table
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.key || row.id}
      empty={empty}
      mobileCard={(row) => (
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
      )}
    />
  );

  return (
    <main className="min-h-screen w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="text-page font-bold text-ink">Mi espacio</h1>
          <p className="text-body text-ink-3">
            Tus clientes, cobros pendientes y documentos de tus ventas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card title="Clientes">
            <p className="text-page font-bold text-ink">{totals.clients}</p>
          </Card>
          <Card title="Contratos">
            <p className="text-page font-bold text-ink">{totals.contracts}</p>
          </Card>
          <Card title="Por cobrar">
            <p className="text-page font-bold text-brand-strong">
              {money(totals.pending)}
            </p>
          </Card>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <Tabs
            items={TABS.map(({ value, label }) => ({ value, label }))}
            value={tab}
            onChange={(next) =>
              navigate(TABS.find((item) => item.value === next)?.path || TABS[0].path)
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

        {error && (
          <ErrorState
            title="No pudimos cargar tu espacio"
            description={error}
            onRetry={load}
          />
        )}

        {loading ? (
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
                />
              )}
            {tab === "documentos" &&
              bodyFor(
                documents,
                documentColumns,
                <EmptyState
                  title="Sin documentos"
                  description="Los comprobantes aparecen cuando se registran pagos."
                />
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
        title="Registrar cobro"
        description={
          collectTarget
            ? `Contrato #${collectTarget.contract.id} · ${collectTarget.contract.applicant_name || ""}`
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
              Cancelar
            </Button>
            <Button
              loading={uploading}
              disabled={!receipt}
              onClick={submitCollection}
            >
              Enviar comprobante
            </Button>
          </>
        }
      >
        {collectTarget && (
          <div className="space-y-4">
            <div className="rounded-control border border-line bg-surface-2 p-3">
              <p className="text-body font-semibold text-ink">
                {collectTarget.payment.description || "Cuota"}
              </p>
              <p className="text-micro text-ink-3">
                Vence {formatDate(collectTarget.payment.due_date)} ·{" "}
                {money(collectTarget.payment.amount)}
              </p>
            </div>
            <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
              Comprobante
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(event) => setReceipt(event.target.files?.[0] || null)}
                className="rounded-control border border-line-strong bg-surface px-3 py-2 text-body text-ink"
              />
            </label>
            <p className="text-micro text-ink-3">
              El cobro quedará “En revisión” hasta que un administrador valide el
              comprobante.
            </p>
          </div>
        )}
      </Dialog>
    </main>
  );
}

export default SellerWorkspace;
