import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import Layout from "./Layout";
import AuthContext from "../../contexts/AuthContext";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../sidebar", () => ({
  Sidebar: ({ handleActive }) => (
    <button type="button" onClick={handleActive}>
      toggle-sidebar
    </button>
  ),
}));

vi.mock("../overlays", () => ({
  Overlay: () => <div data-testid="overlay" />,
  OnboardingTour: () => null,
}));

vi.mock("../header", () => ({
  HeaderOne: () => <header>HeaderOne</header>,
  HeaderTwo: () => <header>HeaderTwo</header>,
}));

vi.mock("./BottomNav", () => ({
  default: () => <nav>BottomNav</nav>,
}));

const user = { id: 1, role: "admin", full_name: "Admin" };

const renderLayout = () =>
  render(
    <AuthContext.Provider value={{ user, logout: vi.fn() }}>
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    </AuthContext.Provider>
  );

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: 1440,
  });
});

describe("Layout shell", () => {
  it("opens the desktop sidebar by default and toggles it", () => {
    const { container } = renderLayout();
    const wrapper = container.querySelector(".layout-wrapper");

    expect(wrapper).toHaveClass("active");

    fireEvent.click(screen.getByText("toggle-sidebar"));
    expect(wrapper).not.toHaveClass("active");
  });

  it("paints the shell with canvas and surface tokens", () => {
    const { container } = renderLayout();
    expect(container.querySelector(".layout-wrapper")).toHaveClass("bg-canvas");
    expect(container.querySelector(".body-wrapper")).toHaveClass(
      "bg-canvas",
      "min-h-screen"
    );
  });
});
