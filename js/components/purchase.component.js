import { PurchaseService } from '../services/purchase.service.js';
import { UiUtils } from '../utils/ui.utils.js';
import { cart } from './cart.component.js';
import { PaginationUtils } from '../utils/pagination.utils.js';

/**
 * Component to handle purchase-related UI and operations
 * Manages:
 * - Purchase history display
 * - Purchase creation
 * - Checkout process
 * - Purchase confirmation
 * Integrates with cart component
 */
class PurchaseComponent {
    constructor() {
        this.pagination = new PaginationUtils();
        this.pagination.sortField = 'fecha';
        this.pagination.onPageChange = () => this.loadPurchases();
        this.initializeEventListeners();
    }

    /**
     * Initializes purchase-related event listeners
     * @private
     */
    initializeEventListeners() {
        // Confirm purchase button
        document.getElementById('confirmPurchaseBtn')?.addEventListener('click', () => {
            this.confirmPurchase();
        });

        // Pagination controls
        document.getElementById('purchasePageSize')?.addEventListener('change', (e) => {
            this.pagination.pageSize = parseInt(e.target.value);
            this.pagination.currentPage = 0;
            this.loadPurchases();
        });

        document.getElementById('purchaseSortDirection')?.addEventListener('change', (e) => {
            this.pagination.sortDirection = e.target.value;
            this.pagination.currentPage = 0;
            this.loadPurchases();
        });

        document.getElementById('prevPageBtnPurchases')?.addEventListener('click', () => {
            if (this.pagination.currentPage > 0) {
                this.pagination.currentPage--;
                this.loadPurchases();
            }
        });

        document.getElementById('nextPageBtnPurchases')?.addEventListener('click', () => {
            if (this.pagination.currentPage < this.pagination.totalPages - 1) {
                this.pagination.currentPage++;
                this.loadPurchases();
            }
        });
    }

    /**
     * Loads and displays purchase history
     */
    async loadPurchases() {
        try {
            const purchases = await PurchaseService.getPurchaseHistory(this.pagination.getParams());
            this.pagination.updateFromResponse(purchases);
            this.displayPurchases(purchases.content);
            this.pagination.updatePaginationInfo(
                'purchasesRange',
                'purchasesTotal',
                'prevPageBtnPurchases',
                'nextPageBtnPurchases',
                'pageNumbersPurchases'
            );
        } catch (error) {
            UiUtils.showError('Error loading purchases: ' + error.message);
        }
    }

    /**
     * Displays purchase history in the UI
     * - Creates table rows for each purchase
     * - Shows purchase date and time
     * - Lists products and quantities
     * - Shows total amount
     * - Formats currency values
     * @private
     * @param {Array} purchases - List of purchases to display
     */
    displayPurchases(purchases) {
        const tbody = document.getElementById('purchasesList');
        tbody.innerHTML = '';

        purchases.forEach(purchase => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(purchase.fecha).toLocaleString()}</td>
                <td>
                    <ul class="list-unstyled">
                        ${purchase.productos.map(prod => 
                            `<li>${prod.productoNombre} x ${prod.cantidad} - $${prod.subtotal}</li>`
                        ).join('')}
                    </ul>
                </td>
                <td>$${purchase.total}</td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Shows checkout modal
     * - Displays cart contents
     * - Shows item details
     * - Calculates final total
     * - Uses Bootstrap modal
     * - Prepares for purchase confirmation
     */
    showCheckoutModal() {
        const detailsContainer = document.getElementById('purchaseDetails');
        const totalElement = document.getElementById('purchaseTotal');

        if(detailsContainer === null || totalElement === null){
            return;
        }
        
        detailsContainer.innerHTML = '';
        cart.getProducts().forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'mb-2';
            itemDiv.innerHTML = `
                <div class="d-flex justify-content-between">
                    <span>${item.nombre} x ${item.quantity}</span>
                    <span>$${(item.precio * item.quantity).toFixed(2)}</span>
                </div>
            `;
            detailsContainer.appendChild(itemDiv);
        });

        totalElement.textContent = cart.calculateTotal().toFixed(2);
        new bootstrap.Modal(document.getElementById('checkoutModal')).show();
    }

    /**
     * Processes the purchase confirmation
     * - Validates cart contents
     * - Creates purchase record
     * - Clears cart on success
     * - Shows confirmation message
     * - Updates purchase history
     * - Handles errors
     */
    async confirmPurchase() {
        UiUtils.showSpinner();
        try {
            const products = cart.getProducts();
            if (products.length === 0) {
                UiUtils.showError('Your cart is empty');
                return;
            }

            await PurchaseService.createPurchase(products);
            
            cart.clear();
            bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
            UiUtils.showSuccess('Purchase completed successfully!');
            this.loadPurchases();
        } catch (error) {
            UiUtils.showError('Error completing purchase: ' + error.message);
        } finally {
            UiUtils.hideSpinner();
        }
    }
}

export const purchaseComponent = new PurchaseComponent(); 