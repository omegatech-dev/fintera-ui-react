import { cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

const renderShortcuts = (options = {}) => {
  const navigate = vi.fn();
  const onOpenHelp = vi.fn();
  const view = renderHook(() =>
    useKeyboardShortcuts({
      user: { role: "admin" },
      navigate,
      onOpenHelp,
      ...options,
    })
  );

  return { ...view, navigate, onOpenHelp };
};

const press = (key, options = {}) => fireEvent.keyDown(document, { key, ...options });

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("useKeyboardShortcuts", () => {
  it("navigates on a g chord", () => {
    const { navigate } = renderShortcuts();

    press("g");
    press("p");

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/payments");
  });

  it("navigates to the guide with g then g", () => {
    const { navigate } = renderShortcuts();

    press("g");
    press("g");

    expect(navigate).toHaveBeenCalledWith("/docs");
  });

  it("navigates to create flows with the n chord", () => {
    const { navigate } = renderShortcuts();

    press("n");
    press("p");
    expect(navigate).toHaveBeenCalledWith("/projects/create");

    press("n");
    press("u");
    expect(navigate).toHaveBeenCalledWith("/users/create");
  });

  it("does not expose create actions to sellers", () => {
    const { navigate } = renderShortcuts({ user: { role: "seller" } });

    press("n");
    press("p");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("supports the seller chord map", () => {
    const { navigate } = renderShortcuts({ user: { role: "seller" } });

    press("g");
    press("b");

    expect(navigate).toHaveBeenCalledWith("/vendedor/cobros");
  });

  it("ignores chords while typing in a field", () => {
    const { navigate } = renderShortcuts();
    const input = document.createElement("input");
    document.body.appendChild(input);

    fireEvent.keyDown(input, { key: "g" });
    fireEvent.keyDown(input, { key: "p" });

    expect(navigate).not.toHaveBeenCalled();
  });

  it("ignores chords with platform modifiers", () => {
    const { navigate } = renderShortcuts();

    press("g", { ctrlKey: true });
    press("p");
    press("g", { metaKey: true });
    press("p");
    press("g", { altKey: true });
    press("p");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("does not navigate when the second key does not match", () => {
    const { navigate } = renderShortcuts();

    press("g");
    press("x");
    press("p");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("expires the chord after the timeout", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const { navigate } = renderShortcuts();

    press("g");
    vi.advanceTimersByTime(1300);
    press("p");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("opens the help with the question mark", () => {
    const { onOpenHelp, navigate } = renderShortcuts();

    press("?");

    expect(onOpenHelp).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("stays inactive while a modal is open", () => {
    const { navigate } = renderShortcuts();
    const modal = document.createElement("div");
    modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal);

    press("g");
    press("p");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("can be disabled", () => {
    const { navigate } = renderShortcuts({ enabled: false });

    press("g");
    press("p");

    expect(navigate).not.toHaveBeenCalled();
  });

  it("exposes the role shortcuts for the help dialog", () => {
    const { result } = renderShortcuts();

    expect(result.current.shortcuts).toHaveLength(12);
    expect(result.current.chordTimeout).toBe(1200);
  });
});
