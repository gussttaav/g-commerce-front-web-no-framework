import { ApiService } from './api.service.js';

/**
 * Service to handle authentication
 * Manages:
 * - User login/logout
 * - User registration
 * - Password changes
 * - Authentication token management
 * - Profile updates
 */
class AuthService {
    /**
     * Authenticates user with email and password
     * Makes API call to login endpoint
     * On success:
     * - Stores authentication data
     * - Sets up user session
     * On error:
     * - Provides specific error messages for different failure cases
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Login response
     */
    static async login(email, password) {
        try {
            const data = await ApiService.post('/usuarios/login', { email, password }, false);
            this.setAuthData(email, password, data);
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
     * - Basic auth token
     * - User email
     * - User role
     * - User name
     * Used after login and password changes
     * @private
     */
    static setAuthData(email, password, userData) {
        localStorage.setItem('authToken', 'Basic ' + btoa(email + ':' + password));
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRole', userData.rol);
        localStorage.setItem('userName', userData.nombre);
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
        return ApiService.post('/usuarios/registro', userData, false);
    }

    /**
     * Logs out the user
     * - Clears all authentication data from localStorage
     * - Redirects to login page
     * - Ensures complete session cleanup
     */
    static logout() {
        localStorage.clear();
        window.location.href = 'index.html';
    }

    /**
     * Updates user profile
     * Makes authenticated API call to update profile
     * Requires valid auth token
     * @param {Object} profileData - Profile update data
     * @returns {Promise} - Update response
     */
    static async updateProfile(profileData) {
        return ApiService.put('/usuarios/perfil', profileData);
    }

    /**
     * Changes user password
     * Makes authenticated API call to change password
     * On success:
     * - Updates stored authentication token with new password
     * - Maintains user session
     * Requires current password for verification
     * @param {Object} passwordData - Password change data
     * @returns {Promise<void>}
     */
    static async changePassword(passwordData) {
        const userEmail = localStorage.getItem('userEmail');
        await ApiService.put('/usuarios/password', passwordData);

        // Update stored auth token with new password
        this.setAuthData(userEmail, passwordData.newPassword, {
            email: userEmail,
            rol: localStorage.getItem('userRole'),
            nombre: localStorage.getItem('userName')
        });
    }
}

export { AuthService }; 