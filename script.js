// =========================================================================
// 1. إعداد Supabase والبيانات الأولية (Initial Data & Supabase Setup)
// =========================================================================

// معلومات اتصال Supabase
const SUPABASE_URL = 'https://bmehblfgoxxbokiqvojb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWhibGZnb3h4Ym9raXF2b2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTA1NzYsImV4cCI6MjA3OTY4NjU3Nn0.CJKGad9xl5ZZv-hHkc0Ot3yLEsHyyGfb-R3yfm5p_mfc';

// تأكد من أن متغير العميل هو 'supabase'
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// البيانات الأولية (تستخدم كـ Fallback أو Mock-up قبل جلب البيانات الفعلية)
let localData = {
    products: [
        { id: 1, name: 'تِيشِيرت فاخر', category: 'ملابس', categoryId: 1, buyPrice: 7000, sellPrice: 10000, quantity: 15, supplier: 'المورد أ', image: 'tshirt-1.png' },
        { id: 2, name: 'عباية سوداء مطرزة', category: 'ملابس', categoryId: 1, buyPrice: 15000, sellPrice: 20000, quantity: 2, supplier: 'المورد ب', image: 'abaya.png' },
        { id: 3, name: 'حجاب حريري ناعم', category: 'ملابس', categoryId: 1, buyPrice: 5000, sellPrice: 8000, quantity: 25, supplier: 'المورد أ', image: 'hijab.png' },
        { id: 4, name: 'فول سوداني', category: 'مكسرات', categoryId: 2, buyPrice: 15, sellPrice: 18, quantity: 5, supplier: 'المورد ج', image: 'peanut.png' },
        { id: 5, name: 'عدس', category: 'بقوليات', categoryId: 3, buyPrice: 12, sellPrice: 15, quantity: 8, supplier: 'المورد ج', image: 'lentil.png' },
        { id: 6, name: 'جبنة كيري', category: 'ألبان', categoryId: 4, buyPrice: 10, sellPrice: 12, quantity: 3, supplier: 'المورد د', image: 'kiri.png' }
    ],
    categories: [
        { id: 1, name: 'ملابس', description: 'أزياء واكسسوارات' },
        { id: 2, name: 'مكسرات', description: 'مكسرات وحبوب' },
        { id: 3, name: 'بقوليات', description: 'بقوليات مجففة' },
        { id: 4, name: 'ألبان', description: 'منتجات الألبان' }
    ],
    units: [
        { id: 1, name: 'قطعة', description: 'لوحدات المفردة' },
        { id: 2, name: 'كجم', description: 'للمواد الوزنية' },
        { id: 3, name: 'علبة', description: 'للمنتجات المعلبة' }
    ],
    currencies: [
        { id: 1, name: 'ريال سعودي', symbol: 'ر.س', rate: 1.00 },
        { id: 2, name: 'دولار أمريكي', symbol: '$', rate: 3.75 }
    ],
    suppliers: [
        { id: 101, name: 'المورد أ', phone: '0501234567' },
        { id: 102, name: 'المورد ب', phone: '0507654321' },
    ],
    purchases: [
        { id: 1, invoiceId: 'INV-001', date: '2025-11-28', product: 'تِيشِيرت فاخر', total: 70000, paymentStatus: 'Paid' },
        { id: 2, invoiceId: 'INV-002', date: '2025-11-29', product: 'عباية سوداء مطرزة', total: 30000, paymentStatus: 'Unpaid' },
    ],
    paymentMethods: [
        { id: 'mastercard', name: 'ماستر كارد', icon: 'fab fa-cc-mastercard', enabled: true },
        { id: 'paypal', name: 'باي بال', icon: 'fab fa-cc-paypal', enabled: true },
        { id: 'cash_on_delivery', name: 'دفع عند الإستلام', icon: 'fas fa-hand-holding-dollar', enabled: true }
    ],
    customers: [
        { id: 1, name: 'أحمد علي', email: 'ahmed@example.com', registered: '2025-10-01', totalOrders: 5 },
        { id: 2, name: 'فاطمة محمد', email: 'fatima@example.com', registered: '2025-11-15', totalOrders: 2 }
    ],
    cart: [],
    orders: []
};

const LOW_STOCK_THRESHOLD = 5;

// =========================================================================
// 2. وظائف Supabase (CRUD Operations)
// =========================================================================

/**
 * دالة جلب البيانات من جدول معين.
 * @param {string} tableName اسم الجدول في Supabase
 * @returns {Promise<Array>} قائمة البيانات
 */
async function fetchData(tableName) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*');

        if (error) throw error;
        // تحديث البيانات المحلية بعد الجلب الناجح
        localData[tableName] = data;
        return data;
    } catch (error) {
        // حماية: نستخدم البيانات المحلية كخيار احتياطي (Fall-back)
        console.warn(`Supabase connection failed for ${tableName}. Using local mock data.`, error.message);
        return localData[tableName] || [];
    }
}

/**
 * دالة إضافة بيانات جديدة.
 */
