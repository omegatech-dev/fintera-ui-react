import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EditProject from "../edit";
import AuthContext from "@/contexts/AuthContext";
import { projectsApi } from "../../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../api", () => ({
  projectsApi: {
    get: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => {
  const t = (key) => key;
  return { useLocale: () => ({ t }) };
});

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../../components/media/ProjectDrawingsPanel", () => ({
  default: () => <div data-testid="drawings-panel" />,
}));

vi.mock("../../components/media/ProjectPhotosPanel", () => ({
  default: () => <div data-testid="photos-panel" />,
}));

vi.mock("framer-motion", () => {
  const Motion = ({ children }) => <div>{children}</div>;
  return { motion: new Proxy({}, { get: () => Motion }) };
});

const renderEdit = () =>
  render(
    <AuthContext.Provider value={{ user: { role: "admin" } }}>
      <MemoryRouter initialEntries={["/projects/1/edit"]}>
        <Routes>
          <Route path="/projects/:id/edit" element={<EditProject />} />
          <Route path="/projects" element={<div>project list</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("EditProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsApi.get.mockResolvedValue({
      project: {
        id: 1,
        name: "Altos de Santa María",
        lot_count: 10,
        sold_lots: 2,
        available_lots: 6,
        reserved_lots: 2,
        is_published: true,
      },
    });
    projectsApi.update.mockResolvedValue({});
    projectsApi.publish.mockResolvedValue({ project: { is_published: true } });
    projectsApi.unpublish.mockResolvedValue({ project: { is_published: false } });
  });

  it("renders a single Save action after the media panels", async () => {
    renderEdit();
    await screen.findByDisplayValue("Altos de Santa María");

    const breadcrumbs = screen.getAllByRole("button", { name: "projectsPage.title" });
    const saveButtons = screen.getAllByRole("button", { name: "projects.saveChanges" });

    expect(breadcrumbs).toHaveLength(1);
    expect(saveButtons).toHaveLength(1);

    const save = saveButtons[0];
    expect(save).toHaveAttribute("form", "project-edit-form");

    const photos = screen.getByTestId("photos-panel");
    expect(
      photos.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("unpublishes the project from the edit page", async () => {
    renderEdit();
    await screen.findByDisplayValue("Altos de Santa María");

    fireEvent.click(
      screen.getByRole("switch", { name: "projects.visiblePortal" })
    );

    await waitFor(() => expect(projectsApi.unpublish).toHaveBeenCalledWith("1"));
    expect(await screen.findByText("projects.unpublished")).toBeInTheDocument();
  });

  it("still sends the edited project from the final action row", async () => {
    const { container } = renderEdit();
    const nameInput = await screen.findByDisplayValue("Altos de Santa María");

    fireEvent.change(nameInput, { target: { value: "Altos Renovados" } });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(projectsApi.update).toHaveBeenCalled());
    expect(projectsApi.update.mock.calls[0][0]).toBe("1");
    expect(projectsApi.update.mock.calls[0][1].project.name).toBe("Altos Renovados");
  });
});
