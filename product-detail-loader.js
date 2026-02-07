// ========================================
// FILE TRACKING INFORMATION
// ========================================
// Name of file: product-detail-loader.js
// Date/Time Created: February 02, 2025 - 20:00 EST
// Date/Time of last Modification: February 07, 2026 - 10:13 AM EST
// How did the work: PHASE 1 - Enhanced product loading with refined display:
//                   - Price formatting: Split into dollars.cents with superscript (e.g. $136.00)
//                   - Category display: Shows "WHEAT AND WHISPER" brand label at top
//                   - Body text: Simple markdown conversion (** for bold, line breaks for paragraphs)
//                   - Stock info: Refined messaging (in stock, low stock, out of stock)
//                   - Quantity controls: Plus/minus buttons with validation
//                   - Add to cart: Integrates with existing cart system
//                   - Error handling: Proper null checks and fallbacks
//                   PHASE 2 - Collapsible Sections:
//                   - Added collapsible toggle functionality for DETAILS and SIZE AND FIT
//                   - Populates collapsible sections with product data (material, color, care, fit, measurements)
//                   - Smooth accordion animation with active states
//                   BUG FIX - Price Parsing:
//                   - Fixed: Now strips $ sign from price before parsing (handles "$270" format)
// Purpose: Loads full product details from markdown files via URL parameter
// Usage: Automatically runs on product-detail.html page load
// File Location: Root directory
// Last Modified By: Claude & David
// Version: 2.1 - Phase 2 (Price Parsing Fixed)
// ========================================

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
                else if (match[1] === 'price' || match[1] === 'weight') {
                    // Strip $ sign and parse as float
                    value = parseFloat(value.replace(/[$,]/g, '')) || 0;
                }
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
    
    // Format price with decimal and superscript cents
    const priceWhole = Math.floor(p.price || 0);
    const priceCents = String(Math.round(((p.price || 0) - priceWhole) * 100)).padStart(2, '0');
    document.getElementById('price-amount').textContent = priceWhole;
    document.getElementById('price-cents').textContent = priceCents;
    
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
    
    // Populate DETAILS collapsible
    const detailMaterial = document.getElementById('detail-material');
    const detailColor = document.getElementById('detail-color');
    const detailCare = document.getElementById('detail-care');
    const detailOrigin = document.getElementById('detail-origin');
    
    // Check both flat fields and nested object fields
    const material = p.details_section?.material || p.material;
    const color = p.details_section?.color || p.color;
    const care = p.details_section?.care_instructions || p.care_instructions;
    const madeIn = p.details_section?.made_in || p.made_in;
    
    if (material) detailMaterial.innerHTML = `<strong>Material:</strong> ${material}`;
    if (color) detailColor.innerHTML = `<strong>Color:</strong> ${color}`;
    if (care) detailCare.innerHTML = `<strong>Care:</strong> ${care}`;
    if (madeIn) detailOrigin.innerHTML = `<strong>Made in:</strong> ${madeIn}`;
    
    // Populate SIZE AND FIT collapsible
    const detailFit = document.getElementById('detail-fit');
    const detailMeasurements = document.getElementById('detail-measurements');
    
    const fit = p.size_fit_section?.fit_description || p.fit_description;
    const measurements = p.size_fit_section?.measurements || p.measurements;
    
    if (fit) detailFit.innerHTML = `<strong>Fit:</strong> ${fit}`;
    if (measurements) detailMeasurements.innerHTML = `<strong>Measurements:</strong> ${measurements}`;
    
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

// =============================================================================
// COLLAPSIBLE SECTIONS
// =============================================================================

function initCollapsibles() {
    const detailsToggle = document.getElementById('details-toggle');
    const detailsContent = document.getElementById('details-content');
    const sizeFitToggle = document.getElementById('size-fit-toggle');
    const sizeFitContent = document.getElementById('size-fit-content');

    if (detailsToggle) {
        detailsToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            detailsContent.classList.toggle('open');
        });
    }

    if (sizeFitToggle) {
        sizeFitToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            sizeFitContent.classList.toggle('open');
        });
    }
}

// Initialize collapsibles when document loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollapsibles);
} else {
    initCollapsibles();
}
