import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingProvider, useOnboarding } from "../OnboardingContext";

const driverMock = vi.fn();
const drive = vi.fn();

vi.mock("driver.js", () => ({
  driver: (...args) => {
    driverMock(...args);
    return { drive };
  },
}));

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ locale: "es", t: (key) => key }),
}));

function wrapper({ children }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

function addTarget(id) {
  const element = document.createElement("div");
  element.id = id;
  document.body.appendChild(element);
}

beforeEach(() => {
  driverMock.mockClear();
  drive.mockClear();
  document.body.innerHTML = "";
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Onboarding tour steps", () => {
  it("does not drive the contracts tour now that its selectors are gone", () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });

    result.current.startTour("contracts");

    expect(driverMock).not.toHaveBeenCalled();
  });

  it("skips a tour when fewer than two targets exist", () => {
    addTarget("projects-filter-section");
    const { result } = renderHook(() => useOnboarding(), { wrapper });

    result.current.startTour("projects");

    expect(driverMock).not.toHaveBeenCalled();
  });

  it("drives a tour with only the steps that exist on the page", () => {
    addTarget("projects-filter-section");
    addTarget("add-project-btn");
    const { result } = renderHook(() => useOnboarding(), { wrapper });

    result.current.startTour("projects");

    expect(driverMock).toHaveBeenCalledTimes(1);
    const config = driverMock.mock.calls[0][0];
    expect(config.steps).toHaveLength(2);
    expect(config.steps[0].element).toBe("#projects-filter-section");
    expect(config.steps[1].element).toBe("#add-project-btn");
    expect(drive).toHaveBeenCalled();
  });
});
