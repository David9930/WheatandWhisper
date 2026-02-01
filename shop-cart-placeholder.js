// shop-cart-placeholder.js
// Simulates shopping cart functionality while building the shop
// Replace with real Snipcart when ready to accept payments

let cart = [];

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    updateCartDisplay();
    setupCartListeners();
});

// Setup event listeners
function setupCartListeners() {
    // Open cart modal
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', openCart);
    }
    
    // Close cart modal
    const closeCart = document.getElementById('close-cart');
    if (closeCart) {
        closeCart.addEventListener('click', closeCartModal);
    }
    
    // Checkout button (placeholder)
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
    
    // Close cart when clicking outside
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
    }
}

// Add item to cart
window.addToCart = function(productData) {
    // Check if item already in cart
    const existingItem = cart.find(item => item.id === productData.id);
    
    if (existingItem) {
        // Increase quantity if not exceeding max
        if (existingItem.quantity < productData.maxQuantity) {
            existingItem.quantity += 1;
        } else {
            alert(`Sorry, maximum ${productData.maxQuantity} per customer`);
            return;
        }
    } else {
        // Add new item
        cart.push({
            id: productData.id,
            name: productData.name,
            price: parseFloat(productData.price),
            image: productData.image,
            quantity: 1,
            maxQuantity: productData.maxQuantity || 999
        });
    }
    
    saveCartToStorage();
    updateCartDisplay();
    openCart();
    
    // Show success animation
    showAddToCartSuccess();
};

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartDisplay();
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= item.maxQuantity) {
            item.quantity = newQuantity;
            saveCartToStorage();
            updateCartDisplay();
        } else {
            alert(`Sorry, maximum ${item.maxQuantity} per customer`);
        }
    }
}

// Calculate cart totals
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
        subtotal: subtotal,
        itemCount: itemCount
    };
}

// Update cart display
function updateCartDisplay() {
    const totals = calculateTotals();
    
    // Update cart count badge
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totals.itemCount;
        
        // Pulse animation when count changes
        cartCount.style.animation = 'none';
        setTimeout(() => {
            cartCount.style.animation = 'pulse 0.3s ease';
        }, 10);
    }
    
    // Update cart items display
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <p class="empty-cart-subtitle">Start adding some handcrafted treasures!</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <p class="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')" title="Remove from cart">
                            ×
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Update subtotal
    const subtotalAmount = document.getElementById('subtotal-amount');
    if (subtotalAmount) {
        subtotalAmount.textContent = `$${totals.subtotal.toFixed(2)}`;
    }
    
    // Enable/disable checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.disabled = cart.length === 0;
    }
}

// Open cart modal
function openCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

// Close cart modal
function closeCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Handle checkout (placeholder)
function handleCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Show placeholder message
    const totals = calculateTotals();
    alert(
        `🛒 PLACEHOLDER CHECKOUT\n\n` +
        `Items: ${totals.itemCount}\n` +
        `Subtotal: $${totals.subtotal.toFixed(2)}\n\n` +
        `When you add Snipcart, clicking here will open the real checkout!\n\n` +
        `For now, this is just a demo to show how the shop will work.`
    );
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('wheatwhisper_cart', JSON.stringify(cart));
    } catch (e) {
        console.warn('Could not save cart to localStorage:', e);
    }
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('wheatwhisper_cart');
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Could not load cart from localStorage:', e);
        cart = [];
    }
}

// Show add to cart success animation
function showAddToCartSuccess() {
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.style.animation = 'none';
        setTimeout(() => {
            cartButton.style.animation = 'cartBounce 0.5s ease';
        }, 10);
    }
}

// Clear cart (useful for testing)
window.clearCart = function() {
    if (confirm('Clear all items from cart?')) {
        cart = [];
        saveCartToStorage();
        updateCartDisplay();
    }
};

// Expose cart for debugging
window.debugCart = function() {
    console.table(cart);
    console.log('Total items:', calculateTotals().itemCount);
    console.log('Subtotal:', calculateTotals().subtotal);
};