async function insertData(tableName, data) {
    try {
        const { data: insertedData, error } = await supabase
            .from(tableName)
            .insert(data)
            .select();

        if (error) throw error;
        // محاكاة الإضافة المحلية حتى يتم التحديث التلقائي
        localData[tableName].push(insertedData[0]); 
        return insertedData;
    } catch (error) {
        console.error(`Error inserting data into ${tableName}:`, error.message);
        return null;
    }
}

/**
 * دالة تحديث البيانات.
 */
async function updateData(tableName, id, updatedFields) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .update(updatedFields)
            .eq('id', id)
            .select();

        if (error) throw error;
        // محاكاة التحديث المحلي
        const index = localData[tableName].findIndex(item => item.id === id);
        if (index !== -1) {
            localData[tableName][index] = { ...localData[tableName][index], ...updatedFields };
        }
        return data;
    } catch (error) {
        console.error(`Error updating data in ${tableName}:`, error.message);
        return null;
    }
}

/**
 * دالة حذف البيانات.
 */
async function deleteData(tableName, id) {
    if (!confirm(`هل أنت متأكد من حذف العنصر رقم ${id} من جدول ${tableName}؟`)) return false;

    try {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;
        // محاكاة الحذف المحلي
        localData[tableName] = localData[tableName].filter(item => item.id !== id);
        return true;
    } catch (error) {
        console.error(`Error deleting data from ${tableName}:`, error.message);
        return false;
    }
}

// =========================================================================
// 3. وظائف الإدارة والتنقل (Navigation & UI Management)
// =========================================================================

function navigateTo(viewId) {
    const allViews = document.querySelectorAll('#app-container section');
    allViews.forEach(view => {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden-view');
        targetView.classList.add('active-view');
    }
    
    if (viewId === 'cart-view') renderCart();
    if (viewId === 'customer-dashboard-view') renderCustomerDashboard();
}

/**
 * دالة التنقل بين واجهات المسؤول (تستخدم في admin.html).
 */
async function navigateToAdmin(viewId) {
    const allViews = document.querySelectorAll('#admin-app-container section');
    allViews.forEach(view => {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden-view');
        targetView.classList.add('active-view');
    }

    // تحميل البيانات الخاصة بالقسم
    if (viewId === 'products-log-view') {
        renderProductsLog();
    } else if (viewId === 'purchases-view') {
        renderPurchasesLog();
    } else if (viewId === 'inventory-alerts-view') {
        renderInventoryAlerts();
    } else if (viewId === 'reports-view') {
        calculateAndRenderReports();
    } else if (viewId === 'settings-view') {
        renderPaymentSettings();
    } else if (viewId === 'suppliers-view') {
        renderSuppliersLog();
    } else if (viewId === 'order-management-view') {
        renderAdminOrderManagement();
    } else if (viewId === 'customers-view') {
        renderCustomersLog(); // **جديد**
    } else if (viewId === 'units-view') {
        renderUnitsLog(); // **جديد**
    } else if (viewId === 'currencies-view') {
        renderCurrenciesLog(); // **جديد**
    } else if (viewId === 'departments-view') {
        renderCategoriesLog(); // **جديد**
    } else if (viewId === 'inventory-view') {
        renderInventoryCategories(); // **جديد**
    } else if (viewId === 'sales-view') {
        await renderSalesManagement(); // **جديد**
    }
}

// =========================================================================
// 4. وظائف واجهة العميل (Customer Frontend Functions)
// =========================================================================

/**
 * تفعيل/تعطيل زر إظهار كلمة المرور.
 * @param {HTMLButtonElement} button زر العين
 * @param {HTMLInputElement} input حقل كلمة المرور
 */
function togglePasswordVisibility(button, input) {
    // الضغط المطول (mousedown) لإظهار، والإفلات (mouseup) للإخفاء
    button.addEventListener('mousedown', () => {
        input.type = 'text';
        button.querySelector('i').className = 'fas fa-eye-slash';
    });
    button.addEventListener('mouseup', () => {
        input.type = 'password';
        button.querySelector('i').className = 'fas fa-eye';
    });
    // لأجهزة اللمس
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        input.type = 'text';
        button.querySelector('i').className = 'fas fa-eye-slash';
    });
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        input.type = 'password';
        button.querySelector('i').className = 'fas fa-eye';
    });
}

/**
 * معالجة تسجيل الدخول (باستخدام Supabase Auth).
 */
async function processLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDisplay = document.getElementById('login-error');

    errorDisplay.textContent = '';
    
    // استخدام وظيفة تسجيل الدخول من Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorDisplay.textContent = `خطأ في تسجيل الدخول: ${error.message}`;
    } else {
        alert('تم تسجيل الدخول بنجاح! نعتذر، لوحة التحكم غير متاحة حالياً.');
        document.getElementById('login-modal').style.display = 'none';
        // يفترض أن يتم توجيه المستخدم إلى لوحة تحكم العميل:
        // navigateTo('customer-dashboard-view');
        // document.getElementById('customer-name').textContent = data.user.email;
        window.location.reload();
    }
}

