import { ApiService } from './api.service.js';

/**
 * Service to handle product-related operations
 * Manages:
 * - Product listing with status filtering, pagination, and sorting
 * - Product creation
 * - Product updates
 * - Product status toggling
 * All operations require authentication except getProducts
 */
class ProductService {
    /**
     * Fetches products based on status and pagination parameters
     * - Supports filtering by ALL, ACTIVE, INACTIVE
     * - Returns paginated product list
     * - Used in both user and admin views
     * - No authentication required
     * @param {Object} options - Query options
     * @param {string} options.status - Product status filter ('ALL', 'ACTIVE', 'INACTIVE')
     * @param {number} options.page - Page number (zero-based)
     * @param {number} options.size - Page size
     * @param {string} options.sort - Sort field
     * @param {string} options.direction - Sort direction ('ASC', 'DESC')
     * @param {string} options.searchText - Search text
     * @returns {Promise<Object>} Paginated list of products
     */
    static async getProducts({
        status = 'ACTIVE',
        page = 0,
        size = 10,
        sort = 'name',
        direction = 'ASC',
        searchText = '',
        authenticated = false
    } = {}) {
        return ApiService.get('/products', {
            status,
            page,
            size,
            sort,
            direction,
            searchText
        }, authenticated); // false indicates that authentication is not required
    }

    /**
     * Creates a new product
     * - Admin only operation
     * - Validates product data
     * - Creates product in database
     * - Returns created product details
     * @param {Object} productData - Product information
     * @returns {Promise<Object>} Created product
     */
    static async createProduct(productData) {
        return ApiService.post('/products', productData);
    }

    /**
     * Updates an existing product
     * - Admin only operation
     * - Updates all product fields
     * - Validates product existence
     * - Returns updated product
     * @param {number} productId - Product ID
     * @param {Object} productData - Updated product information
     * @returns {Promise<Object>} Updated product
     */
    static async updateProduct(productId, productData) {
        return ApiService.put(`/products/${productId}`, productData);
    }

    /**
     * Toggles product status
     * - Switches between active/inactive
     * - Admin only operation
     * - Updates only status field
     * @param {Object} product - The product to be updated
     * @param {boolean} isActive - New status
     * @returns {Promise<Object>} Updated product
     */
    static async toggleStatus(product, isActive) {
        return this.updateProduct(product.id, {
            ...product,
            active: isActive
        });
    }
}

export { ProductService }; 