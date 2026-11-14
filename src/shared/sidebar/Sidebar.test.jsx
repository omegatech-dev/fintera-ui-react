import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import Sidebar from "./Sidebar";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

vi.mock("../branding", () => ({
  BrandingLogo: () => <span data-testid="branding-logo" />,
}));

const renderSidebar = (
  Component,
  role,
  path = "/",
  { handleLogout = vi.fn(), handleActive = vi.fn() } = {}
) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Component
        user={{ id: 7, role, full_name: "Test User" }}
        handleLogout={handleLogout}
        handleActive={handleActive}
      />
    </MemoryRouter>
  );

describe("payments navigation", () => {
  it("links the Payments entry to /payments instead of the dashboard", () => {
    renderSidebar(Sidebar, "admin");
    expect(screen.getByText("dashboard.payments").closest("a")).toHaveAttribute(
      "href",
      "/payments"
    );
  });

  it("marks Payments as active only on the payments route", () => {
    renderSidebar(Sidebar, "admin", "/payments");
    const paymentsItem = screen.getByText("dashboard.payments").closest("li");
    const dashboardItem = screen.getByText("dashboard.dashboard").closest("li");
    expect(paymentsItem).toHaveClass("nav-active");
    expect(dashboardItem).not.toHaveClass("nav-active");
    expect(screen.getByText("dashboard.payments").closest("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});

describe("admin Settings navigation", () => {
  it("shows the Settings entry to admins", () => {
    renderSidebar(Sidebar, "admin");
    expect(screen.getByText("settings.admin.nav")).toBeInTheDocument();
  });

  it("hides the Settings entry from sellers and regular users", () => {
    const { unmount } = renderSidebar(Sidebar, "seller");
    expect(screen.queryByText("settings.admin.nav")).not.toBeInTheDocument();
    unmount();

    renderSidebar(Sidebar, "user");
    expect(screen.queryByText("settings.admin.nav")).not.toBeInTheDocument();
  });
});

describe("seller navigation", () => {
  const sellerLinks = () =>
    within(screen.getByRole("navigation", { name: "dashboard.menu" })).getAllByRole(
      "link"
    );

  it("shows the seller workspace items in the design order", () => {
    renderSidebar(Sidebar, "seller");

    expect(sellerLinks().map((link) => link.textContent.trim())).toEqual([
      "seller.myDay",
      "nav.myLink",
      "seller.myClients",
      "seller.collections",
      "seller.tabCommissions",
      "seller.documents",
    ]);
    expect(sellerLinks().map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/vendedor/enlace",
      "/vendedor/clientes",
      "/vendedor/cobros",
      "/vendedor/comisiones",
      "/vendedor/documentos",
    ]);
  });

  it("does not show admin-only or legacy seller items", () => {
    renderSidebar(Sidebar, "seller");

    ["dashboard.projects", "dashboard.contracts", "docs.title", "settings.admin.nav", "dashboard.workspace"].forEach(
      (label) => expect(screen.queryByText(label)).not.toBeInTheDocument()
    );
  });

  it("marks only My day as active on the seller root", () => {
    renderSidebar(Sidebar, "seller", "/");

    expect(screen.getByText("seller.myDay").closest("li")).toHaveClass(
      "nav-active"
    );
    expect(screen.getByText("seller.myClients").closest("li")).not.toHaveClass(
      "nav-active"
    );
  });

  it("matches nested seller routes without activating two items", () => {
    renderSidebar(Sidebar, "seller", "/vendedor/cobros/123");

    expect(screen.getByText("seller.collections").closest("li")).toHaveClass(
      "nav-active"
    );
    expect(screen.getByText("seller.myDay").closest("li")).not.toHaveClass(
      "nav-active"
    );
    expect(screen.getByText("seller.documents").closest("li")).not.toHaveClass(
      "nav-active"
    );
  });
});

describe("keyboard shortcut hints", () => {
  it("advertises the chord and reveals it on hover", () => {
    renderSidebar(Sidebar, "admin");

    const link = screen.getByText("dashboard.payments").closest("a");
    expect(link).toHaveAttribute("aria-keyshortcuts", "g p");
    expect(link).toHaveAttribute("title", "shortcuts.sidebarHint");

    fireEvent.mouseEnter(link);
    expect(screen.getByText("g p").tagName).toBe("KBD");
  });

  it("does not show shortcut hints to regular users", () => {
    renderSidebar(Sidebar, "user");

    const link = screen.getByText("dashboard.financialDashboard").closest("a");
    expect(link).not.toHaveAttribute("aria-keyshortcuts");
    expect(link).not.toHaveAttribute("title");
  });
});

describe("shell chrome", () => {
  it("shows the brand, workspace chip and user footer", () => {
    renderSidebar(Sidebar, "admin");
    expect(screen.getByRole("link", { name: "Fintera" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByText("Fintera · header.administrator")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getAllByText("header.administrator").length).toBeGreaterThan(0);
  });

  it("keeps the collapse and logout actions wired", () => {
    const handleActive = vi.fn();
    const handleLogout = vi.fn();
    renderSidebar(Sidebar, "admin", "/", { handleActive, handleLogout });

    fireEvent.click(
      screen.getByRole("button", { name: "header.toggleSidebar" })
    );
    expect(handleActive).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "dashboard.logout" }));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("renders full-height navigation rows", () => {
    renderSidebar(Sidebar, "admin");
    expect(screen.getByText("dashboard.dashboard").closest("a")).toHaveClass(
      "h-10"
    );
  });
});
