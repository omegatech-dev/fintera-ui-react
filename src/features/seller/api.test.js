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
import { evidenceFileName, sellerApi } from "./api";

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

  it("lists pending assignments and accepts one", async () => {
    await sellerApi.listPendingAssignments();
    await sellerApi.acceptAssignment(4);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/assignments/pending");
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/assignments/4/accept",
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
    await sellerApi.getHistoricalSale(3);
    await sellerApi.createHistoricalSale({ client_name: "Ana" });
    await sellerApi.updateHistoricalSale(3, { client_name: "Ana" });
    await sellerApi.validateHistoricalSale(3);
    await sellerApi.rejectHistoricalSale(4);

    expect(apiClient.get).toHaveBeenNthCalledWith(
      1,
      "/api/v1/historical_sales",
      {
        params: { status: "pending" },
      }
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(
      2,
      "/api/v1/historical_sales/3"
    );
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

describe("historical evidence endpoints", () => {
  const makeResponse = ({
    status = 200,
    contentType = "",
    body = null,
    blob = null,
  }) => ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => contentType },
    json: async () => body,
    blob: async () => blob,
  });

  it("uploads evidence as multipart with only the file field", async () => {
    const file = new File(["bytes"], "respaldo.png", { type: "image/png" });
    apiClient.post.mockResolvedValue({ historical_sale: { id: 7 } });

    await sellerApi.uploadHistoricalEvidence(7, file);

    const [url, body] = apiClient.post.mock.calls[0];
    expect(url).toBe("/api/v1/historical_sales/7/evidence");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("file")).toBe(file);
    expect(body.has("evidence_file")).toBe(false);
  });

  it("normalizes a stored file response into a blob object URL", async () => {
    const createObjectURL = vi.fn(() => "blob:respaldo");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const blob = new Blob(["bytes"], { type: "image/png" });
    apiClient.get.mockResolvedValue(
      makeResponse({ contentType: "image/png", blob })
    );

    const result = await sellerApi.fetchHistoricalEvidence(7);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/historical_sales/7/evidence",
      { responseType: "response" }
    );
    expect(result).toEqual({
      kind: "file",
      url: "blob:respaldo",
      contentType: "image/png",
    });
    vi.unstubAllGlobals();
  });

  it("returns the external URL for legacy evidence", async () => {
    apiClient.get.mockResolvedValue(
      makeResponse({
        contentType: "application/json",
        body: { evidence_url: "https://cdn.example.com/old.png" },
      })
    );

    const result = await sellerApi.fetchHistoricalEvidence(7);

    expect(result).toEqual({
      kind: "external",
      url: "https://cdn.example.com/old.png",
    });
  });

  it("reports no evidence on 404", async () => {
    apiClient.get.mockResolvedValue(
      makeResponse({ status: 404, body: { error: "sin evidencia" } })
    );

    await expect(sellerApi.fetchHistoricalEvidence(7)).resolves.toEqual({
      kind: "none",
    });
  });

  it("throws the backend error on other failures", async () => {
    apiClient.get.mockResolvedValue(
      makeResponse({ status: 403, body: { error: "No autorizado" } })
    );

    await expect(sellerApi.fetchHistoricalEvidence(7)).rejects.toMatchObject({
      message: "No autorizado",
      status: 403,
    });
  });

  it("downloads the evidence with the download flag", async () => {
    const blob = new Blob(["bytes"], { type: "application/pdf" });
    apiClient.get.mockResolvedValue(blob);

    await expect(sellerApi.downloadHistoricalEvidence(7)).resolves.toBe(blob);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/historical_sales/7/evidence?download=1",
      { responseType: "blob" }
    );
  });

  it("builds the download file name from the path or content type", () => {
    expect(evidenceFileName(7, "evidence/2026/11/a3f8.png")).toBe(
      "respaldo-7.png"
    );
    expect(evidenceFileName(7, "", "application/pdf")).toBe("respaldo-7.pdf");
    expect(evidenceFileName(7, "", "image/jpeg;charset=utf-8")).toBe(
      "respaldo-7.jpg"
    );
    expect(evidenceFileName(7, "", "")).toBe("respaldo-7.bin");
  });
});
