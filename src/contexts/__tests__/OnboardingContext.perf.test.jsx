import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderHook } from "@testing-library/react";
import { OnboardingProvider, useOnboarding } from "../OnboardingContext";
import { LocaleProvider } from "../LocaleContext";

describe("OnboardingContext Performance", () => {
    it("should access local storage efficiently when checking tour completion multiple times", () => {
        const getItemSpy = vi.spyOn(localStorage, "getItem");

        const wrapper = ({ children }) => (
            <LocaleProvider>
                <OnboardingProvider>{children}</OnboardingProvider>
            </LocaleProvider>
        );

        const { result } = renderHook(() => useOnboarding(), { wrapper });

        getItemSpy.mockClear();

        // Call isTourCompleted multiple times
        for (let i = 0; i < 100; i++) {
            result.current.isTourCompleted("home");
        }

        // It should only read from localStorage once during initialization, or not at all on subsequent calls
        expect(getItemSpy).toHaveBeenCalledTimes(0); // Assuming it caches after init
    });
});
