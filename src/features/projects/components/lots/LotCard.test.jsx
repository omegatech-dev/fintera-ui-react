// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, vi, expect, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import LotCard from "./LotCard";

expect.extend(matchers);

vi.mock("../../../../contexts/LocaleContext", () => ({
  useLocale: () => ({
    t: (key) => key,
    locale: "en",
  }),
}));

const baseLot = {
  id: 1,
  name: "Lote 1",
  status: "available",
  price: 750000,
  area: 300,
  length: 20,
  width: 15,
  measurement_unit: "m2",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LotCard", () => {
  it("shows the reserve action for an available lot", () => {
    const onReserve = vi.fn();
    render(<LotCard lot={baseLot} onReserve={onReserve} />);

    fireEvent.click(screen.getByRole("button", { name: /lots\.reserve/ }));

    expect(onReserve).toHaveBeenCalledTimes(1);
    expect(screen.getByText("lots.noOwner")).toBeInTheDocument();
  });

  it("opens the reservation for a reserved lot", () => {
    const onView = vi.fn();
    render(
      <LotCard
        lot={{
          ...baseLot,
          status: "reserved",
          reserved_by: "Ana Pérez",
        }}
        onView={onView}
      />
    );

    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /lots\.viewReservation/ }));

    expect(onView).toHaveBeenCalledTimes(1);
  });

  it("shows the generic view action for financed and paid lots", () => {
    const onView = vi.fn();
    const { rerender } = render(
      <LotCard lot={{ ...baseLot, status: "financed" }} onView={onView} />
    );

    fireEvent.click(screen.getByRole("button", { name: /common\.view/ }));
    expect(onView).toHaveBeenCalledTimes(1);

    rerender(<LotCard lot={{ ...baseLot, status: "fully_paid" }} onView={onView} />);
    fireEvent.click(screen.getByRole("button", { name: /common\.view/ }));
    expect(onView).toHaveBeenCalledTimes(2);
  });

  it("uses the effective price and exposes the admin edit action", () => {
    const onEdit = vi.fn();
    render(
      <LotCard
        lot={{ ...baseLot, effective_price: 700000 }}
        isAdmin
        onEdit={onEdit}
      />
    );

    expect(screen.getByText(/700,000/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /common\.edit/ }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
