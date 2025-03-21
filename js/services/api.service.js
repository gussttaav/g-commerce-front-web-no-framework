import { UiUtils } from '../utils/ui.utils.js';

/**
 * Base URL for all API endpoints
 * Used as prefix for all API requests
 * @constant {string} API_URL - Base URL for API calls
 */
const API_URL = window.APP_CONFIG.API_URL;

/**
 * Service to handle all API requests
 * Manages:
 * - Authentication headers
 * - Request/response handling
 * - Error handling
 * - Base URL configuration
 * - Loading spinner management
 */
class ApiService {
    static BASE_URL = window.APP_CONFIG.API_URL;

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

        const headers = this.getHeaders(requireAuth);

        UiUtils.showSpinner();
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                const errorInfo = await this.handleError(response);
                throw errorInfo;
            }
            return await response.json();
        } catch (error) {
            throw await this.handleError(error);
        } finally {
            UiUtils.hideSpinner();
        }
    }

    /**
     * Makes a POST request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object>} API response
     */
    static async post(endpoint, data, requireAuth = true) {
        const url = this.BASE_URL + endpoint;
        const headers = this.getHeaders(requireAuth);

        UiUtils.showSpinner();
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorInfo = await this.handleError(response);
                throw errorInfo;
            }
            return await response.json();
        } catch (error) {
            throw await this.handleError(error);
        } finally {
            UiUtils.hideSpinner();
        }
    }

    /**
     * Makes a PUT request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object|null>} API response or null if empty response
     */
    static async put(endpoint, data) {
        const url = this.BASE_URL + endpoint;
        const headers = this.getHeaders(true);

        UiUtils.showSpinner();
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorInfo = await this.handleError(response);
                throw errorInfo;
            }
            
            // Check if response is empty
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json') || response.status === 204) {
                // Handle no content or non-JSON response
                return null;
            }
            
            const text = await response.text();
            // Handle empty response body
            if (!text) {
                return null;
            }
            
            // Parse JSON only if we have content
            return JSON.parse(text);
        } catch (error) {
            if (error instanceof SyntaxError) {
                // Handle JSON parse error (empty or invalid JSON)
                return null;
            }
            throw await this.handleError(error);
        } finally {
            UiUtils.hideSpinner();
        }
    }

    /**
     * Makes a DELETE request to the API
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object|null>} API response or null if empty response
     */
    static async delete(endpoint) {
        const url = this.BASE_URL + endpoint;
        const headers = this.getHeaders(true);

        UiUtils.showSpinner();
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const errorInfo = await this.handleError(response);
                throw errorInfo;
            }
            
            // Check if response is empty
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json') || response.status === 204) {
                // Handle no content or non-JSON response
                return null;
            }
            
            const text = await response.text();
            // Handle empty response body
            if (!text) {
                return null;
            }
            
            // Parse JSON only if we have content
            return JSON.parse(text);
        } catch (error) {
            if (error instanceof SyntaxError) {
                // Handle JSON parse error (empty or invalid JSON)
                return null;
            }
            throw await this.handleError(error);
        } finally {
            UiUtils.hideSpinner();
        }
    }

    /**
     * Gets headers for API requests
     * @param {boolean} requireAuth - Whether authentication is required
     * @returns {Object} Headers object
     */
    static getHeaders(requireAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (requireAuth) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                window.location.href = 'index.html';
                throw new Error('No authentication token found');
            }
            headers['Authorization'] = token;
        }

        return headers;
    }

    /**
     * Handles API errors
     * @param {Response|Error} error - Error object
     * @returns {string|Object} Error message or error object with status and message
     */
    static async handleError(error) {
        try {
            if (error instanceof Response) {
                const data = await error.json();
                return {
                    status: error.status,
                    message: data.message || 'Request error'
                };
            }
            return {
                status: error.status || 500,
                message: error.message || 'Request error'
            };
        } catch (e) {
            // If we can't parse the error as JSON
            return {
                status: error.status || 500,
                message: 'Request error'
            };
        }
    }
}

export { ApiService }; 