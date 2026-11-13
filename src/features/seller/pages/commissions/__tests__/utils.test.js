import { describe, expect, it } from "vitest";
import en from "../../../../../locales/en.json";
import { buildCommissionKpis, summarizeCommissions } from "../utils";

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

const directRows = [
  { commission: 25000, amount: 500000, commission_paid_at: null, origin: "referral" },
  { commission: 20000, amount: 400000, commission_paid_at: "2026-11-05", origin: "direct" },
];

const historicalRow = {
  commission: 17000,
  amount: 340000,
  commission_paid_at: null,
  origin: "historical",
  date: "2026-09-15",
};

describe("summarizeCommissions", () => {
  it("totals the commissions without historical rows", () => {
    const totals = summarizeCommissions(directRows);

    expect(totals.total).toBe(45000);
    expect(totals.pending).toBe(25000);
    expect(totals.paid).toBe(20000);
    expect(totals.historical).toBe(0);
    expect(totals.count).toBe(2);
  });

  it("includes historical commissions and keeps them identifiable", () => {
    const totals = summarizeCommissions([...directRows, historicalRow]);

    expect(totals.total).toBe(62000);
    expect(totals.pending).toBe(42000);
    expect(totals.count).toBe(3);
    expect(totals.historical).toBe(17000);
    expect(totals.historicalCount).toBe(1);
  });
});

describe("buildCommissionKpis", () => {
  it("adds the acceptance score KPI with the accepted ratio", () => {
    const kpis = buildCommissionKpis({
      t,
      totals: summarizeCommissions([...directRows, historicalRow]),
      score: 92,
      metrics: { accepted: 12, total: 13 },
    });

    expect(kpis).toHaveLength(4);
    expect(kpis[3]).toMatchObject({
      label: "Acceptance score",
      value: "92%",
      caption: "12 of 13 accepted",
      tone: "success",
    });
    expect(kpis[0].value).toBe("L 62,000");
  });

  it("shows 100% for a new seller and warns on lower levels", () => {
    const newSeller = buildCommissionKpis({
      t,
      totals: summarizeCommissions([]),
      score: null,
      metrics: { accepted: 0, total: 0 },
    });
    const yellow = buildCommissionKpis({
      t,
      totals: summarizeCommissions([]),
      score: 84,
      metrics: { accepted: 8, total: 10 },
    });
    const red = buildCommissionKpis({
      t,
      totals: summarizeCommissions([]),
      score: 59,
      metrics: { accepted: 5, total: 9 },
    });

    expect(newSeller[3]).toMatchObject({
      value: "100%",
      caption: "No assignments yet",
      tone: "success",
    });
    expect(yellow[3]).toMatchObject({ value: "84%", tone: "warning" });
    expect(red[3]).toMatchObject({ value: "59%", tone: "danger" });
  });

});