/**
 * معالجة إنشاء حساب جديد (باستخدام Supabase Auth).
 */
async function processSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errorDisplay = document.getElementById('signup-error');

    errorDisplay.textContent = '';

    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: { display_name: name } // حفظ الاسم كـ metadata
        }
    });

    if (error) {
        errorDisplay.textContent = `خطأ في إنشاء الحساب: ${error.message}`;
    } else if (data.user) {
        alert('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد التسجيل.');
        document.getElementById('signup-modal').style.display = 'none';
        document.getElementById('login-modal').style.display = 'block';
    }
}

// ... بقية وظائف العميل (renderProducts, addToCart, updateCartCount, renderCart, removeFromCart, selectPaymentMethod, validateForm) تبقى كما هي ...

function renderProducts(productsList) {
    const productsListElement = document.getElementById('products-list');
    if (!productsListElement) return;

    productsListElement.innerHTML = '';
    productsList.forEach(product => {
        const isLowStock = product.quantity <= LOW_STOCK_THRESHOLD;

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image ? product.image : 'placeholder.png'}" alt="${product.name}">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">${product.sellPrice.toLocaleString('ar-SA')} ر.س</p>
                <p class="stock-status">
                    الكمية المتبقية: <span class="${isLowStock ? 'low-stock' : ''}">${product.quantity}</span>
                </p>
                <button class="primary-btn add-to-cart-btn" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> أضف إلى العربة
                </button>
            </div>
        `;
        productsListElement.appendChild(productCard);
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const product = localData.products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = localData.cart.find(item => item.id === productId);

    if (cartItem) {
        if (cartItem.quantity < product.quantity) {
            cartItem.quantity++;
        } else {
            alert('عفواً، لا يمكن إضافة المزيد! لقد وصلت إلى الحد الأقصى للمخزون المتاح.');
            return;
        }
    } else {
        localData.cart.push({ ...product, quantity: 1 });
    }

    updateCartCount();
    alert(`${product.name} أُضيف إلى عربة التسوق.`);
}

function updateCartCount() {
    const count = localData.cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

function renderCart() {
    // ... منطق عرض العربة كما هو ...
    const cartListElement = document.getElementById('cart-items-list');
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');
    const shippingFeeElement = document.getElementById('shipping-fee');
    const paymentOptionsContainer = document.getElementById('payment-options');

    if (!cartListElement || !subtotalElement || !totalElement || !paymentOptionsContainer) return;

    cartListElement.innerHTML = '';
    let subtotal = 0;
    const shippingFee = 15.00; // قيمة الشحن الثابتة

    if (localData.cart.length === 0) {
        cartListElement.innerHTML = '<p class="empty-state">عربة التسوق فارغة.</p>';
        subtotalElement.textContent = '0.00 ر.س';
        shippingFeeElement.textContent = '0.00 ر.س';
        totalElement.textContent = '0.00 ر.س';
        document.getElementById('checkout-steps').style.display = 'none';
        return;
    }

    document.getElementById('checkout-steps').style.display = 'block';

    localData.cart.forEach(item => {
        const itemTotal = item.sellPrice * item.quantity;
        subtotal += itemTotal;

        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-details">
                <img src="${item.image ? item.image : 'placeholder.png'}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.sellPrice.toLocaleString('ar-SA')} ر.س x ${item.quantity}</p>
                </div>
            </div>
            <div class="item-actions">
                <p class="financial-data">${itemTotal.toLocaleString('ar-SA')} ر.س</p>
                <button class="secondary-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        cartListElement.appendChild(cartItemElement);
    });

    const total = subtotal + shippingFee;

    subtotalElement.textContent = `${subtotal.toLocaleString('ar-SA')} ر.س`;
    shippingFeeElement.textContent = `${shippingFee.toLocaleString('ar-SA')} ر.س`;
    totalElement.textContent = `${total.toLocaleString('ar-SA')} ر.س`;

    paymentOptionsContainer.innerHTML = '';
    localData.paymentMethods.forEach(method => {
        const optionCard = document.createElement('div');
        optionCard.className = `payment-option-card ${method.enabled ? '' : 'disabled'}`;
        optionCard.setAttribute('data-method-id', method.id);
        optionCard.innerHTML = `<i class="${method.icon}"></i> ${method.name}`;
        
        if (method.enabled) {
            optionCard.addEventListener('click', () => selectPaymentMethod(method.id));
        } else {
            optionCard.title = 'غير متاح حالياً';
        }
        paymentOptionsContainer.appendChild(optionCard);
    });
}

function removeFromCart(productId) {
    const itemIndex = localData.cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        localData.cart.splice(itemIndex, 1);
        renderCart();
        updateCartCount();
    }
}

function selectPaymentMethod(methodId) {
    document.querySelectorAll('.payment-option-card').forEach(card => {
        card.classList.remove('selected');
    });
    const selected = document.querySelector(`.payment-option-card[data-method-id="${methodId}"]`);
    if (selected && !selected.classList.contains('disabled')) {
        selected.classList.add('selected');
        document.getElementById('checkout-form').setAttribute('data-selected-payment', methodId);
    }
}

function validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
            input.style.border = '1px solid red';
            isValid = false;
        } else {
            input.style.border = '';
        }
        
        if (input.getAttribute('data-validation') === 'phone' && !input.value.match(/^[0-9]{10,15}$/)) {
            alert('يرجى إدخال رقم هاتف صحيح (10-15 رقم).');
            input.style.border = '1px solid red';
            isValid = false;
        }
    });

    const selectedPayment = form.getAttribute('data-selected-payment');
    if (!selectedPayment) {
        alert('يرجى اختيار طريقة الدفع.');
        isValid = false;
    }

    return isValid;
}

async function processOrder(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form) || localData.cart.length === 0) return;

    const selectedPayment = form.getAttribute('data-selected-payment');
    const shippingAddress = document.getElementById('shipping-address').value;
    const shippingPhone = document.getElementById('shipping-phone').value;
    const subtotal = localData.cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
    const shippingFee = 15.00;
    const total = subtotal + shippingFee;

    // محاكاة التشفير:
    const encryptedData = {
        address: btoa(shippingAddress),
        phone: btoa(shippingPhone),
    };
    
    // إرسال الطلب إلى Supabase (جدول orders)
    const newOrder = {
        customer_id: 'guest_user',
        date: new Date().toISOString(),
        total_amount: total,
        status: 'Pending',
        payment_method: selectedPayment,
        shipping_address: encryptedData.address,
        shipping_phone: encryptedData.phone,
        items: JSON.stringify(localData.cart),
        id: Date.now() // Mock ID
    };

    const insertedOrder = await insertData('orders', newOrder); // **ملاحظة: insertData تم تعديلها لتأخذ صفيفاً**
    const orderData = insertedOrder ? insertedOrder[0] : newOrder;


    if (insertedOrder) {
        // تحديث المخزون المحلي (يفترض أن يتم في Supabase Triggers/Functions)
        for (const cartItem of localData.cart) {
            const product = localData.products.find(p => p.id === cartItem.id);
            if (product) {
                const newQuantity = product.quantity - cartItem.quantity;
                await updateData('products', product.id, { quantity: newQuantity });
            }
        }

        localData.cart = [];
        updateCartCount();
        localData.orders.push(orderData); 

        alert('تم إتمام طلبك بنجاح! سيتم تحويلك إلى صفحة تتبع الطلب.');
        navigateTo('order-management-view');
        renderOrderDetails(orderData);
    } else {
        alert('حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.');
    }
}

function renderOrderDetails(order) {
    const detailsContainer = document.getElementById('order-details-content');
    if (!detailsContainer) return;
    
    const address = order.shipping_address ? atob(order.shipping_address) : 'غير متوفر';
    const phone = order.shipping_phone ? atob(order.shipping_phone) : 'غير متوفر';

    detailsContainer.innerHTML = `
        <div class="data-card">
            <h3>شكراً لطلبك!</h3>
            <p><strong>رقم الطلب:</strong> #${order.id || 'N/A'}</p>
            <p><strong>التاريخ:</strong> ${new Date(order.date).toLocaleDateString('ar-SA')}</p>
            <p><strong>الإجمالي النهائي:</strong> <span class="financial-data">${order.total_amount.toLocaleString('ar-SA')} ر.س</span></p>
            <p><strong>حالة الطلب:</strong> <span class="status-badge status-pending">${order.status}</span></p>
            
            <h4 style="margin-top: 15px; color: #00796b;">تفاصيل الشحن</h4>
            <p><strong>العنوان:</strong> ${address}</p>
            <p><strong>الهاتف:</strong> ${phone}</p>
            <p><strong>طريقة الدفع:</strong> ${localData.paymentMethods.find(m => m.id === order.payment_method)?.name || 'N/A'}</p>
        </div>
    `;
}


// =========================================================================
// 5. وظائف لوحة تحكم المسؤول (Admin Panel Functions) - (تعديلات شاملة)
// =========================================================================

/**
 * تحديث حالة دفع فاتورة المشتريات.
 */
async function updatePurchasePaymentStatus(purchaseId, status) {
    const updated = await updateData('purchases', purchaseId, { paymentStatus: status });
    if (updated) {
        alert(`تم تحديث حالة دفع الفاتورة #${purchaseId} إلى: ${status === 'Paid' ? 'مدفوعة' : 'معلقة'}`);
        renderPurchasesLog();
    }
}

