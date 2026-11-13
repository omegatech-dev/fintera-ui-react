import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, afterEach, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import NotFound from "../NotFound";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ locale: "es", t: (key) => key }),
}));

function renderNotFound(initialEntry = "/missing") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NotFound", () => {
  it("renders a single h1 with the not-found title and description", () => {
    renderNotFound();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("errors.notFoundTitle");
    expect(screen.getByText("errors.notFoundDescription")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("offers a back action and a link home", () => {
    renderNotFound();

    expect(
      screen.getByRole("button", { name: "common.goBack" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "errors.backToHome" })
    ).toHaveAttribute("href", "/");
  });
});
