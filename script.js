
// ملف: script.js
// منطق تطبيق متجر غادة (العميل والمسؤول)
//

// =========================================================================
// 1. إعداد البيانات الأولية (Initial Data)
// =========================================================================

// تحديث هيكل البيانات المحلية ليشمل الأقسام والوحدات والعملات الجديدة
let localData = {
    // حالة المستخدم
    isLoggedIn: false,
    isAdmin: false,
    
    // بيانات المنتجات (محدثة بالوصف والكمية)
    products: [
        { id: 1, name: 'تِيشِيرت فاخر', category: 'ملابس', description: 'عباية سوداء مطرزة بخيوط ذهبية', buyPrice: 7000, sellPrice: 10000, quantity: 15, supplier: 'المورد أ', image: 'tshirt-1.png', currency: 'YER' }, 
        { id: 2, name: 'تيشيرت فاخر', category: 'ملابس', description: 'حجاب حريري ناعم ومريح', buyPrice: 6000, sellPrice: 8000, quantity: 2, supplier: 'المورد ب', image: 'abaya.png', currency: 'YER' }, 
        { id: 3, name: 'جبنة كيري', category: 'ألبان', buyPrice: 10.00, sellPrice: 12.00, quantity: 3, unit: 'حبة', supplier: 'المورد د', image: 'kiri.png', currency: 'SAR' }, 
        { id: 4, name: 'شاهي ربيع', category: 'مشروبات', buyPrice: 13.00, sellPrice: 18.00, quantity: 4, unit: 'كرتون', supplier: 'المورد هـ', image: 'tea.png', currency: 'SAR' }, 
        { id: 5, name: 'عين الجمل', category: 'مكسرات', buyPrice: 19.00, sellPrice: 25.00, quantity: 5, unit: 'دولار', supplier: 'المورد ج', image: 'walnut.png', currency: 'USD' }, 
        { id: 6, name: 'لوز', category: 'مكسرات', buyPrice: 15.00, sellPrice: 20.00, quantity: 60, unit: 'كيلو', supplier: 'المورد ج', image: 'almond.png', currency: 'USD' },
        { id: 7, name: 'فول سوداني', category: 'مكسرات', buyPrice: 18.00, sellPrice: 25.00, quantity: 25, unit: 'كرتون', supplier: 'المورد ج', image: 'peanut.png', currency: 'YER' },
    ],
    
    // عربة التسوق
    cart: [],
    
    // بيانات الوحدات
    units: [
        { id: 101, name: 'حبة', symbol: 'حبة' },
        { id: 102, name: 'كرتون', symbol: 'كرت' },
        { id: 103, name: 'كيلو', symbol: 'كجم' },
    ],
    
    // بيانات الأقسام (الفئات)
    categories: [
        { id: 201, name: 'ملابس' },
        { id: 202, name: 'ألبان' },
        { id: 203, name: 'مشروبات' },
        { id: 204, name: 'مكسرات' },
    ],
    
    // بيانات العملات (محدثة حسب الطلب)
    currencies: [
        { id: 501, name: 'دولار امريكي', symbol: 'دولار', code: 'USD', active: true, icon: 'fas fa-globe' },
        { id: 502, name: 'ريال يمني', symbol: 'ريال', code: 'YER', active: true, icon: 'fas fa-globe' },
        { id: 503, name: 'ريال سعودي', symbol: 'ر.س', code: 'SAR', active: true, icon: 'fas fa-money-bill-wave' },
    ],

    // بيانات التقارير (محاكاة)
    reports: {
        totalProfit: 2457.00,
        profitPercentage: 29.5,
        totalSalesValue: 8323.00,
        bestSelling: [
            { name: 'العدس', totalSales: 1800.00, unitsSold: 2, currency: 'SAR' },
            { name: 'فول سوداني', totalSales: 18.00, unitsSold: 1, currency: 'USD' },
        ],
        salesGraphData: [1, 2, 4, 8, 5, 2, 1] 
    }
};

const LOW_STOCK_THRESHOLD = 5;

// =========================================================================
// 2. وظائف واجهة العميل (Client Interface Functions)
// =========================================================================

/**
 * دالة لعرض منتجات المتجر.
 */
function renderProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    productsList.innerHTML = '';
    localData.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product.id);
        
        // استخدام currency لضبط العرض
        const currencySymbol = product.currency === 'USD' ? 'دولار' : (product.currency === 'SAR' ? 'ر.س' : 'ج.س');

        productCard.innerHTML = `
            <img src="assets/${product.image}" alt="${product.name}">
            <div class="product-details">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description || ''}</p> 
                <p class="product-price">${product.sellPrice.toLocaleString('ar-SA')} ${currencySymbol}</p>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i> أضف إلى العربة
            </button>
        `;
        productsList.appendChild(productCard);
    });
}

