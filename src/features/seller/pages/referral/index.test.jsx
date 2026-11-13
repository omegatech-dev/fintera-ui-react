import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import SellerReferralPage from "./index";
import { sellerApi } from "../../api";
import { CUSTOMER_PORTAL_URL } from "@config";

expect.extend(matchers);

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

const translations = {
  "sellerReferrals.title": "Mi enlace de referido",
  "sellerReferrals.subtitle":
    "Comparte tu enlace y da seguimiento a los clientes que reserven por ti",
  "sellerReferrals.publicLabel": "TU ENLACE PÚBLICO",
  "sellerReferrals.active": "Activo",
  "sellerReferrals.linkDescription":
    "Cada reserva completada desde este enlace se te asigna automáticamente y genera tu comisión según % de proyecto.",
  "sellerDashboard.referralShare": "Compartir / Imprimir",
  "sellerReferrals.copyLink": "Copiar enlace",
  "sellerReferrals.downloadQr": "Descargar QR",
  "sellerReferrals.copy": "Copiar",
  "sellerReferrals.copied": "Copiado",
  "sellerReferrals.whatsapp": "WhatsApp",
  "sellerReferrals.whatsappMessage":
    "Reserva tu lote conmigo en Fintera: {url}",
  "sellerReferrals.qrTitle": "Tu QR de referido",
  "sellerReferrals.qrCaption": "Imprime o comparte con tus clientes",
  "sellerReferrals.qrAlt": "Código QR del enlace de referido de {name}",
  "sellerReferrals.linkUnavailable":
    "Tu enlace estará disponible cuando un administrador lo active.",
  "sellerReferrals.metrics.visits": "VISITAS",
  "sellerReferrals.metrics.reservations": "RESERVAS ATRIBUIDAS",
  "sellerReferrals.metrics.conversion": "CONVERSIÓN",
  "sellerReferrals.metrics.commission": "COMISIÓN GENERADA",
  "sellerReferrals.howTitle": "Cómo funciona tu enlace",
  "sellerReferrals.steps.share.title": "Comparte el enlace",
  "sellerReferrals.steps.share.description":
    "Envíalo por WhatsApp, redes o entrégalo en persona.",
  "sellerReferrals.steps.reserve.title": "El cliente reserva",
  "sellerReferrals.steps.reserve.description":
    "Elige su lote y completa el pago de reserva desde tu enlace.",
  "sellerReferrals.steps.assign.title": "Se te asigna la venta",
  "sellerReferrals.steps.assign.description":
    "La reserva llega a tu panel y la comisión se calcula automáticamente.",
  "sellerReferrals.rulesTitle": "Reglas de comisión",
  "sellerReferrals.rules.closedSales": "Comisión sobre ventas cerradas",
  "sellerReferrals.rules.releasedOnApproval":
    "Se libera al aprobar la reserva",
  "sellerReferrals.rules.linkOnly": "Solo reservas desde tu enlace",
  "sellerReferrals.rules.unlimited": "Sin límite de referidos",
  "sellerReferrals.rulesNote": "Consulta el detalle en Comisiones.",
  "sellerReferrals.tableTitle": "Reservas desde tu enlace",
  "sellerReferrals.viewAll": "Ver todas",
  "sellerReferrals.columns.client": "CLIENTE",
  "sellerReferrals.columns.lotProject": "LOTE / PROYECTO",
  "sellerReferrals.columns.amount": "MONTO",
  "sellerReferrals.columns.commission": "COMISIÓN",
  "sellerReferrals.columns.status": "ESTADO",
  "sellerReferrals.columns.date": "FECHA",
  "sellerReferrals.emptyTitle": "Aún no hay reservas desde tu enlace",
  "sellerReferrals.emptyDescription":
    "Comparte tu enlace para empezar a recibir reservas atribuidas.",
  "sellerReferrals.loadErrorTitle": "No pudimos cargar tu enlace",
  "sellerReferrals.loadErrorDescription":
    "Revisa tu conexión e intenta de nuevo.",
  "sellerReferrals.reservationsErrorTitle": "No pudimos cargar las reservas",
  "sellerReferrals.reservationsErrorDescription":
    "El enlace sigue activo. Intenta de nuevo.",
  "sellerReferrals.copyError": "No pudimos copiar el enlace",
  "sellerReferrals.status.approved": "Aprobada",
  "sellerReferrals.status.pending": "Pendiente",
  "sellerReferrals.status.in_review": "En revisión",
  "common.loading": "Cargando...",
  "common.notAvailable": "N/A",
  "common.copiedToClipboard": "Copiado al portapapeles",
  "common.retry": "Reintentar",
};