/**
 * عرض سجل المشتريات (مع إمكانية تعديل حالة الدفع).
 */
function renderPurchasesLog() {
    const tableBody = document.getElementById('purchases-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    localData.purchases.forEach(purchase => {
        const statusClass = purchase.paymentStatus === 'Paid' ? 'status-paid' : 'status-unpaid';
        const statusText = purchase.paymentStatus === 'Paid' ? 'مدفوعة' : 'غير مدفوعة';
        
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${purchase.invoiceId}</td>
            <td>${purchase.date}</td>
            <td>${purchase.product}</td>
            <td class="financial-data">${purchase.total.toLocaleString('ar-SA')} ر.س</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <select onchange="updatePurchasePaymentStatus(${purchase.id}, this.value)">
                    <option value="Paid" ${purchase.paymentStatus === 'Paid' ? 'selected' : ''}>مدفوعة</option>
                    <option value="Unpaid" ${purchase.paymentStatus === 'Unpaid' ? 'selected' : ''}>غير مدفوعة</option>
                </select>
            </td>
        `;
    });
}

/**
 * عرض سجل العملاء.
 */
async function renderCustomersLog() {
    const customers = await fetchData('customers');
    const tableBody = document.getElementById('customers-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    customers.forEach(customer => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${new Date(customer.registered).toLocaleDateString('ar-SA')}</td>
            <td>${customer.totalOrders}</td>
        `;
    });
}

