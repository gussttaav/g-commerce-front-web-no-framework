import { ProductService } from '../services/product.service.js';
import { UiUtils } from '../utils/ui.utils.js';
import { cart } from './cart.component.js';
import { PaginationUtils } from '../utils/pagination.utils.js';

/**
 * Component to handle product-related UI and operations
 * Manages:
 * - Product listing and display
 * - Product creation (admin)
 * - Product updates (admin)
 * - Product status toggling
 * - Cart integration
 * - Different views for admin/user
 */
class ProductComponent {
    constructor() {
        this.products = [];
        this.selectedProducts = new Set();
        this.searchTerm = '';
        
        // Initialize pagination for admin view
        this.adminPagination = new PaginationUtils();
        this.adminPagination.sortField = 'name';
        this.adminPagination.onPageChange = () => this.loadProducts(this.getProductStatusFilter());
        
        // Initialize pagination for user view
        this.userPagination = new PaginationUtils();
        this.userPagination.sortField = 'name';
        this.userPagination.onPageChange = () => this.loadProducts(this.getProductStatusFilter());
        
        this.initializeEventListeners();
    }

    /**
     * Initializes all event listeners for the component
     * Handles both admin and user interface events
     * @private
     */
    initializeEventListeners() {
        this.initializeFilterListeners();
        this.initializePaginationListeners();
        this.initializeSearchListeners();
        this.initializeAdminActionListeners();
    }