const t = (key, params = {}) =>
  String(translations[key] ?? key).replace(/\{(\w+)\}/g, (_, name) =>
    params[name] === undefined ? `{${name}}` : String(params[name])
  );

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "es" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("../../api", () => ({
  sellerApi: {
    getReferral: vi.fn(),
    getReferralReservations: vi.fn(),
  },
}));

const REFERRAL_GUID = "9f2c1e6a-7b3d-4c58-9a10-2d5e8f4b6c71";
const REFERRAL_URL = `${CUSTOMER_PORTAL_URL.replace(/\/+$/, "")}/r/${REFERRAL_GUID}`;
const DISPLAY_REFERRAL_URL = REFERRAL_URL.replace(/^https?:\/\//i, "");

const referral = {
  referral_guid: REFERRAL_GUID,
  slug: "cristofer-m",
  seller_name: "Cristofer Hernandez",
  visits: 128,
  attributed_reservations: 6,
  conversion_rate: 4.7,
  generated_commission: 45000,
  commission_rate: 5,
};

const reservations = [
  {
    id: 1,
    client_name: "Milton Perez",
    lot_label: "Lote 3",
    project_name: "Portal Mar de Plata",
    amount: 750000,
    commission_amount: 30000,
    status: "approved",
    date: "2026-12-01",
  },
  {
    id: 2,
    client_name: "Antonio Perez",
    lot_label: "Lote 8",
    project_name: "Ciudad Coral",
    amount: 380000,
    commission_amount: 19000,
    status: "in_review",
    date: "2026-11-10",
  },
  {
    id: 3,
    client_name: "Karla Mejía",
    lot_label: "Lote 5",
    project_name: "Condominios Omega",
    amount: 300000,
    commission_amount: 15000,
    status: "pending",
    date: "2026-10-22",
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <SellerReferralPage />
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
  sellerApi.getReferral.mockReset();
  sellerApi.getReferralReservations.mockReset();
  showToast.mockReset();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  cleanup();
});

describe("SellerReferralPage", () => {
  it("renders the referral link, metrics, rules and attributed reservations", async () => {
    sellerApi.getReferral.mockResolvedValue(referral);
    sellerApi.getReferralReservations.mockResolvedValue({
      reservations,
    });

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Mi enlace de referido" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Comparte tu enlace y da seguimiento a los clientes que reserven por ti"
      )
    ).toBeInTheDocument();

    expect(screen.getAllByText(DISPLAY_REFERRAL_URL)).toHaveLength(2);
    expect(
      screen.getByText(/genera tu comisión según % de proyecto\./)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Compartir / Imprimir" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Código QR del enlace de referido de Cristofer Hernandez",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("VISITAS")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("RESERVAS ATRIBUIDAS")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("CONVERSIÓN")).toBeInTheDocument();
    expect(screen.getByText("4.7%")).toBeInTheDocument();
    expect(screen.getByText("COMISIÓN GENERADA")).toBeInTheDocument();
    expect(screen.getByText("L 45,000")).toBeInTheDocument();

    expect(screen.getByText("Cómo funciona tu enlace")).toBeInTheDocument();
    expect(screen.getByText("Comparte el enlace")).toBeInTheDocument();
    expect(screen.getByText("El cliente reserva")).toBeInTheDocument();
    expect(screen.getByText("Se te asigna la venta")).toBeInTheDocument();

    expect(screen.getByText("Reglas de comisión")).toBeInTheDocument();
    expect(screen.getByText("Comisión sobre ventas cerradas")).toBeInTheDocument();
    expect(screen.getByText("Se libera al aprobar la reserva")).toBeInTheDocument();
    expect(screen.getByText("Solo reservas desde tu enlace")).toBeInTheDocument();
    expect(screen.getByText("Sin límite de referidos")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();

    expect(screen.getByText("Reservas desde tu enlace")).toBeInTheDocument();
    expect(screen.getAllByText("Milton Perez").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Lote 3 · Portal Mar de Plata").length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("L 750,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("L 30,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aprobada").length).toBeGreaterThan(0);
    expect(screen.getAllByText("En revisión").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 dic 2026").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /Ver todas/i })
    ).toHaveAttribute("href", "/vendedor/clientes");

    const whatsapp = screen.getAllByRole("link", { name: /WhatsApp/i })[0];
    expect(whatsapp).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/?text=")
    );
    expect(whatsapp.getAttribute("href")).toContain(
      encodeURIComponent(REFERRAL_URL)
    );
  });

  it("copies the public referral URL and confirms it", async () => {
    sellerApi.getReferral.mockResolvedValue(referral);
    sellerApi.getReferralReservations.mockResolvedValue({ reservations });

    renderPage();

    await screen.findByText("128");
    await userEvent.click(
      screen.getByRole("button", { name: "Copiar enlace" })
    );

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        REFERRAL_URL
      )
    );
    expect(showToast).toHaveBeenCalledWith("Copiado al portapapeles");
    expect(
      await screen.findByRole("button", { name: "Copiado" })
    ).toBeInTheDocument();
  });

  it("shows a loading state while the referral data is pending", async () => {
    const referralRequest = deferred();
    const reservationsRequest = deferred();
    sellerApi.getReferral.mockReturnValue(referralRequest.promise);
    sellerApi.getReferralReservations.mockReturnValue(
      reservationsRequest.promise
    );

    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
    expect(screen.queryByText("128")).not.toBeInTheDocument();

    referralRequest.resolve(referral);
    reservationsRequest.resolve({ reservations });

    expect(await screen.findByText("128")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    );
  });

  it("shows an empty state when there are no attributed reservations", async () => {
    sellerApi.getReferral.mockResolvedValue(referral);
    sellerApi.getReferralReservations.mockResolvedValue({ reservations: [] });

    renderPage();

    expect(
      await screen.findByText("Aún no hay reservas desde tu enlace")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Comparte tu enlace para empezar a recibir reservas atribuidas."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Milton Perez")).not.toBeInTheDocument();
  });

  it("shows an error state and retries the referral request", async () => {
    sellerApi.getReferral
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(referral);
    sellerApi.getReferralReservations.mockResolvedValue({ reservations });

    renderPage();

    expect(
      await screen.findByText("No pudimos cargar tu enlace")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Revisa tu conexión e intenta de nuevo.")
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Reintentar/i })
    );

    await waitFor(() =>
      expect(sellerApi.getReferral).toHaveBeenCalledTimes(2)
    );
    expect(await screen.findByText("128")).toBeInTheDocument();
  });

  it("keeps the link visible when the reservations request fails", async () => {
    sellerApi.getReferral.mockResolvedValue(referral);
    sellerApi.getReferralReservations
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ reservations });

    renderPage();

    expect(
      await screen.findByText("No pudimos cargar las reservas")
    ).toBeInTheDocument();
    expect(screen.getAllByText(DISPLAY_REFERRAL_URL)).toHaveLength(2);

    await userEvent.click(
      screen.getByRole("button", { name: /Reintentar/i })
    );

    await waitFor(() =>
      expect(sellerApi.getReferralReservations).toHaveBeenCalledTimes(2)
    );
    expect((await screen.findAllByText("Milton Perez")).length).toBeGreaterThan(
      0
    );
  });
});
