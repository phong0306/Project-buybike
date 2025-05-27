// Render cart items with quantity and total, with plus/minus/remove buttons
function renderCart() {
    const cartList = document.getElementById('cart-list');
    const cartTotal = document.getElementById('cart-total');
    const checkoutWrap = document.querySelector('.checkout-btn-wrap');
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch(e) {}
    if (!cartList) return;
    if (cart.length === 0) {
        cartList.innerHTML = '<p style="color:#222;text-align:center;">No products in cart.</p>';
        if (cartTotal) cartTotal.innerHTML = '';
        if (checkoutWrap) checkoutWrap.style.display = 'none';
        return;
    }
    // Group by product name+img+price for quantity
    const grouped = {};
    cart.forEach(item => {
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
            // Parse price to number
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
                    <div class="qty-control-group">
                        <button class="qty-btn minus" type="button">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn plus" type="button">+</button>
                    </div>
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
    if (checkoutWrap) checkoutWrap.style.display = '';
}

document.addEventListener('DOMContentLoaded', function() {
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
            } else if (e.target.classList.contains('minus')) {
                if (currentQty > 1) {
                    const idx = cart.findIndex(
                        item => item.name === name && item.img === img && item.price === price
                    );
                    if (idx !== -1) {
                        cart.splice(idx, 1);
                        localStorage.setItem('cart', JSON.stringify(cart));
                        renderCart();
                    }
                }
            } else if (e.target.classList.contains('remove-btn')) {
                cart = cart.filter(item => !(item.name === name && item.img === img && item.price === price));
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            }
        });
    }

    // Đảm bảo hamburger luôn hoạt động trên mobile
    var hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            const nav = document.querySelector('nav.bar');
            const isActive = nav.classList.contains('active');
            if (!isActive) {
                nav.classList.add('active');
                hamburger.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                nav.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
