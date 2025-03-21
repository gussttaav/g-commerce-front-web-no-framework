import { purchaseComponent } from './purchase.component.js';

/**
 * Component to handle shopping cart functionality
 * Manages:
 * - Cart state and storage
 * - Product addition/removal
 * - Quantity updates
 * - Total calculation
 * - Cart UI rendering
 * - Checkout process
 */
class CartComponent {
    constructor() {
        this.selectedProducts = new Map();
        document.addEventListener('DOMContentLoaded', () => {
            this.loadCartFromStorage();
            this.initializeEventListeners();
        });
    }

    /**
     * Loads cart data from localStorage
     * Called on initialization
     * @private
     */
    loadCartFromStorage() {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            const cartItems = JSON.parse(storedCart);
            this.selectedProducts = new Map(cartItems);
            this.updateCartCount();
        }
    }

    /**
     * Saves cart data to localStorage
     * Called after any cart modification
     * @private
     */
    saveCartToStorage() {
        try {
            // Convert Map to array of entries for JSON serialization
            const cartData = JSON.stringify(Array.from(this.selectedProducts.entries()));
            localStorage.setItem('cartItems', cartData);
        } catch (e) {
            console.error('Error saving cart to storage:', e);
        }
    }

    /**
     * Adds a product to the cart
     * - Checks if product already exists
     * - Updates quantity if exists
     * - Adds new item if not
     * - Updates cart badge
     * - Shows success message
     * @param {Object} product - Product to add
     * @param {number} quantity - Quantity to add
     */
    addProduct(product, quantity) {
        if (quantity < 1) {
            throw new Error('Quantity must be greater than 0');
        }

        if (this.selectedProducts.has(product.id)) {
            const currentItem = this.selectedProducts.get(product.id);
            this.selectedProducts.set(product.id, {
                ...currentItem,
                quantity: currentItem.quantity + quantity
            });
        } else {
            this.selectedProducts.set(product.id, {
                ...product,
                quantity
            });
        }

        this.saveCartToStorage();
        this.updateCartCount();
    }

    /**
     * Updates the quantity of a product in the cart
     * - Validates new quantity
     * - Updates total price
     * - Re-renders cart
     * - Removes product if quantity is 0
     * @param {number} productId - Product ID
     * @param {number} newQuantity - New quantity
     */
    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            throw new Error('Quantity must be greater than 0');
        }

        const item = this.selectedProducts.get(productId);
        if (item) {
            this.selectedProducts.set(productId, {
                ...item,
                quantity: newQuantity
            });
            this.saveCartToStorage();
            this.updateCartCount();
        }
    }

    /**
     * Removes a product from the cart
     * - Removes entire product entry
     * - Updates cart badge
     * - Re-renders cart if modal open
     * - Shows feedback message
     * @param {number} productId - ID of product to remove
     */
    removeProduct(productId) {
        this.selectedProducts.delete(productId);
        this.saveCartToStorage();
        this.updateCartCount();
    }

    /**
     * Calculates the total price of items in cart
     * - Sums all product prices
     * - Multiplies by quantities
     * - Returns formatted total
     * - Used in cart display and checkout
     * @returns {number} Total cart value
     */
    calculateTotal() {
        let total = 0;
        this.selectedProducts.forEach(item => {
            total += item.precio * item.quantity;
        });
        return total;
    }

    /**
     * Updates the cart count display
     */
    updateCartCount() {
        const count = Array.from(this.selectedProducts.values())
            .reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
        this.renderCartModal();
    }

    /**
     * Renders the cart modal content
     * - Creates product list HTML
     * - Shows empty cart message if needed
     * - Updates total price
     * - Handles quantity controls
     * - Uses Bootstrap modal
     */
    renderCartModal() {
        const tbody = document.getElementById('cartItems');
        const totalElement = document.getElementById('cartTotal');
        tbody.innerHTML = '';

        this.selectedProducts.forEach((item, productId) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td>$${item.precio}</td>
                <td>
                    <div class="input-group input-group-sm" style="width: 120px">
                        <button class="btn btn-outline-secondary quantity-decrease" 
                                data-product-id="${productId}">-</button>
                        <input type="number" class="form-control text-center quantity-input" 
                               value="${item.quantity}" min="1" 
                               data-product-id="${productId}">
                        <button class="btn btn-outline-secondary quantity-increase"
                                data-product-id="${productId}">+</button>
                    </div>
                </td>
                <td>$${(item.precio * item.quantity).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-product" 
                            data-product-id="${productId}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        totalElement.textContent = this.calculateTotal().toFixed(2);
    }

    /**
     * Clears the cart
     * - Empties products array
     * - Updates cart badge
     * - Called after successful purchase
     * - Called on logout
     */
    clear() {
        this.selectedProducts.clear();
        localStorage.removeItem('cartItems');
        this.updateCartCount();
    }

    /**
     * Initializes cart event listeners
     * @private
     */
    initializeEventListeners() {
        // Cart modal buttons
        document.getElementById('proceedToCheckoutBtn')?.addEventListener('click', () => {
            bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
            purchaseComponent.showCheckoutModal();
        });

        // Cart item controls
        document.getElementById('cartItems')?.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('[data-product-id]')?.dataset.productId);
            if (!productId) return;

            if (e.target.matches('.quantity-decrease')) {
                const item = this.selectedProducts.get(productId);
                if (item) this.updateQuantity(productId, item.quantity - 1);
            }
            else if (e.target.matches('.quantity-increase')) {
                const item = this.selectedProducts.get(productId);
                if (item) this.updateQuantity(productId, item.quantity + 1);
            }
            else if (e.target.closest('.remove-product')) {
                this.removeProduct(productId);
            }
        });

        // Handle quantity input changes
        document.getElementById('cartItems')?.addEventListener('change', (e) => {
            if (e.target.matches('.quantity-input')) {
                const productId = parseInt(e.target.dataset.productId);
                this.updateQuantity(productId, parseInt(e.target.value));
            }
        });
    }

    /**
     * Gets all products in cart
     * - Returns copy of products array
     * - Used for checkout
     * - Used for cart rendering
     * @returns {Array} List of products
     */
    getProducts() {
        return Array.from(this.selectedProducts.values());
    }
}

export const cart = new CartComponent();