// admin-functions.js - ملف شامل لوظائف الإدارة

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async function() {
    await initializeAdminApp();
});

async function initializeAdminApp() {
    try {
        // التحقق من تسجيل الدخول
        await checkAdminLogin();
        
        // تهيئة المكونات
        initializeNavigation();
        initializeEventListeners();
        initializeModals();
        
        // تحميل البيانات
        await loadDashboardData();
        updateAllCounts();
        
        // تحديث تلقائي كل دقيقة
        setInterval(updateDashboardStats, 60000);
        
        console.log('✅ تم تهيئة تطبيق الإدارة بنجاح');
    } catch (error) {
        console.error('❌ خطأ في تهيئة التطبيق:', error);
        showMessage('حدث خطأ في تحميل التطبيق', 'error');
    }
}

// ========== نظام التنقل ==========
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section-content');
    const pageTitle = document.getElementById('pageTitle');
    
    // إنشاء البطاقات الرئيسية
    createMainCards();
    
    navLinks.forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // إزالة النشاط من جميع الروابط
            navLinks.forEach(l => l.classList.remove('active'));
            
            // إضافة النشاط للرابط الحالي
            this.classList.add('active');
            
            // إخفاء جميع الأقسام
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // الحصول على القسم المطلوب
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId + 'Section');
            const targetPageTitle = this.querySelector('span').textContent;
            
            // تحديث عنوان الصفحة
            if (pageTitle) {
                pageTitle.textContent = targetPageTitle;
                const icon = this.querySelector('i').className;
                pageTitle.innerHTML = `<i class="${icon}"></i> ${targetPageTitle}`;
            }
            
            // إظهار القسم المطلوب
            if (targetSection) {
                targetSection.style.display = 'block';
                
                // تحميل بيانات القسم
                await loadSectionData(sectionId);
            }
        });
    });
    
    // التبويبات
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// إنشاء البطاقات الرئيسية
function createMainCards() {
    const cardsGrid = document.querySelector('#dashboardSection .cards-grid');
    if (!cardsGrid) return;
    
    const cardsData = [
        {
            title: 'العملاء',
            icon: 'fa-users',
            color: 'gradient-1',
            description: 'إدارة حسابات العملاء ومتابعة طلباتهم',
            section: 'customers'
        },
        {
            title: 'الطلبات',
            icon: 'fa-shopping-cart',
            color: 'gradient-2',
            description: 'عرض وتحديث وتتبع حالة الطلبات',
            section: 'orders'
        },
        {
            title: 'الأقسام',
            icon: 'fa-list-alt',
            color: 'gradient-3',
            description: 'إدارة فئات المنتجات وتنظيمها',
            section: 'categories'
        },
        {
            title: 'تنبيهات المخزون',
            icon: 'fa-exclamation-triangle',
            color: 'gradient-4',
            description: 'مراقبة المنتجات المنخفضة في المخزون',
            section: 'inventory'
        },
        {
            title: 'التقارير',
            icon: 'fa-chart-bar',
            color: 'gradient-5',
            description: 'تقارير المبيعات والربحية والإحصائيات',
            section: 'reports'
        },
        {
            title: 'سجل المنتجات',
            icon: 'fa-box',
            color: 'gradient-6',
            description: 'إدارة جميع المنتجات الحقيقية والرقمية',
            section: 'products'
        },
        {
            title: 'المشتريات',
            icon: 'fa-file-invoice-dollar',
            color: 'gradient-7',
            description: 'فواتير المشتريات وإدارة الموردين',
            section: 'purchases'
        },
        {
            title: 'الوحدات',
            icon: 'fa-balance-scale',
            color: 'gradient-8',
            description: 'إدارة وحدات القياس والبيع',
            section: 'units'
        },
        {
            title: 'العملات',
            icon: 'fa-money-bill-wave',
            color: 'gradient-9',
            description: 'إدارة العملات وأسعار الصرف',
            section: 'currencies'
        },
        {
            title: 'الإعدادات',
            icon: 'fa-cog',
            color: 'gradient-10',
            description: 'الإعدادات العامة وتخصيص النظام',
            section: 'settings'
        },
        {
            title: 'إدارة الأقسام',
            icon: 'fa-sitemap',
            color: 'gradient-11',
            description: 'تنظيم هيكل الأقسام والفروع',
            section: 'categories'
        },
        {
            title: 'الموردين',
            icon: 'fa-truck',
            color: 'gradient-12',
            description: 'إدارة الموردين وسجل التعاملات',
            section: 'suppliers'
        }
    ];
    
    cardsGrid.innerHTML = '';
    
    cardsData.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.setAttribute('data-section', card.section);
        
        cardElement.innerHTML = `
            <div class="card-icon ${card.color}">
                <i class="fas ${card.icon}"></i>
            </div>
            <h3>${card.title}</h3>
            <p>${card.description}</p>
        `;
        
        cardElement.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            const navLink = document.querySelector(`.sidebar-nav a[data-section="${section}"]`);
            if (navLink) navLink.click();
        });
        
        cardsGrid.appendChild(cardElement);
    });
}