/**
 * عرض فئات المنتجات في صفحة المخزون.
 */
async function renderInventoryCategories() {
    const categories = await fetchData('categories');
    const container = document.getElementById('category-cards-container');
    const categoryProductsSection = document.getElementById('category-products-list');

    if (!container || !categoryProductsSection) return;

    container.innerHTML = '';
    categoryProductsSection.style.display = 'none';

    categories.forEach((category, index) => {
        const card = document.createElement('div');
        // استخدام ألوان عشوائية بسيطة للمحاكاة
        const colors = ["pink", "purple", "teal", "yellow", "lavender", "green", "red", "cyan", "orange", "gray", "blue", "brown"];
        const color = colors[index % colors.length];
        
        card.className = 'section-card';
        card.setAttribute('data-color', color);
        card.setAttribute('data-category-id', category.id);
        card.innerHTML = `
            <i class="fas fa-boxes"></i>
            <span>${category.name}</span>
        `;
        card.addEventListener('click', () => {
            renderProductsByCategoryId(category.id, category.name);
        });
        container.appendChild(card);
    });
}

/**
 * عرض منتجات فئة محددة.
 */
function renderProductsByCategoryId(categoryId, categoryName) {
    const products = localData.products.filter(p => p.categoryId === categoryId);
    const tableBody = document.getElementById('inventory-products-table-body');
    const categoryNameDisplay = document.getElementById('selected-category-name');
    const categoryProductsSection = document.getElementById('category-products-list');

    if (!tableBody || !categoryNameDisplay || !categoryProductsSection) return;

    categoryNameDisplay.textContent = categoryName;
    tableBody.innerHTML = '';
    categoryProductsSection.style.display = 'block';

    products.forEach(product => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td class="financial-data">${product.sellPrice.toLocaleString('ar-SA')} ر.س</td>
            <td>
                <button class="secondary-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
            </td>
        `;
    });
}

/**
 * عرض إدارة الأقسام (الفئات).
 */
async function renderCategoriesLog() {
    const categories = await fetchData('categories');
    const tableBody = document.getElementById('categories-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    categories.forEach(category => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.description || 'لا يوجد وصف'}</td>
            <td>
                <button class="secondary-btn" onclick="editCategory(${category.id}, '${category.name}', '${category.description}')"><i class="fas fa-edit"></i></button>
                <button class="secondary-btn" onclick="deleteCategory(${category.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
    // إضافة مستمع حدث زر الإضافة
    document.getElementById('add-category-btn').onclick = () => addCategory();
}

/**
 * إضافة/تعديل فئة.
 */
async function addCategory(id = null, currentName = '', currentDescription = '') {
    const name = prompt(`أدخل اسم الفئة ${id ? 'المحدث' : 'الجديد'}:`, currentName);
    if (name) {
        const description = prompt('أدخل وصف الفئة (اختياري):', currentDescription || '');
        const data = { name, description };
        
        if (id) {
            await updateData('categories', id, data);
        } else {
            await insertData('categories', data);
        }
        renderCategoriesLog();
    }
}

/**
 * حذف فئة.
 */
async function deleteCategory(id) {
    const success = await deleteData('categories', id);
    if (success) {
        alert('تم حذف الفئة بنجاح.');
        renderCategoriesLog();
    }
}

/**
 * عرض سجل الوحدات.
 */
async function renderUnitsLog() {
    const units = await fetchData('units');
    const tableBody = document.getElementById('units-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    units.forEach(unit => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${unit.name}</td>
            <td>${unit.description || 'لا يوجد وصف'}</td>
            <td>
                <button class="secondary-btn" onclick="editUnit(${unit.id}, '${unit.name}')"><i class="fas fa-edit"></i></button>
                <button class="secondary-btn" onclick="deleteUnit(${unit.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
    document.getElementById('add-unit-btn').onclick = () => addUnit();
}

/**
 * إضافة/تعديل وحدة.
 */
async function addUnit(id = null, currentName = '') {
    const name = prompt(`أدخل اسم الوحدة ${id ? 'المحدث' : 'الجديد'} (مثال: كجم، قطعة):`, currentName);
    if (name) {
        const data = { name, description: '' }; // يمكن توسيعها لاحقاً
        
        if (id) {
            await updateData('units', id, data);
        } else {
            await insertData('units', data);
        }
        renderUnitsLog();
    }
}

/**
 * حذف وحدة.
 */
async function deleteUnit(id) {
    const success = await deleteData('units', id);
    if (success) {
        alert('تم حذف الوحدة بنجاح.');
        renderUnitsLog();
    }
}

/**
 * عرض سجل العملات.
 */
async function renderCurrenciesLog() {
    const currencies = await fetchData('currencies');
    const tableBody = document.getElementById('currencies-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    currencies.forEach(currency => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${currency.name}</td>
            <td>${currency.symbol}</td>
            <td>${currency.rate.toFixed(4)}</td>
            <td>
                <button class="secondary-btn" onclick="editCurrency(${currency.id}, '${currency.name}', '${currency.symbol}', ${currency.rate})"><i class="fas fa-edit"></i></button>
                <button class="secondary-btn" onclick="deleteCurrency(${currency.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
    document.getElementById('add-currency-btn').onclick = () => addCurrency();
}

/**
 * إضافة/تعديل عملة.
 */
async function addCurrency(id = null, currentName = '', currentSymbol = '', currentRate = 1.0) {
    const name = prompt(`أدخل اسم العملة ${id ? 'المحدث' : 'الجديد'}:`, currentName);
    if (name) {
        const symbol = prompt('أدخل رمز العملة (مثال: $):', currentSymbol);
        const rate = parseFloat(prompt('أدخل سعر الصرف مقابل الريال السعودي (مثال: 3.75):', currentRate));
        
        if (isNaN(rate)) return alert('سعر الصرف يجب أن يكون رقماً.');

        const data = { name, symbol, rate };
        
        if (id) {
            await updateData('currencies', id, data);
        } else {
            await insertData('currencies', data);
        }
        renderCurrenciesLog();
    }
}

/**
 * حذف عملة.
 */
async function deleteCurrency(id) {
    const success = await deleteData('currencies', id);
    if (success) {
        alert('تم حذف العملة بنجاح.');
        renderCurrenciesLog();
    }
}


/**
 * عرض وإدارة المبيعات (الطلبات).
 */
async function renderSalesManagement() {
    const orders = await fetchData('orders'); // جلب كل الطلبات
    const tableBody = document.getElementById('admin-sales-table-body');
    const totalSalesDisplay = document.getElementById('total-sales-value');
    
    if (!tableBody || !totalSalesDisplay) return;

    let totalSales = 0;

    tableBody.innerHTML = '';
    orders.forEach(order => {
        totalSales += order.total_amount;
        
        const statusClass = order.status === 'Pending' ? 'status-pending' : order.status === 'Shipped' ? 'status-shipped' : 'status-delivered';
        const phone = order.shipping_phone ? atob(order.shipping_phone) : 'N/A';
        
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>العميل (هاتف: ${phone})</td>
            <td>${new Date(order.date).toLocaleDateString('ar-SA')}</td>
            <td class="financial-data">${order.total_amount.toLocaleString('ar-SA')} ر.س</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            <td>
                <button class="secondary-btn" onclick="viewOrderDetails(${order.id})"><i class="fas fa-eye"></i></button>
            </td>
        `;
    });
    
    totalSalesDisplay.textContent = totalSales.toLocaleString('ar-SA');
    
    // ربط زر تصدير PDF
    document.getElementById('export-sales-pdf-btn').onclick = () => exportSalesToPDF(orders, totalSales);
}

