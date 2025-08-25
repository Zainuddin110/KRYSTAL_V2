// ES6 Module Import for Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase Configuration
const supabaseUrl = 'https://mrujnqmedrlkdmzgkkix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydWpucW1lZHJsa2Rtemdra2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTUwOTYsImV4cCI6MjA2OTc3MTA5Nn0.JKyiYfAYilL1Gnci2Aj-mDl1dSJ9QcPb13X76bQ8nFI';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

class ProductDisplay {
    constructor() {
        this.category = document.body.getAttribute('data-category');
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 20;
        this.totalCount = 0;
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log(`🚀 Initializing ProductDisplay for category: ${this.category}`);
        
        if (!this.category) {
            console.error('❌ No data-category found on body element');
            this.showError('Category not specified');
            return;
        }

        await this.loadProducts();
        this.setupEventListeners();
    }

    async loadProducts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.setLoading(true);
        
        try {
            console.log(`📊 Loading products for category: ${this.category}, page: ${this.currentPage}`);
            
            const startIndex = (this.currentPage - 1) * this.productsPerPage;
            const endIndex = startIndex + this.productsPerPage - 1;

            const { data, error, count } = await supabase
                .from('products')
                .select('*', { count: 'exact' })
                .eq('category', this.category)
                .eq('is_active', true)
                .order('created_at', { ascending: true })
                .range(startIndex, endIndex);

            if (error) {
                console.error('❌ Error loading products:', error);
                this.showError('Failed to load products');
                return;
            }

            this.products = data || [];
            this.totalCount = count || 0;
            this.filteredProducts = [...this.products];

            console.log(`✅ Loaded ${this.products.length} products, total: ${this.totalCount}`);

            this.renderProducts();
            this.updateProductCount();
            this.setupPagination();

        } catch (error) {
            console.error('❌ Error in loadProducts:', error);
            this.showError('Failed to load products');
        } finally {
            this.setLoading(false);
            this.isLoading = false;
        }
    }

    renderProducts() {
        const container = document.getElementById('productsGrid');
        const noProductsDiv = document.getElementById('noProducts');
        
        if (!container) {
            console.error('Products container not found');
            return;
        }

        // Hide no products message
        if (noProductsDiv) {
            noProductsDiv.style.display = 'none';
        }

        if (this.filteredProducts.length === 0) {
            // Show no products message
            if (noProductsDiv) {
                noProductsDiv.style.display = 'block';
            }
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.filteredProducts.map(product => `
            <div class="product-item" data-product-id="${product.id}">
                <div class="product-card">
                    <div class="product-image-container">
                        <img src="${this.getImageUrl(product.image_url, product.product_name)}" 
                             alt="${this.escapeHtml(product.product_name)}" 
                             class="product-image"
                             loading="lazy"
                             onerror="this.src='${this.createFallbackImageUrl(product.product_name)}'">
                        <div class="product-overlay">
                            <button class="view-product-btn" onclick="window.showProductModal('${product.image_url || ''}', '${this.escapeHtml(product.product_name)}', '${this.escapeHtml(product.description || '')}', '${this.formatCategory(product.category)}')">
                                <span class="view-icon"></span>
                                View Details
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${this.escapeHtml(product.product_name)}</h3>
                        <p class="product-category">${this.formatCategory(product.category)}</p>
                        <div class="product-actions">
                            <button class="inquiry-btn" onclick="window.location.href='../contact-us.html'">
                                💬 Send Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Pagination buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.goToPreviousPage();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.goToNextPage();
            });
        }
    }

    handleSearch(searchTerm) {
        const term = searchTerm.trim().toLowerCase();
        
        if (term === '') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product =>
                product.product_name.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term))
            );
        }

        this.renderProducts();
        this.updateProductCount();
        this.setupPagination();
    }

    setupPagination() {
        const totalPages = Math.ceil(this.totalCount / this.productsPerPage);
        const paginationWrapper = document.getElementById('paginationWrapper');
        const paginationNumbers = document.getElementById('paginationNumbers');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (!paginationWrapper || !paginationNumbers) return;

        // Hide pagination if only one page or no products
        if (totalPages <= 1) {
            paginationWrapper.style.display = 'none';
            return;
        }

        paginationWrapper.style.display = 'block';

        // Update pagination numbers
        paginationNumbers.innerHTML = '';
        
        // Show page numbers (with ellipsis for many pages)
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.goToPage(i);
            });
            paginationNumbers.appendChild(pageBtn);
        }

        // Update prev/next buttons
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.totalCount / this.productsPerPage);
        if (page < 1 || page > totalPages || page === this.currentPage) return;

        this.currentPage = page;
        this.loadProducts();
        this.scrollToTop();
    }

    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    goToNextPage() {
        const totalPages = Math.ceil(this.totalCount / this.productsPerPage);
        if (this.currentPage < totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }

    updateProductCount() {
        const currentCountEl = document.getElementById('currentCount');
        const totalCountEl = document.getElementById('totalCount');

        if (currentCountEl && totalCountEl) {
            const displayedCount = this.filteredProducts.length;
            currentCountEl.textContent = displayedCount;
            totalCountEl.textContent = this.totalCount;
        }
    }

    setLoading(isLoading) {
        const spinner = document.getElementById('loadingSpinner');
        const productsGrid = document.getElementById('productsGrid');
        
        if (spinner) {
            spinner.style.display = isLoading ? 'block' : 'none';
        }
        
        if (productsGrid && isLoading) {
            productsGrid.innerHTML = '';
        }
    }

    showError(message) {
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>Error Loading Products</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-btn">Retry</button>
                </div>
            `;
        }
    }

    scrollToTop() {
        const productsSection = document.querySelector('.products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Utility functions
    getImageUrl(imageUrl, productName) {
        if (imageUrl && imageUrl !== 'null' && imageUrl !== '') {
            return imageUrl;
        }
        return this.createFallbackImageUrl(productName);
    }

    createFallbackImageUrl(productName) {
        const encodedName = encodeURIComponent(productName.substring(0, 15));
        return `https://via.placeholder.com/400x300/1a2742/ffffff?text=${encodedName}`;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatCategory(category) {
        if (!category) return 'Product';
        return category.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Products.js initialized');
    
    // Check if we have the required elements
    const requiredElements = ['productsGrid', 'searchInput', 'loadingSpinner'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.warn('⚠️ Missing required elements:', missingElements);
    }
    
    // Initialize product display
    window.productDisplay = new ProductDisplay();
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('💥 JavaScript error in products.js:', e.error);
});

console.log('📦 Products.js with Supabase integration loaded successfully');