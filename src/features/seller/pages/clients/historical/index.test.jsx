import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../../../locales/en.json";
import HistoricalClientPage from "./index";

expect.extend(matchers);

const getValue = (object, path) =>
  path.split(".").reduce((current, key) => current?.[key], object);

const t = (key, params = {}) => {
  const value = getValue(en, key) ?? key;
  return Object.entries(params).reduce(
    (text, [name, replacement]) =>
      text.replaceAll(`{${name}}`, String(replacement)),
    value
  );
};

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock("../../../api", () => ({
  sellerApi: {
    getCommissionRules: vi.fn(),
    getHistoricalSale: vi.fn(),
    createHistoricalSale: vi.fn(),
    updateHistoricalSale: vi.fn(),
    uploadHistoricalEvidence: vi.fn(),
    fetchHistoricalEvidence: vi.fn(),
    downloadHistoricalEvidence: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

import { sellerApi } from "../../../api";

function renderPage() {
  return render(
    <MemoryRouter>
      <HistoricalClientPage />
    </MemoryRouter>
  );
}

function renderEditPage(id = "91") {
  return render(
    <MemoryRouter initialEntries={[`/vendedor/clientes/historicos/${id}`]}>
      <Routes>
        <Route
          path="/vendedor/clientes/historicos/:id"
          element={<HistoricalClientPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

const fillForm = () => {
  fireEvent.change(screen.getByLabelText(/Full name/), {
    target: { value: "Ana Ramos" },
  });
  fireEvent.change(screen.getByLabelText(/Identity/), {
    target: { value: "0801-1990-12345" },
  });
  fireEvent.change(screen.getByLabelText(/^Phone/), {
    target: { value: "9999-8888" },
  });
  fireEvent.change(screen.getByLabelText(/^Email/), {
    target: { value: "ana@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/Project/), {
    target: { value: "Residencial Los Pinos" },
  });
  fireEvent.change(screen.getByLabelText(/Lot/), {
    target: { value: "Lote 12" },
  });
  fireEvent.change(screen.getByLabelText(/Area/), {
    target: { value: "500" },
  });
  fireEvent.change(screen.getByLabelText(/Sale price/), {
    target: { value: "750000" },
  });
  fireEvent.change(screen.getByLabelText(/Sale date/), {
    target: { value: "2023-05-15" },
  });
  fireEvent.change(screen.getByLabelText(/Payment method/), {
    target: { value: "financed" },
  });
  fireEvent.change(screen.getByLabelText(/Sale status/), {
    target: { value: "installments" },
  });
  fireEvent.change(screen.getByLabelText(/Installments paid/), {
    target: { value: "3" },
  });
};

beforeEach(() => {
  sellerApi.getCommissionRules.mockReset();
  sellerApi.getHistoricalSale.mockReset();
  sellerApi.createHistoricalSale.mockReset();
  sellerApi.updateHistoricalSale.mockReset();
  sellerApi.uploadHistoricalEvidence.mockReset();
  sellerApi.getCommissionRules.mockResolvedValue({ default_rate: 5 });
  sellerApi.createHistoricalSale.mockResolvedValue({ id: 91 });
  sellerApi.updateHistoricalSale.mockResolvedValue({ id: 91 });
  sellerApi.uploadHistoricalEvidence.mockResolvedValue({
    historical_sale: { id: 91 },
  });
  sellerApi.fetchHistoricalEvidence.mockReset();
  sellerApi.downloadHistoricalEvidence.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("historical client form", () => {
  it("renders the 21h sections and the save checklist", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Add historical client",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Migrate old sales without going through the project and reservation flow."
      )
    ).toBeInTheDocument();

    expect(screen.getByText("Client data")).toBeInTheDocument();
    expect(screen.getByText("Historical sale")).toBeInTheDocument();
    expect(screen.getByText("What happens on save")).toBeInTheDocument();
    expect(
      screen.getByText("The sale creates no reservation and blocks no lot.")
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(sellerApi.getCommissionRules).toHaveBeenCalledTimes(1)
    );
  });

  it("submits the historical payload without reservation or lot references", async () => {
    renderPage();
    fillForm();

    expect(screen.getByDisplayValue("37500.00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(sellerApi.createHistoricalSale).toHaveBeenCalledTimes(1)
    );

    const payload = sellerApi.createHistoricalSale.mock.calls[0][0];
    expect(payload).toMatchObject({
      full_name: "Ana Ramos",
      identity: "0801-1990-12345",
      phone: "9999-8888",
      email: "ana@example.com",
      project_name: "Residencial Los Pinos",
      lot_label: "Lote 12",
      area_m2: 500,
      sale_price: 750000,
      sale_date: "2023-05-15",
      payment_mode: "financed",
      sale_status: "installments",
      installments_paid: 3,
      rate: 5,
      amount: 37500,
      commission_status: "pending",
      is_historical: true,
    });
    expect(payload).not.toHaveProperty("project_id");
    expect(payload).not.toHaveProperty("lot_id");
    expect(payload).not.toHaveProperty("reservation_id");

    expect(
      await screen.findByText("Historical · pending validation")
    ).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith(
      "Historical · pending validation",
      "success"
    );
  });

  it("validates the required fields before saving", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Enter the full name.")
    ).toBeInTheDocument();
    expect(sellerApi.createHistoricalSale).not.toHaveBeenCalled();
  });

  it("preloads the seller rate and allows overriding it", async () => {
    sellerApi.getCommissionRules.mockResolvedValue({
      rules: { default_rate: 5, seller_rate: 6 },
    });

    renderPage();
    await waitFor(() =>
      expect(screen.getByLabelText(/Commission rate/)).toHaveValue(6)
    );

    fillForm();
    expect(screen.getByDisplayValue("45000.00")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Commission rate/), {
      target: { value: "7" },
    });
    expect(screen.getByDisplayValue("52500.00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(sellerApi.createHistoricalSale).toHaveBeenCalledTimes(1)
    );

    const payload = sellerApi.createHistoricalSale.mock.calls[0][0];
    expect(payload).toMatchObject({ rate: 7, amount: 52500 });
  });

  it("recalculates the rate when the commission amount changes", async () => {
    renderPage();
    fillForm();

    fireEvent.change(screen.getByLabelText(/Commission amount/), {
      target: { value: "45000" },
    });

    expect(screen.getByLabelText(/Commission rate/)).toHaveValue(6);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(sellerApi.createHistoricalSale).toHaveBeenCalledTimes(1)
    );

    const payload = sellerApi.createHistoricalSale.mock.calls[0][0];
    expect(payload).toMatchObject({ rate: 6, amount: 45000 });
  });

  it("loads and updates a pending historical record", async () => {
    sellerApi.getHistoricalSale.mockResolvedValue({
      historical_sale: {
        id: 91,
        full_name: "Ana Ramos",
        client_identity: "0801-1990-12345",
        client_phone: "9999-8888",
        client_email: "ana@example.com",
        project_name: "Residencial Los Pinos",
        lot_label: "Lote 12",
        area_m2: 500,
        sale_price: 750000,
        sale_date: "2023-05-15",
        payment_mode: "bank",
        sale_status: "installments",
        installments_paid: 3,
        rate: 6,
        commission_amount: 45000,
        commission_status: "pending",
        validation_status: "pending",
      },
    });

    renderEditPage();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Edit historical client",
      })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText(/Full name/)).toHaveValue("Ana Ramos")
    );
    expect(screen.getByLabelText(/Commission rate/)).toHaveValue(6);
    expect(screen.getByLabelText(/Commission amount/)).toHaveValue(45000);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(sellerApi.updateHistoricalSale).toHaveBeenCalledWith(
        "91",
        expect.objectContaining({
          full_name: "Ana Ramos",
          sale_price: 750000,
          rate: 6,
          amount: 45000,
        })
      )
    );
  });

  const evidenceFile = new File(["bytes"], "respaldo.png", {
    type: "image/png",
  });

  const attachEvidence = () => {
    const input = screen.getByLabelText(/Evidence \(optional\)/);
    Object.defineProperty(input, "files", { value: [evidenceFile] });
    fireEvent.change(input);
  };

  it("uploads the attached evidence after creating the record", async () => {
    renderPage();
    fillForm();
    attachEvidence();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(sellerApi.createHistoricalSale).toHaveBeenCalledTimes(1)
    );
    await waitFor(() =>
      expect(sellerApi.uploadHistoricalEvidence).toHaveBeenCalledWith(
        91,
        evidenceFile
      )
    );
    expect(showToast).toHaveBeenCalledWith(
      "Historical · pending validation",
      "success"
    );
  });

  it("preserves the uploaded evidence when editing without a new file", async () => {
    sellerApi.getHistoricalSale.mockResolvedValue({
      historical_sale: {
        id: 91,
        full_name: "Ana Ramos",
        client_identity: "0801-1990-12345",
        sale_price: 750000,
        sale_date: "2023-05-15",
        rate: 6,
        commission_amount: 45000,
        validation_status: "pending",
        evidence_file: "evidence/2026/11/a3f8.png",
      },
    });

    renderEditPage();
    await waitFor(() =>
      expect(screen.getByLabelText(/Full name/)).toHaveValue("Ana Ramos")
    );

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(sellerApi.updateHistoricalSale).toHaveBeenCalledWith(
        "91",
        expect.objectContaining({
          evidence_file: "evidence/2026/11/a3f8.png",
        })
      )
    );
    expect(sellerApi.uploadHistoricalEvidence).not.toHaveBeenCalled();
  });

  it("keeps the created record and retries only the upload when it fails", async () => {
    sellerApi.uploadHistoricalEvidence.mockRejectedValue({
      message: "Solo se aceptan archivos PDF, JPEG o PNG",
    });

    renderPage();
    fillForm();
    attachEvidence();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Solo se aceptan archivos PDF, JPEG o PNG")
    ).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith(
      "Historical · pending validation",
      "success"
    );
    expect(sellerApi.createHistoricalSale).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(sellerApi.uploadHistoricalEvidence).toHaveBeenCalledTimes(2)
    );
    expect(sellerApi.createHistoricalSale).toHaveBeenCalledTimes(1);
  });

  it("stays on the page when the upload fails after an update", async () => {
    sellerApi.getHistoricalSale.mockResolvedValue({
      historical_sale: {
        id: 91,
        full_name: "Ana Ramos",
        client_identity: "0801-1990-12345",
        sale_price: 750000,
        sale_date: "2023-05-15",
        rate: 6,
        commission_amount: 45000,
        validation_status: "pending",
      },
    });
    sellerApi.uploadHistoricalEvidence.mockRejectedValue({
      status: 403,
      message: "forbidden",
    });

    renderEditPage();
    await waitFor(() =>
      expect(screen.getByLabelText(/Full name/)).toHaveValue("Ana Ramos")
    );
    attachEvidence();

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(sellerApi.uploadHistoricalEvidence).toHaveBeenCalledWith(
        "91",
        evidenceFile
      )
    );
    expect(
      await screen.findByText(
        "You do not have permission to upload evidence for this client."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Edit historical client" })
    ).toBeInTheDocument();
  });

  describe("evidence viewer in edit page", () => {
    const editSaleWithEvidence = {
      id: 91,
      full_name: "Ana Ramos",
      client_identity: "0801-1990-12345",
      sale_price: 750000,
      sale_date: "2023-05-15",
      rate: 6,
      commission_amount: 45000,
      validation_status: "pending",
      evidence_file: "evidence/2026/11/a3f8.png",
    };

    beforeEach(() => {
      vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: vi.fn(() => "blob:preview"),
        revokeObjectURL: vi.fn(),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const openEditWithEvidence = async () => {
      sellerApi.getHistoricalSale.mockResolvedValue({
        historical_sale: editSaleWithEvidence,
      });
      renderEditPage();
      await waitFor(() =>
        expect(screen.getByLabelText(/Full name/)).toHaveValue("Ana Ramos")
      );
    };

    it("lets the owner view the uploaded evidence", async () => {
      sellerApi.fetchHistoricalEvidence.mockResolvedValue({
        kind: "file",
        url: "blob:preview",
        contentType: "image/png",
      });

      await openEditWithEvidence();
      fireEvent.click(screen.getByRole("button", { name: "View evidence" }));

      const image = await screen.findByRole("img");
      expect(image).toHaveAttribute("src", "blob:preview");
    });

    it("shows the error state when the evidence request is rejected", async () => {
      sellerApi.fetchHistoricalEvidence.mockRejectedValue({
        status: 403,
        message: "No autorizado",
      });

      await openEditWithEvidence();
      fireEvent.click(screen.getByRole("button", { name: "View evidence" }));

      expect(await screen.findByText("No autorizado")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
    });
  });
});
