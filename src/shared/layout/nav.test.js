import { describe, expect, it } from "vitest";
import { getActionShortcuts, getNavShortcuts, getNavItems } from "./nav";

const toMap = (shortcuts) =>
  Object.fromEntries(shortcuts.map((entry) => [entry.keys[1], entry.to]));

describe("navigation shortcut metadata", () => {
  it("maps every admin entry to a unique chord", () => {
    const shortcuts = getNavShortcuts({ role: "admin" });

    expect(toMap(shortcuts)).toEqual({
      d: "/",
      p: "/payments",
      m: "/commissions",
      c: "/contracts",
      r: "/projects",
      u: "/users",
      a: "/analytics",
      l: "/audits",
      g: "/docs",
      s: "/settings",
    });
    expect(new Set(shortcuts.map((entry) => entry.keys[1])).size).toBe(
      shortcuts.length
    );
    expect(shortcuts.every((entry) => entry.keys[0] === "g")).toBe(true);
  });

  it("maps the seller workspace chords", () => {
    const shortcuts = getNavShortcuts({ role: "seller" });

    expect(toMap(shortcuts)).toEqual({
      d: "/",
      c: "/vendedor/clientes",
      b: "/vendedor/cobros",
      m: "/vendedor/comisiones",
      o: "/vendedor/documentos",
    });
  });

  it("does not expose shortcuts to regular users", () => {
    expect(getNavShortcuts({ role: "user", id: 9 })).toEqual([]);
    expect(getNavShortcuts(null)).toEqual([]);
  });

  it("resolves routes from the same navigation source per role", () => {
    const adminItems = getNavItems({ role: "admin" });
    const sellerItems = getNavItems({ role: "seller" });

    adminItems.forEach((item) => {
      if (!item.shortcut) return;
      const shortcut = getNavShortcuts({ role: "admin" }).find(
        (entry) => entry.keys[1] === item.shortcut
      );
      expect(shortcut.to).toBe(item.resolvedTo);
      expect(shortcut.labelKey).toBe(item.labelKey);
    });

    sellerItems.forEach((item) => {
      if (!item.shortcut) return;
      const shortcut = getNavShortcuts({ role: "seller" }).find(
        (entry) => entry.keys[1] === item.shortcut
      );
      expect(shortcut.to).toBe(item.resolvedTo);
      expect(shortcut.labelKey).toBe(item.labelKey);
    });
  });
});

describe("action shortcut metadata", () => {
  it("exposes create project and add user to admins", () => {
    const shortcuts = getActionShortcuts({ role: "admin" });

    expect(shortcuts).toEqual([
      expect.objectContaining({ keys: ["n", "p"], to: "/projects/create" }),
      expect.objectContaining({ keys: ["n", "u"], to: "/users/create" }),
    ]);
  });

  it("does not expose create actions to sellers or regular users", () => {
    expect(getActionShortcuts({ role: "seller" })).toEqual([]);
    expect(getActionShortcuts({ role: "user" })).toEqual([]);
  });
});
