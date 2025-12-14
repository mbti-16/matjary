// script.js - للصفحة الرئيسية للمتجر
document.addEventListener('DOMContentLoaded', function() {
    // تحميل المنتجات والفئات
    loadCategories();
    loadFeaturedProducts();
    
    // إعداد المستمعين للأحداث
    setupStoreEventListeners();
    
    // التحقق من حالة تسجيل الدخول
    checkAuthStatus();
});

// إعداد المستمعين للأحداث
function setupStoreEventListeners() {
    // البحث
    document.querySelector('.nav-search button').addEventListener('click', searchProducts);
    document.querySelector('.nav-search input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchProducts();
    });
    
    // عربة التسوق
    document.querySelector('.close-cart').addEventListener('click', function() {
        document.getElementById('cartSidebar').classList.remove('show');
    });
    
    document.querySelector('.cart-icon').addEventListener('click', function() {
        document.getElementById('cartSidebar').classList.add('show');
    });
    
    // نموذج المصادقة
    document.querySelectorAll('.close-auth, .auth-tab').forEach(el => {
        el.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            if (tab) {
                switchAuthTab(tab);
            } else {
                document.getElementById('authModal').style.display = 'none';
            }
        });
    });
    
    // إرسال النماذج
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// تحميل الفئات
async function loadCategories() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .limit(6);
        
        if (error) throw error;
        
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;
        
        if (!categories || categories.length === 0) {
            grid.innerHTML = '<p>لا توجد فئات متاحة</p>';
            return;
        }
        
        let html = '';
        const colors = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5', 'gradient-6'];
        
        categories.forEach((category, index) => {
            const colorClass = colors[index % colors.length];
            
            html += `
                <div class="category-card ${colorClass}">
                    <div class="category-icon">
                        <i class="fas fa-tag"></i>
                    </div>
                    <h3>${category.name}</h3>
                    <p>${category.description || 'تسوق الآن'}</p>
                </div>
            `;
        });
        
        grid.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ في تحميل الفئات:', error);
    }
}

// تحميل المنتجات المميزة
async function loadFeaturedProducts() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .limit(8);
        
        if (error) throw error;
        
        const grid = document.getElementById('featuredProducts');
        if (!grid) return;
        
        if (!products || products.length === 0) {
            grid.innerHTML = '<p>لا توجد منتجات متاحة</p>';
            return;
        }
        
        let html = '';
        
        products.forEach(product => {
            const profit = product.sell_price - product.buy_price;
            const profitPercent = ((profit / product.buy_price) * 100).toFixed(0);
            
            html += `
                <div class="product-card">
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name}">` : 
                        `<div class="product-image-placeholder">
                            <i class="fas fa-box"></i>
                        </div>`
                    }
                    <h3>${product.name}</h3>
                    <div class="product-price">
                        <span class="price">${product.sell_price.toFixed(2)} ر.س</span>
                        ${profitPercent > 20 ? 
                            `<span class="discount">${profitPercent}% ربح</span>` : 
                            ''
                        }
                    </div>
                    <div class="product-stock">
                        ${product.quantity > 0 ? 
                            `<span class="in-stock">متوفر (${product.quantity})</span>` :
                            '<span class="out-of-stock">غير متوفر</span>'
                        }
                    </div>
                    <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> أضف إلى السلة
                    </button>
                </div>
            `;
        });
        
        grid.innerHTML = html;
        
        // إضافة مستمعين لأزرار إضافة إلى السلة
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                addToCart(productId);
            });
        });
        
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
    }
}

// البحث عن المنتجات
async function searchProducts() {
    const searchTerm = document.querySelector('.nav-search input').value.trim();
    
    if (!searchTerm) {
        alert('الرجاء إدخال كلمة للبحث');
        return;
    }
    
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${searchTerm}%`)
            .limit(20);
        
        if (error) throw error;
        
        // عرض نتائج البحث
        if (products && products.length > 0) {
            // يمكن تنفيذ عرض نتائج البحث في صفحة منفصلة أو نافذة منبثقة
            alert(`تم العثور على ${products.length} منتج يحتوي على "${searchTerm}"`);
        } else {
            alert('لم يتم العثور على منتجات تطابق بحثك');
        }
        
    } catch (error) {
        console.error('خطأ في البحث:', error);
        alert('حدث خطأ أثناء البحث');
    }
}

