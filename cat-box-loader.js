// =============================================================================
// FILE: cat-box-loader.js
// CREATED: 2025-02-02
// MODIFIED: 2025-02-02 19:40 EST
// PURPOSE: Loads products from content/products/ and filters by category_box
// CHANGES: Fixed to work with GitHub/Netlify (no directory listing needed)
// =============================================================================

// Product files list (Paige updates this when adding products)
// FORMAT: Just the filename without path or extension
const PRODUCT_FILES = [
    'yammies'  // Add more product slugs here as you create them
    // Example:
    // 'lavender-soap',
    // 'honey-jar',
    // 'wool-yarn'
];

// Main initialization
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🛍️ Category page loader starting...');
    
    // Get the category box number from the page
    const boxNumber = window.CATEGORY_BOX_NUMBER;
    console.log(`📦 Loading products for Category Box ${boxNumber}`);
    
    // Load category info from shop-settings.md
    await loadCategoryInfo(boxNumber);
    
    // Load and display products
    await loadProducts(boxNumber);
});

// Load category name and emoji from shop-settings.md
async function loadCategoryInfo(boxNumber) {
    try {
        const response = await fetch('content/pages/shop-settings.md');
        const text = await response.text();
        
        // Parse the shop settings
        const categoryKey = `category_box_${boxNumber}`;
        const categoryMatch = text.match(new RegExp(`${categoryKey}:[\\s\\S]*?title:\\s*(.+?)\\s*\\n[\\s\\S]*?emoji:\\s*(.+?)\\s*\\n`, 'i'));
        
        if (categoryMatch) {
            const categoryTitle = categoryMatch[1].trim();
            const categoryEmoji = categoryMatch[2].trim();
            
            // Update page title and header
            const pageTitleElement = document.querySelector('title');
            const categoryNameElement = document.getElementById('category-name');
            const categoryEmojiElement = document.getElementById('category-emoji');
            const breadcrumbElement = document.getElementById('breadcrumb-category');
            
            if (pageTitleElement) pageTitleElement.textContent = `${categoryTitle} - Wheat and Whisper Farm`;
            if (categoryNameElement) categoryNameElement.textContent = categoryTitle;
            if (categoryEmojiElement) categoryEmojiElement.textContent = categoryEmoji;
            if (breadcrumbElement) breadcrumbElement.textContent = categoryTitle;
            
            console.log(`✅ Category info loaded: ${categoryEmoji} ${categoryTitle}`);
        } else {
            console.warn(`⚠️ No category info found for Box ${boxNumber}`);
            const categoryNameElement = document.getElementById('category-name');
            if (categoryNameElement) categoryNameElement.textContent = `Category ${boxNumber}`;
        }
    } catch (error) {
        console.error('Error loading category info:', error);
        const categoryNameElement = document.getElementById('category-name');
        if (categoryNameElement) categoryNameElement.textContent = `Category ${boxNumber}`;
    }
}

