// بيانات المنتجات
const products = [
    {
        id: 1,
        name: "تيشيرت فاخر",
        price: 10000,
        image: "https://via.placeholder.com/300",
        description: "عباية سوداء مطرزة بخيوط ذهبية"
    },
    {
        id: 2,
        name: "تيشيرت فاخر",
        price: 8000,
        image: "https://via.placeholder.com/300",
        description: "حجاب حريري ناعم ومريح"
    },
    {
        id: 3,
        name: "تيشيرت انمي",
        price: 12000,
        image: "https://via.placeholder.com/300",
        description: "جاكيت أنيق للمحجبات"
    }
];

// بيانات التقييمات
const reviews = [
    {
        name: "سارة محمد",
        rating: 4,
        date: "15 يناير 2024",
        comment: "المنتج جميل والجودة ممتازة، أنصح به"
    },
    {
        name: "أماني عبد الله",
        rating: 5,
        date: "10 فبراير 2024",
        comment: "التوصيل كان سريعًا والمنتج أفضل من المتوقع"
    }
];

// عربة التسوق
let cart = [];

// عرض المنتجات
function displayProducts() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card product-card h-100">
                <img src="${product.image}" class="card-img-top product-img" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted">${product.description}</p>
                    <p class="price fw-bold">${product.price} ج.س</p>
                </div>
                <button class="btn btn-add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                    <i class="fas fa-cart-plus me-2"></i>أضف إلى العربة
                </button>
            </div>
        </div>
    `).join('');
}

// عرض التقييمات
function displayReviews() {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = reviews.map(review => `
        <div class="col-md-6 mb-4">
            <div class="card testimonial-card p-3 h-100">
                <div class="d-flex justify-content-between">
                    <div class="user-info">
                        <strong>${review.name}</strong>
                        <div class="stars">
                            ${'<i class="fas fa-star"></i>'.repeat(review.rating)}
                            ${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
                        </div>
                    </div>
                    <small class="text-muted">${review.date}</small>
                </div>
                <p class="mt-2">${review.comment}</p>
            </div>
        </div>
    `).join('');
}

// إدارة عربة التسوق
function addToCart(productId, productName, price) {
    const existingItem = cart.find(item => item.id === productId);
    
    if(existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartUI();
    showAlert('تمت إضافة المنتج إلى العربة', 'success');
}

function updateCartUI() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');
    
    // تحديث العداد
    cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // عرض العناصر
    if(cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted"></i>
                <p class="mt-3">عربة التسوق فارغة</p>
            </div>
        `;
    } else {
        cartItemsEl.innerHTML = cart.map(item => `
            <div class="cart-item d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <img src="product_${item.id}.jpg" width="60" class="rounded me-3">
                    <div>
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">${item.price} ج.س</small>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="btn btn-sm btn-danger ms-3" onclick="removeItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // حساب المجموع
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalEl.textContent = `${total} ج.س`;
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if(item) {
        item.quantity += change;
        if(item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        updateCartUI();
    }
}

function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    showAlert('تم حذف المنتج من العربة', 'warning');
}

// البحث عن المنتجات
document.getElementById('searchInput').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const results = products.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
    );
    
    displaySearchResults(results);
});

function displaySearchResults(results) {
    const container = document.getElementById('productsContainer');
    if(results.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>لا توجد نتائج</h4>
            </div>
        `;
    } else {
        container.innerHTML = results.map(product => `
            <div class="col-md-4 mb-4">
                <div class="card product-card h-100">
                    <img src="${product.image}" class="card-img-top product-img" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted">${product.description}</p>
                        <p class="price fw-bold">${product.price} ج.س</p>
                    </div>
                    <button class="btn btn-add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                        <i class="fas fa-cart-plus me-2"></i>أضف إلى العربة
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// إظهار تنبيه
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    displayReviews();
    
    // حفظ العربة في localStorage
    if(localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
        updateCartUI();
    }
    
    // حفظ العربة عند التغيير
    setInterval(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, 1000);
});