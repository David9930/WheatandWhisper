// =============================================================================
// FILE: cat-box-loader.js
// CREATED: 2025-02-02
// MODIFIED: 2025-02-02 19:10 EST
// PURPOSE: Loads products from content/products/ and filters by category_box
// =============================================================================

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
            document.getElementById('page-title').textContent = `${categoryTitle} - Wheat and Whisper Farm`;
            document.getElementById('category-name').textContent = categoryTitle;
            document.getElementById('category-emoji').textContent = categoryEmoji;
            document.getElementById('breadcrumb-category').textContent = categoryTitle;
            
            console.log(`✅ Category info loaded: ${categoryEmoji} ${categoryTitle}`);
        } else {
            console.warn(`⚠️ No category info found for Box ${boxNumber}`);
            document.getElementById('category-name').textContent = `Category ${boxNumber}`;
        }
    } catch (error) {
        console.error('Error loading category info:', error);
        document.getElementById('category-name').textContent = `Category ${boxNumber}`;
    }
}

// Load products from content/products/
async function loadProducts(boxNumber) {
    const container = document.getElementById('products-container');
    const emptyState = document.getElementById('empty-state');
    const categoryCount = document.getElementById('category-count');
    
    try {
        // Fetch the products folder
        const productsResponse = await fetch('content/products/');
        const productsText = await productsResponse.text();
        
        // Extract product filenames from directory listing
        const parser = new DOMParser();
        const doc = parser.parseFromString(productsText, 'text/html');
        const links = doc.querySelectorAll('a[href$=".md"]');
        const productFiles = Array.from(links).map(link => 'content/products/' + link.getAttribute('href'));
        
        console.log(`📂 Found ${productFiles.length} product files`);
        
        // Load each product file
        const products = [];
        for (const file of productFiles) {
            try {
                const response = await fetch(file);
                const text = await response.text();
                const product = parseProduct(text, file);
                
                // Filter by category_box and availability
                if (product.category_box === boxNumber.toString() && product.available !== false) {
                    products.push(product);
                }
            } catch (error) {
                console.warn(`⚠️ Could not load ${file}:`, error);
            }
        }
        
        console.log(`✅ Loaded ${products.length} products for Box ${boxNumber}`);
        
        // Display products
        if (products.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            categoryCount.textContent = 'No products available';
        } else {
            container.innerHTML = '';
            categoryCount.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'}`;
            
            // Sort by order field
            products.sort((a, b) => (a.order || 100) - (b.order || 100));
            
            // Create product cards
            products.forEach(product => {
                const card = createProductCard(product);
                container.appendChild(card);
            });
            
            emptyState.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<div class="error-message"><p>Error loading products. Please try again later.</p></div>';
    }
}

// Parse product markdown file
function parseProduct(text, filename) {
    const product = {
        filename: filename
    };
    
    // Extract YAML front matter
    const frontMatterMatch = text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) return product;
    
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
    } else if (product.stock <= 3) {
        stockBadge = `<span class="stock-badge low-stock">Only ${product.stock} left!</span>`;
    }
    
    // Featured badge
    const featuredBadge = product.featured ? '<span class="featured-badge">⭐ Featured</span>' : '';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || 'images/uploads/placeholder-product.jpg'}" alt="${product.title}">
            ${stockBadge}
            ${featuredBadge}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.short_description || ''}</p>
            <div class="product-footer">
                <span class="product-price">$${parseFloat(product.price || 0).toFixed(2)}</span>
                ${product.stock > 0 ? 
                    `<button class="add-to-cart-btn" data-product='${JSON.stringify(product)}'>Add to Cart</button>` :
                    `<button class="add-to-cart-btn" disabled>Sold Out</button>`
                }
            </div>
        </div>
    `;
    
    // Add to cart functionality
    const addButton = card.querySelector('.add-to-cart-btn:not([disabled])');
    if (addButton) {
        addButton.addEventListener('click', function() {
            const productData = JSON.parse(this.dataset.product);
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
        alert(`Added ${product.title} to cart! (Cart placeholder active)`);
    }
}

// Debug function
window.catBoxDebug = {
    reload: () => location.reload(),
    getBoxNumber: () => window.CATEGORY_BOX_NUMBER,
    info: () => console.log('Category Box ' + window.CATEGORY_BOX_NUMBER)
};

console.log('✅ Category box loader ready! Debug: catBoxDebug.info()');
