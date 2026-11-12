import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EditLot from "../lots/edit";
import AuthContext from "@/contexts/AuthContext";
import { projectsApi } from "../../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../api", () => ({
  projectsApi: {
    getLot: vi.fn(),
    get: vi.fn(),
    updateLot: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => {
  const t = (key) => key;
  return { useLocale: () => ({ t }) };
});

vi.mock("../../components/media/LotPhotosPanel", () => ({
  default: () => <div data-testid="lot-photos-panel" />,
}));

vi.mock("framer-motion", () => {
  const Motion = ({ children }) => <div>{children}</div>;
  return {
    motion: new Proxy({}, { get: () => Motion }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

const renderEdit = () =>
  render(
    <AuthContext.Provider value={{ user: { role: "admin" } }}>
      <MemoryRouter initialEntries={["/projects/14/lots/239/edit"]}>
        <Routes>
          <Route path="/projects/:project_id/lots/:lot_id/edit" element={<EditLot />} />
          <Route path="/projects/:project_id/lots" element={<div>lot list</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("EditLot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsApi.getLot.mockResolvedValue({
      lot: {
        id: 239,
        guid: "lot-guid-239",
        name: "Lote 239",
        length: 10,
        width: 20,
        price: 2000,
        area: 200,
        status: "available",
        measurement_unit: "m2",
      },
    });
    projectsApi.get.mockResolvedValue({
      project: {
        name: "Ciudad Coral",
        price_per_square_unit: 100,
        measurement_unit: "m2",
      },
    });
    projectsApi.updateLot.mockResolvedValue({});
  });

  it("sends the existing guid when saving", async () => {
    const { container } = renderEdit();
    await screen.findByDisplayValue("Lote 239");

    fireEvent.submit(container.querySelector("#lot-edit-form"));

    await waitFor(() => expect(projectsApi.updateLot).toHaveBeenCalled());
    expect(projectsApi.updateLot.mock.calls[0][0]).toBe("14");
    expect(projectsApi.updateLot.mock.calls[0][1]).toBe("239");
    expect(projectsApi.updateLot.mock.calls[0][2].lot.guid).toBe("lot-guid-239");
  });
});
