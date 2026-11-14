import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  normalizeAssignmentList,
  normalizeAssignmentStatus,
  normalizeSellerList,
  secondsUntil,
} from "./assignment";

describe("assignment countdown", () => {
  it("formats the remaining time as HH:MM:SS", () => {
    expect(formatCountdown(7152)).toBe("01:59:12");
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(null)).toBe("--:--:--");
  });

  it("never returns a negative countdown", () => {
    expect(secondsUntil("2026-11-13T10:00:00Z", Date.parse("2026-11-13T11:00:00Z"))).toBe(0);
  });
});

describe("assignment normalization", () => {
  it("treats rejected offers as expired", () => {
    expect(normalizeAssignmentStatus("rejected")).toBe("expired");
    expect(normalizeAssignmentStatus("accepted")).toBe("accepted");
    expect(normalizeAssignmentStatus(undefined)).toBe("pending");
  });

  it("accepts wrapped and plain list payloads", () => {
    expect(normalizeSellerList([{ id: 1 }, { id: 2 }])).toHaveLength(2);
    expect(normalizeSellerList({ sellers: [{ id: 3 }] })).toHaveLength(1);
    expect(normalizeAssignmentList({ assignments: [{ id: 9 }] })).toHaveLength(1);
    expect(normalizeAssignmentList(null)).toEqual([]);
  });
});
