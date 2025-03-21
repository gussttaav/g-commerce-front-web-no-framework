import { AuthService } from '../services/auth.service.js';
import { UserService } from '../services/user.service.js';
import { UiUtils } from '../utils/ui.utils.js';
import { PaginationUtils } from '../utils/pagination.utils.js';

/**
 * Component to handle user-related UI and operations
 * Manages:
 * - User profile management
 * - Password changes
 * - Admin user management
 * - User role changes
 * - User listing (admin)
 */
class UserComponent {
    constructor() {
        this.pagination = new PaginationUtils();
        this.pagination.sortField = 'email';
        this.pagination.sortDirection = 'ASC';
        this.pagination.onPageChange = () => this.loadUsers();
        this.initializeEventListeners();
    }

    /**
     * Initializes user-related event listeners
     * - Profile form submission
     * - Password change form
     * - Admin user management
     * - Role change buttons
     * - Pagination buttons
     */
    initializeEventListeners() {
        // Static elements that exist on page load
        document.getElementById('profileForm')?.addEventListener('submit', this.updateProfile.bind(this));
        document.getElementById('passwordForm')?.addEventListener('submit', this.changePassword.bind(this));
        document.getElementById('saveUserBtn')?.addEventListener('click', () => this.saveUser());
        document.getElementById('addAdminUserBtn')?.addEventListener('click', () => this.showAddUserModal());

        // Pagination controls
        document.getElementById('userPageSize')?.addEventListener('change', (e) => {
            this.pagination.pageSize = parseInt(e.target.value);
            this.pagination.currentPage = 0;
            this.loadUsers();
        });

        document.getElementById('userSortField')?.addEventListener('change', (e) => {
            this.pagination.sortField = e.target.value;
            this.pagination.currentPage = 0;
            this.loadUsers();
        });

        document.getElementById('userSortDirection')?.addEventListener('change', (e) => {
            this.pagination.sortDirection = e.target.value;
            this.pagination.currentPage = 0;
            this.loadUsers();
        });

        document.getElementById('prevPageBtnUsers')?.addEventListener('click', () => {
            if (this.pagination.currentPage > 0) {
                this.pagination.currentPage--;
                this.loadUsers();
            }
        });

        document.getElementById('nextPageBtnUsers')?.addEventListener('click', () => {
            if (this.pagination.currentPage < this.pagination.totalPages - 1) {
                this.pagination.currentPage++;
                this.loadUsers();
            }
        });
    }

    /**
     * Loads and displays user profile
     * - Fetches current user data
     * - Populates profile form
     * - Shows errors if any
     * - Used in profile section
     */
    async loadProfile() {
        try {
            const profile = await UserService.getProfile();
            document.getElementById('profileName').value = profile.nombre;
            document.getElementById('profileEmail').value = profile.email;
        } catch (error) {
            UiUtils.showError('Error loading profile: ' + error.message);
        }
    }

    /**
     * Updates user profile
     * - Validates form data
     * - Sends update request
     * - Updates UI on success
     * - Shows feedback messages
     * - Updates stored user name
     * @param {Event} event - Form submit event
     */
    async updateProfile(event) {
        event.preventDefault();
        
        const profileData = {
            nombre: document.getElementById('profileName').value,
            nuevoEmail: document.getElementById('profileEmail').value
        };

        try {
            await UserService.updateProfile(profileData);
            UiUtils.showSuccess('Profile updated successfully!');
            localStorage.setItem('userEmail', profileData.nuevoEmail);
            document.getElementById('userEmail').textContent = profileData.nombre;
        } catch (error) {
            UiUtils.showError('Error updating profile: ' + error.message);
        }
    }

    /**
     * Changes user password
     * - Validates password match
     * - Sends change request
     * - Clears form on success
     * - Shows feedback
     * - Updates auth token
     * @param {Event} event - Form submit event
     */
    async changePassword(event) {
        event.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            UiUtils.showError('New passwords do not match');
            return;
        }

        const passwordData = {
            currentPassword,
            newPassword,
            confirmPassword
        };

        try {
            await AuthService.changePassword(passwordData);
            UiUtils.showSuccess('Password changed successfully!');
            document.getElementById('passwordForm').reset();
        } catch (error) {
            UiUtils.showError('Error changing password: ' + error.message);
        }
    }

    /**
     * Loads and displays user list
     * - Admin only function
     * - Fetches all users
     * - Creates user table
     * - Adds role controls
     * - Shows errors if any
     */
    async loadUsers() {
        try {
            const response = await UserService.listUsers(this.pagination.getParams());
            this.pagination.updateFromResponse(response);
            this.displayUsers(response.content);
            this.pagination.updatePaginationInfo(
                'usersRange',
                'usersTotal',
                'prevPageBtnUsers',
                'nextPageBtnUsers',
                'pageNumbersUsers'
            );
        } catch (error) {
            UiUtils.showError('Error loading users: ' + error.message);
        }
    }

    /**
     * Displays user list in admin panel
     * @private
     * @param {Array} users - List of users to display
     */
    displayUsers(users) {
        const tbody = document.getElementById('adminUsersList');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            const toggleButton = document.createElement('button');
            toggleButton.className = 'btn btn-sm btn-outline-danger';
            toggleButton.textContent = 'Change Role';
            toggleButton.addEventListener('click', () => this.toggleRole(user.id, user.rol));

            row.innerHTML = `
                <td>${user.nombre}</td>
                <td>${user.email}</td>
                <td>${user.rol}</td>
                <td>${new Date(user.fechaCreacion).toLocaleString()}</td>
                <td></td>
            `;
            row.querySelector('td:last-child').appendChild(toggleButton);
            tbody.appendChild(row);
        });
    }

    /**
     * Shows modal for adding new admin user
     * - Resets form
     * - Shows modal
     * - Prepares for user creation
     * - Admin only function
     */
    showAddUserModal() {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        form.reset();
        document.getElementById('userModalTitle').textContent = 'Add Admin User';
        document.getElementById('userId').value = '';
        document.getElementById('userPassword').required = true;
        new bootstrap.Modal(modal).show();
    }

    /**
     * Saves new admin user
     */
    async saveUser() {
        const userData = {
            nombre: document.getElementById('userName').value,
            email: document.getElementById('newUserEmail').value,
            password: document.getElementById('userPassword').value
        };

        try {
            await UserService.createAdminUser(userData);
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            UiUtils.showSuccess('User saved successfully!');
            this.loadUsers();
        } catch (error) {
            UiUtils.showError('Error saving user: ' + error.message);
        }
    }

    /**
     * Toggles user role between ADMIN and USER
     * @param {number} userId - User ID
     * @param {string} currentRole - Current user role
     */
    async toggleRole(userId, currentRole) {
        if (!confirm('Are you sure you want to change this user\'s role?')) {
            return;
        }

        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        try {
            await UserService.changeRole(userId, newRole);
            UiUtils.showSuccess('User role updated successfully!');
            this.loadUsers();
        } catch (error) {
            UiUtils.showError('Error updating user role: ' + error.message);
        }
    }
}

export const userComponent = new UserComponent(); 