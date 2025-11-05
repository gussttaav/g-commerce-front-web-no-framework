import { ApiService } from './api.service.js';

/**
 * Service to handle authentication
 * Manages:
 * - User login/logout
 * - User registration
 * - Password changes
 * - Authentication token management
 * - Profile updates
 * - Token refresh
 */
class AuthService {
    /**
     * Authenticates user with email and password
     * Makes API call to login endpoint
     * On success:
     * - Stores JWT tokens and user data
     * - Sets up user session
     * On error:
     * - Provides specific error messages for different failure cases
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Login response
     */
    static async login(email, password) {
        try {
            const data = await ApiService.post('/auth/login', { email, password }, false);
            this.setAuthData(data);
            return data;
        } catch (error) {
            let errorMsg = "Login failed. Try again later!";
            
            // Get the actual error message
            if (error.message) {
                errorMsg = error.message;
            }
            
            throw new Error(errorMsg);
        }
    }

    /**
     * Stores authentication data in localStorage
     * Sets up:
     * - JWT access token
     * - Refresh token
     * - User data
     * - Token expiration
     * Used after login and token refresh
     * @private
     */
    static setAuthData(authResponse) {
        const { user, token, refreshToken, expiresIn, refreshExpiresIn } = authResponse;
        
        // Store tokens
        localStorage.setItem('authToken', `Bearer ${token}`);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Store user data
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userId', user.id);
        
        // Store token expiration timestamps
        const accessTokenExpiry = Date.now() + (expiresIn * 1000);
        const refreshTokenExpiry = Date.now() + (refreshExpiresIn * 1000);
        localStorage.setItem('accessTokenExpiry', accessTokenExpiry.toString());
        localStorage.setItem('refreshTokenExpiry', refreshTokenExpiry.toString());
    }

    /**
     * Refreshes the access token using the refresh token
     * @returns {Promise} - Refresh response with new tokens
     */
    static async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${ApiService.BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${refreshToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            this.setAuthData(data);
            return data;
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    /**
     * Checks if the access token is expired or about to expire
     * @returns {boolean} - True if token needs refresh
     */
    static shouldRefreshToken() {
        const expiry = localStorage.getItem('accessTokenExpiry');
        if (!expiry) return true;
        
        // Refresh if token expires in less than 5 minutes
        return Date.now() > (parseInt(expiry) - 5 * 60 * 1000);
    }

    /**
     * Gets valid authentication token, refreshing if necessary
     * @returns {Promise<string>} - Valid access token
     */
    static async getValidToken() {
        if (this.shouldRefreshToken()) {
            await this.refreshToken();
        }
        return localStorage.getItem('authToken');
    }

    /**
     * Logs out the user
     * - Calls logout endpoint to blacklist tokens
     * - Clears all authentication data from localStorage
     * - Redirects to login page
     */
    static async logout() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const authToken = localStorage.getItem('authToken');
            
            // Call logout endpoint if we have tokens
            if (authToken && refreshToken) {
                await ApiService.post('/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with client-side cleanup even if API call fails
        } finally {
            // Always clear local storage and redirect
            localStorage.clear();
            window.location.href = 'index.html';
        }
    }

    /**
     * Validates the current JWT token
     * @returns {Promise<boolean>} - True if token is valid
     */
    static async validateToken() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return false;

            const response = await fetch(`${ApiService.BASE_URL}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) return false;

            const data = await response.json();
            return data.valid === true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Registers a new user
     * Makes API call to registration endpoint
     * Validates response and handles errors
     * Does not automatically log in the user
     * User must login after successful registration
     * @param {Object} userData - User registration data
     * @returns {Promise} - Registration response
     */
    static async register(userData) {
        return ApiService.post('/users', { ...userData, rol: 'USER' }, false);
    }

    /**
     * Changes user password
     * Makes authenticated API call to change password
     * On success:
     * - Does NOT update tokens (user must login again)
     * Requires current password for verification
     * @param {Object} passwordData - Password change data
     * @returns {Promise<void>}
     */
    static async changePassword(passwordData) {
        await ApiService.patch('/users/me', passwordData);
        // Note: After password change, user should login again with new password
    }
}

export { AuthService };
