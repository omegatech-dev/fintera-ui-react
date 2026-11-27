import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../../locales/en.json";
import AuthContext from "@/contexts/AuthContext";
import ReserveWizard from "./ReserveWizard";
import { sellerApi } from "../../../seller/api";
import { usersApi } from "../../../users/api";

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

vi.mock("../../../users/api", () => ({
  usersApi: { list: vi.fn() },
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
  usersApi.list.mockResolvedValue({ users: [], pagination: {} });
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

  it("assigns the reservation to the seller without asking for one", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const sellerUser = {
      id: 7,
      role: "seller",
      full_name: "Ana Vendedora",
      email: "ana@example.com",
    };

    render(
      <AuthContext.Provider value={{ user: sellerUser, token: "token" }}>
        <ReserveWizard lot={lot} currency="HNL" onSubmit={onSubmit} />
      </AuthContext.Provider>
    );

    expect(
      screen.queryByText("Did a seller assist you?")
    ).not.toBeInTheDocument();
    expect(sellerApi.listSellers).not.toHaveBeenCalled();

    const rail = screen.getByText("ASSIGNED SELLER").closest("section");
    expect(within(rail).getByText("Ana Vendedora")).toBeInTheDocument();
    expect(
      within(rail).getByText("This reservation will be assigned to you")
    ).toBeInTheDocument();

    fillClient();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await completeAndSubmit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      assignmentOrigin: "manual",
      sellerId: 7,
    });
  });

  it("marks a historical client in the reservation search and selection", async () => {
    usersApi.list.mockResolvedValue({
      users: [
        {
          id: 9,
          full_name: "Ana Histórica",
          email: "historico+ana@fintera.local",
          phone: "9999-1111",
          identity: "0801-1990-00009",
          historical_client: true,
          credit_score: 700,
        },
      ],
      pagination: {},
    });

    render(<ReserveWizard lot={lot} currency="HNL" onSubmit={vi.fn()} />);

    const search = screen.getByPlaceholderText("Search by name, phone or email");
    fireEvent.change(search, { target: { value: "Ana" } });

    expect(
      await screen.findByText("Ana Histórica", {}, { timeout: 2500 })
    ).toBeInTheDocument();
    expect(screen.getByText("HISTORICAL")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Ana Histórica"));

    expect(screen.getAllByText("HISTORICAL").length).toBeGreaterThan(0);
    expect(screen.getByText("No email")).toBeInTheDocument();
  });

  it("shows the deployment currency in the amount labels", async () => {
    render(<ReserveWizard lot={lot} currency="USD" onSubmit={vi.fn()} />);

    expect(await screen.findByText("Omoa · 12 sales")).toBeInTheDocument();
    fillClient();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(
      await screen.findByLabelText(/Reservation Amount \(USD\)/)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Down Payment Amount \(USD\)/)
    ).toBeInTheDocument();
  });
});
