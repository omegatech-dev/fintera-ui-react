import { describe, expect, it } from "vitest";
import {
  normalizeCredit,
  readCommissionCredits,
  summarizeCredits,
} from "./credits";

describe("commission credit normalization", () => {
  it("normalizes partial applications and their destination contracts", () => {
    const [credit] = readCommissionCredits({
      credits: [
        {
          id: 5,
          amount: 10000,
          applied_amount: 6000,
          remaining_amount: 4000,
          source: "cancellation",
          applications_total: 1,
          applications: [
            {
              id: 8,
              applied_contract_id: 14,
              applied_contract_guid: "destination-guid",
              amount: "6000.00",
            },
          ],
        },
      ],
    });

    expect(credit).toMatchObject({
      amount: 10000,
      applied_amount: 6000,
      remaining_amount: 4000,
      source: "cancellation",
      applications_total: 1,
      applications: [
        {
          applied_contract_id: 14,
          applied_contract_guid: "destination-guid",
          amount: 6000,
        },
      ],
    });
  });

  it("uses remaining balances when summarizing pending credits", () => {
    const summary = summarizeCredits([
      normalizeCredit({
        id: 1,
        amount: 10000,
        applied_amount: 6000,
        remaining_amount: 4000,
        status: "pending",
      }),
      normalizeCredit({
        id: 2,
        amount: 3000,
        applied_amount: 3000,
        remaining_amount: 0,
        status: "settled",
      }),
    ]);

    expect(summary).toEqual({
      total: 13000,
      pending: 4000,
      settled: 3000,
      count: 2,
    });
  });
});
