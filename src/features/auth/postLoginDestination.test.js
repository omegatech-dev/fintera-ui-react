import { describe, it, expect } from "vitest";
import {
  CUSTOMER_PORTAL_FALLBACK,
  resolvePostLoginDestination,
} from "./postLoginDestination";

describe("resolvePostLoginDestination", () => {
  it("sends admins to the dashboard", () => {
    expect(resolvePostLoginDestination({ id: 1, role: "admin" })).toEqual({
      type: "internal",
      path: "/",
    });
  });

  it("sends sellers to the dashboard", () => {
    expect(resolvePostLoginDestination({ id: 2, role: "seller" })).toEqual({
      type: "internal",
      path: "/",
    });
  });

  it("keeps the forced password change for back-office roles", () => {
    expect(
      resolvePostLoginDestination({
        id: 3,
        role: "admin",
        must_change_password: true,
      })
    ).toEqual({
      type: "internal",
      path: "/settings/user/3/security",
    });
  });

  it("sends customers to the configured portal", () => {
    expect(
      resolvePostLoginDestination(
        { id: 4, role: "user" },
        "https://portal.example.com"
      )
    ).toEqual({ type: "external", path: "https://portal.example.com" });
  });

  it("trims the configured portal URL", () => {
    expect(
      resolvePostLoginDestination(
        { id: 4, role: "user" },
        "  https://portal.example.com  "
      )
    ).toEqual({ type: "external", path: "https://portal.example.com" });
  });

  it("falls back to the local 403 when the portal is not configured", () => {
    expect(resolvePostLoginDestination({ id: 4, role: "user" }, "")).toEqual({
      type: "internal",
      path: CUSTOMER_PORTAL_FALLBACK,
    });
    expect(resolvePostLoginDestination({ id: 4, role: "user" }, undefined)).toEqual({
      type: "internal",
      path: CUSTOMER_PORTAL_FALLBACK,
    });
  });

  it("treats unknown roles as customers", () => {
    expect(
      resolvePostLoginDestination({ id: 5, role: "unknown" }, "")
    ).toEqual({ type: "internal", path: CUSTOMER_PORTAL_FALLBACK });
  });
});
