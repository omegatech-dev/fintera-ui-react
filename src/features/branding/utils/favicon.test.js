import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { brandInitial } from "./brandInitial";
import { setMonogramFavicon, restoreBundledFavicon } from "./favicon";

describe("brandInitial", () => {
  it("returns the uppercase first letter", () => {
    expect(brandInitial("acme")).toBe("A");
  });

  it("does not split surrogate pairs", () => {
    expect(brandInitial("🅰lpha")).toBe("🅰");
  });

  it("falls back to F for empty names", () => {
    expect(brandInitial("   ")).toBe("F");
    expect(brandInitial(null)).toBe("F");
  });
});

describe("favicon", () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const contextStub = {
    beginPath: vi.fn(),
    roundRect: vi.fn(),
    fillRect: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = "";
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
    document.head.innerHTML = "";
  });

  const insertBundledIcons = () => {
    for (const href of ["/favicon.ico", "/pwa-64x64.png"]) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = href;
      document.head.appendChild(link);
    }
  };

  it("swaps the bundled icons for a monogram data URL", () => {
    insertBundledIcons();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => contextStub);
    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => "data:image/png;base64,abc"
    );

    expect(setMonogramFavicon("G")).toBe(true);

    const icons = document.querySelectorAll('link[rel="icon"]');
    expect(icons).toHaveLength(1);
    expect(icons[0].dataset.monogram).toBe("true");
    expect(icons[0].href).toBe("data:image/png;base64,abc");
    expect(icons[0].type).toBe("image/png");
  });

  it("leaves the head untouched when a canvas is unavailable", () => {
    insertBundledIcons();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

    expect(setMonogramFavicon("G")).toBe(false);

    const icons = document.querySelectorAll('link[rel="icon"]');
    expect(icons).toHaveLength(2);
    expect(icons[0].getAttribute("href")).toBe("/favicon.ico");
  });

  it("leaves the head untouched when the data URL is empty", () => {
    insertBundledIcons();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => contextStub);
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:,");

    expect(setMonogramFavicon("G")).toBe(false);
    expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(2);
  });

  it("restores the bundled icons and drops the monogram", () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => contextStub);
    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => "data:image/png;base64,abc"
    );
    setMonogramFavicon("G");
    expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(1);

    restoreBundledFavicon();

    const icons = [...document.querySelectorAll('link[rel="icon"]')];
    expect(icons).toHaveLength(2);
    expect(icons.map((l) => l.getAttribute("href"))).toEqual([
      "/favicon.ico",
      "/pwa-64x64.png",
    ]);
  });

  it("does not duplicate the bundled icons when restoring twice", () => {
    insertBundledIcons();
    restoreBundledFavicon();
    expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(2);
  });
});
