import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { canReadArticle, normalizeRole, useDocs } from "./useDocs";

describe("useDocs", () => {
  it("hides admin-only articles from sellers", () => {
    const { result } = renderHook(() => useDocs("en", "seller"));
    const slugs = result.current.articles.map((article) => article.slug);

    expect(slugs).toContain("payment-schedule");
    expect(slugs).toContain("financing-types");
    expect(slugs).not.toContain("settings-and-branding");
    expect(slugs).not.toContain("approving-payments");
    expect(slugs).not.toContain("managing-projects");
  });

  it("serves the seller-specific overview to sellers and the shared one to admins", () => {
    const seller = renderHook(() => useDocs("en", "seller"));
    const admin = renderHook(() => useDocs("en", "admin"));

    const sellerOverview = seller.result.current.articles.find(
      (article) => article.slug === "overview-and-roles",
    );
    const adminOverview = admin.result.current.articles.find(
      (article) => article.slug === "overview-and-roles",
    );

    expect(sellerOverview.body).toContain("Create a reservation");
    expect(sellerOverview.body).not.toContain("## Admin menu");
    expect(adminOverview.body).toContain("## Admin menu");
    expect(adminOverview.body).toContain("## Seller workspace");
  });

  it("localizes the seller-specific overview", () => {
    const { result } = renderHook(() => useDocs("es", "seller"));
    const overview = result.current.articles.find(
      (article) => article.slug === "overview-and-roles",
    );

    expect(overview.body).toContain("Crear una reserva");
    expect(overview.body).not.toContain("## Menú del administrador");
  });

  it("shows every article to admins", () => {
    const { result } = renderHook(() => useDocs("en", "admin"));
    const slugs = result.current.articles.map((article) => article.slug);

    expect(slugs).toContain("settings-and-branding");
    expect(slugs).toContain("approving-contracts");
    expect(slugs).toContain("approving-payments");
  });

  it("drops sections that have no visible articles", () => {
    const { result } = renderHook(() => useDocs("en", "seller"));
    const administration = result.current.sections.find(
      (section) => section.id === "administration",
    );

    expect(result.current.sections.every((section) => section.articles.length > 0)).toBe(true);
    expect(administration.articles.map((article) => article.slug)).toEqual([
      "profile-and-security",
      "terms-and-conditions",
    ]);
  });

  it("shows the seller workspace articles to sellers", () => {
    const { result } = renderHook(() => useDocs("en", "seller"));
    const slugs = result.current.articles.map((article) => article.slug);

    expect(slugs).toEqual(
      expect.arrayContaining([
        "seller-my-day",
        "seller-clients",
        "seller-collections",
        "seller-documents",
      ]),
    );
    expect(slugs).not.toContain("reports-and-analytics");
    expect(slugs).not.toContain("audits");
  });

  it("loads localized titles and bodies", () => {
    const { result } = renderHook(() => useDocs("es", "admin"));
    const article = result.current.articles.find((entry) => entry.slug === "overdue-interest");

    expect(article.title).toBe("Interés por mora");
    expect(article.body).toContain("La fórmula");
  });

  it("includes the keyboard shortcuts article for staff roles", () => {
    const admin = renderHook(() => useDocs("en", "admin"));
    const seller = renderHook(() => useDocs("es", "seller"));

    expect(admin.result.current.articles.map((article) => article.slug)).toContain(
      "keyboard-shortcuts",
    );
    expect(seller.result.current.articles.map((article) => article.slug)).toContain(
      "keyboard-shortcuts",
    );
  });

  it("normalizes unknown roles to user", () => {
    expect(normalizeRole("admin")).toBe("admin");
    expect(normalizeRole("seller")).toBe("seller");
    expect(normalizeRole("user")).toBe("user");
    expect(normalizeRole(undefined)).toBe("user");
  });

  it("checks article audience", () => {
    expect(canReadArticle({ audience: ["admin"] }, "seller")).toBe(false);
    expect(canReadArticle({ audience: ["admin", "seller"] }, "seller")).toBe(true);
    expect(canReadArticle({ audience: ["admin"] }, "admin")).toBe(true);
  });
});
