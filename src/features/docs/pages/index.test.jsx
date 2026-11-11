import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthContext from "@/contexts/AuthContext";
import Documentation from "./index";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

const renderDocs = (role, initialEntry = "/docs") =>
  render(
    <AuthContext.Provider value={{ user: { id: 1, role } }}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/docs" element={<Documentation />} />
          <Route path="/docs/:slug" element={<Documentation />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe("Documentation page", () => {
  it("shows admin-only articles to admins", async () => {
    renderDocs("admin");

    expect(
      await screen.findByRole("heading", { name: "System overview and roles" }),
    ).toBeInTheDocument();
    expect(screen.getByText("General settings and branding")).toBeInTheDocument();
    expect(screen.getByText("Approving, rejecting, and undoing payments")).toBeInTheDocument();
  });

  it("hides admin-only articles from sellers", async () => {
    renderDocs("seller");

    expect(
      await screen.findByRole("heading", { name: "System overview and roles" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Financing types: direct, bank, and cash")).toBeInTheDocument();
    expect(screen.queryByText("General settings and branding")).toBeNull();
    expect(screen.queryByText("Approving, rejecting, and undoing payments")).toBeNull();
  });

  it("filters the article list with search", async () => {
    const user = userEvent.setup();
    renderDocs("admin");

    await screen.findByRole("heading", { name: "System overview and roles" });
    await user.type(screen.getByRole("searchbox"), "moratory");

    expect(await screen.findByText("Overdue (moratory) interest")).toBeInTheDocument();
    expect(screen.queryByText("Contract lifecycle and statuses")).toBeNull();
  });

  it("renders the selected article and its table of contents", async () => {
    renderDocs("admin", "/docs/overdue-interest");

    expect(
      await screen.findByRole("heading", { name: "Overdue (moratory) interest" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "The formula" })).toHaveAttribute(
      "href",
      "#the-formula",
    );
  });
});
