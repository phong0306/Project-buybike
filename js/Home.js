// Toggle mobile menu
function toggleMenu() {
    const nav = document.querySelector('nav.bar');
    const hamburger = document.querySelector('.hamburger');
    const isActive = nav.classList.contains('active');
    if (!isActive) {
        nav.classList.add('active');
        if (hamburger) hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        nav.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Toggle search box
function toggleSearch() {
    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.classList.toggle('show');
}

// Toggle submenu on mobile
document.querySelectorAll('nav.bar ul li a').forEach(item => {
    item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const submenu = item.nextElementSibling;
            const parentLi = item.parentElement;
            if (submenu && submenu.tagName === 'UL') {
                e.preventDefault();
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                parentLi.classList.toggle('active');
            }
        }
    });
});

// Close mobile menu when clicking a menu item (no submenu)
document.querySelectorAll('nav.bar ul li a').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768 && !item.nextElementSibling) {
            const nav = document.querySelector('nav.bar');
            nav.classList.remove('active');
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Blur effect on load
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.body.classList.add('blur-fade-out');
    }, 100);
    updateCartCount();
    renderCart();
});

// Blur overlay on image hover
document.querySelectorAll('.img-box').forEach(box => {
    box.addEventListener('mouseenter', () => {
        document.querySelector('.global-blur-overlay').classList.add('active');
    });
    box.addEventListener('mouseleave', () => {
        document.querySelector('.global-blur-overlay').classList.remove('active');
    });
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        document.querySelectorAll('.bike-group').forEach(group => {
            group.classList.remove('active');
        });
        document.querySelector('.bike-' + target).classList.add('active');
    });
});

// Helper: get price from add-to-cart div text
function extractPrice(text) {
    const match = text.match(/\$[\d,]+/);
    return match ? match[0] : "Price";
}

// Add to cart and save to localStorage
function addToCart(event, name) {
    event.stopPropagation();
    const imgBox = event.target.closest('.img-box');
    if (!imgBox) return;
    const img = imgBox.querySelector('.img-main');
    const label = imgBox.querySelector('.img-label');
    const addToCartDiv = imgBox.querySelector('.add-to-cart');
    const price = extractPrice(addToCartDiv.textContent.trim());
    const product = {
        name: label ? label.textContent.trim() : name,
        img: img ? img.src : "",
        price: price
    };
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch(e) {}
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showCartNotify(product.name);
}

// Show notification when add to cart
function showCartNotify(name) {
    const notify = document.getElementById('cartNotify');
    if (!notify) return;
    notify.innerHTML = `<span class="tick">&#10003;</span> ${name} added`;
    notify.classList.add('show');
    setTimeout(() => {
        notify.classList.remove('show');
    }, 1800);
}

// Update cart count in UI
function updateCartCount() {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch(e) {}
    const cartCountElem = document.getElementById('cartCount');
    if (cartCountElem) cartCountElem.textContent = cart.length;
}

// Render cart items from localStorage (for Webforcard.html)
function renderCart() {
    const cartList = document.getElementById('cart-list');
    const cartTotal = document.getElementById('cart-total');
    if (!cartList) return;
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch(e) {}
    if (cart.length === 0) {
        cartList.innerHTML = '<p style="color:#222;text-align:center;">No products in cart.</p>';
        if (cartTotal) cartTotal.innerHTML = '';
        return;
    }
    // Group by product name+img+price for quantity
    const grouped = {};
    cart.forEach((item, idx) => {
        const key = item.name + '|' + item.img + '|' + item.price;
        if (!grouped[key]) {
            grouped[key] = { ...item, quantity: 1, key };
        } else {
            grouped[key].quantity += 1;
        }
    });
    let total = 0;
    cartList.innerHTML = `
        <div class="cart-header-row">
            <div class="cart-col-img"></div>
            <div class="cart-col-name">Product</div>
            <div class="cart-col-price">Price</div>
            <div class="cart-col-qty">Quantity</div>
            <div class="cart-col-subtotal">Subtotal</div>
            <div style="width:40px"></div>
        </div>
        ` + Object.values(grouped).map(item => {
            let priceNum = 0;
            if (item.price && item.price.startsWith('$')) {
                priceNum = Number(item.price.replace(/[^0-9.]/g, '').replace(/,/g, ''));
            }
            const subtotal = priceNum * item.quantity;
            total += subtotal;
            return `
            <div class="cart-row" data-key="${encodeURIComponent(item.key)}">
                <div class="cart-col-img"><img src="${item.img}" alt="${item.name}"></div>
                <div class="cart-col-name">${item.name}</div>
                <div class="cart-col-price">${item.price}</div>
                <div class="cart-col-qty">
                    <button class="qty-btn minus" type="button">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn plus" type="button">+</button>
                </div>
                <div class="cart-col-subtotal">${priceNum ? ('$' + subtotal.toLocaleString()) : ''}</div>
                <button class="remove-btn" title="Remove item" type="button">&times;</button>
            </div>
            `;
        }).join('');
    if (cartTotal) {
        cartTotal.innerHTML = `
            <div class="cart-total-row">
                <span class="cart-total-label">Total:</span>
                <span class="cart-total-value">${total ? ('$' + total.toLocaleString()) : ''}</span>
            </div>
        `;
    }
}

// Handle plus/minus/remove actions in cart
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.body.classList.add('blur-fade-out');
    }, 100);
    updateCartCount();
    renderCart();
    const cartList = document.getElementById('cart-list');
    if (cartList) {
        cartList.addEventListener('click', function(e) {
            const row = e.target.closest('.cart-row');
            if (!row) return;
            const key = decodeURIComponent(row.getAttribute('data-key'));
            let cart = [];
            try {
                cart = JSON.parse(localStorage.getItem('cart')) || [];
            } catch(e) {}
            const [name, img, price] = key.split('|');
            const currentQty = cart.filter(item => item.name === name && item.img === img && item.price === price).length;
            if (e.target.classList.contains('plus')) {
                cart.push({ name, img, price });
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                updateCartCount();
            } else if (e.target.classList.contains('minus')) {
                if (currentQty > 1) {
                    const idx = cart.findIndex(
                        item => item.name === name && item.img === img && item.price === price
                    );
                    if (idx !== -1) {
                        cart.splice(idx, 1);
                        localStorage.setItem('cart', JSON.stringify(cart));
                        renderCart();
                        updateCartCount();
                    }
                }
            } else if (e.target.classList.contains('remove-btn')) {
                cart = cart.filter(item => !(item.name === name && item.img === img && item.price === price));
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                updateCartCount();
            }
        });
    }
});