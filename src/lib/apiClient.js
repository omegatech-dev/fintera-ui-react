import { API_URL } from "@config";

const HEADERS_DEFAULT = {
    "Content-Type": "application/json",
};

let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

/**
 * Generic API client wrapper
 * @param {string} endpoint - Relative API endpoint (e.g., '/api/v1/projects')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function request(endpoint, { body, ...customConfig } = {}) {
    const token = authToken;
    const headers = { ...HEADERS_DEFAULT };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        method: body ? "POST" : "GET",
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        if (body instanceof FormData) {
            // Let the browser set the Content-Type header with the boundary
            delete config.headers["Content-Type"];
            config.body = body;
        } else {
            config.body = JSON.stringify(body);
        }
    }

    let response, data;
    try {
        response = await fetch(`${API_URL}${endpoint}`, config);
    } catch (error) {
        if (error.name === 'AbortError' || error.code === 20 || error.message?.includes('aborted')) {
            throw error;
        }
        console.error("API Network Error:", error);
        throw new Error("Network error");
    }

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
        console.warn("Unauthorized access - dispatching auth:unauthorized event");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        return Promise.reject({ message: "Unauthorized", status: 401 });
    }

    if (customConfig.responseType === 'blob') {
        if (response.ok) {
            return response.blob();
        }
        // If blob request fails, still try to parse error as json if possible, or text
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        } catch {
            data = {};
        }
    } else {
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        } catch {
            data = {};
        }
    }

    if (response.ok) {
        return data;
    } else {
        const error = {
            message: data.message || data.error || "Something went wrong",
            status: response.status,
            errors: data.errors,
        };
        return Promise.reject(error);
    }
}

export const apiClient = {
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
    post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "POST", body }),
    put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "PUT", body }),
    patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "PATCH", body }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),
};
