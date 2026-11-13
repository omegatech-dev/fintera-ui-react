import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import AuthContext from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { commissionsApi } from "../api";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
  Table,
} from "@/shared/ui";

const money = (value) =>
  `L ${Number(value || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;

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

function Commissions() {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";
  const [paying, setPaying] = useState(null);
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(monthEnd);
  const [items, setItems] = useState([]);
  const [seller, setSeller] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commissionsApi.list(startDate, endDate);
      setItems(data?.commissions || []);
    } catch {
      setError("No pudimos cargar las comisiones.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  const sellers = useMemo(
    () => [...new Set(items.map((item) => item.seller).filter(Boolean))].sort(),
    [items]
  );

  const filtered = useMemo(
    () => (seller ? items.filter((item) => item.seller === seller) : items),
    [items, seller]
  );

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, item) => ({
          commission: acc.commission + Number(item.commission || 0),
          amount: acc.amount + Number(item.amount || 0),
          paid: acc.paid + (item.commission_paid_at ? Number(item.commission || 0) : 0),
          pending:
            acc.pending + (item.commission_paid_at ? 0 : Number(item.commission || 0)),
        }),
        { commission: 0, amount: 0, paid: 0, pending: 0 }
      ),
    [filtered]
  );

  const handlePay = useCallback(
    async (row) => {
      if (!row?.contract_guid) return;
      const confirmed = await confirmDialog({
        title: "Marcar comisión como pagada",
        description: `Se registrará el pago de ${money(row.commission)} a ${
          row.seller || "el vendedor"
        }. Esta acción no modifica el monto de la comisión.`,
        confirmLabel: "Marcar pagada",
      });
      if (!confirmed) return;

      setPaying(row.contract_guid);
      try {
        const result = await commissionsApi.markPaid(row.contract_guid);
        const paidAt = result?.contract?.commission_paid_at || new Date().toISOString();
        setItems((prev) =>
          prev.map((item) =>
            item.contract_guid === row.contract_guid
              ? { ...item, commission_paid_at: paidAt }
              : item
          )
        );
        showToast("Comisión marcada como pagada.");
      } catch (err) {
        showToast(err?.message || "No pudimos marcar la comisión.", "error");
      } finally {
        setPaying(null);
      }
    },
    [showToast]
  );

  const averageRate = totals.amount
    ? ((totals.commission / totals.amount) * 100).toFixed(1)
    : "0.0";

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await commissionsApi.downloadCsv(startDate, endDate);
      const url = URL.createObjectURL(
        blob instanceof Blob ? blob : new Blob([blob])
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `comisiones-${startDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "seller",
        header: "Vendedor",
        render: (row) => row.seller || "—",
      },
      {
        key: "contract_id",
        header: "Contrato",
        render: (row) => `#${row.contract_id}`,
      },
      {
        key: "client_name",
        header: "Cliente",
        render: (row) => row.client_name || "—",
      },
      {
        key: "project",
        header: "Proyecto / lote",
        render: (row) => `${row.project || "—"} · ${row.lot || "—"}`,
      },
      {
        key: "amount",
        header: "Monto",
        align: "right",
        render: (row) => money(row.amount),
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
        key: "date",
        header: "Fecha",
        render: (row) => row.date || "—",
      },
      {
        key: "commission_paid_at",
        header: "Estado",
        render: (row) =>
          row.commission_paid_at ? (
            <Chip tone="success">Pagada</Chip>
          ) : (
            <Chip tone="warning">Pendiente</Chip>
          ),
      },
      ...(isAdmin
        ? [
            {
              key: "actions",
              header: "",
              align: "right",
              render: (row) =>
                row.commission_paid_at ? (
                  <span className="text-micro text-ink-3">
                    {new Date(row.commission_paid_at).toLocaleDateString("es-HN")}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={paying === row.contract_guid}
                    disabled={!row.contract_guid}
                    onClick={() => handlePay(row)}
                  >
                    Marcar pagada
                  </Button>
                ),
            },
          ]
        : []),
    ],
    [handlePay, isAdmin, paying]
  );

  return (
    <main className="min-h-screen w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-page font-bold text-ink">Comisiones</h1>
            <p className="text-body text-ink-3">
              Comisiones de vendedores para el periodo seleccionado.
            </p>
          </div>
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            Exportar CSV
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
            Desde
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-body-lg text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
            Hasta
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-body-lg text-ink"
            />
          </label>
          <label className="flex min-w-52 flex-col gap-1 text-label font-semibold text-ink-2">
            Vendedor
            <Select value={seller} onChange={(event) => setSeller(event.target.value)}>
              <option value="">Todos los vendedores</option>
              {sellers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </label>
        </div>

        {error && (
          <ErrorState
            title="No pudimos cargar las comisiones"
            description={error}
            onRetry={load}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-card border border-line bg-surface p-4">
                  <Skeleton rows={2} />
                </div>
              ))
            : [
                { label: "Comisiones del periodo", value: money(totals.commission) },
                { label: "Pagadas", value: money(totals.paid) },
                { label: "Pendientes", value: money(totals.pending) },
                { label: "Tasa promedio", value: `${averageRate}%` },
              ].map((kpi) => (
                <Card key={kpi.label} title={kpi.label}>
                  <p className="text-page font-bold text-ink">{kpi.value}</p>
                </Card>
              ))}
        </div>

        <Card title="Detalle de comisiones" bodyClassName="p-0">
          <Table
            columns={columns}
            rows={filtered}
            getRowKey={(row) => `${row.contract_id}-${row.seller}`}
            empty={
              <div className="p-5">
                <EmptyState
                  title="Sin comisiones en el periodo"
                  description="Ajusta las fechas o el vendedor."
                />
              </div>
            }
            mobileCard={(row) => (
              <div className="rounded-card border border-line bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-body font-semibold text-ink">
                      #{row.contract_id} · {row.client_name}
                    </p>
                    <p className="text-micro text-ink-3">
                      {row.seller} · {row.project} · {row.date}
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
                  {isAdmin && !row.commission_paid_at && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={paying === row.contract_guid}
                      disabled={!row.contract_guid}
                      onClick={() => handlePay(row)}
                    >
                      Marcar pagada
                    </Button>
                  )}
                </div>
              </div>
            )}
          />
        </Card>
      </div>
    </main>
  );
}

export default Commissions;