// تبديل التبويبات
function switchTab(tabId) {
    // إزالة النشاط من جميع التبويبات
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // تفعيل التبويب والمحتوى المطلوب
    const activeTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(tabId + 'Tab');
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    // تحميل بيانات التبويب إذا لزم الأمر
    loadTabData(tabId);
}

// ========== إدارة الأحداث ==========
function initializeEventListeners() {
    // زر تسجيل الخروج
    document.getElementById('logoutBtn')?.addEventListener('click', logoutAdmin);
    
    // زر تحديث البيانات
    document.getElementById('refreshData')?.addEventListener('click', refreshAllData);
    
    // أزرار الإضافة
    document.getElementById('addCustomerBtn')?.addEventListener('click', () => showAddModal('customer'));
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => showAddModal('category'));
    document.getElementById('addRealProductBtn')?.addEventListener('click', () => showAddModal('product', 'real'));
    document.getElementById('addDigitalProductBtn')?.addEventListener('click', () => showAddModal('product', 'digital'));
    document.getElementById('addPurchaseBtn')?.addEventListener('click', () => showAddModal('purchase'));
    document.getElementById('addUnitBtn')?.addEventListener('click', () => showAddModal('unit'));
    document.getElementById('addCurrencyBtn')?.addEventListener('click', () => showAddModal('currency'));
    document.getElementById('addSupplierBtn')?.addEventListener('click', () => showAddModal('supplier'));
    
    // أزرار التصدير والطباعة
    document.getElementById('exportOrdersBtn')?.addEventListener('click', exportOrders);
    document.getElementById('printInvoicesBtn')?.addEventListener('click', printInvoices);
    
    // أزرار خاصة
    document.getElementById('restockAllBtn')?.addEventListener('click', restockAllProducts);
    document.getElementById('updateRatesBtn')?.addEventListener('click', updateCurrencyRates);
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
    document.getElementById('resetSettingsBtn')?.addEventListener('click', resetSettings);
    
    // النماذج
    document.getElementById('settingsForm')?.addEventListener('submit', saveSettings);
    document.getElementById('productForm')?.addEventListener('submit', saveProduct);
    document.getElementById('invoiceForm')?.addEventListener('submit', saveInvoice);
    document.getElementById('restockForm')?.addEventListener('submit', processRestock);
    
    // البحث والتصفية
    document.getElementById('customerSearch')?.addEventListener('input', debounce(searchCustomers, 300));
    document.getElementById('productSearch')?.addEventListener('input', debounce(searchProducts, 300));
    document.getElementById('supplierSearch')?.addEventListener('input', debounce(searchSuppliers, 300));
    document.getElementById('orderStatusFilter')?.addEventListener('change', filterOrders);
    document.getElementById('orderDateFilter')?.addEventListener('change', filterOrders);
    document.getElementById('inventoryThreshold')?.addEventListener('change', loadInventoryAlerts);
    
    // تحديث الأسعار تلقائياً
    document.getElementById('buyPrice')?.addEventListener('input', calculateProfit);
    document.getElementById('sellPrice')?.addEventListener('input', calculateProfit);
}

