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
    // Sửa lỗi: Nếu dữ liệu từ Home.html chỉ là tên sản phẩm (string), chuyển thành object mặc định
    cart = cart.map(item => {
        if (typeof item === 'string') {
            // Nếu chỉ có tên, trả về object mặc định (không có ảnh, giá)
            return { name: item, img: '', price: '' };
        }
        return item;
    });
    // Group by product name+img+price for quantity
    const grouped = {};
    cart.forEach(item => {
        // Đảm bảo đường dẫn ảnh đúng thư mục ../img/
        let img = item.img;
        if (img && !/^https?:\/\//.test(img) && !img.startsWith('/')) {
            if (!img.startsWith('../img/')) {
                img = '../img/' + img.split('/').pop();
            }
        }
        const key = item.name + '|' + img + '|' + item.price;
        if (!grouped[key]) {
            grouped[key] = { ...item, img, quantity: 1, key };
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
                <div class="cart-col-img"><img src="${item.img || '../img/no-image.png'}" alt="${item.name}"></div>
                <div class="cart-col-name">${item.name}</div>
                <div class="cart-col-price">${item.price || ''}</div>
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

// Hàm này sẽ đồng bộ dữ liệu giỏ hàng từ localStorage (được Home.js cập nhật) và render lại giao diện
function syncCartFromLocalStorage() {
    renderCart();
}

// Đảm bảo luôn cập nhật giỏ hàng khi quay lại/truy cập Card.html
window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
        syncCartFromLocalStorage();
    }
});

// Khi vào trang Card.html, luôn lấy dữ liệu mới nhất từ localStorage
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    const cartList = document.getElementById('cart-list');
    if (cartList) {
        cartList.addEventListener('click', function(e) {
            let target = e.target;
            if (!target.classList.contains('plus') && !target.classList.contains('minus') && !target.classList.contains('remove-btn')) {
                if (target.closest('.qty-btn')) target = target.closest('.qty-btn');
                if (target.closest('.remove-btn')) target = target.closest('.remove-btn');
            }
            if (target.classList.contains('plus') || target.classList.contains('minus') || target.classList.contains('remove-btn')) {
                const row = target.closest('.cart-row');
                if (!row) return;
                const key = decodeURIComponent(row.getAttribute('data-key'));
                let cart = [];
                try {
                    cart = JSON.parse(localStorage.getItem('cart')) || [];
                } catch(e) {}
                const [name, img, price] = key.split('|');
                if (target.classList.contains('plus')) {
                    cart.push({ name, img, price });
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                } else if (target.classList.contains('minus')) {
                    // Nếu chỉ còn 1 sản phẩm thì xóa luôn, nếu nhiều hơn thì giảm số lượng
                    const currentQty = cart.filter(item => item.name === name && item.img === img && item.price === price).length;
                    if (currentQty <= 1) {
                        cart = cart.filter(item => !(item.name === name && item.img === img && item.price === price));
                    } else {
                        const idx = cart.findIndex(
                            item => item.name === name && item.img === img && item.price === price
                        );
                        if (idx !== -1) {
                            cart.splice(idx, 1);
                        }
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                } else if (target.classList.contains('remove-btn')) {
                    cart = cart.filter(item => !(item.name === name && item.img === img && item.price === price));
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                }
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

// Xóa toàn bộ sản phẩm trong giỏ hàng (dùng cho nút "Clear Cart")
function clearCart() {
    localStorage.removeItem('cart');
    renderCart();
}

// Ví dụ: Thêm nút xóa toàn bộ giỏ hàng (nếu muốn)
// document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