/**
 * دالة لإضافة منتج إلى عربة التسوق.
 */
function addToCart(productId) {
    const product = localData.products.find(p => p.id === productId);
    if (!product || product.quantity <= 0) {
        alert('عذراً، هذا المنتج غير متوفر حالياً.');
        return;
    }

    const cartItem = localData.cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        localData.cart.push({
            id: product.id,
            name: product.name,
            price: product.sellPrice,
            currency: product.currency,
            quantity: 1
        });
    }
    updateCartCount();
    alert(`تمت إضافة ${product.name} إلى العربة.`);
}

/**
 * دالة لتحديث عدد المنتجات في أيقونة العربة.
 */
function updateCartCount() {
    const count = localData.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// ... (بقية الدوال: renderCart, showCartModal, hideCartModal, checkout) ...


// =========================================================================
// 3. وظائف لوحة تحكم المسؤول (Admin Panel Functions)
// =========================================================================

/**
 * وظيفة التنقل بين واجهات المسؤول.
 */
function navigateToAdmin(viewId) {
    const allViews = document.querySelectorAll('.admin-view');
    allViews.forEach(view => {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden-view');
        targetView.classList.add('active-view');
    }

    // استدعاء دالة العرض المناسبة
    if (viewId === 'inventory-alerts-view') {
        renderInventoryAlerts();
    } else if (viewId === 'reports-view') {
        renderReportsView();
    } else if (viewId === 'currencies-view') {
        renderCurrenciesView();
    } else if (viewId === 'units-view') {
        renderUnitsView();
    } else if (viewId === 'departments-view') {
        renderDepartmentsView();
    } 
    // بقية الأقسام ...
}

// --- 3.1 وظائف قسم تنبيهات المخزون ---

/**
 * عرض تنبيهات المخزون للمنتجات التي توشك على النفاد.
 */
function renderInventoryAlerts() {
    const alertsContainer = document.getElementById('inventory-alerts-list');
    if (!alertsContainer) return;
    
    alertsContainer.innerHTML = '';
    const lowStockProducts = localData.products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);
    
    document.getElementById('low-stock-count').textContent = lowStockProducts.length;
    document.getElementById('dashboard-alert-count').textContent = lowStockProducts.length;

    lowStockProducts.forEach(product => {
        const productCategory = localData.categories.find(c => c.name === product.category);
        const currencySymbol = product.currency === 'USD' ? 'دولار' : (product.currency === 'SAR' ? 'ر.س' : 'ريال');
        
        const alertCard = document.createElement('div');
        alertCard.className = 'alert-item-card data-card';
        alertCard.innerHTML = `
            <div class="alert-header">
                <span class="alert-badge">منخفض</span>
                <span class="product-category">${productCategory ? productCategory.name : 'فئة غير معروفة'}</span>
            </div>
            <div class="alert-body">
                <h4>${product.name}</h4>
                <div class="product-info-row">
                    <p class="financial-data">${product.sellPrice.toLocaleString('ar-SA')} ${currencySymbol}</p>
                    <p class="remaining-qty">متبقي: <span>${product.quantity}</span></p>
                </div>
            </div>
            <div class="alert-actions">
                <button class="secondary-btn delete-btn" onclick="alert('محاكاة: حذف المنتج من التنبيهات')">حذف</button>
                <button class="primary-btn small-btn" onclick="increaseProductQuantity(${product.id})">زيادة الكمية</button>
            </div>
        `;
        alertsContainer.appendChild(alertCard);
    });
}

function increaseProductQuantity(productId) {
    const product = localData.products.find(p => p.id === productId);
    if (product) {
        product.quantity += 10;
        alert(`تم زيادة كمية ${product.name} إلى ${product.quantity}.`);
        renderInventoryAlerts();
    }
}

// --- 3.2 وظائف قسم التقارير ---

/**
 * عرض تقارير المبيعات والأرباح.
 */
function renderReportsView() {
    const reportData = localData.reports;
    
    document.getElementById('report-total-sales-value').textContent = reportData.totalSalesValue.toLocaleString('ar-SA');
    document.getElementById('report-total-profit').textContent = reportData.totalProfit.toLocaleString('ar-SA');
    document.getElementById('report-profit-percentage').textContent = reportData.profitPercentage;
    
    renderSalesGraph(reportData.salesGraphData);

    const bestSellingList = document.getElementById('best-selling-products');
    bestSellingList.innerHTML = '';
    
    reportData.bestSelling.forEach((item, index) => {
        const currencySymbol = item.currency === 'USD' ? 'دولار' : (item.currency === 'SAR' ? 'ر.س' : 'ريال');
        const itemCard = document.createElement('div');
        itemCard.className = 'best-selling-item';
        itemCard.innerHTML = `
            <div class="item-rank-icon">
                <span>${index + 1}</span>
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p><span>${item.unitsSold}</span> عملية بيع - <span>${item.unitsSold}</span> وحدة</p>
                <p class="financial-data">${item.totalSales.toLocaleString('ar-SA')} ${currencySymbol}</p>
            </div>
            <button class="package-icon-btn"><i class="fas fa-box"></i></button>
        `;
        bestSellingList.appendChild(itemCard);
    });
}

/**
 * محاكاة للرسم البياني للمبيعات.
 */
function renderSalesGraph(data) {
    const graphContainer = document.getElementById('sales-graph-container');
    if (!graphContainer) return;
    
    // محاكاة الرسم البياني
    graphContainer.innerHTML = `
        <div class="graph-placeholder" style="background: url('assets/graph_placeholder.svg') no-repeat center; height: 150px; border: 1px solid #eee; border-radius: 10px;">
        <p style="text-align: right; margin: 0; padding: 5px; font-weight: bold; color: #00796b;">${localData.reports.totalSalesValue.toLocaleString('ar-SA')} ر.س</p>
        </div>
    `;
}

// --- 3.3 وظائف قسم إدارة العملات ---

/**
 * عرض قائمة العملات.
 */
function renderCurrenciesView() {
    const currenciesList = document.getElementById('currencies-list');
    if (!currenciesList) return;
    
    currenciesList.innerHTML = '';
    
    document.getElementById('total-currencies-count').textContent = localData.currencies.length;
    
    localData.currencies.forEach(currency => {
        const currencyCard = document.createElement('div');
        currencyCard.className = 'currency-card data-card';
        const randomColor = ['green', 'pink', 'blue', 'orange'][Math.floor(Math.random() * 4)];

        currencyCard.innerHTML = `
            <div class="currency-details">
                <span class="currency-symbol-tag" data-color="${randomColor}">${currency.symbol}</span>
                <div class="currency-info">
                    <h4>${currency.name}</h4>
                    <p>${currency.code}</p>
                </div>
                <button class="currency-icon-btn"><i class="${currency.icon}"></i></button>
            </div>
            <button class="delete-currency-btn" onclick="deleteCurrency('${currency.code}')"><i class="fas fa-trash-can"></i> حذف العملة</button>
        `;
        currenciesList.appendChild(currencyCard);
    });

    document.getElementById('add-currency-btn').onclick = () => {
        const newCurrencyCode = prompt("أدخل رمز العملة الجديدة (مثل USD):");
        if (newCurrencyCode && newCurrencyCode.trim() !== '') {
            addCurrency(newCurrencyCode.toUpperCase());
        }
    };
}

/**
 * إضافة عملة جديدة (محاكاة).
 */
function addCurrency(code) {
    if (localData.currencies.some(c => c.code === code)) {
        alert(`العملة ${code} موجودة بالفعل.`);
        return;
    }
    
    const newId = localData.currencies.length + 501;
    const newCurrency = { 
        id: newId, 
        name: `عملة ${code}`, 
        symbol: code.substring(0, 3), 
        code: code, 
        active: true, 
        icon: 'fas fa-money-bill-wave' 
    };
    
    localData.currencies.push(newCurrency);
    alert(`تمت إضافة العملة ${code} بنجاح.`);
    renderCurrenciesView();
}

/**
 * حذف عملة (محاكاة).
 */
function deleteCurrency(code) {
    localData.currencies = localData.currencies.filter(c => c.code !== code);
    alert(`تم حذف العملة ${code} بنجاح.`);
    renderCurrenciesView();
}

// --- 3.4 وظائف قسم إدارة الوحدات ---

function renderUnitsView() {
    const unitsList = document.getElementById('units-list');
    if (!unitsList) return;
    
    unitsList.innerHTML = '';
    localData.units.forEach(unit => {
        const unitCard = document.createElement('div');
        unitCard.className = 'unit-card data-card';
        unitCard.innerHTML = `
            <h4>${unit.name}</h4>
            <p>${unit.symbol}</p>
            <button class="delete-btn" onclick="deleteUnit(${unit.id})"><i class="fas fa-trash-can"></i></button>
        `;
        unitsList.appendChild(unitCard);
    });
}

function deleteUnit(unitId) {
    localData.units = localData.units.filter(u => u.id !== unitId);
    alert('تم حذف الوحدة.');
    renderUnitsView();
}

// --- 3.5 وظائف قسم إدارة الأقسام ---

function renderDepartmentsView() {
    const departmentsList = document.getElementById('departments-list');
    if (!departmentsList) return;
    
    departmentsList.innerHTML = '';
    localData.categories.forEach(category => {
        const deptCard = document.createElement('div');
        deptCard.className = 'department-card data-card';
        deptCard.innerHTML = `
            <h4>${category.name}</h4>
            <button class="delete-btn" onclick="deleteDepartment(${category.id})"><i class="fas fa-trash-can"></i></button>
        `;
        departmentsList.appendChild(deptCard);
    });
}

function deleteDepartment(deptId) {
    localData.categories = localData.categories.filter(c => c.id !== deptId);
    alert('تم حذف القسم.');
    renderDepartmentsView();
}

// =========================================================================
// 4. وظائف المصادقة وإدارة النماذج (Authentication & Modal Management)
// =========================================================================

/**
 * إخفاء جميع النماذج.
 */
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active-modal');
        modal.classList.add('hidden-modal');
    });
}