// Load products from product files list
async function loadProducts(boxNumber) {
    const container = document.getElementById('products-container');
    const emptyState = document.getElementById('empty-state');
    const categoryCount = document.getElementById('category-count');
    
    if (!container) {
        console.error('❌ Products container not found!');
        return;
    }
    
    try {
        console.log(`📂 Loading ${PRODUCT_FILES.length} product files...`);
        
        // Load each product file
        const products = [];
        for (const filename of PRODUCT_FILES) {
            try {
                const filepath = `content/products/${filename}.md`;
                const response = await fetch(filepath);
                
                if (!response.ok) {
                    console.warn(`⚠️ Could not load ${filepath}: ${response.status}`);
                    continue;
                }
                
                const text = await response.text();
                const product = parseProduct(text, filename);
                
                // Filter by category_box and availability
                if (product.category_box === boxNumber.toString() && product.available !== false) {
                    products.push(product);
                    console.log(`✅ Loaded: ${product.title} (Box ${product.category_box})`);
                }
            } catch (error) {
                console.warn(`⚠️ Error loading ${filename}:`, error);
            }
        }
        
        console.log(`✅ Found ${products.length} products for Box ${boxNumber}`);
        
        // Display products
        if (products.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (categoryCount) categoryCount.textContent = 'No products available';
        } else {
            container.innerHTML = '';
            if (categoryCount) categoryCount.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'}`;
            
            // Sort by order field
            products.sort((a, b) => (a.order || 100) - (b.order || 100));
            
            // Create product cards
            products.forEach(product => {
                const card = createProductCard(product);
                container.appendChild(card);
            });
            
            if (emptyState) emptyState.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<div class="error-message"><p>Error loading products. Please try again later.</p></div>';
    }
}

// Parse product markdown file
function parseProduct(text, filename) {
    const product = {
        filename: filename,
        slug: filename
    };
    
    // Extract YAML front matter
    const frontMatterMatch = text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) {
        console.warn(`⚠️ No front matter in ${filename}`);
        return product;
    }
    
    const frontMatter = frontMatterMatch[1];
    const lines = frontMatter.split('\n');
    
    lines.forEach(line => {
        const match = line.match(/^\s*(\w+):\s*(.+)$/);
        if (match) {
            const key = match[1];
            let value = match[2].trim();
            
            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');
            
            // Parse boolean
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            // Parse numbers
            else if (key === 'order' || key === 'stock') value = parseInt(value) || 0;
            else if (key === 'price' || key === 'weight') value = parseFloat(value) || 0;
            
            product[key] = value;
        }
    });
    
    // Extract body content (after front matter)
    const bodyMatch = text.match(/---[\s\S]*?---\s*\n([\s\S]*)/);
    if (bodyMatch) {
        product.body = bodyMatch[1].trim();
    }
    
    return product;
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Stock badge
    let stockBadge = '';
    if (product.stock === 0) {
        stockBadge = '<span class="stock-badge sold-out">Sold Out</span>';
    } else if (product.stock && product.stock <= 3) {
        stockBadge = `<span class="stock-badge low-stock">Only ${product.stock} left!</span>`;
    }
    
    // Featured badge
    const featuredBadge = product.featured ? '<span class="featured-badge">⭐ Featured</span>' : '';
    
    // Default placeholder image
    const productImage = product.image || 'images/uploads/placeholder-product.jpg';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${productImage}" alt="${product.title || 'Product'}" onerror="this.src='images/uploads/placeholder-product.jpg'">
            ${stockBadge}
            ${featuredBadge}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title || 'Untitled Product'}</h3>
            <p class="product-description">${product.short_description || ''}</p>
            <div class="product-footer">
                <span class="product-price">$${parseFloat(product.price || 0).toFixed(2)}</span>
                ${product.stock === 0 ? 
                    `<button class="add-to-cart-btn" disabled>Sold Out</button>` :
                    `<button class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&#39;")}'>Add to Cart</button>`
                }
            </div>
        </div>
    `;
    
    // Add to cart functionality
    const addButton = card.querySelector('.add-to-cart-btn:not([disabled])');
    if (addButton) {
        addButton.addEventListener('click', function() {
            const productData = JSON.parse(this.dataset.product.replace(/&#39;/g, "'"));
            addToCart(productData);
            
            // Visual feedback
            this.textContent = '✓ Added!';
            setTimeout(() => {
                this.textContent = 'Add to Cart';
            }, 1500);
        });
    }
    
    return card;
}

// Add product to cart (uses shop-cart-placeholder.js if available)
function addToCart(product) {
    // This integrates with your existing cart system
    if (typeof window.addToCart === 'function') {
        window.addToCart(product);
    } else {
        console.log('Cart system not loaded, product:', product);
        
        // Update cart count manually if cart system exists
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const currentCount = parseInt(cartCount.textContent) || 0;
            cartCount.textContent = currentCount + 1;
        }
        
        alert(`Added ${product.title} to cart! (Cart placeholder active)`);
    }
}

// Debug function
window.catBoxDebug = {
    reload: () => location.reload(),
    getBoxNumber: () => window.CATEGORY_BOX_NUMBER,
    info: () => {
        console.log('=== CATEGORY BOX DEBUG ===');
        console.log('Box Number:', window.CATEGORY_BOX_NUMBER);
        console.log('Product Files:', PRODUCT_FILES);
        console.log('==========================');
    },
    addProduct: (filename) => {
        console.log(`To add "${filename}" to the list:`);
        console.log(`1. Open cat-box-loader.js`);
        console.log(`2. Add '${filename}' to PRODUCT_FILES array`);
        console.log(`3. Upload and refresh`);
    }
};

console.log('✅ Category box loader ready! Debug: catBoxDebug.info()');
