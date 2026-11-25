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

const CONTENT_TYPE_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "application/pdf": "pdf",
};

const extensionFromEvidencePath = (path) => {
  const match = /\.([a-z0-9]+)(?:$|[?#])/i.exec(String(path || ""));
  return match ? match[1].toLowerCase() : "";
};

export const evidenceFileName = (saleId, evidencePath, contentType = "") => {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase();
  const extension =
    extensionFromEvidencePath(evidencePath) ||
    CONTENT_TYPE_EXTENSIONS[type] ||
    "bin";
  return `respaldo-${saleId}.${extension}`;
};

const evidenceEndpoint = (id, query = "") =>
  `${API}/historical_sales/${id}/evidence${query}`;

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
  getHistoricalSale: (id) =>
    apiClient.get(`${API}/historical_sales/${id}`),
  createHistoricalSale: (payload) =>
    apiClient.post(`${API}/historical_sales`, payload),
  updateHistoricalSale: (id, payload) =>
    apiClient.put(`${API}/historical_sales/${id}`, payload),
  importHistoricalSales: (file, options) =>
    apiClient.post(
      `${API}/historical_sales/import`,
      toImportFormData(file, options)
    ),
  uploadHistoricalEvidence: (id, file) =>
    apiClient.post(evidenceEndpoint(id), toImportFormData(file)),
  fetchHistoricalEvidence: async (id) => {
    const response = await apiClient.get(evidenceEndpoint(id), {
      responseType: "response",
    });
    if (response.status === 404) return { kind: "none" };
    if (!response.ok) {
      let message = "Something went wrong";
      try {
        const data = await response.json();
        message = data.error || data.message || message;
      } catch {
        // Keep the fallback message when the body is not JSON.
      }
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    const contentType = (
      response.headers?.get("content-type") || ""
    ).toLowerCase();
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!data?.evidence_url) {
        throw new Error("Missing evidence URL");
      }
      return { kind: "external", url: data.evidence_url };
    }
    const blob = await response.blob();
    return {
      kind: "file",
      url: URL.createObjectURL(blob),
      contentType: blob.type || contentType,
    };
  },
  downloadHistoricalEvidence: (id) =>
    apiClient.get(evidenceEndpoint(id, "?download=1"), {
      responseType: "blob",
    }),
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
