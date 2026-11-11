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
    expect(administration.articles.map((article) => article.slug)).toEqual(["users-management"]);
  });

  it("loads localized titles and bodies", () => {
    const { result } = renderHook(() => useDocs("es", "admin"));
    const article = result.current.articles.find((entry) => entry.slug === "overdue-interest");

    expect(article.title).toBe("Interés por mora");
    expect(article.body).toContain("La fórmula");
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
