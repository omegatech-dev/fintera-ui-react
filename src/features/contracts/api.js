import { apiClient } from "../../lib/apiClient";

export const contractsApi = {
    list: (params) => apiClient.get('/api/v1/contracts', { params }),
    getByGuid: (guid) => apiClient.get(`/api/v1/contracts/${guid}`),
    getStats: () => apiClient.get('/api/v1/contracts/stats'),
    downloadPdf: (contractId) => apiClient.get('/api/v1/reports/user_promise_contract_pdf', { params: { contract_id: contractId }, responseType: 'blob' }),
    downloadCustomerRecord: (contractId) => apiClient.get('/api/v1/reports/customer_record_pdf', { params: { contract_id: contractId }, responseType: 'blob' }),
    downloadDocument: (documentName, params) => apiClient.get(`/api/v1/reports/${documentName}`, { params, responseType: 'blob' }),
    sendReminder: (guid) => apiClient.post(`/api/v1/contracts/${guid}/reminder`, {}),

    // Identity documents of the applicant: the DNI and the RTN slots plus the
    // contract attachments exposed as read-only legacy entries.
    listIdentityDocuments: (guid) => apiClient.get(`/api/v1/contracts/${guid}/identity_documents`),
    // The listing returns relative content/preview URLs; apiClient prefixes the
    // API origin and returns the bytes as a blob.
    fetchIdentityDocumentBlob: (relativeUrl) => apiClient.get(relativeUrl, { responseType: 'blob' }),
    // Store or replace one kind of the applicant's identity documents. Admins
    // address the person directly; sellers go through a contract in scope.
    uploadIdentityDocumentForUser: (userId, kind, file) => {
        const formData = new FormData();
        formData.append("kind", kind);
        formData.append("file", file);
        return apiClient.post(`/api/v1/users/${userId}/identity_documents`, formData);
    },
    uploadIdentityDocumentForContract: (guid, kind, file) => {
        const formData = new FormData();
        formData.append("kind", kind);
        formData.append("file", file);
        return apiClient.post(`/api/v1/contracts/${guid}/identity_documents`, formData);
    },

    getDetails: (projectId, lotId, contractId) => apiClient.get(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}`),

    listAssignments: (guid) => apiClient.get(`/api/v1/contracts/${guid}/assignments`),
    reassign: (guid, payload) => apiClient.post(`/api/v1/contracts/${guid}/assignments`, payload),

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

    undoPayment: (paymentId) => apiClient.post(`/api/v1/payments/${paymentId}/undo`),

    approvePayment: (paymentId, data) => apiClient.post(`/api/v1/payments/${paymentId}/approve`, data),

    capitalRepayment: (projectId, lotId, contractId, amount) =>
        apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/contracts/${contractId}/capital_repayment`, { capital_repayment_amount: amount }),
};
