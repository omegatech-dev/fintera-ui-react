import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/apiClient";
import { commissionsApi } from "./api";

vi.mock("@/lib/apiClient", () => ({
  apiClient: { get: vi.fn() },
}));

describe("commissionsApi.list", () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.get.mockResolvedValue({});
  });

  it("sends every paging and seller parameter", async () => {
    await commissionsApi.list("2026-11-01", "2026-11-30", {
      page: 2,
      perPage: 20,
      sellerId: "7",
      search: "ana",
      creditsPage: 3,
      creditsPerPage: 20,
    });

    const url = apiClient.get.mock.calls[0][0];
    expect(url).toContain("/api/v1/reports/commissions?");
    expect(url).toContain("start_date=2026-11-01");
    expect(url).toContain("end_date=2026-11-30");
    expect(url).toContain("page=2");
    expect(url).toContain("per_page=20");
    expect(url).toContain("seller_id=7");
    expect(url).toContain("search=ana");
    expect(url).toContain("credits_page=3");
    expect(url).toContain("credits_per_page=20");
  });

  it("omits seller_id and search when they are empty", async () => {
    await commissionsApi.list("2026-11-01", "2026-11-30", {
      page: 1,
      perPage: 20,
      sellerId: "",
      search: "",
    });

    const url = apiClient.get.mock.calls[0][0];
    expect(url).not.toContain("seller_id");
    expect(url).not.toContain("search=");
    expect(url).toContain("page=1");
  });

  it("keeps the period-only request for callers without options", async () => {
    await commissionsApi.list("2026-11-01", "2026-11-30");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/reports/commissions?start_date=2026-11-01&end_date=2026-11-30"
    );
  });

  it("no longer exposes listProjects", () => {
    expect(commissionsApi.listProjects).toBeUndefined();
  });
});

describe("commissionsApi.download", () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.get.mockResolvedValue({});
  });

  it("adds seller_id to the export query when a seller is selected", async () => {
    await commissionsApi.download("2026-11-01", "2026-11-30", "xlsx", {
      sellerId: "7",
    });

    const [url, config] = apiClient.get.mock.calls[0];
    expect(url).toContain("/api/v1/reports/commissions_export?");
    expect(url).toContain("start_date=2026-11-01");
    expect(url).toContain("end_date=2026-11-30");
    expect(url).toContain("seller_id=7");
    expect(url).toContain("format=xlsx");
    expect(config).toEqual({ responseType: "blob" });
  });

  it("omits seller_id for the unfiltered export", async () => {
    await commissionsApi.download("2026-11-01", "2026-11-30", "pdf", {
      sellerId: "",
    });

    const url = apiClient.get.mock.calls[0][0];
    expect(url).not.toContain("seller_id");
    expect(url).toContain("format=pdf");
  });

  it("keeps working without an options argument", async () => {
    await commissionsApi.download("2026-11-01", "2026-11-30");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/reports/commissions_export?start_date=2026-11-01&end_date=2026-11-30&format=csv",
      { responseType: "blob" }
    );
  });
});

describe("commissionsApi.previewPayout", () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.get.mockResolvedValue({});
  });

  it("requests the payout preview for a contract", async () => {
    await commissionsApi.previewPayout("contract-guid");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/contracts/contract-guid/commission/payout-preview"
    );
  });
});