/**
 * إظهار نموذج تسجيل الدخول.
 */
function showLoginModal() {
    hideAllModals();
    document.getElementById('login-modal').classList.remove('hidden-modal');
    document.getElementById('login-modal').classList.add('active-modal');
}

/**
 * إظهار نموذج إنشاء حساب جديد.
 */
function showRegisterModal() {
    hideAllModals();
    document.getElementById('register-modal').classList.remove('hidden-modal');
    document.getElementById('register-modal').classList.add('active-modal');
}

/**
 * إظهار نموذج نسيت كلمة المرور.
 */
function showForgotPasswordModal() {
    hideAllModals();
    document.getElementById('forgot-password-modal').classList.remove('hidden-modal');
    document.getElementById('forgot-password-modal').classList.add('active-modal');
}

/**
 * تسجيل خروج المستخدم.
 */
function logoutUser() {
    localData.isLoggedIn = false;
    localData.isAdmin = false;
    document.getElementById('products-view').classList.remove('active-view');
    document.getElementById('products-view').classList.add('hidden-view');
    showLoginModal();
    alert('تم تسجيل الخروج بنجاح.');
}

/**
 * محاكاة تسجيل الدخول.
 */
function simulateLogin() {
    // يمكن هنا التحقق من email/password
    localData.isLoggedIn = true;
    
    hideAllModals();
    
    // عرض واجهة العميل بعد تسجيل الدخول
    const clientView = document.getElementById('products-view');
    if (clientView) {
        clientView.classList.remove('hidden-view');
        clientView.classList.add('active-view');
        renderProducts();
        updateCartCount();
    }
}


