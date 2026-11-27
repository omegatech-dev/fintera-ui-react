import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "@/locales/en.json";
import CommissionCreditsCard from "./CommissionCreditsCard";

expect.extend(matchers);

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

afterEach(cleanup);

describe("CommissionCreditsCard", () => {
  it("shows global balance and application destinations without settlement actions", () => {
    render(
      <MemoryRouter>
        <CommissionCreditsCard
          sellerBalance={4000}
          credits={[
            {
              id: 4,
              seller: "Ana",
              contract_id: 10,
              amount: 7000,
              applied_amount: 3000,
              remaining_amount: 4000,
              source: "reassignment",
              status: "pending",
              applications_total: 1,
              applications: [
                {
                  id: 12,
                  applied_contract_id: 19,
                  applied_contract_guid: "contract-19",
                  amount: 3000,
                },
              ],
            },
          ]}
          showSeller
        />
      </MemoryRouter>
    );

    expect(screen.getAllByText("L 4,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("L 7,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("L 3,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Reassignment").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "#19" })[0]
    ).toHaveAttribute("href", "/contracts/contract-19");
    expect(
      screen.queryByRole("button", { name: "Apply credit" })
    ).not.toBeInTheDocument();
  });

  it("shows an explicit zero balance without a net-payable calculation", () => {
    render(
      <MemoryRouter>
        <CommissionCreditsCard
          sellerBalance={0}
          credits={[]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Seller credit balance")).toBeInTheDocument();
    expect(screen.getByText("L 0")).toBeInTheDocument();
    expect(screen.queryByText("Net payable")).not.toBeInTheDocument();
  });
});
