import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, afterEach, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import AuthContext from "@/contexts/AuthContext";
import ForbiddenPage from "./ForbiddenPage";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ locale: "es", t: (key) => key }),
}));

vi.mock("@config", () => ({
  CUSTOMER_PORTAL_URL: "https://portal.test/",
}));

function renderForbidden({ role = "admin" } = {}) {
  return render(
    <AuthContext.Provider value={{ user: { id: 1, role }, token: "token", loading: false }}>
      <MemoryRouter initialEntries={["/forbidden"]}>
        <ForbiddenPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("ForbiddenPage", () => {
  it("renders a single h1, the 403 code and a way back", () => {
    renderForbidden();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("errors.forbiddenTitle");
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.getByText("errors.forbiddenDescription")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "common.goBack" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "errors.backToHome" })
    ).toHaveAttribute("href", "/");
  });

  it("points customers to the customer portal", () => {
    renderForbidden({ role: "user" });

    expect(
      screen.getByText("errors.forbiddenPortalPrompt")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "errors.forbiddenPortalLink" })
    ).toHaveAttribute("href", "https://portal.test/");
  });

  it("does not show the portal prompt to staff", () => {
    renderForbidden({ role: "seller" });

    expect(
      screen.queryByText("errors.forbiddenPortalPrompt")
    ).not.toBeInTheDocument();
  });
});
