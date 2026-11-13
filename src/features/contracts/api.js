import { apiClient } from "../../lib/apiClient";

export const contractsApi = {
    list: (params) => apiClient.get('/api/v1/contracts', { params }),
    getByGuid: (guid) => apiClient.get(`/api/v1/contracts/${guid}`),
    getStats: () => apiClient.get('/api/v1/contracts/stats'),
    getDetails: (projectId, lotId, contractId) => apiClient.get(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}`),

    update: (projectId, lotId, contractId, data) =>
        apiClient.patch(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}`, data),

    updateNotes: (projectId, lotId, contractId, notes) =>
        apiClient.patch(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}`, {
            contract: { note: notes }
        }),

    delete: (projectId, lotId, contractId) => apiClient.delete(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}`),
    approve: (projectId, lotId, contractId) => apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}/approve`),
    reject: (projectId, lotId, contractId, reason) => apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}/reject`, { reason }),
    cancel: (projectId, lotId, contractId, note) => apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}/cancel`, { note }),
    reopen: (projectId, lotId, contractId) => apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}/reopen`),

    undoPayment: (paymentId) => apiClient.post(`/api/v1/payments/${paymentId}/undo`),

    approvePayment: (paymentId, data) => apiClient.post(`/api/v1/payments/${paymentId}/approve`, data),

    capitalRepayment: (projectId, lotId, contractId, amount) =>
        apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}/capital_repayment`, { capital_repayment_amount: amount }),
};