/**
 * تصدير فواتير المبيعات إلى PDF.
 */
function exportSalesToPDF(orders, totalSales) {
    // تتطلب مكتبة jspdf
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: 'a4', unit: 'pt', orientation: 'p' });
    
    // إضافة خط عربي
    doc.addFont('Tajawal-Regular.ttf', 'Tajawal', 'normal');
    doc.setFont('Tajawal');
    
    const margin = 40;
    let y = 60;
    
    // وظيفة لعكس النص لدعم RTL (تتطلب معالجة متقدمة لـ jspdf لم يتم تضمينها)
    const reverseText = (text) => text.split('').reverse().join(''); 

    doc.setFontSize(20).text(reverseText('تقرير المبيعات الكلي - متجر غادة'), 400, y, { align: 'right' });
    y += 30;
    doc.setFontSize(12).text(reverseText(`الإجمالي العام: ${totalSales.toLocaleString('ar-SA')} ر.س`), 550, y, { align: 'right' });
    y += 20;

    const tableData = orders.map(order => [
        `#${order.id}`,
        `${new Date(order.date).toLocaleDateString('ar-SA')}`,
        order.status,
        `${order.total_amount.toLocaleString('ar-SA')} ر.س`
    ]);
    
    // jspdf-autotable (إذا كانت متوفرة)
    // doc.autoTable({
    //     startY: y + 10,
    //     head: [[reverseText('رقم الطلب'), reverseText('التاريخ'), reverseText('الحالة'), reverseText('الإجمالي')]],
    //     body: tableData,
    //     styles: { font: 'Tajawal', fontStyle: 'normal' },
    //     headStyles: { fillColor: [0, 121, 107] }
    // });
    
    // تصدير بسيط
    alert('تم محاكاة إنشاء ملف PDF. للحصول على ملف PDF حقيقي، يجب تضمين مكتبة jspdf-autotable والخطوط العربية بشكل صحيح.');
    // doc.save('Sales_Report.pdf');
}

