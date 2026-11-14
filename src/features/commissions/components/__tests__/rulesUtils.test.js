import { describe, expect, it } from "vitest";
import {
  buildExceptionChanges,
  buildRulesPayload,
  buildSellerRows,
  normalizeExceptions,
  normalizeRules,
} from "../rulesUtils";

describe("normalizeRules", () => {
  it("reads the global rules defensively", () => {
    expect(
      normalizeRules({
        rules: {
          default_rate: 5,
          payment_rule: "contract_approval",
          acceptance_window_hours: 2,
          unassigned_rate: 3,
        },
      })
    ).toEqual({
      defaultRate: "5",
      paymentRule: "contract_approval",
      acceptanceWindow: "2",
      unassignedRate: "3",
    });
  });

  it("falls back to the design defaults", () => {
    expect(normalizeRules({})).toMatchObject({
      defaultRate: "5.0",
      acceptanceWindow: "2",
      unassignedRate: "3.0",
    });
  });
});

describe("normalizeExceptions", () => {
  it("accepts an exceptions array and seller objects", () => {
    expect(
      normalizeExceptions([
        { id: 1, seller: { id: 11, full_name: "Cristofer" }, rate: 6 },
      ])
    ).toEqual([
      { id: 1, sellerId: 11, sellerName: "Cristofer", rate: 6 },
    ]);
  });
});

describe("buildSellerRows", () => {
  it("merges the seller list with exceptions and prop names", () => {
    const rows = buildSellerRows({
      sellers: [
        { sellerId: 11, sellerName: "Cristofer" },
        { sellerId: 12, sellerName: "Juan" },
      ],
      exceptions: [{ id: 7, sellerId: 11, sellerName: "", rate: 6 }],
      propSellers: ["Cristofer", "Ana"],
      defaultRate: "5",
    });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      sellerId: 11,
      sellerName: "Cristofer",
      exceptionId: 7,
      rate: "6",
    });
    expect(rows[1]).toMatchObject({ sellerId: 12, rate: "5" });
    expect(rows[2]).toMatchObject({ sellerName: "Ana", rate: "5" });
  });
});

describe("buildExceptionChanges", () => {
  const rows = [
    { sellerId: 11, exceptionId: 7, rate: "6" },
    { sellerId: 12, exceptionId: null, rate: "5" },
    { sellerId: 13, exceptionId: 8, rate: "5" },
    { sellerId: null, rate: "9" },
  ];

  it("upserts non-default rates and removes empty exceptions", () => {
    expect(buildExceptionChanges(rows, "5")).toEqual({
      upserts: [{ seller_id: 11, rate: 6 }],
      deletes: [8],
    });
  });
});

describe("buildRulesPayload", () => {
  it("sends the acceptance window and the unassigned rate", () => {
    expect(
      buildRulesPayload({
        defaultRate: "5.5",
        paymentRule: "contract_approval",
        acceptanceWindow: "4",
        unassignedRate: "3.5",
      })
    ).toEqual({
      default_rate: 5.5,
      payment_rule: "contract_approval",
      acceptance_window_hours: 4,
      unassigned_rate: 3.5,
    });
  });
});
