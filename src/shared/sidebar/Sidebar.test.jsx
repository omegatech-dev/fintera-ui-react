import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import Sidebar from "./Sidebar";
import SidebarV2 from "./SidebarV2";

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

describe("admin Settings navigation", () => {
  it("shows the Settings entry to admins in both sidebar variants", () => {
    const { unmount } = renderSidebar(Sidebar, "admin");
    expect(screen.getByText("settings.admin.nav")).toBeInTheDocument();
    unmount();

    renderSidebar(SidebarV2, "admin");
    expect(screen.getByTitle("settings.admin.nav")).toBeInTheDocument();
  });

  it("hides the Settings entry from sellers and regular users", () => {
    const { unmount } = renderSidebar(Sidebar, "seller");
    expect(screen.queryByText("settings.admin.nav")).not.toBeInTheDocument();
    unmount();

    renderSidebar(SidebarV2, "user");
    expect(screen.queryByTitle("settings.admin.nav")).not.toBeInTheDocument();
  });
});
