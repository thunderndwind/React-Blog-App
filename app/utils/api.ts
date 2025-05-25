import { API_CONFIG } from '~/config';

/**
 * Get CSRF token from cookies
 */
export const getCSRFToken = () => {
    const cookieName = API_CONFIG.CSRF_COOKIE_NAME || 'csrftoken';
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(`${cookieName}=`))
        ?.split('=')[1];
};

/**
 * Creates a full API URL from an endpoint
 */
export const getFullUrl = (endpoint: string): string => {
    // If it's already a full URL, return it
    if (endpoint.startsWith('http')) {
        return endpoint;
    }

    // Make sure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;
};

/**
 * Get auth headers for authenticated requests
 */
export const getAuthHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`
});

/**
 * Standardized API response type
 */
export type ApiResponse<T> = {
    status: 'success' | 'error';
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
    pagination?: {
        next: string | null;
        previous: string | null;
        page_size: number;
    };
};

/**
 * Try to refresh the authentication token
 */
export const refreshAuthToken = async (): Promise<boolean> => {
    try {
        const url = getFullUrl('/auth/token/refresh');
        const csrfToken = getCSRFToken();
        const headers: Record<string, string> = {};

        if (csrfToken) {
            headers[API_CONFIG.CSRF_HEADER_NAME] = csrfToken;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            credentials: 'include',
            mode: 'cors',
        });

        if (response.ok) {
            const data = await response.json();
            return data.status === 'success';
        }
        return false;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        return false;
    }
};

/**
 * Simple API request helper that handles standardized responses
 */
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    const url = getFullUrl(endpoint);

    try {
        // Add CSRF token to headers for non-GET requests
        const csrfToken = getCSRFToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        if (options.method && options.method !== 'GET' && csrfToken) {
            headers[API_CONFIG.CSRF_HEADER_NAME] = csrfToken;
        }

        const response = await fetch(url, {
            ...options,
            credentials: 'include', // Include cookies in requests
            headers,
            mode: 'cors',
        });

        const responseData = await response.json();

        // Check for standard API responses with status field
        if (responseData.status) {
            // If it's a standard response, check for error status
            if (responseData.status === 'error') {
                throw {
                    status: response.status,
                    message: responseData.message || response.statusText,
                    errors: responseData.errors || {},
                };
            }
            return responseData as ApiResponse<T>;
        }

        // Handle JWT validation errors which have a different format
        if (!response.ok) {
            // Django REST framework token validation error format
            if (responseData.detail && (responseData.code === 'token_not_valid' || responseData.detail === 'Authentication credentials were not provided.')) {
                throw {
                    status: response.status,
                    message: responseData.detail,
                    code: responseData.code || 'auth_error',
                    errors: { auth: ['Authentication failed. Please log in again.'] }
                };
            }

            // CSRF validation error
            if (response.status === 403 && responseData.detail && responseData.detail.includes('CSRF')) {
                throw {
                    status: 403,
                    message: 'CSRF validation failed',
                    code: 'csrf_error',
                    errors: { csrf: ['CSRF validation failed. Please refresh the page and try again.'] }
                };
            }

            // Handle validation errors (common format from DRF)
            if (response.status === 400 && typeof responseData === 'object') {
                const errors: Record<string, string[]> = {};

                // Process each field's errors
                Object.entries(responseData).forEach(([field, value]) => {
                    if (Array.isArray(value)) {
                        errors[field] = value.map(err => err.toString());
                    } else if (value !== null && typeof value === 'object') {
                        // Handle nested error objects
                        errors[field] = ['Invalid data'];
                    } else if (value) {
                        errors[field] = [value.toString()];
                    }
                });

                throw {
                    status: response.status,
                    message: 'Validation failed',
                    errors: Object.keys(errors).length > 0 ? errors : { form: ['Form validation failed'] }
                };
            }

            // Other errors from DRF
            throw {
                status: response.status,
                message: responseData.detail || response.statusText,
                errors: responseData.errors || responseData
            };
        }

        // If it's not a standardized response but still successful, wrap it
        return {
            status: 'success',
            message: 'Request successful',
            data: responseData as T
        };
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}; 