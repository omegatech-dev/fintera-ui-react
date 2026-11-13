import { apiClient } from "../../lib/apiClient";

export const paymentsApi = {
    list: (params) => apiClient.get('/api/v1/payments', { params }),
    getStats: () => apiClient.get('/api/v1/payments/stats'),
    approve: (id, body) => apiClient.post(`/api/v1/payments/${id}/approve`, body),
    reject: (id, body) => apiClient.post(`/api/v1/payments/${id}/reject`, body),
    downloadReceipt: (id) => apiClient.get(`/api/v1/payments/${id}/download_receipt`, { responseType: 'blob' }),
    uploadReceipt: (id, formData) => apiClient.post(`/api/v1/payments/${id}/upload_receipt`, formData),
};
