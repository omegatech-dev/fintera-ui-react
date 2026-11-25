import { describe, expect, it, vi } from "vitest";
import { createNoopRollbar } from "./noopRollbar";

describe("createNoopRollbar", () => {
  it("exposes every method the app and the SDK bindings call", () => {
    const stub = createNoopRollbar();
    for (const method of [
      "critical",
      "error",
      "warning",
      "info",
      "debug",
      "log",
    ]) {
      expect(typeof stub[method]).toBe("function");
      expect(stub[method]()).toBeUndefined();
    }
  });

  it("never reaches the network or throws", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const stub = createNoopRollbar();
    expect(() => stub.error(new Error("boom"))).not.toThrow();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("returns a fresh instance per call", () => {
    expect(createNoopRollbar()).not.toBe(createNoopRollbar());
  });
});