// إضافة منتج إلى عربة التسوق
async function addToCart(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        if (product.quantity <= 0) {
            alert('هذا المنتج غير متوفر حالياً');
            return;
        }
        
        // الحصول على عربة التسوق الحالية من localStorage
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // التحقق إذا كان المنتج موجوداً بالفعل
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity >= product.quantity) {
                alert('لا يمكن إضافة كمية أكبر من المخزون المتاح');
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.sell_price,
                quantity: 1,
                image: product.image_url
            });
        }
        
        // حفظ عربة التسوق
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // تحديث واجهة عربة التسوق
        updateCartDisplay();
        
        // إشعار النجاح
        alert(`تمت إضافة "${product.name}" إلى عربة التسوق`);
        
    } catch (error) {
        console.error('خطأ في إضافة المنتج:', error);
        alert('حدث خطأ أثناء إضافة المنتج إلى السلة');
    }
}

// تحديث عرض عربة التسوق
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cartTotal');
    
    // تحديث العداد
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // تحديث العناصر
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">عربة التسوق فارغة</p>';
        cartTotal.textContent = '0 ر.س';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <div class="item-price">${item.price.toFixed(2)} ر.س × ${item.quantity}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm" onclick="updateCartItem(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-sm" onclick="updateCartItem(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = total.toFixed(2) + ' ر.س';
}

// تحديث كمية المنتج في عربة التسوق
window.updateCartItem = function(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
};

// إزالة منتج من عربة التسوق
window.removeFromCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
};

// التحقق من حالة المصادقة
async function checkAuthStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // تحديث واجهة المستخدم للمستخدم المسجل
        document.querySelector('.fa-user').parentElement.innerHTML = `
            <div class="user-menu">
                <span>مرحباً!</span>
                <div class="user-dropdown">
                    <a href="#" onclick="viewProfile()">الملف الشخصي</a>
                    <a href="#" onclick="viewOrders()">طلباتي</a>
                    <a href="#" onclick="logout()">تسجيل الخروج</a>
                </div>
            </div>
        `;
    }
}

// التعامل مع تسجيل الدخول
async function handleLogin(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        alert('تم تسجيل الدخول بنجاح!');
        document.getElementById('authModal').style.display = 'none';
        checkAuthStatus();
        
    } catch (error) {
        alert('خطأ في تسجيل الدخول: ' + error.message);
    }
}

// التعامل مع التسجيل
async function handleRegister(e) {
    e.preventDefault();
    
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
    
    if (password !== confirmPassword) {
        alert('كلمة المرور غير متطابقة');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: name
                }
            }
        });
        
        if (error) throw error;
        
        alert('تم إنشاء الحساب بنجاح! تم إرسال رابط التفعيل إلى بريدك الإلكتروني');
        document.getElementById('authModal').style.display = 'none';
        
    } catch (error) {
        alert('خطأ في إنشاء الحساب: ' + error.message);
    }
}

// تبديل علامات المصادقة
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
    
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

// تسجيل الخروج
async function logout() {
    try {
        await supabase.auth.signOut();
        alert('تم تسجيل الخروج بنجاح');
        location.reload();
    } catch (error) {
        alert('خطأ في تسجيل الخروج: ' + error.message);
    }
}

