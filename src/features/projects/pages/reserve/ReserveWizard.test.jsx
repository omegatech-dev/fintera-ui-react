import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../../locales/en.json";
import ReserveWizard from "./ReserveWizard";
import { sellerApi } from "../../../seller/api";

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

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/AuthContext", async () => {
  const { createContext } = await import("react");
  return {
    default: createContext({ user: { role: "admin" }, token: "token" }),
  };
});

vi.mock("@/shared/editor/MessageEditor", () => ({
  default: () => <div data-testid="message-editor" />,
}));

vi.mock("../../../seller/api", () => ({
  sellerApi: { listSellers: vi.fn() },
}));

const sellers = [
  { id: 1, full_name: "Cristofer Mejía", address: "Omoa", sales_count: 12 },
  { id: 2, full_name: "Juan Pérez", address: "Tegucigalpa", sales_count: 8 },
];

const lot = {
  name: "Lote 3",
  projectName: "Portal Mar de Plata",
  status: "available",
  dimensions: "15 × 20 m",
  area: "300 m²",
  measurementUnit: "m²",
  price: 750000,
  commissionRates: { direct: 5, bank: 4, cash: 3 },
};

const fillClient = () => {
  fireEvent.click(screen.getByRole("radio", { name: "New" }));
  fireEvent.change(screen.getByLabelText(/Full Name/), {
    target: { value: "Karla Mejía" },
  });
  fireEvent.change(screen.getByLabelText(/Phone/), {
    target: { value: "9999-0000" },
  });
  fireEvent.change(screen.getByLabelText(/Identity/), {
    target: { value: "0801-1990-00001" },
  });
};

const completeAndSubmit = async () => {
  fireEvent.change(screen.getByLabelText(/Reservation Amount/), {
    target: { value: "15000" },
  });
  fireEvent.change(screen.getByLabelText(/Down Payment Amount/), {
    target: { value: "0" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Continue to documents" })
  );
  fireEvent.click(screen.getByRole("button", { name: "Create Request" }));
};

beforeEach(() => {
  sellerApi.listSellers.mockResolvedValue({ sellers });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ReserveWizard seller question", () => {
  it("advances without a seller and submits an automatic assignment", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReserveWizard lot={lot} currency="HNL" onSubmit={onSubmit} />);

    expect(await screen.findByText("Omoa · 12 sales")).toBeInTheDocument();
    expect(screen.getAllByText(/300 m²/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/300 m² m²/)).not.toBeInTheDocument();
    fillClient();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Financing plan")).toBeInTheDocument();

    await completeAndSubmit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      assignmentOrigin: "automatic",
      sellerId: "",
    });
  });

  it("submits the chosen seller as a manual assignment", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReserveWizard lot={lot} currency="HNL" onSubmit={onSubmit} />);

    expect(await screen.findByText("Omoa · 12 sales")).toBeInTheDocument();
    fillClient();
    fireEvent.click(screen.getByRole("radio", { name: /Cristofer Mejía/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await completeAndSubmit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      assignmentOrigin: "manual",
      sellerId: 1,
    });
  });

  it("updates the summary rail when the seller selection changes", async () => {
    render(<ReserveWizard lot={lot} currency="HNL" onSubmit={vi.fn()} />);

    expect(await screen.findByText("Omoa · 12 sales")).toBeInTheDocument();
    const rail = screen.getByText("ASSIGNED SELLER").closest("section");
    expect(within(rail).getByText("Automatic assignment")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /Cristofer Mejía/ }));
    expect(within(rail).getByText("Cristofer Mejía")).toBeInTheDocument();
    expect(
      within(rail).getByText("They will contact you to follow up")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /No one assisted me/ }));
    expect(within(rail).getByText("Automatic assignment")).toBeInTheDocument();
  });
});
