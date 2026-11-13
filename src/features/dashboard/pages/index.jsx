import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import { paymentsApi } from "../../payments/api";
import { contractsApi } from "../../contracts/api";
import { projectsApi } from "../../projects/api";
import RecentActivity from "../components/RecentActivity";
import SellerDashboard from "./SellerDashboard";
import { Button, Card, Chip, ErrorState, Skeleton } from "@/shared/ui";

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  if (Math.abs(amount) >= 1_000_000) {
    return `L ${(amount / 1_000_000).toFixed(2)}M`;
  }
  return `L ${amount.toLocaleString("es-HN", {
    maximumFractionDigits: 0,
  })}`;
};

function AttentionCard({ label, value, caption, to, tone = "default" }) {
  const tones = {
    default: "text-ink",
    danger: "text-danger",
    warning: "text-warning",
    success: "text-brand-strong",
    info: "text-info",
  };

  return (
    <Link
      to={to}
      className="group flex flex-col gap-1 rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong"
    >
      <span className="text-label font-semibold text-ink-3">{label}</span>
      <span className={`text-page font-bold ${tones[tone]}`}>{value}</span>
      <span className="text-micro text-ink-3">{caption}</span>
      <span className="mt-1 text-label font-semibold text-brand">
        Revisar →
      </span>
    </Link>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [paymentsStats, setPaymentsStats] = useState(null);
  const [contractsStats, setContractsStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [paymentsResult, contractsResult, recentPaymentsResult, projectsResult] =
      await Promise.allSettled([
        paymentsApi.getStats(),
        contractsApi.getStats(),
        paymentsApi.list({ page: 1, per_page: 4, sort: "due_date-asc" }),
        projectsApi.list({ page: 1, per_page: 100 }),
      ]);

    if (paymentsResult.status === "fulfilled") {
      setPaymentsStats(paymentsResult.value);
    }
    if (contractsResult.status === "fulfilled") {
      setContractsStats(contractsResult.value);
    }
    if (recentPaymentsResult.status === "fulfilled") {
      setRecentPayments(
        recentPaymentsResult.value.payments ||
          recentPaymentsResult.value.data ||
          []
      );
    }
    if (projectsResult.status === "fulfilled") {
      const projects = projectsResult.value.projects || projectsResult.value.data || [];
      const total = projects.reduce(
        (sum, project) => sum + (Number(project.lot_count) || 0),
        0
      );
      const occupied = projects.reduce(
        (sum, project) =>
          sum +
          (Number(project.sold_lots) || 0) +
          (Number(project.financed_lots) || 0),
        0
      );
      setOccupancy(total > 0 ? Math.round((occupied / total) * 1000) / 10 : null);
    }

    if (
      paymentsResult.status === "rejected" &&
      contractsResult.status === "rejected"
    ) {
      setError("No pudimos cargar el resumen.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const overdue = paymentsStats?.total_overdue;
  const collected = paymentsStats?.collected_this_month;
  const pendingContracts = contractsStats?.pending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-page font-bold text-ink">Requiere tu atención</h2>
          <p className="text-body text-ink-3">
            Lo que necesita una decisión hoy.
          </p>
        </div>
        <Button onClick={() => navigate("/payments")}>Registrar pago</Button>
      </div>

      {error && (
        <ErrorState
          title="No pudimos cargar el resumen"
          description="Revisa tu conexión e intenta de nuevo."
          onRetry={load}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-card border border-line bg-surface p-4"
              >
                <Skeleton rows={3} />
              </div>
            ))
          : [
              {
                label: "Vencidos",
                value: formatMoney(overdue),
                caption: "Cuotas vencidas por cobrar",
                to: "/payments?status=overdue",
                tone: "danger",
              },
              {
                label: "Pagos por aprobar",
                value: paymentsStats?.pending_count ?? "—",
                caption: "Esperan una decisión",
                to: "/payments?status=submitted",
                tone: "warning",
              },
              {
                label: "Contratos por aprobar",
                value: pendingContracts ?? "—",
                caption: "Reservas listas para firmar",
                to: "/contracts",
                tone: "info",
              },
              {
                label: "Reservas sin contrato",
                value: contractsStats?.reservations_without_contract ?? "—",
                caption: "Lotes reservados sin contrato",
                to: "/projects",
                tone: "default",
              },
            ].map((card) => (
              <AttentionCard key={card.label} {...card} />
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Cobros de esta semana"
            action={
              <Link to="/payments" className="text-label font-semibold text-brand">
                Ver pagos →
              </Link>
            }
          >
            {loading ? (
              <Skeleton rows={4} />
            ) : recentPayments.length === 0 ? (
              <p className="text-body text-ink-3">Sin cobros pendientes esta semana.</p>
            ) : (
              <div className="divide-y divide-line">
                {recentPayments.map((payment) => {
                  const overdue = payment.status === "overdue";
                  return (
                    <Link
                      key={payment.id}
                      to="/payments"
                      className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:bg-surface-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-body font-semibold text-ink">
                          {payment.applicant_name ||
                            payment.contract?.applicant_user?.full_name ||
                            "—"}
                        </p>
                        <p className="truncate text-micro text-ink-3">
                          {[payment.project_name, payment.lot_name]
                            .filter(Boolean)
                            .join(" · ") || payment.description}
                        </p>
                      </div>
                      <span className={`text-body font-semibold ${overdue ? "text-danger" : "text-ink-2"}`}>
                        {payment.due_date
                          ? new Date(payment.due_date).toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                      <span className="text-body font-bold tabular-nums text-ink">
                        {formatMoney(payment.total_amount ?? payment.amount)}
                      </span>
                      <Chip tone={overdue ? "danger" : "warning"}>
                        {overdue ? "Vencido" : "Pendiente"}
                      </Chip>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card title="Resumen del mes">
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-body text-ink-2">Recaudado</dt>
                <dd className="text-body font-bold text-ink">{formatMoney(collected)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-body text-ink-2">Vencido</dt>
                <dd className="text-body font-bold text-danger">{formatMoney(overdue)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-body text-ink-2">Ocupación de lotes</dt>
                <dd className="text-body font-bold text-ink">
                  {occupancy == null ? "—" : `${occupancy}%`}
                </dd>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(occupancy || 0, 100)}%` }}
                />
              </div>
            </dl>
          </Card>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <main className="min-h-screen w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="mx-auto max-w-7xl">
        {user?.role === "seller" ? <SellerDashboard user={user} /> : <AdminDashboard />}
      </div>
    </main>
  );
}

export default Home;