/**
 * عرض واجهة إدارة الطلبات (للمسؤول).
 */
function renderAdminOrderManagement() {
    const tableBody = document.getElementById('admin-orders-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    localData.orders.forEach(order => {
        const statusClass = order.status === 'Pending' ? 'status-pending' : order.status === 'Shipped' ? 'status-shipped' : 'status-delivered';
        const phone = order.shipping_phone ? atob(order.shipping_phone) : 'N/A';
        
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>#${order.id || 'N/A'}</td>
            <td>العميل (هاتف: ${phone})</td>
            <td>${new Date(order.date).toLocaleDateString('ar-SA')}</td>
            <td class="financial-data">${order.total_amount.toLocaleString('ar-SA')} ر.س</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            <td>
                <select onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>معلق</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>شحن</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>توصيل</option>
                </select>
            </td>
        `;
    });
}

async function updateOrderStatus(orderId, newStatus) {
    const order = localData.orders.find(o => o.id === orderId);
    if (order) {
        await updateData('orders', orderId, { status: newStatus });
        alert(`تم تحديث حالة الطلب #${orderId} إلى: ${newStatus}`);
        renderAdminOrderManagement();
        if (document.getElementById('admin-sales-table-body')) renderSalesManagement(); // تحديث شاشة المبيعات
    }
}


// ... بقية وظائف المسؤول (renderProductsLog, renderInventoryAlerts, increaseQuantity, renderSuppliersLog, calculateAndRenderReports, renderPaymentSettings, togglePaymentMethod) تبقى كما هي ...
function renderProductsLog() {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    localData.products.forEach(product => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.buyPrice.toLocaleString('ar-SA')} ر.س</td>
            <td>${product.sellPrice.toLocaleString('ar-SA')} ر.س</td>
            <td>${product.quantity}</td>
            <td>${product.supplier}</td>
            <td>
                <button class="secondary-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                <button class="secondary-btn" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
}

function renderInventoryAlerts() {
    const lowStockList = document.getElementById('low-stock-list');
    const alertCountElement = document.getElementById('inventory-alert-count');
    if (!lowStockList || !alertCountElement) return;

    lowStockList.innerHTML = '';
    const lowStockProducts = localData.products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);

    alertCountElement.textContent = lowStockProducts.length;

    if (lowStockProducts.length === 0) {
        lowStockList.innerHTML = '<p class="data-card">✅ لا توجد تنبيهات مخزون حالياً.</p>';
        return;
    }
    
    lowStockProducts.forEach(product => {
        const itemElement = document.createElement('div');
        itemElement.className = 'low-stock-item data-card';
        itemElement.innerHTML = `
            <div class="item-details">
                <h4>${product.name} <span class="low-stock-badge">منخفض</span></h4>
                <p class="item-category">${product.category}</p>
            </div>
            <p class="quantity-info">
                المتبقي: <span class="remaining">${product.quantity}</span>
            </p>
            <p class="item-actions">
                <button class="primary-btn" onclick="increaseQuantity(${product.id}, 10)">زيادة الكمية</button>
                <button class="secondary-btn" onclick="deleteProduct(${product.id})">حذف</button>
            </p>
        `;
        lowStockList.appendChild(itemElement);
    });
}

async function increaseQuantity(productId, amount) {
    const product = localData.products.find(p => p.id === productId);
    if (product) {
        const newQuantity = product.quantity + amount;
        await updateData('products', productId, { quantity: newQuantity });
        alert(`تم زيادة كمية ${product.name} بمقدار ${amount}. الكمية الجديدة: ${newQuantity}`);
        renderInventoryAlerts();
        renderProductsLog();
        if (document.getElementById('inventory-products-table-body')) renderProductsByCategoryId(product.categoryId, product.category);
    }
}

