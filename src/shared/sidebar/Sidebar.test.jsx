import { render, screen, cleanup } from "@testing-library/react";
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

const renderSidebar = (Component, role, path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Component
        user={{ id: 7, role, full_name: "Test User" }}
        handleLogout={() => {}}
        handleActive={() => {}}
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
