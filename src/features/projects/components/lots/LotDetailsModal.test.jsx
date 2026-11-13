// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import LotDetailsModal from "./LotDetailsModal";

expect.extend(matchers);

vi.mock("../../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

const lot = {
  id: 3,
  project_name: "Portal Mar de Plata",
  name: "Lote 3",
  status: "available",
  width: 15,
  length: 20,
  measurement_unit: "m2",
  area: 300,
  price: 750000,
  code: "PMP-L03",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LotDetailsModal", () => {
  it("renders the sheet facts, price, and available lot actions", () => {
    const onReserve = vi.fn();
    const onEdit = vi.fn();

    render(
      <LotDetailsModal
        lot={lot}
        onClose={vi.fn()}
        onReserve={onReserve}
        onEdit={onEdit}
        isAdmin
      />
    );

    expect(screen.getByRole("heading", { name: "Lote 3" })).toBeInTheDocument();
    expect(screen.getByText("PMP-L03")).toBeInTheDocument();
    expect(screen.getByText("750,000 HNL")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "projects.reserveLot" }));
    expect(onReserve).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "lots.editLot" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("does not offer the reserve action for a reserved lot", () => {
    render(
      <LotDetailsModal
        lot={{ ...lot, status: "reserved", reserved_by: "Ana Pérez" }}
        onClose={vi.fn()}
        onReserve={vi.fn()}
      />
    );

    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "projects.reserveLot" })
    ).not.toBeInTheDocument();
  });
});
