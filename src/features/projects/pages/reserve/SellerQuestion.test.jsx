import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../../locales/en.json";
import SellerQuestion from "./SellerQuestion";

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

const sellers = [
  { id: 1, full_name: "Cristofer Mejía", address: "Omoa", sales_count: 12 },
  { id: 2, full_name: "Juan Pérez", address: "Tegucigalpa", sales_count: 8 },
  { id: 3, full_name: "María López", address: "San Pedro Sula", sales_count: 3 },
  { id: 4, full_name: "Ana Torres", address: "La Ceiba", sales_count: 1 },
];

afterEach(cleanup);

describe("SellerQuestion", () => {
  it("selects a suggested seller as a manual assignment", () => {
    const onModeChange = vi.fn();
    render(
      <SellerQuestion
        sellers={sellers}
        mode="automatic"
        onModeChange={onModeChange}
      />
    );

    expect(screen.getByText("Omoa · 12 sales")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Cristofer Mejía/ }));

    expect(onModeChange).toHaveBeenCalledWith("manual", sellers[0]);
  });

  it("filters the list with Buscar otro vendedor", () => {
    const onModeChange = vi.fn();
    render(
      <SellerQuestion
        sellers={sellers}
        mode="automatic"
        onModeChange={onModeChange}
      />
    );

    expect(screen.queryByText("Ana Torres")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Search another seller" }));
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "ana" },
    });
    fireEvent.click(screen.getByRole("radio", { name: /Ana Torres/ }));

    expect(onModeChange).toHaveBeenCalledWith("manual", sellers[3]);
  });

  it("selects automatic assignment when nobody attended the client", () => {
    const onModeChange = vi.fn();
    render(
      <SellerQuestion
        sellers={sellers}
        mode="manual"
        selectedSellerId={1}
        onModeChange={onModeChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: /No one assisted me/ }));

    expect(onModeChange).toHaveBeenCalledWith("automatic", null);
  });

  it("keeps the hint and the automatic option when there are no sellers", () => {
    render(
      <SellerQuestion
        sellers={[]}
        mode="automatic"
        onModeChange={vi.fn()}
      />
    );

    expect(screen.getByText("No sellers are available right now.")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /No one assisted me/ })).toBeChecked();
    expect(
      screen.getByText(
        "If you don't choose a seller, we'll automatically assign an available one. You can change it later."
      )
    ).toBeInTheDocument();
  });
});
