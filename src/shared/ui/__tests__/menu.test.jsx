import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import Menu from "../Menu";

expect.extend(matchers);
const originalMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMatchMedia;
  cleanup();
});

const renderMenu = (props = {}) =>
  render(
    <Menu
      label="Acciones"
      icon={<span aria-hidden="true">…</span>}
      items={[
        { label: "Aprobar", onSelect: vi.fn() },
        { label: "Rechazar", onSelect: vi.fn() },
        { separator: true },
        { label: "Eliminar", tone: "danger", onSelect: vi.fn() },
      ]}
      {...props}
    />
  );

describe("Menu", () => {
  it("renders the panel in a portal outside the trigger container", () => {
    renderMenu();

    const trigger = screen.getByRole("button", { name: "Acciones" });
    fireEvent.click(trigger);

    const menu = screen.getByRole("menu", { name: "Acciones" });
    expect(document.body).toContainElement(menu);
    expect(trigger.parentElement).not.toContainElement(menu);
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Eliminar" })).toHaveClass(
      "text-danger"
    );
  });

  it("focuses the first item and supports arrow, Home and End navigation", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    const menu = screen.getByRole("menu", { name: "Acciones" });
    const first = screen.getByRole("menuitem", { name: "Aprobar" });
    const second = screen.getByRole("menuitem", { name: "Rechazar" });
    const last = screen.getByRole("menuitem", { name: "Eliminar" });

    expect(first).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(second).toHaveFocus();
    fireEvent.keyDown(menu, { key: "End" });
    expect(last).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(last).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Home" });
    expect(first).toHaveFocus();
  });

  it("selects an item and closes the menu", () => {
    const onSelect = vi.fn();
    renderMenu({ items: [{ label: "Aprobar", onSelect }] });
    const trigger = screen.getByRole("button", { name: "Acciones" });
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole("menuitem", { name: "Aprobar" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Acciones" });
    fireEvent.click(trigger);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on outside pointer, scroll and resize", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Acciones" });

    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.scroll(window);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent(window, new Event("resize"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders the mobile sheet full width when the viewport is small", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(max-width: 639px)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    const menu = screen.getByRole("menu", { name: "Acciones" });
    expect(menu).toHaveClass("fixed", "inset-x-3", "bottom-3");
    expect(screen.getByRole("menuitem", { name: "Aprobar" })).toHaveClass(
      "min-h-10"
    );
  });
});
