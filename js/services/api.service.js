import { UiUtils } from '../utils/ui.utils.js';
import { AuthService } from './auth.service.js';

/**
 * Base URL for all API endpoints
 * Used as prefix for all API requests
 * @constant {string} API_URL - Base URL for API calls
 */
const API_URL = window.APP_CONFIG.API_URL;

/**
 * Service to handle all API requests
 * Manages:
 * - JWT authentication headers
 * - Automatic token refresh
 * - Request/response handling
 * - Error handling
 * - Base URL configuration
 * - Loading spinner management
 */
class ApiService {
    static BASE_URL = window.APP_CONFIG.API_URL;

    /**
     * Makes an authenticated request with automatic token refresh
     * @param {string} url - Request URL
     * @param {Object} options - Fetch options
     * @param {boolean} requireAuth - Whether authentication is required
     * @returns {Promise<Response>} - Fetch response
     */
    static async makeRequest(url, options = {}, requireAuth = true) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        if (requireAuth) {
            try {
                const token = await AuthService.getValidToken();
                config.headers['Authorization'] = token;
            } catch (error) {
                // Token refresh failed, redirect to login
                AuthService.logout();
                throw new Error('Authentication failed');
            }
        }

        UiUtils.showSpinner();
        try {
            const response = await fetch(url, config);
            
            // Handle 401 Unauthorized - token might be invalid
            if (response.status === 401 && requireAuth) {
                // Try to refresh token and retry once
                try {
                    await AuthService.refreshToken();
                    const newToken = await AuthService.getValidToken();
                    config.headers['Authorization'] = newToken;
                    
                    const retryResponse = await fetch(url, config);
                    if (!retryResponse.ok) {
                        const errorInfo = await this.handleError(retryResponse);
                        throw errorInfo;
                    }
                    return retryResponse;
                } catch (refreshError) {
                    // Refresh failed, logout user
                    AuthService.logout();
                    throw new Error('Session expired. Please login again.');
                }
            }

            if (!response.ok) {
                const errorInfo = await this.handleError(response);
                throw errorInfo;
            }
            
            return response;
        } catch (error) {
            throw await this.handleError(error);
        } finally {
            UiUtils.hideSpinner();
        }
    }

    /**
     * Makes a GET request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @param {boolean} requireAuth - Whether authentication is required
     * @returns {Promise<Object>} API response
     */
    static async get(endpoint, params = {}, requireAuth = true) {
        const url = new URL(this.BASE_URL + endpoint);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await this.makeRequest(url, { method: 'GET' }, requireAuth);
        return await response.json();
    }

    /**
     * Makes a POST request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @param {boolean} requireAuth - Whether authentication is required
     * @returns {Promise<Object>} API response
     */
    static async post(endpoint, data, requireAuth = true) {
        const url = this.BASE_URL + endpoint;
        const response = await this.makeRequest(
            url, 
            { 
                method: 'POST',
                body: JSON.stringify(data)
            }, 
            requireAuth
        );
        return await response.json();
    }

    /**
     * Makes a PUT request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @param {boolean} requireAuth - Whether authentication is required
     * @returns {Promise<Object|null>} API response or null if empty response
     */
    static async put(endpoint, data, requireAuth = true) {
        const url = this.BASE_URL + endpoint;
        const response = await this.makeRequest(
            url, 
            { 
                method: 'PUT',
                body: JSON.stringify(data)
            }, 
            requireAuth
        );

        // Handle empty responses
        return await this.handleEmptyResponse(response);
    }

    /**
     * Makes a DELETE request to the API
     * @param {string} endpoint - API endpoint
     * @param {boolean} requireAuth - Whether authentication is required
     * @returns {Promise<Object|null>} API response or null if empty response
     */
    static async delete(endpoint, requireAuth = true) {
        const url = this.BASE_URL + endpoint;
        const response = await this.makeRequest(
            url, 
            { method: 'DELETE' }, 
            requireAuth
        );

        // Handle empty responses
        return await this.handleEmptyResponse(response);
    }

    /**
     * Handles empty or non-JSON responses
     * @param {Response} response - Fetch response
     * @returns {Promise<Object|null>} Parsed JSON or null
     */
    static async handleEmptyResponse(response) {
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json') || response.status === 204) {
            return null;
        }
        
        const text = await response.text();
        // Handle empty response body
        if (!text) {
            return null;
        }
        
        // Parse JSON only if we have content
        return JSON.parse(text);
    }

    /**
     * Handles API errors
     * @param {Response|Error} error - Error object
     * @returns {Object} Error object with status and message
     */
    static async handleError(error) {
        try {
            if (error instanceof Response) {
                const data = await error.json().catch(() => ({}));
                return {
                    status: error.status,
                    message: data.message || this.getDefaultErrorMessage(error.status)
                };
            }
            return {
                status: error.status || 500,
                message: error.message || 'Request error'
            };
        } catch (e) {
            return {
                status: error.status || 500,
                message: 'Request error'
            };
        }
    }

    /**
     * Gets default error message based on HTTP status
     * @param {number} status - HTTP status code
     * @returns {string} Default error message
     */
    static getDefaultErrorMessage(status) {
        const messages = {
            400: 'Invalid request data',
            401: 'Authentication required',
            403: 'Access denied',
            404: 'Resource not found',
            409: 'Conflict - resource already exists',
            429: 'Rate limit exceeded',
            500: 'Internal server error'
        };
        return messages[status] || 'Request error';
    }
}

export { ApiService };
