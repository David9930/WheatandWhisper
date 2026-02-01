// shop-products-loader-placeholder.js
// Loads products from Netlify CMS with dynamic categories
// Works with placeholder cart (no Snipcart account needed yet)

let allProducts = [];
let currentCategory = 'all';
let allCategories = new Set();

// Load products when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Load all product files from CMS
async function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    try {
        // Fetch list of product files
        const response = await fetch('content/products/');
        const html = await response.text();
        
        // Parse file names from directory listing
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'))
            .map(a => a.getAttribute('href'))
            .filter(href => href && href.endsWith('.md'));
        
        // Load each product file
        const productPromises = links.map(async (filename) => {
            try {
                const response = await fetch(`content/products/${filename}`);
                const text = await response.text();
                return parseProductData(text);
            } catch (error) {
                console.error(`Error loading ${filename}:`, error);
                return null;
            }
        });
        
        const products = await Promise.all(productPromises);
        allProducts = products
            .filter(p => p !== null && p.available)
            .sort((a, b) => a.order - b.order);
        
        // Extract unique categories
        extractCategories(allProducts);
        
        // Build category filters
        buildCategoryFilters();
        
        // Display products
        displayProducts(allProducts);
        
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = `
            <div class="error-message">
                <p>Sorry, we're having trouble loading our products right now.</p>
                <p>Please refresh the page or contact us directly.</p>
            </div>
        `;
    }
}

// Parse product markdown file
function parseProductData(fileContent) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = fileContent.match(frontMatterRegex);
    
    if (!match) return null;
    
    const frontMatter = match[1];
    const product = {};
    
    // Parse YAML front matter
    const lines = frontMatter.split('\n');
    lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');
            
            // Parse booleans and numbers
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(value) && value !== '') value = parseFloat(value);
            
            product[key] = value;
        }
    });
    
    return product;
}

// Extract unique categories from products
function extractCategories(products) {
    allCategories = new Set();
    
    products.forEach(product => {
        if (product.category && product.category.name) {
            allCategories.add(JSON.stringify({
                name: product.category.name,
                emoji: product.category.emoji || '📦',
                slug: product.category.slug || product.category.name.toLowerCase().replace(/\s+/g, '-')
            }));
        }
    });
}

// Build category filter buttons
function buildCategoryFilters() {
    const filterContainer = document.getElementById('category-filters');
    if (!filterContainer) return;
    
    // Start with "All Products" button
    let filterHTML = '<button class="filter-btn active" data-category="all">All Products</button>';
    
    // Add category buttons
    const categories = Array.from(allCategories).map(c => JSON.parse(c));
    categories
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(category => {
            filterHTML += `
                <button class="filter-btn" data-category="${category.slug}">
                    ${category.emoji} ${category.name}
                </button>
            `;
        });
    
    filterContainer.innerHTML = filterHTML;
    
    // Setup click handlers
    setupCategoryFilters();
}

// Setup category filter buttons
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            const category = button.getAttribute('data-category');
            currentCategory = category;
            
            const filteredProducts = category === 'all' 
                ? allProducts 
                : allProducts.filter(p => {
                    if (!p.category || !p.category.slug) return false;
                    return p.category.slug === category;
                });
            
            displayProducts(filteredProducts);
        });
    });
}

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <p>No products available in this category yet.</p>
                <p>Check back soon for new items!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Create individual product card HTML
function createProductCard(product) {
    const stockStatus = product.stock > 0 
        ? `<span class="in-stock">In Stock (${product.stock})</span>` 
        : `<span class="out-of-stock">Sold Out</span>`;
    
    const stockClass = product.stock > 0 ? 'available' : 'sold-out';
    
    const productId = product.sku || product.title.toLowerCase().replace(/\s+/g, '-');
    
    return `
        <div class="product-card ${stockClass}" data-category="${product.category?.slug || 'all'}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                ${product.featured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
            
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.short_description || ''}</p>
                
                <div class="product-footer">
                    <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
                    ${stockStatus}
                </div>
                
                ${product.stock > 0 ? `
                    <button 
                        class="buy-button"
                        onclick="addToCart({
                            id: '${productId}',
                            name: '${escapeHtml(product.title)}',
                            price: '${product.price}',
                            image: '${product.image}',
                            description: '${escapeHtml(product.short_description || product.title)}',
                            maxQuantity: ${product.stock || 999}
                        })"
                    >
                        Add to Cart
                    </button>
                ` : `
                    <button class="buy-button sold-out-button" disabled>
                        Sold Out
                    </button>
                `}
            </div>
        </div>
    `;
}

// Escape HTML for security
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Optional: Smooth scroll to products when filter is clicked
function scrollToProducts() {
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
