import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import SellerDashboard from "./SellerDashboard";
import { dashboardApi } from "../api";

expect.extend(matchers);

const translations = {
  "dashboard.goodMorning": "Buenos días, {name}",
  "dashboard.goodAfternoon": "Buenas tardes, {name}",
  "dashboard.goodEvening": "Buenas noches, {name}",
  "common.loading": "Cargando...",
  "common.notAvailable": "N/A",
  "common.previous": "Anterior",
  "common.next": "Siguiente",
  "sellerDashboard.newReservation": "Nueva reserva",
  "sellerDashboard.collectionsShortcut": "Cobros",
  "sellerDashboard.summaryTitle": "Resumen",
  "sellerDashboard.monthSales": "Ventas del mes",
  "sellerDashboard.pendingCommission": "Comisión estimada",
  "sellerDashboard.activeLeads": "Prospectos activos",
  "sellerDashboard.stats.sixMonthTotal": "Acumulado 6 meses: {amount}",
  "sellerDashboard.stats.commissionCaption":
    "2% sobre ventas aprobadas de los últimos 6 meses",
  "sellerDashboard.stats.leadsCaption": "Pendientes o en revisión",
  "sellerDashboard.stats.conversionCaption":
    "Proporción de prospectos que se convirtieron en ventas aprobadas.",
  "sellerDashboard.stats.last6Months": "Últimos 6 meses",
  "sellerDashboard.stats.sales": "Ventas",
  "sellerDashboard.activityTitle": "Actividad reciente",
  "sellerDashboard.activitySubtitle":
    "Últimos contratos y clientes actualizados",
  "sellerDashboard.viewAllCustomers": "Ver todos",
  "sellerDashboard.noActivityTitle": "Sin actividad reciente",
  "sellerDashboard.noActivityDescription":
    "Cuando registres una venta o se actualice un contrato, aparecerá aquí.",
  "sellerDashboard.commissionDetailTitle": "Detalle de comisión",
  "sellerDashboard.conversionLabel": "Tasa de conversión",
  "sellerDashboard.viewCommissions": "Ver comisiones",
  "sellerDashboard.performanceTrend": "Tendencia de Rendimiento",
  "sellerDashboard.chartLabel": "Ventas de los últimos 6 meses",
  "sellerDashboard.chartEmptyTitle": "Sin ventas en los últimos 6 meses",
  "sellerDashboard.chartEmptyDescription":
    "La gráfica aparecerá cuando se apruebe una venta.",
  "sellerDashboard.loadErrorTitle": "No pudimos cargar tu día",
  "sellerDashboard.loadErrorDescription":
    "Revisa tu conexión e intenta de nuevo.",
  "payments.statusOptions.approved": "Aprobado",
  "payments.statusOptions.pending": "Pendiente",
};

const t = (key, params = {}) =>
  String(translations[key] ?? key).replace(/\{(\w+)\}/g, (_, name) =>
    params[name] === undefined ? `{${name}}` : String(params[name])
  );

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "es" }),
}));

vi.mock("react-chartjs-2", () => ({
  Line: ({ role, "aria-label": ariaLabel }) => (
    <div data-testid="seller-sales-chart" role={role} aria-label={ariaLabel} />
  ),
}));

vi.mock("../api", () => ({
  dashboardApi: {
    getSellerStats: vi.fn(),
    getCommissions: vi.fn(),
    downloadCommissionsCsv: vi.fn(),
  },
}));

const sellerStats = {
  total_sales_value: 900000,
  active_leads: 7,
  pending_commission: 18000,
  conversion_rate: 42.5,
  chart_data: {
    labels: ["jun", "jul", "ago", "sep", "oct", "nov"],
    data: [50000, 70000, 80000, 90000, 110000, 120000],
  },
  recent_customers: [
    {
      name: "Milton Perez",
      project: "Altos del Valle",
      status: "approved",
      amount: "L 54,583.00",
      date: "2026-11-10T10:00:00Z",
    },
    {
      name: "N/A",
      project: "N/A",
      status: "pending",
      amount: "L 10,000.00",
      date: "",
    },
  ],
};

