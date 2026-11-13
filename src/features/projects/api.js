import { apiClient } from "../../lib/apiClient";

export const projectsApi = {
    list: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/projects?${query}`);
    },
    get: (id) => apiClient.get(`/api/v1/projects/${id}`),
    create: (data) => apiClient.post("/api/v1/projects", data),
    update: (id, data) => apiClient.put(`/api/v1/projects/${id}`, data),
    delete: (id) => apiClient.delete(`/api/v1/projects/${id}`),
    publish: (id) => apiClient.post(`/api/v1/projects/${id}/publish`, {}),
    unpublish: (id) => apiClient.post(`/api/v1/projects/${id}/unpublish`, {}),
    import: (formData) => apiClient.post("/api/v1/projects/import", formData),
    importTemplate: () =>
        apiClient.get("/api/v1/projects/import/template", { responseType: "blob" }),

    createLot: (projectId, data) => apiClient.post(`/api/v1/projects/${projectId}/lots`, data),
    listLots: (projectId, params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/api/v1/projects/${projectId}/lots?${query}`);
    },
    getLot: (projectId, lotId) => apiClient.get(`/api/v1/projects/${projectId}/lots/${lotId}`),
    updateLot: (projectId, lotId, data) => apiClient.put(`/api/v1/projects/${projectId}/lots/${lotId}`, data),
    createContract: (projectId, lotId, data) => apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/contracts`, data),

    // Project media
    listDrawings: (projectId) => apiClient.get(`/api/v1/projects/${projectId}/drawings`),
    uploadDrawings: (projectId, formData) => apiClient.post(`/api/v1/projects/${projectId}/drawings`, formData),
    updateDrawing: (drawingId, data) => apiClient.patch(`/api/v1/drawings/${drawingId}`, data),
    deleteDrawing: (drawingId) => apiClient.delete(`/api/v1/drawings/${drawingId}`),

    listProjectPhotos: (projectId) => apiClient.get(`/api/v1/projects/${projectId}/photos`),
    uploadProjectPhotos: (projectId, formData) => apiClient.post(`/api/v1/projects/${projectId}/photos`, formData),
    updateProjectPhoto: (photoId, data) => apiClient.patch(`/api/v1/project-photos/${photoId}`, data),
    deleteProjectPhoto: (photoId) => apiClient.delete(`/api/v1/project-photos/${photoId}`),

    listLotPhotos: (projectId, lotId) => apiClient.get(`/api/v1/projects/${projectId}/lots/${lotId}/photos`),
    uploadLotPhotos: (projectId, lotId, formData) => apiClient.post(`/api/v1/projects/${projectId}/lots/${lotId}/photos`, formData),
    updateLotPhoto: (photoId, data) => apiClient.patch(`/api/v1/photos/${photoId}`, data),
    deleteLotPhoto: (photoId) => apiClient.delete(`/api/v1/photos/${photoId}`),

    // Project payment instructions (bank accounts)
    listPaymentInstructions: (projectId) => apiClient.get(`/api/v1/projects/${projectId}/payment-instructions`),
    createPaymentInstruction: (projectId, data) => apiClient.post(`/api/v1/projects/${projectId}/payment-instructions`, data),
    updatePaymentInstruction: (projectId, instructionId, data) => apiClient.patch(`/api/v1/projects/${projectId}/payment-instructions/${instructionId}`, data),
    deletePaymentInstruction: (projectId, instructionId) => apiClient.delete(`/api/v1/projects/${projectId}/payment-instructions/${instructionId}`),
};
