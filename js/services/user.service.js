import { ApiService } from './api.service.js';

/**
 * Service to handle user-related operations
 * Manages:
 * - User profile operations
 * - User administration
 * - Role management
 * All operations require authentication
 * Some operations require admin privileges
 */
class UserService {
    /**
     * Fetches user profile
     * - Gets current user's data
     * - Uses auth token
     * - Returns full profile
     * - Used in profile page
     * @returns {Promise<Object>} User profile data
     */
    static async getProfile() {
        return ApiService.get('/usuarios/me');
    }

    /**
     * Updates user profile
     * - Updates name and email
     * - Validates new data
     * - Maintains session
     * - Returns updated profile
     * @param {Object} profileData - Updated profile information
     * @returns {Promise<Object>} Updated profile
     */
    static async updateProfile(profileData) {
        return ApiService.patch('/usuarios/me', profileData);
    }

    /**
     * Lists all users (admin only) with pagination
     * - Admin privilege required
     * - Returns all system users
     * - Includes user details
     * - Used in admin panel
     * - Shows registration dates
     * @param {Object} params - Pagination parameters (page, size, sort, direction)
     * @returns {Promise<Object>} Paginated list of users
     */
    static async listUsers(params = {}) {
        return ApiService.get('/usuarios', params);
    }

    /**
     * Creates a new admin user
     * - Admin privilege required
     * - Sets role as ADMIN
     * - Validates user data
     * - Returns created user
     * - Used in admin panel
     * @param {Object} userData - New user data
     * @returns {Promise<Object>} Created user
     */
    static async createAdminUser(userData) {
        return ApiService.post('/usuarios', { ...userData, rol: 'ADMIN' });
    }

    /**
     * Changes user role
     * - Toggles between ADMIN and USER
     * - Admin privilege required
     * - Immediate effect
     * - Cannot change own role
     * - Used in admin panel
     * @param {number} userId - User ID
     * @param {string} newRole - New role ('ADMIN' | 'USER')
     * @returns {Promise<void>}
     */
    static async changeRole(userId, newRole) {
        return ApiService.patch(`/usuarios/${userId}/role`, { rol: newRole });
    }
}

export { UserService }; 