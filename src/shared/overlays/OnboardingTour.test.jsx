import { act, cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AuthContext from "@/contexts/AuthContext";
import OnboardingTour from "./OnboardingTour";

const startTour = vi.fn();

vi.mock("../../contexts/OnboardingContext", () => ({
  useOnboarding: () => ({
    startTour,
    isTourCompleted: () => false,
  }),
}));

function renderTour(pathname) {
  return render(
    <AuthContext.Provider value={{ user: { id: 1, role: "admin" }, token: "token" }}>
      <MemoryRouter initialEntries={[pathname]}>
        <OnboardingTour />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  startTour.mockClear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("OnboardingTour", () => {
  it("does not auto-start a tour on contracts, where the targets were removed", () => {
    renderTour("/contracts");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(startTour).not.toHaveBeenCalled();
  });

  it("auto-starts the tour for a page with a valid tour", () => {
    renderTour("/projects");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(startTour).toHaveBeenCalledWith("projects");
  });

  it("ignores the restart event on a page without a tour", () => {
    renderTour("/contracts");

    act(() => {
      window.dispatchEvent(new CustomEvent("start-onboarding-tour"));
      vi.advanceTimersByTime(500);
    });

    expect(startTour).not.toHaveBeenCalled();
  });
});