// =========================================================================
// 5. ميزات واجهة المستخدم الإضافية (UI Enhancements)
// =========================================================================

/**
 * تفعيل خاصية إظهار/إخفاء كلمة المرور بالضغط المطول.
 */
function setupPasswordToggle() {
    const passwordInput = document.getElementById('login-password');
    const toggleIcon = document.getElementById('toggle-password');

    if (passwordInput && toggleIcon) {
        
        const showPassword = () => {
            passwordInput.setAttribute('type', 'text');
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        };

        const hidePassword = () => {
            passwordInput.setAttribute('type', 'password');
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        };

        // الربط بأحداث الفأرة واللمس
        toggleIcon.addEventListener('mousedown', showPassword);
        toggleIcon.addEventListener('mouseup', hidePassword);
        toggleIcon.addEventListener('mouseleave', hidePassword);
        toggleIcon.addEventListener('touchstart', showPassword);
        toggleIcon.addEventListener('touchend', hidePassword);
        toggleIcon.addEventListener('touchcancel', hidePassword);
    }
}

/**
 * تهيئة تطبيق المسؤول.
 */
function initializeAdminApp() {
    document.querySelectorAll('.section-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const viewId = e.currentTarget.getAttribute('data-view');
            navigateToAdmin(viewId);
        });
    });
    
    // تهيئة الواجهة وعرض البيانات الأولية (لوحة التحكم)
    navigateToAdmin('admin-dashboard-view');
}


// =========================================================================
// 6. تهيئة التطبيق (Initialization)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    const isAdminPage = document.getElementById('admin-app-container');

    if (!isAdminPage) {
        // تهيئة واجهة العميل (index.html)
        setupPasswordToggle();
        
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            simulateLogin();
        });
        
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('محاكاة: تم تسجيل الحساب. يمكنك تسجيل الدخول الآن.');
            showLoginModal();
        });
        
        document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('محاكاة: تم إرسال رابط إعادة تعيين كلمة المرور.');
            showLoginModal();
        });
        
        // إظهار شاشة تسجيل الدخول عند بدء التشغيل
        showLoginModal(); 
    }
});