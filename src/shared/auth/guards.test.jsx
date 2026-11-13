import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, afterEach, vi } from "vitest";
import AuthContext from "@/contexts/AuthContext";
import AdminRoute from "./AdminRoute";
import AdminOrOwnerRoute from "./AdminOrOwnerRoute";

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ locale: "es", t: (key) => key }),
}));

const FORBIDDEN_TEXT = "errors.forbiddenTitle";

afterEach(() => {
  cleanup();
});

function renderGuard({ guard, user, token = "token", route = "/" }) {
  const Guard = guard;
  return render(
    <AuthContext.Provider value={{ user, token, loading: false }}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route
            path="/"
            element={
              <Guard>
                <div>protected content</div>
              </Guard>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <Guard>
                <div>protected content</div>
              </Guard>
            }
          />
          <Route path="/signin" element={<div>sign in page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("AdminRoute", () => {
  it("renders children for admins", () => {
    renderGuard({ guard: AdminRoute, user: { id: 1, role: "admin" } });
    expect(screen.getByText("protected content")).toBeTruthy();
  });

  it("renders the 403 screen for sellers instead of redirecting", () => {
    renderGuard({ guard: AdminRoute, user: { id: 2, role: "seller" } });
    expect(screen.getByText(FORBIDDEN_TEXT)).toBeTruthy();
    expect(screen.queryByText("protected content")).toBeNull();
  });

  it("renders the 403 screen for customers", () => {
    renderGuard({ guard: AdminRoute, user: { id: 3, role: "user" } });
    expect(screen.getByText(FORBIDDEN_TEXT)).toBeTruthy();
  });

  it("still redirects unauthenticated visitors to sign in", () => {
    renderGuard({ guard: AdminRoute, user: null, token: null });
    expect(screen.getByText("sign in page")).toBeTruthy();
  });
});

describe("AdminOrOwnerRoute", () => {
  it("renders children for admins and sellers", () => {
    const { unmount } = renderGuard({
      guard: AdminOrOwnerRoute,
      user: { id: 1, role: "admin" },
    });
    expect(screen.getByText("protected content")).toBeTruthy();
    unmount();

    renderGuard({
      guard: AdminOrOwnerRoute,
      user: { id: 2, role: "seller" },
    });
    expect(screen.getByText("protected content")).toBeTruthy();
  });

  it("lets customers view their own resources", () => {
    renderGuard({
      guard: AdminOrOwnerRoute,
      user: { id: 7, role: "user" },
      route: "/users/7",
    });
    expect(screen.getByText("protected content")).toBeTruthy();
  });

  it("renders the 403 screen for another customer's resources", () => {
    renderGuard({
      guard: AdminOrOwnerRoute,
      user: { id: 7, role: "user" },
      route: "/users/9",
    });
    expect(screen.getByText(FORBIDDEN_TEXT)).toBeTruthy();
  });

  it("renders the 403 screen for customers on shared back-office routes", () => {
    renderGuard({
      guard: AdminOrOwnerRoute,
      user: { id: 7, role: "user" },
      route: "/",
    });
    expect(screen.getByText(FORBIDDEN_TEXT)).toBeTruthy();
  });

  it("still redirects unauthenticated visitors to sign in", () => {
    renderGuard({ guard: AdminOrOwnerRoute, user: null, token: null });
    expect(screen.getByText("sign in page")).toBeTruthy();
  });
});
