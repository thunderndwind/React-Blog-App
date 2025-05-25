// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT || 30000),
    CSRF_COOKIE_NAME: import.meta.env.VITE_CSRF_COOKIE_NAME || 'csrftoken',
    CSRF_HEADER_NAME: import.meta.env.VITE_CSRF_HEADER_NAME || 'X-CSRFToken',
};

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
    BASE_URL: API_CONFIG.BASE_URL,
    LOGIN: `${API_CONFIG.BASE_URL}${import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/auth/login'}`,
    REGISTER: `${API_CONFIG.BASE_URL}${import.meta.env.VITE_AUTH_REGISTER_ENDPOINT || '/auth/register'}`,
    VALIDATE_TOKEN: `${API_CONFIG.BASE_URL}${import.meta.env.VITE_AUTH_VALIDATE_TOKEN_ENDPOINT || '/auth/validate-token'}`,
    REFRESH_TOKEN: `${API_CONFIG.BASE_URL}${import.meta.env.VITE_AUTH_REFRESH_TOKEN_ENDPOINT || '/auth/refresh-token'}`,
    LOGOUT: `${API_CONFIG.BASE_URL}${import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT || '/auth/logout'}`,
};

// Function to create a full API URL
export const getApiUrl = (endpoint: string): string => {
    if (endpoint.startsWith('http')) {
        return endpoint;
    }

    // Make sure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;
}; 