import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../../locales/en.json";
import SellerScoreSummary from "../SellerScoreSummary";

expect.extend(matchers);
afterEach(cleanup);

const getValue = (object, path) =>
  path.split(".").reduce((current, key) => current?.[key], object);

const t = (key, params = {}) => {
  const value = getValue(en, key) ?? key;
  return Object.entries(params).reduce(
    (text, [name, replacement]) =>
      text.replaceAll(`{${name}}`, String(replacement)),
    value
  );
};

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

const renderSummary = (user) =>
  render(
    <MemoryRouter>
      <SellerScoreSummary user={user} />
    </MemoryRouter>
  );

describe("SellerScoreSummary", () => {
  it("shows the ratio, window and override author", () => {
    renderSummary({
      id: 7,
      role: "seller",
      score: 92,
      score_metrics: { accepted_count: 12, expired_count: 1, window_days: 90 },
      score_override_by: "Sergio Peralta",
      score_override_at: "2026-11-12T10:00:00Z",
    });

    expect(screen.getByText("Acceptance score")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(
      screen.getByText("12 of 13 assignments accepted · last 90 days")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Adjusted by Sergio Peralta/)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/users/7/edit"
    );
  });

  it("shows a new seller without history as green 100", () => {
    renderSummary({ id: 8, role: "seller", score: null });

    expect(screen.getByText("New")).toBeInTheDocument();
    expect(
      screen.getByText("No assignments in the last 90 days")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Calculated automatically")
    ).toBeInTheDocument();
  });
});
