import { apiClient } from "@/lib/apiClient";

const periodQuery = (startDate, endDate) =>
  `?start_date=${encodeURIComponent(startDate || "")}&end_date=${encodeURIComponent(endDate || "")}`;

export const commissionsApi = {
  list: (startDate, endDate) =>
    apiClient.get(`/api/v1/reports/commissions${periodQuery(startDate, endDate)}`),
  downloadCsv: (startDate, endDate) =>
    apiClient.get(`/api/v1/reports/commissions_csv${periodQuery(startDate, endDate)}`, {
      responseType: "blob",
    }),
};
