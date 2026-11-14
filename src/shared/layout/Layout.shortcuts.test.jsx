import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import Layout from "./Layout";
import AuthContext from "../../contexts/AuthContext";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../sidebar", () => ({
  Sidebar: () => <aside>Sidebar</aside>,
}));

vi.mock("../overlays", () => ({
  Overlay: () => null,
  OnboardingTour: () => null,
}));

vi.mock("../header", () => ({
  HeaderOne: () => <header>HeaderOne</header>,
}));

vi.mock("./BottomNav", () => ({
  default: () => null,
}));

vi.mock("../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

function LocationProbe() {
  const { pathname } = useLocation();
  return <span data-testid="pathname">{pathname}</span>;
}

const adminUser = { id: 1, role: "admin", full_name: "Admin" };
const sellerUser = { id: 2, role: "seller", full_name: "Seller" };

const renderLayout = (user = adminUser) =>
  render(
    <AuthContext.Provider value={{ user, logout: vi.fn() }}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<LocationProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: 1440,
  });
});

describe("Layout keyboard shortcuts", () => {
  it("navigates from the shell with an admin chord", () => {
    renderLayout();

    fireEvent.keyDown(document, { key: "g" });
    fireEvent.keyDown(document, { key: "p" });

    expect(screen.getByTestId("pathname")).toHaveTextContent("/payments");
  });

  it("navigates from the shell with a seller action chord", () => {
    renderLayout(sellerUser);

    fireEvent.keyDown(document, { key: "n" });
    fireEvent.keyDown(document, { key: "c" });

    expect(screen.getByTestId("pathname")).toHaveTextContent(
      "/vendedor/clientes/historicos"
    );
  });

  it("opens and closes the shortcut help with ? and Escape", () => {
    renderLayout();

    fireEvent.keyDown(document, { key: "?" });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "shortcuts.title" })
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
