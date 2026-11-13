import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
    createHistoricalSale: vi.fn(),
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
  sellerApi.createHistoricalSale.mockReset();
  sellerApi.getCommissionRules.mockResolvedValue({ default_rate: 5 });
  sellerApi.createHistoricalSale.mockResolvedValue({ id: 91 });
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
});
