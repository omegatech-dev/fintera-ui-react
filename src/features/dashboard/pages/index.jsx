import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import { paymentsApi } from "../../payments/api";
import { contractsApi } from "../../contracts/api";
import RecentActivity from "../components/RecentActivity";
import SellerDashboard from "./SellerDashboard";
import { Button, Card, ErrorState, Skeleton } from "@/shared/ui";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [paymentsResult, contractsResult] = await Promise.allSettled([
      paymentsApi.getStats(),
      contractsApi.getStats(),
    ]);

    if (paymentsResult.status === "fulfilled") {
      setPaymentsStats(paymentsResult.value);
    }
    if (contractsResult.status === "fulfilled") {
      setContractsStats(contractsResult.value);
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
  const activeContracts = contractsStats?.approved;

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
                to: "/payments",
                tone: "danger",
              },
              {
                label: "Contratos por aprobar",
                value: pendingContracts ?? "—",
                caption: "Esperan una decisión",
                to: "/contracts",
                tone: "warning",
              },
              {
                label: "Contratos activos",
                value: activeContracts ?? "—",
                caption: "Con financiamiento vigente",
                to: "/contracts",
                tone: "default",
              },
              {
                label: "Recaudado este mes",
                value: formatMoney(collected),
                caption: "Pagos aprobados",
                to: "/payments",
                tone: "success",
              },
            ].map((card) => (
              <AttentionCard key={card.label} {...card} />
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Resumen del mes">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-micro text-ink-3">Recaudado</dt>
                <dd className="text-title font-bold text-ink">
                  {formatMoney(collected)}
                </dd>
              </div>
              <div>
                <dt className="text-micro text-ink-3">Vencido</dt>
                <dd className="text-title font-bold text-danger">
                  {formatMoney(overdue)}
                </dd>
              </div>
              <div>
                <dt className="text-micro text-ink-3">Contratos activos</dt>
                <dd className="text-title font-bold text-ink">
                  {activeContracts ?? "—"}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <main className="min-h-screen w-full px-6 pb-6 pt-[100px] sm:pt-[156px] xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="mx-auto max-w-7xl">
        {user?.role === "seller" ? <SellerDashboard user={user} /> : <AdminDashboard />}
      </div>
    </main>
  );
}

export default Home;