// إضافة تنسيقات إضافية للمتجر
const storeStyles = document.createElement('style');
storeStyles.textContent = `
    .store-nav {
        background-color: white;
        box-shadow: var(--box-shadow);
        position: sticky;
        top: 0;
        z-index: 1000;
    }
    
    .nav-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .nav-brand h1 {
        color: var(--primary-color);
        margin: 0;
        font-size: 1.5rem;
    }
    
    .nav-search {
        display: flex;
        flex: 1;
        max-width: 500px;
        margin: 0 20px;
    }
    
    .nav-search input {
        flex: 1;
        padding: 10px 15px;
        border: 2px solid #eee;
        border-radius: 25px 0 0 25px;
        font-size: 1rem;
    }
    
    .nav-search button {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 0 25px 25px 0;
        cursor: pointer;
    }
    
    .nav-actions {
        display: flex;
        gap: 20px;
    }
    
    .nav-icon {
        position: relative;
        color: var(--dark-color);
        font-size: 1.2rem;
    }
    
    .cart-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: var(--danger-color);
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .categories-section, .featured-products {
        padding: 40px 20px;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .categories-section h2, .featured-products h2 {
        text-align: center;
        margin-bottom: 30px;
        color: var(--primary-color);
    }
    
    .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }
    
    .category-card {
        text-align: center;
        padding: 20px;
        border-radius: var(--border-radius);
        color: white;
        cursor: pointer;
        transition: var(--transition);
    }
    
    .category-card:hover {
        transform: translateY(-5px);
    }
    
    .category-icon {
        font-size: 2rem;
        margin-bottom: 10px;
    }
    
    .category-card h3 {
        margin: 10px 0;
        font-size: 1.2rem;
    }
    
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 25px;
    }
    
    .product-card {
        background-color: white;
        border-radius: var(--border-radius);
        padding: 20px;
        box-shadow: var(--box-shadow);
        text-align: center;
        transition: var(--transition);
    }
    
    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }
    
    .product-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 15px;
    }
    
    .product-image-placeholder {
        width: 100%;
        height: 200px;
        background-color: #f5f5f5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        color: var(--gray-color);
        font-size: 3rem;
    }
    
    .product-card h3 {
        margin: 10px 0;
        color: var(--dark-color);
        font-size: 1.1rem;
    }
    
    .product-price {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
    }
    
    .price {
        font-size: 1.3rem;
        font-weight: bold;
        color: var(--primary-color);
    }
    
    .discount {
        background-color: var(--danger-color);
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.9rem;
    }
    
    .product-stock {
        margin: 10px 0;
    }
    
    .in-stock {
        color: #27ae60;
        font-weight: bold;
    }
    
    .out-of-stock {
        color: var(--danger-color);
        font-weight: bold;
    }
    
    .cart-sidebar {
        position: fixed;
        top: 0;
        left: -350px;
        width: 350px;
        height: 100%;
        background-color: white;
        box-shadow: var(--box-shadow);
        transition: var(--transition);
        z-index: 1001;
        display: flex;
        flex-direction: column;
    }
    
    .cart-sidebar.show {
        left: 0;
    }
    
    .cart-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .cart-header h3 {
        margin: 0;
        color: var(--primary-color);
    }
    
    .close-cart {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--gray-color);
    }
    
    .cart-items {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
    }
    
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    
    .item-info h4 {
        margin: 0 0 5px 0;
        font-size: 1rem;
    }
    
    .item-price {
        color: var(--primary-color);
        font-weight: bold;
    }
    
    .item-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .empty-cart {
        text-align: center;
        color: var(--gray-color);
        padding: 40px 20px;
    }
    
    .cart-footer {
        padding: 20px;
        border-top: 1px solid #eee;
    }
    
    .cart-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        font-size: 1.2rem;
        font-weight: bold;
    }
    
    .checkout-btn {
        width: 100%;
    }
    
    .auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1002;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .auth-content {
        background-color: white;
        border-radius: var(--border-radius);
        width: 90%;
        max-width: 400px;
        overflow: hidden;
    }
    
    .auth-header {
        padding: 20px;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .auth-header h3 {
        margin: 0;
        color: white;
    }
    
    .close-auth {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
    }
    
    .auth-body {
        padding: 20px;
    }
    
    .auth-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 2px solid #eee;
    }
    
    .auth-tab {
        flex: 1;
        padding: 10px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        color: var(--gray-color);
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
    }
    
    .auth-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
        font-weight: bold;
    }
    
    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .auth-form input {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
    }
    
    .user-menu {
        position: relative;
        cursor: pointer;
    }
    
    .user-menu span {
        color: var(--primary-color);
        font-weight: bold;
    }
    
    .user-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        background-color: white;
        box-shadow: var(--box-shadow);
        border-radius: var(--border-radius);
        padding: 10px 0;
        min-width: 150px;
        display: none;
    }
    
    .user-menu:hover .user-dropdown {
        display: block;
    }
    
    .user-dropdown a {
        display: block;
        padding: 8px 15px;
        color: var(--dark-color);
        text-decoration: none;
        transition: var(--transition);
    }
    
    .user-dropdown a:hover {
        background-color: #f5f5f5;
        color: var(--primary-color);
    }
    
    @media (max-width: 768px) {
        .nav-container {
            flex-direction: column;
            gap: 15px;
        }
        
        .nav-search {
            max-width: 100%;
            margin: 10px 0;
        }
        
        .cart-sidebar {
            width: 100%;
            left: -100%;
        }
        
        .categories-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .products-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (max-width: 480px) {
        .categories-grid {
            grid-template-columns: 1fr;
        }
        
        .products-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(storeStyles);