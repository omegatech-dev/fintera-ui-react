import { apiClient } from "@/lib/apiClient";

export const sellerApi = {
  contracts: () => apiClient.get("/api/v1/contracts?page=1&per_page=200"),
};
