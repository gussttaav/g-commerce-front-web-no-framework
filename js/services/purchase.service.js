import { ApiService } from './api.service.js';

/**
 * Service to handle purchase-related operations
 * Manages:
 * - Purchase creation
 * - Purchase history retrieval with pagination and sorting by date
 * - Purchase data formatting
 * All operations require authentication
 * Integrates with cart data
 */
export class PurchaseService {
    /**
     * Fetches user's purchase history
     * - Gets all user purchases paginated
     * - Includes purchase details
     * - Shows product information
     * - Includes dates and totals
     * - Ordered by date desc
     * @param {Object} params - Pagination parameters
     * @returns {Promise} Purchase history data
     */
    static async getPurchaseHistory(params = {}) {
        return ApiService.get('/compras/listar', params);
    }

    /**
     * Creates a new purchase
     * - Validates product list
     * - Formats purchase data
     * - Creates purchase record
     * - Requires authenticated user
     * - Used in checkout process
     * @param {Array} products - List of products with quantities
     * @returns {Promise<Object>} Purchase confirmation
     */
    static async createPurchase(products) {
        const purchaseData = {
            productos: products.map(item => ({
                productoId: item.id,
                cantidad: item.quantity
            }))
        };

        return ApiService.post('/compras/nueva', purchaseData);
    }
} 