    /**
     * Initializes filter-related event listeners
     * @private
     */
    initializeFilterListeners() {
        // Status filter (admin only)
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.adminPagination.currentPage = 0;
            this.loadProducts(e.target.value);
        });

        // Sort fields
        document.getElementById('sortField')?.addEventListener('change', (e) => {
            this.adminPagination.sortField = e.target.value;
            this.adminPagination.currentPage = 0;
            this.loadProducts(this.getProductStatusFilter());
        });

        document.getElementById('sortFieldUser')?.addEventListener('change', (e) => {
            this.userPagination.sortField = e.target.value;
            this.userPagination.currentPage = 0;
            this.loadProducts(this.getProductStatusFilter());
        });

        // Sort direction
        document.getElementById('sortDirection')?.addEventListener('change', (e) => {
            this.adminPagination.sortDirection = e.target.value;
            this.adminPagination.currentPage = 0;
            this.loadProducts(this.getProductStatusFilter());
        });

        document.getElementById('sortDirectionUser')?.addEventListener('change', (e) => {
            this.userPagination.sortDirection = e.target.value;
            this.userPagination.currentPage = 0;
            this.loadProducts(this.getProductStatusFilter());
        });

        // Page size
        document.getElementById('pageSize')?.addEventListener('change', (e) => {
            this.adminPagination.pageSize = parseInt(e.target.value);
            this.adminPagination.currentPage = 0;
            this.loadProducts(this.getProductStatusFilter());
        });

        document.getElementById('pageSizeUser')?.addEventListener('change', (e) => {
            this.userPagination.pageSize = parseInt(e.target.value);
            this.userPagination.currentPage = 0;
            this.loadProducts(this.getProductStatusFilter());
        });

        // Category filters (user only)
        document.querySelectorAll('.categories-filter button')?.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.categories-filter button').forEach(btn => 
                    btn.classList.remove('active'));
                button.classList.add('active');
                this.loadProducts(this.getProductStatusFilter());
            });
        });
    }

    /**
     * Initializes pagination-related event listeners
     * @private
     */
    initializePaginationListeners() {
        // Previous page - Admin
        document.getElementById('prevPageBtn')?.addEventListener('click', () => {
            if (this.adminPagination.currentPage > 0) {
                this.adminPagination.currentPage--;
                this.loadProducts(this.getProductStatusFilter());
            }
        });

        // Next page - Admin
        document.getElementById('nextPageBtn')?.addEventListener('click', () => {
            if (this.adminPagination.currentPage < this.adminPagination.totalPages - 1) {
                this.adminPagination.currentPage++;
                this.loadProducts(this.getProductStatusFilter());
            }
        });

        // Previous page - User
        document.getElementById('prevPageBtnUser')?.addEventListener('click', () => {
            if (this.userPagination.currentPage > 0) {
                this.userPagination.currentPage--;
                this.loadProducts(this.getProductStatusFilter());
            }
        });

        // Next page - User
        document.getElementById('nextPageBtnUser')?.addEventListener('click', () => {
            if (this.userPagination.currentPage < this.userPagination.totalPages - 1) {
                this.userPagination.currentPage++;
                this.loadProducts(this.getProductStatusFilter());
            }
        });
    }

    /**
     * Initializes search-related event listeners
     * @private
     */
    initializeSearchListeners() {
        ['searchAdmin', 'searchUser'].forEach(id => {
            const searchInput = document.getElementById(id);
            if (searchInput) {
                // Debounce search input
                let timeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.searchTerm = e.target.value;
                        const pagination = id === 'searchAdmin' ? this.adminPagination : this.userPagination;
                        pagination.currentPage = 0; // Reset to first page on search
                        this.loadProducts(this.getProductStatusFilter());
                    }, 300);
                });

                // Limpiar búsqueda cuando el campo esté vacío
                searchInput.addEventListener('search', (e) => {
                    if (e.target.value === '') {
                        this.searchTerm = '';
                        const pagination = id === 'searchAdmin' ? this.adminPagination : this.userPagination;
                        pagination.currentPage = 0;
                        this.loadProducts(this.getProductStatusFilter());
                    }
                });
            }
        });
    }

    /**
     * Initializes admin-specific action listeners
     * @private
     */
    initializeAdminActionListeners() {
        // Select all products
        document.getElementById('selectAllProducts')?.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#adminProductsList input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                this.toggleProductSelection(checkbox.dataset.productId, e.target.checked);
            });
        });

        // Product form
        document.getElementById('productForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Add Product button
        document.getElementById('addProductButton')?.addEventListener('click', () => {
            this.showEditModal();
        });

        // Delete confirmation
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
            this.deleteSelectedProducts();
        });
    }

    /**
     * Toggles selection of a product in admin view
     * @param {string} productId - Product ID
     * @param {boolean} selected - Whether the product is selected
     * @private
     */
    toggleProductSelection(productId, selected) {
        if (selected) {
            this.selectedProducts.add(productId);
        } else {
            this.selectedProducts.delete(productId);
        }
        this.updateBulkActionButtons();
    }

    /**
     * Updates the state of bulk action buttons based on selection
     * @private
     */
    updateBulkActionButtons() {
        const hasSelection = this.selectedProducts.size > 0;
        // Update bulk action buttons state here
    }

    /**
     * Gets the current product status filter
     * - For regular users, always returns 'ACTIVE'
     * - For admin users, gets the value from status selector
     * - If no value is selected, defaults to 'ALL'
     * - Used in pagination and sorting to maintain filter state
     * @returns {string} Filter status ('ACTIVE', 'INACTIVE', 'ALL')
     */
    getProductStatusFilter() {
        let productStatusFilter = 'ACTIVE';
        if (localStorage.getItem('userRole') === 'ADMIN') {
            productStatusFilter = document.getElementById('statusFilter')?.value || 'ALL';
        }
        return productStatusFilter;
    }

    /**
     * Loads and displays products
     * - Fetches products by status
     * - Different displays for admin/user
     * - Handles loading states
     * - Shows errors if any
     * - Adds interactive controls
     * @param {string} status - Product status filter
     */
    async loadProducts(status = 'ACTIVE') {
        try {
            const isAdmin = localStorage.getItem('userRole') === 'ADMIN';
            const pagination = isAdmin ? this.adminPagination : this.userPagination;
            const userAuthenticated = localStorage.getItem('userEmail') ? true : false;
            
            const response = await ProductService.getProducts({
                status,
                ...pagination.getParams(),
                searchText: this.searchTerm,
                authenticated: userAuthenticated
            });

            this.products = response.content;
            pagination.updateFromResponse(response);
            
            if (isAdmin) {
                this.displayAdminProducts();
            } else {
                this.displayUserProducts();
            }

            // Update pagination UI
            pagination.updatePaginationInfo(
                isAdmin ? 'itemsRange' : 'itemsRangeUser',
                isAdmin ? 'totalItems' : 'totalItemsUser',
                isAdmin ? 'prevPageBtn' : 'prevPageBtnUser',
                isAdmin ? 'nextPageBtn' : 'nextPageBtnUser',
                isAdmin ? 'pageNumbers' : 'pageNumbersUser'
            );

            // Actualizar el estado de los campos de búsqueda
            const searchInput = document.getElementById(isAdmin ? 'searchAdmin' : 'searchUser');
            if (searchInput) {
                searchInput.value = this.searchTerm;
            }
        } catch (error) {
            UiUtils.showError('Error loading products: ' + error.message);
        }
    }

    /**
     * Displays products in user view
     * - Creates product cards
     * - Shows prices and descriptions
     * - Adds cart controls
     * - Responsive grid layout
     * @private
     */
    displayUserProducts() {
        const container = document.getElementById('productsList');
        container.innerHTML = '';

        this.products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text flex-grow-1">${product.description || 'No description available'}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <h6 class="price-tag mb-0">$${product.price.toFixed(2)}</h6>
                            <div class="input-group input-group-sm"">
                                <button class="btn btn-outline-secondary quantity-btn" data-action="decrease">-</button>
                                <input type="number" class="form-control text-center quantity-input" value="1" min="1" max="99" readonly>
                                <button class="btn btn-outline-secondary quantity-btn" data-action="increase">+</button>
                                <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
                                    <i class="bi bi-cart-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Agregar event listeners después de crear el elemento
            const quantityInput = card.querySelector('.quantity-input');
            const quantityBtns = card.querySelectorAll('.quantity-btn');
            const addToCartBtn = card.querySelector('.add-to-cart-btn');

            quantityBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const currentValue = parseInt(quantityInput.value);
                    if (btn.dataset.action === 'increase' && currentValue < 99) {
                        quantityInput.value = currentValue + 1;
                    } else if (btn.dataset.action === 'decrease' && currentValue > 1) {
                        quantityInput.value = currentValue - 1;
                    }
                });
            });

            addToCartBtn.addEventListener('click', () => {
                this.quickAddToCart(product.id, addToCartBtn);
            });

            container.appendChild(card);
        });
    }

    /**
     * Displays products in admin view with enhanced table
     * @private
     */
    displayAdminProducts() {
        const tbody = document.getElementById('adminProductsList');
        tbody.innerHTML = '';

        this.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.description || 'No description'}</td>
                <td>$${product.price}</td>
                <td>
                    <div class="form-check form-switch">
                        <input type="checkbox" class="form-check-input status-toggle" 
                               data-product-id="${product.id}"
                               ${product.active ? 'checked' : ''}>
                    </div>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary edit-product" data-product-id="${product.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </div>
                </td>
            `;

            // Agregar event listeners
            const statusToggle = row.querySelector('.status-toggle');
            statusToggle.addEventListener('change', (e) => {
                this.toggleStatus(product.id, Boolean(e.target.checked));
            });

            const editButton = row.querySelector('.edit-product');
            editButton.addEventListener('click', () => {
                this.showEditModal(product.id);
            });

            tbody.appendChild(row);
        });
    }

    /**
     * Shows modal for adding/editing product
     * - Resets form for new product
     * - Populates form for edit
     * - Sets modal title
     * - Prepares validation
     * - Admin only function
     * @param {Object} [product] - Product to edit (if editing)
     */
    async showEditModal(productId = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        form.reset();
        if (productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                title.textContent = 'Edit Product';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productPrice').value = product.price;
            }
        } else {
            title.textContent = 'Add Product';
            document.getElementById('productId').value = '';
        }

        new bootstrap.Modal(modal).show();
    }

    /**
     * Saves product (create/update)
     * - Validates form data
     * - Creates or updates product
     * - Refreshes product list
     * - Shows feedback
     * - Closes modal on success
     */
    async saveProduct() {
        const productId = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            active: true
        };

        try {
            if (productId) {
                const existingProduct = this.products.find(p => p.id === parseInt(productId));
                if (existingProduct) {
                    productData.active = existingProduct.active;
                }
                await ProductService.updateProduct(productId, productData);
            } else {
                await ProductService.createProduct(productData);
            }

            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            UiUtils.showSuccess('Product saved successfully!');
            this.loadProducts(document.getElementById('statusFilter').value);
        } catch (error) {
            UiUtils.showError('Error saving product: ' + error.message);
        }
    }

    /**
     * Toggles product status
     * - Switches active/inactive
     * - Updates UI immediately
     * - Shows confirmation
     * - Handles errors
     * - Admin only function
     * @param {number} productId - Product ID
     * @param {boolean} currentStatus - Current product status
     */
    async toggleStatus(productId, isActive) {
        try {
            // Obtener el producto del array local
            let product = this.products.find(p => p.id === productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            await ProductService.toggleStatus(product, isActive);
            UiUtils.showSuccess(`Product ${isActive ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            UiUtils.showError('Error updating product status: ' + error.message);
            // Encontrar el switch específico y revertir su estado
            const statusToggle = document.querySelector(`.status-toggle[data-product-id="${productId}"]`);
            if (statusToggle) {
                statusToggle.checked = !isActive;
            }
        }
    }

    /**
     * Shows delete confirmation modal
     * @param {number} productId - Product ID to delete
     */
    showDeleteConfirmation(productId) {
        this.selectedProducts.clear();
        this.selectedProducts.add(productId);
        const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
        modal.show();
    }

    /**
     * Deletes selected products
     * @private
     */
    async deleteSelectedProducts() {
        try {
            for (const productId of this.selectedProducts) {
                await ProductService.deleteProduct(productId);
            }
            
            UiUtils.showSuccess('Products deleted successfully');
            this.selectedProducts.clear();
            this.loadProducts(this.getProductStatusFilter());
            
            bootstrap.Modal.getInstance(document.getElementById('deleteProductModal')).hide();
        } catch (error) {
            UiUtils.showError('Error deleting products: ' + error.message);
        }
    }

    /**
     * Quick add to cart with default quantity (1)
     * @param {number} productId - Product ID
     * @param {HTMLElement} button - Button element that triggered the action
     */
    quickAddToCart(productId, button) {
        const product = this.products.find(p => p.id === productId);
        const quantityInput = button.parentElement.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value);

        try {
            cart.addProduct(product, quantity);
            UiUtils.showSuccess(`Added ${quantity} ${product.name} to cart`);
            quantityInput.value = '1'; // Reset quantity
        } catch (error) {
            UiUtils.showError(error.message);
        }
    }
}

export const productComponent = new ProductComponent(); 