// ========== إدارة النوافذ المنبثقة ==========
function initializeModals() {
    // إغلاق النوافذ
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // إغلاق بالنقر خارج النافذة
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// عرض نافذة منبثقة
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// إخفاء نافذة منبثقة
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========== تحميل بيانات الأقسام ==========
async function loadSectionData(sectionId) {
    try {
        switch(sectionId) {
            case 'customers':
                await loadCustomers();
                break;
            case 'orders':
                await loadOrders();
                break;
            case 'categories':
                await loadCategories();
                break;
            case 'inventory':
                await loadInventoryAlerts();
                break;
            case 'reports':
                await loadReports();
                break;
            case 'products':
                await loadProducts();
                break;
            case 'purchases':
                await loadPurchases();
                break;
            case 'units':
                await loadUnits();
                break;
            case 'currencies':
                await loadCurrencies();
                break;
            case 'settings':
                await loadSettings();
                break;
            case 'suppliers':
                await loadSuppliers();
                break;
        }
    } catch (error) {
        console.error(`خطأ في تحميل قسم ${sectionId}:`, error);
        showMessage(`حدث خطأ في تحميل ${sectionId}`, 'error');
    }
}

// تحميل بيانات التبويب
async function loadTabData(tabId) {
    try {
        switch(tabId) {
            case 'sales':
                await loadSalesReport();
                break;
            case 'products':
                await loadProductsReport();
                break;
            case 'customers':
                await loadCustomersReport();
                break;
            case 'profitability':
                await loadProfitabilityReport();
                break;
        }
    } catch (error) {
        console.error(`خطأ في تحميل تبويب ${tabId}:`, error);
    }
}

// ========== لوحة التحكم ==========
async function loadDashboardData() {
    try {
        await Promise.all([
            updateDashboardStats(),
            loadRecentOrders(),
            loadInventoryAlertsDashboard(),
            initializeSalesChart()
        ]);
    } catch (error) {
        console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
    }
}

async function updateDashboardStats() {
    try {
        // العملاء
        const { count: customersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_admin', false);
        
        // الطلبات
        const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });
        
        // المنتجات
        const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
        
        // المبيعات
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount');
        
        let totalSales = 0;
        if (orders) {
            totalSales = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        }
        
        // تحديث الواجهة
        document.getElementById('totalCustomers').textContent = customersCount || 0;
        document.getElementById('totalOrders').textContent = ordersCount || 0;
        document.getElementById('totalProducts').textContent = productsCount || 0;
        document.getElementById('totalSales').textContent = formatCurrency(totalSales);
        
        // تحديث العدادات في الشريط الجانبي
        updateSidebarCounts({
            customers: customersCount || 0,
            orders: ordersCount || 0,
            products: productsCount || 0,
            totalSales: totalSales
        });
        
    } catch (error) {
        console.error('خطأ في تحديث الإحصائيات:', error);
    }
}

// تحديث جميع العدادات
async function updateAllCounts() {
    try {
        const [
            customersCount,
            ordersCount,
            categoriesCount,
            inventoryCount,
            productsCount,
            purchasesCount,
            unitsCount,
            currenciesCount,
            suppliersCount
        ] = await Promise.all([
            getCount('profiles', 'is_admin', false),
            getCount('orders'),
            getCount('categories'),
            getLowStockCount(),
            getCount('products'),
            getCount('purchases'),
            getCount('units'),
            getCount('currencies'),
            getCount('suppliers')
        ]);
        
        updateSidebarCounts({
            customers: customersCount,
            orders: ordersCount,
            categories: categoriesCount,
            inventory: inventoryCount,
            products: productsCount,
            purchases: purchasesCount,
            units: unitsCount,
            currencies: currenciesCount,
            suppliers: suppliersCount
        });
        
    } catch (error) {
        console.error('خطأ في تحديث العدادات:', error);
    }
}

// دالة مساعدة للحصول على عدد السجلات
async function getCount(table, column = null, value = null) {
    let query = supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
    
    if (column && value !== null) {
        query = query.eq(column, value);
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
}

// دالة مساعدة لحساب المنتجات منخفضة المخزون
async function getLowStockCount() {
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('quantity', 5);
    
    if (error) throw error;
    return count || 0;
}

// تحديث العدادات في الشريط الجانبي
function updateSidebarCounts(counts) {
    const elements = {
        customersCount: counts.customers,
        ordersCount: counts.orders,
        categoriesCount: counts.categories,
        inventoryCount: counts.inventory,
        productsCount: counts.products,
        purchasesCount: counts.purchases,
        unitsCount: counts.units,
        currenciesCount: counts.currencies,
        suppliersCount: counts.suppliers
    };
    
    Object.entries(elements).forEach(([id, count]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline-block' : 'none';
        }
    });
}

