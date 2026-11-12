import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from "../../lib/apiClient";
import { contractsApi } from "./api";

describe("contractsApi.capitalRepayment", () => {
  it("sends the amount in the documented capital_repayment_amount field", async () => {
    apiClient.post.mockResolvedValueOnce({ message: "ok" });

    await contractsApi.capitalRepayment(1, 2, 3, 1500);

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/projects/1/lots/2/contracts/3/capital_repayment",
      { capital_repayment_amount: 1500 }
    );
  });
});
