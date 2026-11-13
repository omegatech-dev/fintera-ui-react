import { describe, expect, it } from "vitest";

import { getWeekRange, paymentDueWithin } from "./weekRange";

describe("dashboard current-week collections", () => {
  const range = getWeekRange(new Date(2026, 10, 13)); // Friday 13 Nov 2026

  it("uses a Monday-to-Sunday range", () => {
    expect(range.start.getFullYear()).toBe(2026);
    expect(range.start.getMonth()).toBe(10);
    expect(range.start.getDate()).toBe(9);
    expect(range.end.getDate()).toBe(15);
  });

  it("keeps only payments due inside the current week", () => {
    expect(paymentDueWithin({ due_date: "2026-11-09" }, range)).toBe(true);
    expect(paymentDueWithin({ due_date: "2026-11-13T00:00:00Z" }, range)).toBe(
      true
    );
    expect(paymentDueWithin({ due_date: "2026-11-15" }, range)).toBe(true);
    expect(paymentDueWithin({ due_date: "2026-10-31" }, range)).toBe(false);
    expect(paymentDueWithin({ due_date: "2026-11-16" }, range)).toBe(false);
  });
});
