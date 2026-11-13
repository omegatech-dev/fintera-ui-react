import { render, screen, cleanup, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import BottomNav from "./BottomNav";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

const renderNav = (role, path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav role={role} onOpenMenu={() => {}} />
    </MemoryRouter>
  );

const navLinks = () =>
  within(screen.getByRole("navigation", { name: "Navegación principal" })).queryAllByRole(
    "link"
  );

describe("BottomNav seller", () => {
  it("shows the five workspace items in the design order", () => {
    renderNav("seller");

    expect(navLinks().map((link) => link.textContent.trim())).toEqual([
      "seller.myDay",
      "seller.myClients",
      "seller.collections",
      "seller.tabCommissions",
      "seller.documents",
    ]);
    expect(navLinks().map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/vendedor/clientes",
      "/vendedor/cobros",
      "/vendedor/comisiones",
      "/vendedor/documentos",
    ]);
    expect(screen.queryByText("Más")).not.toBeInTheDocument();
  });

  it("does not show the admin mobile items", () => {
    renderNav("seller");

    ["Inicio", "Contratos", "Pagos", "Proyectos"].forEach((label) =>
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    );
  });

  it("marks only the matching nested seller route as current", () => {
    renderNav("seller", "/vendedor/cobros/123");

    const current = navLinks().filter(
      (link) => link.getAttribute("aria-current") === "page"
    );
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("seller.collections");
  });
});

describe("BottomNav other roles", () => {
  it("keeps the admin items and the More action", () => {
    renderNav("admin");

    expect(navLinks().map((link) => link.textContent.trim())).toEqual([
      "Inicio",
      "Contratos",
      "Pagos",
      "Proyectos",
    ]);
    expect(screen.getByRole("button", { name: "Más" })).toBeInTheDocument();
    expect(screen.queryByText("seller.myDay")).not.toBeInTheDocument();
  });

  it("keeps the regular-user fallback to the More action", () => {
    renderNav("user");

    expect(navLinks()).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Más" })).toBeInTheDocument();
  });
});