const seller = {
  id: 2,
  full_name: "Cristofer Hernandez",
  email: "cristofer@example.com",
  role: "seller",
};

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <SellerDashboard user={seller} />
    </MemoryRouter>
  );

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  dashboardApi.getSellerStats.mockReset();
  dashboardApi.getCommissions.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("SellerDashboard", () => {
  it("renders the KPI row, recent activity and commission summary from real API data", async () => {
    dashboardApi.getSellerStats.mockResolvedValue(sellerStats);
    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: /Buenos días, Cristofer/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Ventas del mes")).toBeInTheDocument();
    expect(screen.getByText("L 120,000")).toBeInTheDocument();
    expect(
      screen.getByText(/Acumulado 6 meses: .*L 900,000/)
    ).toBeInTheDocument();

    expect(screen.getByText("Comisión estimada")).toBeInTheDocument();
    expect(screen.getAllByText(/2% sobre ventas aprobadas/).length).toBe(2);

    expect(screen.getByText("Prospectos activos")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();

    expect(screen.getByText("Actividad reciente")).toBeInTheDocument();
    expect(screen.getByText("Milton Perez")).toBeInTheDocument();
    expect(screen.getByText("Altos del Valle")).toBeInTheDocument();
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);

    expect(screen.getByText("Detalle de comisión")).toBeInTheDocument();
    expect(screen.getByText("42.5%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "43"
    );

    expect(
      screen.getByRole("img", { name: "Ventas de los últimos 6 meses" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Ver comisiones/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ver todos/i })
    ).toHaveAttribute("href", "/vendedor/clientes");
    expect(
      screen.getByRole("button", { name: /Nueva reserva/i })
    ).toBeInTheDocument();

    const now = new Date();
    expect(dashboardApi.getSellerStats).toHaveBeenCalledWith(
      now.getMonth() + 1,
      now.getFullYear()
    );
  });

  it("shows a loading state while the seller stats are pending", async () => {
    const pending = deferred();
    dashboardApi.getSellerStats.mockReturnValue(pending.promise);

    renderDashboard();

    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
    expect(screen.queryByText("Ventas del mes")).not.toBeInTheDocument();

    pending.resolve(sellerStats);
    expect(
      await screen.findByText("Ventas del mes")
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows an error state and retries the request", async () => {
    dashboardApi.getSellerStats
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(sellerStats);

    renderDashboard();

    expect(
      await screen.findByText("No pudimos cargar tu día")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Revisa tu conexión e intenta de nuevo.")
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Reintentar/i })
    );

    await waitFor(() =>
      expect(dashboardApi.getSellerStats).toHaveBeenCalledTimes(2)
    );
    expect(await screen.findByText("Ventas del mes")).toBeInTheDocument();
  });

  it("renders empty states when there is no activity or chart data", async () => {
    dashboardApi.getSellerStats.mockResolvedValue({
      ...sellerStats,
      recent_customers: [],
      chart_data: { labels: [], data: [] },
    });

    renderDashboard();

    expect(
      await screen.findByText("Sin actividad reciente")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sin ventas en los últimos 6 meses")
    ).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("opens the commissions dialog from the commission card", async () => {
    dashboardApi.getSellerStats.mockResolvedValue(sellerStats);
    dashboardApi.getCommissions.mockResolvedValue({
      commissions: [
        {
          contract_id: 91,
          date: "2026-11-05",
          client_name: "Cliente del modal",
          project: "Altos del Valle",
          lot: "Lote 031",
          financing_type: "direct",
          amount: 500000,
          commission: 10000,
        },
      ],
    });

    renderDashboard();

    await screen.findByText("Ventas del mes");
    await userEvent.click(
      screen.getByRole("button", { name: /Ver comisiones/i })
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("Cliente del modal")).toBeInTheDocument();
    expect(dashboardApi.getCommissions).toHaveBeenCalled();
  });

  it("uses a stacking, responsive layout for the KPIs and detail panels", async () => {
    dashboardApi.getSellerStats.mockResolvedValue(sellerStats);
    const { container } = renderDashboard();

    await screen.findByText("Ventas del mes");

    const kpiTitle = container.querySelector("#seller-kpis-title");
    expect(kpiTitle?.nextElementSibling).toHaveClass(
      "grid-cols-1",
      "sm:grid-cols-3"
    );

    const activityTitle = container.querySelector("#seller-activity-title");
    expect(activityTitle?.closest("div.grid")).toHaveClass("lg:grid-cols-3");
  });
});
