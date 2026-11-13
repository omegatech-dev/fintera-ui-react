import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/lib/apiClient";
import { sellerApi } from "./api";

beforeEach(() => {
  Object.values(apiClient).forEach((mock) => mock.mockReset());
});

describe("seller referral endpoints", () => {
  it("reads the referral link and its reservations", async () => {
    await sellerApi.getReferral();
    await sellerApi.getReferralReservations();

    expect(apiClient.get).toHaveBeenNthCalledWith(
      1,
      "/api/v1/vendedor/referrals"
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(
      2,
      "/api/v1/vendedor/referrals/reservations",
      { params: undefined }
    );
  });
});

describe("seller assignment endpoints", () => {
  it("searches sellers", async () => {
    await sellerApi.listSellers({ search: "ana" });

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/sellers", {
      params: { search: "ana" },
    });
  });

  it("lists pending assignments and accepts or rejects one", async () => {
    await sellerApi.listPendingAssignments();
    await sellerApi.acceptAssignment(4);
    await sellerApi.rejectAssignment(5);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/assignments/pending");
    expect(apiClient.post).toHaveBeenNthCalledWith(
      1,
      "/api/v1/assignments/4/accept",
      {}
    );
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      "/api/v1/assignments/5/reject",
      {}
    );
  });

  it("overrides a seller score", async () => {
    await sellerApi.overrideScore(9, { score: 80, reason: "Revisión" });

    expect(apiClient.patch).toHaveBeenCalledWith("/api/v1/users/9/score", {
      score: 80,
      reason: "Revisión",
    });
  });
});

describe("historical sales endpoints", () => {
  it("lists, creates, updates, validates and rejects", async () => {
    await sellerApi.listHistoricalSales({ status: "pending" });
    await sellerApi.createHistoricalSale({ client_name: "Ana" });
    await sellerApi.updateHistoricalSale(3, { client_name: "Ana" });
    await sellerApi.validateHistoricalSale(3);
    await sellerApi.rejectHistoricalSale(4);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/historical_sales", {
      params: { status: "pending" },
    });
    expect(apiClient.post).toHaveBeenNthCalledWith(
      1,
      "/api/v1/historical_sales",
      { client_name: "Ana" }
    );
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/historical_sales/3", {
      client_name: "Ana",
    });
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      "/api/v1/historical_sales/3/validate",
      {}
    );
    expect(apiClient.post).toHaveBeenNthCalledWith(
      3,
      "/api/v1/historical_sales/4/reject",
      {}
    );
  });

  it("uploads a CSV with the import options", async () => {
    const file = new File(["client_name"], "historico.csv", {
      type: "text/csv",
    });

    await sellerApi.importHistoricalSales(file, {
      mark_historical: true,
      skip_duplicates: true,
      create_commission: false,
    });

    const [url, body] = apiClient.post.mock.calls[0];
    expect(url).toBe("/api/v1/historical_sales/import");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("file")).toBe(file);
    expect(body.get("mark_historical")).toBe("true");
    expect(body.get("skip_duplicates")).toBe("true");
    expect(body.get("create_commission")).toBe("false");
  });
});

describe("commission rule endpoints", () => {
  it("reads and updates the rules", async () => {
    await sellerApi.getCommissionRules();
    await sellerApi.updateCommissionRules({ default_rate: 5 });

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/commissions/rules");
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/commissions/rules", {
      default_rate: 5,
    });
  });

  it("manages per-seller exceptions", async () => {
    await sellerApi.listCommissionExceptions();
    await sellerApi.upsertCommissionException({ seller_id: 2, rate: 6 });
    await sellerApi.deleteCommissionException(7);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/commissions/exceptions"
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/commissions/exceptions",
      { seller_id: 2, rate: 6 }
    );
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/api/v1/commissions/exceptions/7"
    );
  });
});
