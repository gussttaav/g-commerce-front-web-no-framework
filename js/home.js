import { ThemeUtils } from './utils/theme.utils.js';
import { AuthService } from './services/auth.service.js';
import { cart } from './components/cart.component.js';
import { productComponent } from './components/product.component.js';

/**
 * Show products and handle authentication and user registration
 * Includes:
 * - User login
 * - New user registration
 * - Product display for non-authenticated users
 * - Pagination and search
 */
class AuthController {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });
    }

    /**
     * Initializes the authentication application
     * - Sets up theme management
     * - Initializes all event listeners
     * - Load and display the products
     */
    async initializeApp() {
        ThemeUtils.initialize();
        this.initializeEventListeners();
        await productComponent.loadProducts();
    }

    /**
     * Sets up all event listeners for the auth page
     * Includes:
     * - Theme toggle button
     * - Login form submission
     * - Registration form submission
     * - Cart button
     */
    initializeEventListeners() {
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', ThemeUtils.toggle.bind(ThemeUtils));

        // Cart button
        document.getElementById('cartButton')?.addEventListener('click', (e) => {
            e.preventDefault();
            cart.renderCartModal();
            new bootstrap.Modal(document.getElementById('cartModal')).show();
        });

        // Proceed to checkout button
        document.getElementById('proceedToCheckoutBtn')?.addEventListener('click', () => {
            bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
            this.showSection('login');
        });

        // Register button
        document.getElementById('registerBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('register');
        });

        // Login button
        document.getElementById('loginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('login');
        });

        // User login button
        document.getElementById('userLoginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('login');
        });

        // Logo click
        document.querySelector('.navbar-brand')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('products');
        });
    }

    /**
     * Shows the specified section and hides others
     * @private
     * @param {string} sectionName - Name of section to show
     */
    showSection(sectionName) {
        const sections = {
            products: 'productsSection',
            login: 'loginForm',
            register: 'registerForm'
        };

        Object.values(sections).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('d-none');
            }
        });

        const targetEl = document.getElementById(sections[sectionName]);
        if (targetEl) {
            targetEl.classList.remove('d-none');
        }
    }

    /**
     * Handles login form submission
     * Attempts to authenticate the user
     * On success:
     * - Redirects to dashboard
     * On error:
     * - Shows error message in login alert
     */
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await AuthService.login(email, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            const loginAlert = document.getElementById('loginAlert');
            loginAlert.textContent = error.message;
            loginAlert.classList.remove('d-none');
        }
    }

    /**
     * Handles the registration process
     */
    async handleRegister() {
        const registerAlert = document.getElementById('registerAlert');
        registerAlert.classList.add('d-none');

        try {
            const userData = {
                nombre: document.getElementById('reg-nombre').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value
            };
            await AuthService.register(userData);
            
            // Clear form and switch to login view
            document.getElementById('register-form').reset();
            toggleForms();
            
            // Show success message in login form
            const loginAlert = document.getElementById('loginAlert');
            loginAlert.classList.remove('d-none');
            loginAlert.className = loginAlert.className.replace('alert-danger', 'alert-success');
            loginAlert.textContent = 'Registration successful! Please login.';
        } catch (error) {
            registerAlert.textContent = error.message;
            registerAlert.classList.remove('d-none');
        }
    }
}

// Function to toggle between forms
window.toggleForms = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginAlert = document.getElementById('loginAlert');
    const registerAlert = document.getElementById('registerAlert');

    if (loginForm.classList.contains('d-none')) {
        loginForm.classList.remove('d-none');
        registerForm.classList.add('d-none');
        loginAlert.classList.add('d-none');
    } else {
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        registerAlert.classList.add('d-none');
    }
};

// Initialize the controller
const auth = new AuthController();