// ========== العملاء ==========
async function loadCustomers() {
    try {
        const { data: customers, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_admin', false)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById('customersTable');
        if (!container) return;
        
        if (!customers || customers.length === 0) {
            container.innerHTML = '<div class="no-data">لا يوجد عملاء مسجلين</div>';
            return;
        }
        
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>تاريخ التسجيل</th>
                        <th>عدد الطلبات</th>
                        <th>إجمالي المشتريات</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];
            
            // الحصول على بيانات الطلبات
            const { data: orders } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('customer_id', customer.id);
            
            const orderCount = orders?.length || 0;
            const totalSpent = orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;
            const joinDate = new Date(customer.created_at).toLocaleDateString('ar-SA');
            
            // الحصول على البريد الإلكتروني من auth.users
            const { data: authUser } = await supabase.auth.admin.getUserById(customer.id);
            const email = authUser?.user?.email || 'غير متوفر';
            
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>
                        <strong>${customer.display_name}</strong>
                        ${customer.phone ? `<br><small>${customer.phone}</small>` : ''}
                    </td>
                    <td>${email}</td>
                    <td>${joinDate}</td>
                    <td><span class="badge badge-info">${orderCount}</span></td>
                    <td><strong>${formatCurrency(totalSpent)}</strong></td>
                    <td>
                        <span class="badge badge-success">نشط</span>
                    </td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm" onclick="viewCustomerDetails('${customer.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editCustomer('${customer.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${customer.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }
        
        html += '</tbody></table>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ في تحميل العملاء:', error);
        showMessage('حدث خطأ في تحميل بيانات العملاء', 'error');
    }
}

// البحث عن العملاء
async function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.trim();
    
    if (!searchTerm) {
        await loadCustomers();
        return;
    }
    
    try {
        const { data: customers, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_admin', false)
            .or(`display_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // تحديث الجدول بالنتائج
        updateCustomersTable(customers);
        
    } catch (error) {
        console.error('خطأ في البحث عن العملاء:', error);
        showMessage('حدث خطأ في البحث', 'error');
    }
}

// ========== الطلبات ==========
async function loadOrders() {
    try {
        const statusFilter = document.getElementById('orderStatusFilter')?.value;
        const dateFilter = document.getElementById('orderDateFilter')?.value;
        
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }
        
        if (dateFilter) {
            const startDate = new Date(dateFilter);
            const endDate = new Date(dateFilter);
            endDate.setDate(endDate.getDate() + 1);
            
            query = query.gte('created_at', startDate.toISOString())
                         .lt('created_at', endDate.toISOString());
        }
        
        const { data: orders, error } = await query;
        
        if (error) throw error;
        
        displayOrders(orders);
        
    } catch (error) {
        console.error('خطأ في تحميل الطلبات:', error);
        showMessage('حدث خطأ في تحميل الطلبات', 'error');
    }
}

// عرض الطلبات
async function displayOrders(orders) {
    const container = document.getElementById('ordersTable');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="no-data">لا توجد طلبات</div>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>التاريخ</th>
                    <th>المجموع</th>
                    <th>طريقة الدفع</th>
                    <th>حالة الشحن</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (const order of orders) {
        // الحصول على بيانات العميل
        let customerName = 'ضيف';
        if (order.customer_id) {
            const { data: customer } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('id', order.customer_id)
                .single();
            
            if (customer) {
                customerName = customer.display_name;
            }
        }
        
        const date = new Date(order.date).toLocaleDateString('ar-SA');
        const time = new Date(order.date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        
        html += `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${customerName}</td>
                <td>
                    ${date}<br>
                    <small>${time}</small>
                </td>
                <td><strong>${formatCurrency(order.total_amount)}</strong></td>
                <td>${order.payment_method}</td>
                <td>${getShippingStatus(order.shipping_status)}</td>
                <td>${getOrderStatusBadge(order.status)}</td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="updateOrderStatus(${order.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="printOrder(${order.id})">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// تصدير الطلبات
async function exportOrders() {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!orders || orders.length === 0) {
            showMessage('لا توجد طلبات للتصدير', 'warning');
            return;
        }
        
        // تحضير البيانات للتصدير
        const exportData = orders.map(order => ({
            'رقم الطلب': order.id,
            'التاريخ': new Date(order.date).toLocaleDateString('ar-SA'),
            'المجموع': order.total_amount,
            'طريقة الدفع': order.payment_method,
            'حالة الطلب': order.status,
            'عنوان الشحن': order.shipping_address,
            'هاتف الشحن': order.shipping_phone
        }));
        
        // إنشاء ملف CSV
        const csvContent = convertToCSV(exportData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `طلبات_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('تم تصدير الطلبات بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في تصدير الطلبات:', error);
        showMessage('حدث خطأ في تصدير الطلبات', 'error');
    }
}

// ========== المنتجات ==========
async function loadProducts() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        displayProducts(products);
        
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        showMessage('حدث خطأ في تحميل المنتجات', 'error');
    }
}

// عرض المنتجات
async function displayProducts(products) {
    const container = document.getElementById('productsTable');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="no-data">لا توجد منتجات</div>';
        return;
    }
    
    // الحصول على بيانات الأقسام
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name');
    
    const categoryMap = {};
    categories?.forEach(cat => {
        categoryMap[cat.id] = cat.name;
    });
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>القسم</th>
                    <th>السعر</th>
                    <th>الكمية</th>
                    <th>الربحية</th>
                    <th>المورد</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    products.forEach(product => {
        const categoryName = categoryMap[product.category_id] || 'غير مصنف';
        const profit = product.sell_price - product.buy_price;
        const profitMargin = product.buy_price > 0 ? ((profit / product.buy_price) * 100) : 0;
        const quantityClass = product.quantity < 5 ? 'badge-danger' : 'badge-success';
        const profitClass = profitMargin >= 20 ? 'badge-success' : profitMargin >= 10 ? 'badge-warning' : 'badge-danger';
        
        html += `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${product.image_url ? 
                            `<img src="${product.image_url}" alt="${product.name}" style="width: 40px; height: 40px; border-radius: 5px; object-fit: cover;">` : 
                            `<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-box" style="color: #999;"></i>
                            </div>`
                        }
                        <div>
                            <strong>${product.name}</strong>
                            ${product.sku ? `<br><small>SKU: ${product.sku}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>${categoryName}</td>
                <td>
                    <div style="text-align: left;">
                        <div><small>شراء: ${formatCurrency(product.buy_price)}</small></div>
                        <div><strong>بيع: ${formatCurrency(product.sell_price)}</strong></div>
                    </div>
                </td>
                <td><span class="badge ${quantityClass}">${product.quantity}</span></td>
                <td>
                    <span class="badge ${profitClass}">${profitMargin.toFixed(1)}%</span>
                    <br>
                    <small>${formatCurrency(profit)} ربح</small>
                </td>
                <td>${product.supplier || '-'}</td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm" onclick="viewProductDetails(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="restockProduct(${product.id})">
                        <i class="fas fa-boxes"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// البحث عن المنتجات
async function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.trim();
    
    if (!searchTerm) {
        await loadProducts();
        return;
    }
    
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
            .order('name');
        
        if (error) throw error;
        
        displayProducts(products);
        
    } catch (error) {
        console.error('خطأ في البحث عن المنتجات:', error);
        showMessage('حدث خطأ في البحث', 'error');
    }
}

// ========== المخزون والتنبيهات ==========
async function loadInventoryAlerts() {
    try {
        const threshold = parseInt(document.getElementById('inventoryThreshold')?.value) || 5;
        
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .lt('quantity', threshold)
            .order('quantity', { ascending: true });
        
        if (error) throw error;
        
        displayInventoryAlerts(products, threshold);
        
    } catch (error) {
        console.error('خطأ في تحميل تنبيهات المخزون:', error);
        showMessage('حدث خطأ في تحميل التنبيهات', 'error');
    }
}

// عرض تنبيهات المخزون
async function displayInventoryAlerts(products, threshold) {
    const container = document.getElementById('inventoryTable');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                لا توجد منتجات تحت الحد الأدنى للمخزون (${threshold})
            </div>
            <div class="no-data">جميع المنتجات في مستويات آمنة</div>
        `;
        return;
    }
    
    // تحديث العداد في الشريط الجانبي
    document.getElementById('inventoryCount').textContent = products.length;
    
    let html = `
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            يوجد ${products.length} منتجات تحتاج إلى إعادة تخزين (أقل من ${threshold})
        </div>
        <table>
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>المخزون الحالي</th>
                    <th>الحد الأدنى</th>
                    <th>سعر الشراء</th>
                    <th>سعر البيع</th>
                    <th>المورد</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    products.forEach(product => {
        const needed = threshold - product.quantity;
        const alertLevel = product.quantity < 2 ? 'danger' : product.quantity < 5 ? 'warning' : 'info';
        
        html += `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>
                    <span class="badge badge-${alertLevel}">${product.quantity}</span>
                </td>
                <td>${threshold}</td>
                <td>${formatCurrency(product.buy_price)}</td>
                <td><strong>${formatCurrency(product.sell_price)}</strong></td>
                <td>${product.supplier || '-'}</td>
                <td class="actions">
                    <button class="btn btn-success btn-sm" onclick="restockProduct(${product.id})">
                        <i class="fas fa-boxes"></i> إعادة تخزين
                    </button>
                    <button class="btn btn-info btn-sm" onclick="viewProductDetails(${product.id})">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                </td>
            </tr>
        `;
    });
