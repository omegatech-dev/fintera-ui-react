// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter } from "react-router-dom";
import AuthContext from "@/contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

expect.extend(matchers);

vi.mock("@/contexts/AuthContext", async () => {
  const React = await import("react");
  return { default: React.createContext(null) };
});

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({
    t: (key) =>
      ({
        "customerPortal.title": "Tu cuenta de cliente está en el portal",
        "customerPortal.description": "Gestiona tus reservas en el portal.",
        "customerPortal.action": "Ir al portal",
      }[key] || key),
  }),
}));

function renderRoute(user) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ token: "token", user, loading: false }}>
        <ProtectedRoute>
          <div>admin content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
});

describe("ProtectedRoute customer access", () => {
  it("shows the customer portal notice for user-role accounts", () => {
    renderRoute({ id: 2, role: "user" });

    expect(
      screen.getByText("Tu cuenta de cliente está en el portal")
    ).toBeInTheDocument();
    expect(screen.queryByText("admin content")).not.toBeInTheDocument();
  });

  it("keeps seller access to the admin app", () => {
    renderRoute({ id: 3, role: "seller" });
    expect(screen.getByText("admin content")).toBeInTheDocument();
  });
});
