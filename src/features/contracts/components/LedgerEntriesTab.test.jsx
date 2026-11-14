import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import LedgerEntriesTab from "./LedgerEntriesTab";

expect.extend(matchers);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

afterEach(() => {
  cleanup();
});

describe("LedgerEntriesTab cancellation entries", () => {
  it("renders refund and write-off rows with the API description", () => {
    render(
      <LedgerEntriesTab
        ledgerLoading={false}
        ledgerEntries={[
          {
            id: 1,
            entry_type: "refund",
            entry_date: "2026-11-01",
            amount: 2500,
            description: null,
          },
          {
            id: 2,
            entry_type: "adjustment",
            entry_date: "2026-11-01",
            amount: -300,
            description: "Ajuste manual por cancelación",
          },
          {
            id: 3,
            entry_type: "adjustment",
            entry_date: "2026-11-02",
            amount: -100,
          },
        ]}
      />
    );

    expect(screen.getAllByText("contracts.ledgerRefund")).toHaveLength(2);
    expect(screen.getAllByText("contracts.ledgerAdjustment")).toHaveLength(2);
    expect(
      screen.getAllByText("Ajuste manual por cancelación")
    ).toHaveLength(2);
    expect(
      screen.getAllByText("payments.statusOptions.refund")
    ).toHaveLength(1);
  });
});
