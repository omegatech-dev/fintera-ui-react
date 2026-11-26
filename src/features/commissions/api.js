import { apiClient } from "@/lib/apiClient";
import { projectsApi } from "@/features/projects/api";

const periodQuery = (startDate, endDate) =>
  `?start_date=${encodeURIComponent(startDate || "")}&end_date=${encodeURIComponent(endDate || "")}`;

const pageQuery = ({
  page,
  perPage,
  sellerId,
  search,
  creditsPage,
  creditsPerPage,
} = {}) => {
  const params = new URLSearchParams();
  if (sellerId) params.set("seller_id", sellerId);
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  if (perPage) params.set("per_page", perPage);
  if (creditsPage) params.set("credits_page", creditsPage);
  if (creditsPerPage) params.set("credits_per_page", creditsPerPage);
  const query = params.toString();
  return query ? `&${query}` : "";
};

export const commissionsApi = {
  list: (startDate, endDate, options) =>
    apiClient.get(
      `/api/v1/reports/commissions${periodQuery(startDate, endDate)}${pageQuery(options)}`
    ),
  download: (startDate, endDate, format = "csv", { sellerId } = {}) => {
    const seller = sellerId ? `&seller_id=${encodeURIComponent(sellerId)}` : "";
    return apiClient.get(
      `/api/v1/reports/commissions_export${periodQuery(startDate, endDate)}${seller}&format=${format}`,
      {
        responseType: "blob",
      }
    );
  },
  markPaid: (contractGuid) =>
    apiClient.patch(`/api/v1/contracts/${contractGuid}/commission/pay`),
  previewPayout: (contractGuid) =>
    apiClient.get(
      `/api/v1/contracts/${contractGuid}/commission/payout-preview`
    ),
  getProject: (projectId) => projectsApi.get(projectId),
  updateProject: (projectId, project) => projectsApi.update(projectId, { project }),
};
