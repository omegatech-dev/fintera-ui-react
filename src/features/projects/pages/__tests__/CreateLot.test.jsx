import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CreateLot from "../lots/create";
import AuthContext from "@/contexts/AuthContext";
import { projectsApi } from "../../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../api", () => ({
  projectsApi: {
    get: vi.fn(),
    createLot: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => {
  const t = (key) => key;
  return { useLocale: () => ({ t }) };
});

const renderCreate = () =>
  render(
    <AuthContext.Provider value={{ user: { role: "admin" } }}>
      <MemoryRouter initialEntries={["/projects/14/lots/create"]}>
        <Routes>
          <Route path="/projects/:id/lots/create" element={<CreateLot />} />
          <Route path="/projects/:id/lots" element={<div>lot list</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("CreateLot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsApi.get.mockResolvedValue({
      project: {
        name: "Ciudad Coral",
        price_per_square_unit: 100,
        measurement_unit: "m2",
      },
    });
    projectsApi.createLot.mockResolvedValue({});
  });

  it("renders the new form shell and sends the calculated lot payload", async () => {
    const { container } = renderCreate();

    const nameInput = await screen.findByLabelText("lots.lotName");
    fireEvent.change(nameInput, { target: { value: "Lote 42" } });
    fireEvent.change(screen.getByLabelText("lots.length (m)"), {
      target: { value: "20" },
    });
    fireEvent.change(screen.getByLabelText("lots.width (m)"), {
      target: { value: "10" },
    });

    expect(screen.getByText("lots.formSummary")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "header.pageTitle.createLot" })
    ).toHaveAttribute("form", "lot-create-form");

    fireEvent.submit(container.querySelector("#lot-create-form"));

    await waitFor(() => expect(projectsApi.createLot).toHaveBeenCalled());
    const payload = projectsApi.createLot.mock.calls[0][1].lot;
    expect(payload.name).toBe("Lote 42");
    expect(payload.length).toBe(20);
    expect(payload.width).toBe(10);
    expect(payload.area).toBe(200);
    expect(payload.price).toBe(20000);
    expect(payload.override_price).toBeNull();
    expect(payload.override_area).toBeNull();
  });
});
