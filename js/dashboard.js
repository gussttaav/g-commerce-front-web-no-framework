import { AuthService } from './services/auth.service.js';
import { ThemeUtils } from './utils/theme.utils.js';
import { productComponent } from './components/product.component.js';
import { userComponent } from './components/user.component.js';
import { purchaseComponent } from './components/purchase.component.js';
import { cart } from './components/cart.component.js';

/**
 * Main dashboard controller that orchestrates all components
 * Manages:
 * - Application initialization
 * - Authentication checks
 * - Navigation handling
 * - Component coordination
 * - Role-based UI
 * - Theme management
 */
class DashboardController {
    constructor() {
        // Wait for DOM to be loaded before initializing
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });
    }

    /**
     * Initializes the dashboard application
     * - Waits for DOM load
     * - Sets up initial state
     * - Checks authentication
     * - Loads appropriate data
     */
    async initializeApp() {
        ThemeUtils.initialize();
        this.checkAuth();
        this.initializeNavigation();
        await this.loadInitialData();
    }

    /**
     * Checks user authentication and sets up UI accordingly
     * - Validates JWT token
     * - Redirects if not authenticated
     * - Sets up user info display
     * - Configures UI based on role
     * - Called on initialization
     */
    async checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        // Validate token with server
        try {
            const isValid = await AuthService.validateToken();
            if (!isValid) {
                AuthService.logout();
                return;
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            AuthService.logout();
            return;
        }

        const userRole = localStorage.getItem('userRole');
        document.getElementById('userEmail').textContent = localStorage.getItem('userName');

        this.setupUIByRole(userRole);
    }

    /**
     * Sets up UI elements based on user role
     * - Shows/hides admin features
     * - Shows/hides user features
     * @private
     * @param {string} userRole - User's role
     */
    setupUIByRole(userRole) {
        document.querySelectorAll('.user-only').forEach(el => {
            if (el.classList.contains('d-flex')) {
                el.style.setProperty("display", userRole === "USER" ? "flex" : "none", "important");
            } else {
                el.style.setProperty("display", userRole === "USER" ? "block" : "none", "important");
            }
        });
    
        // Handle admin-only elements
        document.querySelectorAll('.admin-only').forEach(el => {
            if (el.classList.contains('d-flex')) {
                el.style.setProperty("display", userRole === "ADMIN" ? "flex" : "none", "important");
            } else {
                el.style.setProperty("display", userRole === "ADMIN" ? "block" : "none", "important");
            }
        });
    }
    

    /**
     * Initializes all event listeners
     * - Sets up navigation handlers
     * - Manages section switching
     * - Handles theme toggling
     * - Controls cart operations
     * - Manages logout process
     * @private
     */
    initializeNavigation() {
        // Navigation events
        document.getElementById('productsLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('products');
            document.getElementById('purchasesLink').classList.remove('active');
            document.getElementById('productsLink').classList.add('active');
        });

        document.getElementById('purchasesLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('purchases');
            document.getElementById('productsLink').classList.remove('active');
            document.getElementById('purchasesLink').classList.add('active');
            purchaseComponent.loadPurchases();
        });

        document.getElementById('adminProductsLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('adminProducts');
            document.getElementById('adminUsersLink').classList.remove('active');
            document.getElementById('adminProductsLink').classList.add('active');
            productComponent.loadProducts('ALL');
        });

        document.getElementById('adminUsersLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('adminUsers');
            document.getElementById('adminProductsLink').classList.remove('active');
            document.getElementById('adminUsersLink').classList.add('active');
            userComponent.loadUsers();
        });

        // Navbar brand (logo) click
        document.querySelector('.navbar-brand')?.addEventListener('click', (e) => {
            e.preventDefault();
            const userRole = localStorage.getItem('userRole');
            
            if (userRole === 'USER') {
                // Si es usuario normal, mostrar sección de productos
                this.showSection('products');
                document.getElementById('purchasesLink')?.classList.remove('active');
                document.getElementById('productsLink')?.classList.add('active');
            } else if (userRole === 'ADMIN') {
                // Si es administrador, mostrar sección de administración de productos
                this.showSection('adminProducts');
                document.getElementById('adminUsersLink')?.classList.remove('active');
                document.getElementById('adminProductsLink')?.classList.add('active');
                productComponent.loadProducts('ALL');
            }
        });

        document.getElementById('profileLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('profile');
            userComponent.loadProfile();
        });

        document.getElementById('changePasswordLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('password');
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', ThemeUtils.toggle.bind(ThemeUtils));

        // Logout
        document.getElementById('logoutLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
        });

        // Status filter for products
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            productComponent.loadProducts(e.target.value);
        });

        // Cart button
        document.getElementById('cartButton')?.addEventListener('click', (e) => {
            e.preventDefault();
            cart.renderCartModal();
            new bootstrap.Modal(document.getElementById('cartModal')).show();
        });
    }

    /**
     * Shows the specified section and hides others
     * - Updates active section
     * - Manages navigation state
     * - Updates UI visibility
     * - Loads section data if needed
     * - Handles transitions
     * @private
     * @param {string} sectionName - Name of section to show
     */
    showSection(sectionName) {
        const sections = {
            products: 'productsSection',
            purchases: 'purchasesSection',
            adminProducts: 'adminSection',
            adminUsers: 'adminUsersSection',
            profile: 'profileSection',
            password: 'passwordSection'
        };

        Object.values(sections).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('d-none');
                el.style.display = 'none';
            }
        });
    
        const targetEl = document.getElementById(sections[sectionName]);
        if (targetEl) {
            targetEl.classList.remove('d-none');
            targetEl.style.display = '';
        }
    }

    /**
     * Loads initial data based on user role
     * - Loads products for users
     * - Loads admin data if admin
     * - Sets up initial view
     * - Handles loading errors
     * - Called after initialization
     * @private
     */
    async loadInitialData() {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'USER') {
            await productComponent.loadProducts();
        } else if (userRole === 'ADMIN') {
            await productComponent.loadProducts('ALL');
        }
    }
}

// Initialize dashboard
const dashboard = new DashboardController();