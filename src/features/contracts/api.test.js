import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/apiClient", () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

import { apiClient } from "../../lib/apiClient";
import { contractsApi } from "./api";

describe("contractsApi identity documents", () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.post.mockReset();
    apiClient.get.mockResolvedValue({});
  });

  it("lists the identity documents of a contract by GUID", async () => {
    await contractsApi.listIdentityDocuments("guid-9");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/contracts/guid-9/identity_documents"
    );
  });

  it("uploads an identity document for a person with its kind", async () => {
    apiClient.post.mockResolvedValue({});
    const file = new File(["x"], "dni.png", { type: "image/png" });

    await contractsApi.uploadIdentityDocumentForUser(7, "dni", file);

    const [url, body] = apiClient.post.mock.calls[0];
    expect(url).toBe("/api/v1/users/7/identity_documents");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("kind")).toBe("dni");
    expect(body.get("file")).toBe(file);
  });

  it("uploads an identity document through a contract in scope", async () => {
    apiClient.post.mockResolvedValue({});
    const file = new File(["x"], "rtn.png", { type: "image/png" });

    await contractsApi.uploadIdentityDocumentForContract("guid-9", "rtn", file);

    const [url, body] = apiClient.post.mock.calls[0];
    expect(url).toBe("/api/v1/contracts/guid-9/identity_documents");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("kind")).toBe("rtn");
    expect(body.get("file")).toBe(file);
  });

  it("fetches a content or preview URL as a blob", async () => {
    await contractsApi.fetchIdentityDocumentBlob(
      "/api/v1/identity_documents/3/preview"
    );

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/identity_documents/3/preview",
      { responseType: "blob" }
    );
  });
});

describe("contractsApi report downloads", () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.get.mockResolvedValue(new Blob(["pdf"]));
  });

  it("downloads the customer record as a blob", async () => {
    await contractsApi.downloadCustomerRecord(16);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/reports/customer_record_pdf",
      { params: { contract_id: 16 }, responseType: "blob" }
    );
  });

  it("downloads a named contract document as a blob", async () => {
    await contractsApi.downloadDocument("user_promise_contract_pdf", {
      contract_id: 16,
      user_id: 7,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/reports/user_promise_contract_pdf",
      {
        params: { contract_id: 16, user_id: 7 },
        responseType: "blob",
      }
    );
  });
});
