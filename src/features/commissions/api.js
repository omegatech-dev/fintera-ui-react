import { apiClient } from "@/lib/apiClient";
import { projectsApi } from "@/features/projects/api";

const periodQuery = (startDate, endDate) =>
  `?start_date=${encodeURIComponent(startDate || "")}&end_date=${encodeURIComponent(endDate || "")}`;

export const commissionsApi = {
  list: (startDate, endDate) =>
    apiClient.get(`/api/v1/reports/commissions${periodQuery(startDate, endDate)}`),
  downloadCsv: (startDate, endDate) =>
    apiClient.get(`/api/v1/reports/commissions_csv${periodQuery(startDate, endDate)}`, {
      responseType: "blob",
    }),
  markPaid: (contractGuid) =>
    apiClient.patch(`/api/v1/contracts/${contractGuid}/commission/pay`),
  applyCredit: (creditId) =>
    apiClient.post(`/api/v1/commissions/credits/${creditId}/apply`),
  listProjects: () => projectsApi.list({ per_page: 100 }),
  getProject: (projectId) => projectsApi.get(projectId),
  updateProject: (projectId, project) => projectsApi.update(projectId, { project }),
};
