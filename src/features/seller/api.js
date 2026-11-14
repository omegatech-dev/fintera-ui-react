import { apiClient } from "@/lib/apiClient";

const API = "/api/v1";

const toImportFormData = (file, options = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, typeof value === "boolean" ? String(value) : value);
  });
  return formData;
};

export const sellerApi = {
  contracts: () => apiClient.get("/api/v1/contracts?page=1&per_page=200"),

  getReferral: () => apiClient.get(`${API}/vendedor/referrals`),
  getReferralReservations: (params) =>
    apiClient.get(`${API}/vendedor/referrals/reservations`, { params }),

  listSellers: ({ search } = {}) =>
    apiClient.get(`${API}/sellers`, { params: { search } }),
  listPendingAssignments: () => apiClient.get(`${API}/assignments/pending`),
  acceptAssignment: (id) =>
    apiClient.post(`${API}/assignments/${id}/accept`, {}),

  overrideScore: (userId, { score, reason } = {}) =>
    apiClient.patch(`${API}/users/${userId}/score`, { score, reason }),

  listHistoricalSales: (params) =>
    apiClient.get(`${API}/historical_sales`, { params }),
  createHistoricalSale: (payload) =>
    apiClient.post(`${API}/historical_sales`, payload),
  updateHistoricalSale: (id, payload) =>
    apiClient.put(`${API}/historical_sales/${id}`, payload),
  importHistoricalSales: (file, options) =>
    apiClient.post(
      `${API}/historical_sales/import`,
      toImportFormData(file, options)
    ),
  validateHistoricalSale: (id) =>
    apiClient.post(`${API}/historical_sales/${id}/validate`, {}),
  rejectHistoricalSale: (id) =>
    apiClient.post(`${API}/historical_sales/${id}/reject`, {}),

  getCommissionRules: () => apiClient.get(`${API}/commissions/rules`),
  updateCommissionRules: (payload) =>
    apiClient.put(`${API}/commissions/rules`, payload),
  listCommissionExceptions: () =>
    apiClient.get(`${API}/commissions/exceptions`),
  upsertCommissionException: (payload) =>
    apiClient.post(`${API}/commissions/exceptions`, payload),
  deleteCommissionException: (id) =>
    apiClient.delete(`${API}/commissions/exceptions/${id}`),
};