function renderSuppliersLog() {
    const tableBody = document.getElementById('suppliers-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    localData.suppliers.forEach(supplier => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.phone}</td>
            <td>
                <button class="secondary-btn" onclick="editSupplier(${supplier.id})"><i class="fas fa-edit"></i></button>
                <button class="secondary-btn" onclick="deleteSupplier(${supplier.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
}

function calculateAndRenderReports() {
    // ... منطق حساب التقارير كما هو ...
    const topSellingList = document.getElementById('top-selling-products-list');
    const totalProfitDisplay = document.getElementById('total-profit-display');
    if (!topSellingList || !totalProfitDisplay) return;

    let totalProfit = 0;
    
    const salesData = localData.products.map(product => {
        const profitPerUnit = product.sellPrice - product.buyPrice;
        const profitMargin = ((product.sellPrice - product.buyPrice) / product.buyPrice) * 100;
        const totalSalesValue = product.sellPrice * (15 - product.quantity); 
        const totalProfitValue = profitPerUnit * (15 - product.quantity);
        
        totalProfit += totalProfitValue;

        return {
            name: product.name,
            totalSales: totalSalesValue,
            totalProfit: totalProfitValue,
            profitMargin: profitMargin.toFixed(1)
        };
    }).sort((a, b) => b.totalSales - a.totalSales);

    totalProfitDisplay.textContent = totalProfit.toLocaleString('ar-SA');
    
    topSellingList.innerHTML = '';
    salesData.slice(0, 5).forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'top-selling-item';
        itemElement.innerHTML = `
            <div class="top-selling-info">
                <span>${index + 1}. ${item.name}</span>
                <span class="low-stock">| هامش الربح: ${item.profitMargin}%</span>
            </div>
            <span class="top-selling-sales financial-data">${item.totalSales.toLocaleString('ar-SA')} ر.س</span>
        `;
        topSellingList.appendChild(itemElement);
    });
}

function renderPaymentSettings() {
    const settingsContainer = document.getElementById('payment-methods-settings');
    if (!settingsContainer) return;

    settingsContainer.innerHTML = '';

    localData.paymentMethods.forEach(method => {
        const toggleElement = document.createElement('div');
        toggleElement.className = 'payment-method-toggle';
        toggleElement.innerHTML = `
            <span>${method.name}</span>
            <label class="toggle-switch">
                <input type="checkbox" id="toggle-${method.id}" ${method.enabled ? 'checked' : ''} onchange="togglePaymentMethod('${method.id}')">
                <span class="slider"></span>
            </label>
        `;
        settingsContainer.appendChild(toggleElement);
    });
}

function togglePaymentMethod(methodId) {
    const method = localData.paymentMethods.find(m => m.id === methodId);
    if (method) {
        method.enabled = !method.enabled;
        alert(`${method.name} أصبحت الآن ${method.enabled ? 'مفعلة' : 'معطلة'}.`);
        // يجب هنا إرسال تحديث إلى Supabase
    }
}


// =========================================================================
// 6. تهيئة التطبيق (Initialization)
// =========================================================================

async function initializeApp() {
    // 1. جلب البيانات من Supabase
    await fetchData('products');
    await fetchData('categories');
    await fetchData('units');
    await fetchData('currencies');
    await fetchData('customers');
    await fetchData('orders');
    await fetchData('purchases');
    
    // 2. تحديد الواجهة الحالية (عميل أو مسؤول)
    if (document.getElementById('products-view')) {
        // واجهة العميل (index.html)
        renderProducts(localData.products);
        updateCartCount();

        // مستمعي الأحداث لواجهة العميل
        document.getElementById('cart-icon-btn').addEventListener('click', () => navigateTo('cart-view'));
        
        // فتح نموذج تسجيل الدخول
        document.getElementById('login-btn').addEventListener('click', () => {
            document.getElementById('login-modal').style.display = 'block';
            document.getElementById('signup-modal').style.display = 'none';
        });
        // إغلاق النماذج
        document.querySelectorAll('.modal .close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => e.target.closest('.modal').style.display = 'none');
        });
        
        // التبديل إلى إنشاء حساب
        document.getElementById('signup-link').addEventListener('click', () => {
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('signup-modal').style.display = 'block';
        });

        // زر نسيت كلمة المرور (محاكاة)
        document.getElementById('forgot-password-link').addEventListener('click', () => {
            alert('تم إرسال رابط لإعادة تعيين كلمة المرور إلى بريدك الإلكتروني (محاكاة).');
        });

        // تفعيل أزرار إظهار كلمة المرور
        document.querySelectorAll('.toggle-password-btn').forEach(button => {
            const input = button.closest('.password-group').querySelector('input');
            togglePasswordVisibility(button, input);
        });

        // معالجة نماذج الدخول والتسجيل
        document.getElementById('login-form').addEventListener('submit', processLogin);
        document.getElementById('signup-form').addEventListener('submit', processSignup);
        
        document.getElementById('checkout-form').addEventListener('submit', processOrder);
        document.getElementById('admin-login-link').addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
        
    } else if (document.getElementById('admin-dashboard-view')) {
        // واجهة المسؤول (admin.html)
        
        document.querySelectorAll('.section-card, .management-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const viewId = e.currentTarget.getAttribute('data-view');
                navigateToAdmin(viewId);
            });
        });
        
        document.getElementById('admin-logout-btn').addEventListener('click', () => {
            // تسجيل الخروج من Supabase
            supabase.auth.signOut().then(() => {
                alert('تم تسجيل الخروج من لوحة التحكم.');
                window.location.href = 'index.html';
            });
        });
        
        navigateToAdmin('admin-dashboard-view');
    }
}

// تشغيل دالة التهيئة عند تحميل الصفحة
window.addEventListener('load', initializeApp);
