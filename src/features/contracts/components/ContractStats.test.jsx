import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

import ContractStats from "./ContractStats";

expect.extend(matchers);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "es" }),
}));

describe("ContractStats", () => {
  it("renders active, outstanding, overdue and cancelled metrics", () => {
    render(
      <ContractStats
        stats={{
          total: 15,
          approved: 11,
          pending: 0,
          rejected: 0,
          cancelled: 4,
          active: 11,
          pending_balance: 2100000,
          overdue: 1980000,
          overdue_count: 12,
        }}
      />
    );

    expect(screen.getByText("contracts.activeContracts")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("L 2,100,000")).toBeInTheDocument();
    expect(screen.getByText("L 1,980,000")).toBeInTheDocument();
    expect(screen.getByText("contracts.status.cancelled")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(
      screen.getByText("payments.kpiOverdue")
    ).toBeInTheDocument();
  });
});
