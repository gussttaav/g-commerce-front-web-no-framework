/**
 * Utility class for handling pagination logic
 * Provides common pagination functionality that can be reused across components
 */
export class PaginationUtils {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.totalPages = 0;
        this.totalElements = 0;
        this.sortField = '';
        this.sortDirection = 'ASC';
    }

    /**
     * Updates pagination information and controls in the UI
     * @param {string} rangeElementId - ID of element showing items range
     * @param {string} totalElementId - ID of element showing total items
     * @param {string} prevBtnId - ID of previous page button
     * @param {string} nextBtnId - ID of next page button
     * @param {string} pageNumbersId - ID of container for page numbers
     */
    updatePaginationInfo(rangeElementId, totalElementId, prevBtnId, nextBtnId, pageNumbersId) {
        const start = this.currentPage * this.pageSize + 1;
        const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);

        // Update range and total
        document.getElementById(rangeElementId).textContent = `${start}-${end}`;
        document.getElementById(totalElementId).textContent = this.totalElements;

        // Update buttons state
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        
        if (prevBtn) prevBtn.disabled = this.currentPage <= 0;
        if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages - 1;

        // Update page numbers
        const pageNumbersContainer = document.getElementById(pageNumbersId);
        if (pageNumbersContainer) {
            pageNumbersContainer.innerHTML = '';
            
            // Calculate page range to show
            let startPage = Math.max(0, this.currentPage - 2);
            let endPage = Math.min(this.totalPages - 1, startPage + 4);
            
            // Adjust start if we're near the end
            if (endPage - startPage < 4) {
                startPage = Math.max(0, endPage - 4);
            }

            // First page
            if (startPage > 0) {
                this.addPageButton(pageNumbersContainer, 0, '1');
                if (startPage > 1) {
                    this.addPageButton(pageNumbersContainer, null, '...');
                }
            }

            // Page numbers
            for (let i = startPage; i <= endPage; i++) {
                this.addPageButton(pageNumbersContainer, i, (i + 1).toString(), i === this.currentPage);
            }

            // Last page
            if (endPage < this.totalPages - 1) {
                if (endPage < this.totalPages - 2) {
                    this.addPageButton(pageNumbersContainer, null, '...');
                }
                this.addPageButton(pageNumbersContainer, this.totalPages - 1, this.totalPages.toString());
            }
        }
    }

    /**
     * Adds a page button to the pagination
     * @private
     * @param {HTMLElement} container - Container element
     * @param {number|null} pageNumber - Page number (null for ellipsis)
     * @param {string} text - Button text
     * @param {boolean} [isActive=false] - Whether the button is active
     */
    addPageButton(container, pageNumber, text, isActive = false) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn ${isActive ? 'btn-primary' : 'btn-outline-primary'}`;
        button.textContent = text;
        
        if (pageNumber !== null) {
            button.addEventListener('click', () => {
                this.currentPage = pageNumber;
                if (this.onPageChange) {
                    this.onPageChange();
                }
            });
        } else {
            button.disabled = true;
        }
        
        container.appendChild(button);
    }

    /**
     * Updates pagination state from API response
     * @param {Object} response - API response with pagination data
     */
    updateFromResponse(response) {
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
    }

    /**
     * Gets current pagination parameters
     * @returns {Object} Current pagination parameters
     */
    getParams() {
        return {
            page: this.currentPage,
            size: this.pageSize,
            sort: this.sortField,
            direction: this.sortDirection
        };
    }
} 