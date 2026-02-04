// =============================================================================
// FILE: product-detail-loader.js
// CREATED: 2025-02-02
// PURPOSE: Loads full product details from URL parameter
// =============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productSlug = urlParams.get('product');
    
    if (!productSlug) {
        showError();
        return;
    }
    
    await loadProduct(productSlug);
});

async function loadProduct(slug) {
    try {
        const response = await fetch(`content/products/${slug}.md`);
        if (!response.ok) throw new Error('Product not found');
        
        const text = await response.text();
        const product = parseProduct(text);
        displayProduct(product);
    } catch (error) {
        console.error('Error loading product:', error);
        showError();
    }
}

function parseProduct(text) {
    const product = {};
    const frontMatterMatch = text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontMatterMatch) {
        const lines = frontMatterMatch[1].split('\n');
        lines.forEach(line => {
            const match = line.match(/^\s*(\w+):\s*(.+)$/);
            if (match) {
                let value = match[2].trim().replace(/^["']|["']$/g, '');
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                else if (match[1] === 'stock' || match[1] === 'order') value = parseInt(value) || 0;
                else if (match[1] === 'price' || match[1] === 'weight') value = parseFloat(value) || 0;
                product[match[1]] = value;
            }
        });
    }
    const bodyMatch = text.match(/---[\s\S]*?---\s*\n([\s\S]*)/);
    if (bodyMatch) product.body = bodyMatch[1].trim();
    return product;
}

function displayProduct(p) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('product-content').style.display = 'block';
    
    document.getElementById('page-title').textContent = `${p.title} - Wheat and Whisper Farm`;
    document.getElementById('product-title').textContent = p.title || 'Product';
    
    // Format price with superscript
    const priceWhole = Math.floor(p.price || 0);
    const priceCents = Math.round(((p.price || 0) - priceWhole) * 100);
    document.getElementById('price-amount').textContent = priceWhole;
    
    document.getElementById('breadcrumb-product').textContent = p.title || 'Product';
    
    // Category - use site name or product category
    const categoryElement = document.getElementById('product-category');
    if (categoryElement) {
        categoryElement.textContent = 'WHEAT AND WHISPER';
    }
    
    if (p.sku) document.getElementById('product-sku').textContent = `SKU: ${p.sku}`;
    if (p.short_description) document.getElementById('product-short-desc').textContent = p.short_description;
    
    // Format body description
    if (p.body) {
        let html = p.body
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        document.getElementById('product-body').innerHTML = '<p>' + html + '</p>';
    }
    
    const mainImg = document.getElementById('main-image');
    mainImg.src = p.image || 'images/uploads/placeholder-product.jpg';
    mainImg.alt = p.title;
    
    const stockInfo = document.getElementById('stock-info');
    if (p.stock === 0) {
        stockInfo.innerHTML = '<span class="out-of-stock">⚠️ Out of Stock</span>';
        document.getElementById('add-to-cart-btn').disabled = true;
    } else if (p.stock <= 3) {
        stockInfo.innerHTML = `<span class="low-stock">Only ${p.stock} left in stock!</span>`;
    } else {
        stockInfo.innerHTML = `<span class="in-stock">✓ ${p.stock} in stock</span>`;
    }
    
    const badges = document.getElementById('product-badges');
    if (p.featured) badges.innerHTML += '<span class="badge-featured">⭐ Featured</span>';
    
    const meta = document.getElementById('product-meta');
    let metaHTML = '<div class="meta-grid">';
    if (p.weight) metaHTML += `<div class="meta-item"><strong>Weight:</strong> ${p.weight} oz</div>`;
    if (p.category_box) metaHTML += `<div class="meta-item"><strong>Category:</strong> Box ${p.category_box}</div>`;
    metaHTML += '</div>';
    meta.innerHTML = metaHTML;
    
    document.getElementById('quantity').max = p.stock || 99;
    
    document.getElementById('qty-plus').onclick = () => {
        const qty = document.getElementById('quantity');
        if (parseInt(qty.value) < parseInt(qty.max)) qty.value = parseInt(qty.value) + 1;
    };
    document.getElementById('qty-minus').onclick = () => {
        const qty = document.getElementById('quantity');
        if (parseInt(qty.value) > 1) qty.value = parseInt(qty.value) - 1;
    };
    
    document.getElementById('add-to-cart-btn').onclick = () => {
        const qty = parseInt(document.getElementById('quantity').value);
        for (let i = 0; i < qty; i++) {
            if (typeof window.addToCart === 'function') window.addToCart(p);
        }
        document.getElementById('add-to-cart-btn').textContent = '✓ Added to Cart!';
        setTimeout(() => { document.getElementById('add-to-cart-btn').textContent = 'Add to Cart'; }, 2000);
    };
}

function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
}
