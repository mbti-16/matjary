// navigation.js - إدارة التنقل بين الأقسام

// كائن يحتوي على معلومات جميع الأقسام
const sectionsData = {
    dashboard: {
        title: 'لوحة التحكم',
        icon: 'fa-tachometer-alt',
        description: 'نظرة عامة على النظام'
    },
    customers: {
        title: 'العملاء',
        icon: 'fa-users',
        description: 'إدارة حسابات العملاء'
    },
    orders: {
        title: 'الطلبات',
        icon: 'fa-shopping-cart',
        description: 'إدارة طلبات الشراء'
    },
    categories: {
        title: 'الأقسام',
        icon: 'fa-list-alt',
        description: 'إدارة فئات المنتجات'
    },
    inventory: {
        title: 'تنبيهات المخزون',
        icon: 'fa-exclamation-triangle',
        description: 'المنتجات المنخفضة في المخزون'
    },
    reports: {
        title: 'التقارير',
        icon: 'fa-chart-bar',
        description: 'تقارير المبيعات والربحية'
    },
    products: {
        title: 'سجل المنتجات',
        icon: 'fa-box',
        description: 'إدارة جميع المنتجات'
    },
    purchases: {
        title: 'المشتريات',
        icon: 'fa-file-invoice-dollar',
        description: 'فواتير المشتريات'
    },
    units: {
        title: 'الوحدات',
        icon: 'fa-balance-scale',
        description: 'إدارة وحدات القياس'
    },
    currencies: {
        title: 'العملات',
        icon: 'fa-money-bill-wave',
        description: 'إدارة العملات وأسعار الصرف'
    },
    settings: {
        title: 'الإعدادات',
        icon: 'fa-cog',
        description: 'الإعدادات العامة'
    },
    suppliers: {
        title: 'الموردين',
        icon: 'fa-truck',
        description: 'إدارة الموردين'
    }
};

// تهيئة التنقل
function initializeNavigation() {
    // ربط أحداث النقر على روابط الشريط الجانبي
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = this.getAttribute('data-section');
            
            if (sectionId) {
                // إزالة النشاط من جميع الروابط
                navLinks.forEach(l => l.classList.remove('active'));
                
                // إضافة النشاط للرابط الحالي
                this.classList.add('active');
                
                // تغيير القسم النشط
                changeActiveSection(sectionId);
            }
        });
    });
    
    // تفعيل قسم لوحة التحكم افتراضيًا
    const dashboardLink = document.querySelector('.sidebar-nav a[data-section="dashboard"]');
    if (dashboardLink) {
        dashboardLink.classList.add('active');
        changeActiveSection('dashboard');
    }
}

// تغيير القسم النشط
async function changeActiveSection(sectionId) {
    // إخفاء جميع الأقسام
    const allSections = document.querySelectorAll('.section-content');
    allSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // تحديث عنوان الصفحة
        updatePageTitle(sectionId);
        
        // تحميل بيانات القسم إذا لزم الأمر
        await loadSectionData(sectionId);
    } else {
        console.error(`القسم ${sectionId}Section غير موجود`);
        // إنشاء القسم ديناميكياً إذا لم يكن موجوداً
        createSection(sectionId);
    }
}

// تحديث عنوان الصفحة
function updatePageTitle(sectionId) {
    const pageTitle = document.getElementById('pageTitle');
    const sectionData = sectionsData[sectionId];
    
    if (pageTitle && sectionData) {
        pageTitle.innerHTML = `<i class="fas ${sectionData.icon}"></i> ${sectionData.title}`;
    }
}

// إنشاء قسم ديناميكياً
function createSection(sectionId) {
    const contentContainer = document.getElementById('contentContainer');
    const sectionData = sectionsData[sectionId];
    
    if (!contentContainer || !sectionData) return;
    
    const sectionHTML = `
        <section id="${sectionId}Section" class="section-content">
            <div class="table-container">
                <div class="table-header">
                    <h2><i class="fas ${sectionData.icon}"></i> ${sectionData.title}</h2>
                    <p>${sectionData.description}</p>
                </div>
                <div id="${sectionId}Content">
                    <div class="loading">جاري تحميل ${sectionData.title}...</div>
                </div>
            </div>
        </section>
    `;
    
    contentContainer.insertAdjacentHTML('beforeend', sectionHTML);
    
    // إظهار القسم الجديد
    const newSection = document.getElementById(`${sectionId}Section`);
    if (newSection) {
        newSection.style.display = 'block';
        updatePageTitle(sectionId);
        loadSectionData(sectionId);
    }
}

// تحميل بيانات القسم
async function loadSectionData(sectionId) {
    const contentDiv = document.getElementById(`${sectionId}Content`);
    
    if (!contentDiv) return;
    
    try {
        switch(sectionId) {
            case 'dashboard':
                await loadDashboardContent();
                break;
            case 'customers':
                await loadCustomersContent();
                break;
            case 'orders':
                await loadOrdersContent();
                break;
            case 'categories':
                await loadCategoriesContent();
                break;
            case 'inventory':
                await loadInventoryContent();
                break;
            case 'reports':
                await loadReportsContent();
                break;
            case 'products':
                await loadProductsContent();
                break;
            case 'purchases':
                await loadPurchasesContent();
                break;
            case 'units':
                await loadUnitsContent();
                break;
            case 'currencies':
                await loadCurrenciesContent();
                break;
            case 'settings':
                await loadSettingsContent();
                break;
            case 'suppliers':
                await loadSuppliersContent();
                break;
            default:
                contentDiv.innerHTML = `<div class="no-data">قيد التطوير</div>`;
        }
    } catch (error) {
        console.error(`خطأ في تحميل ${sectionId}:`, error);
        contentDiv.innerHTML = `<div class="error-message">حدث خطأ في تحميل البيانات</div>`;
    }
}

// ========== دوال تحميل المحتوى لكل قسم ==========

// لوحة التحكم
async function loadDashboardContent() {
    const contentDiv = document.getElementById('dashboardContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon gradient-1">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalCustomers">0</h3>
                    <p>إجمالي العملاء</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gradient-2">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalOrders">0</h3>
                    <p>إجمالي الطلبات</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gradient-3">
                    <i class="fas fa-box"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalProducts">0</h3>
                    <p>إجمالي المنتجات</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gradient-4">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalSales">0 ر.س</h3>
                    <p>إجمالي المبيعات</p>
                </div>
            </div>
        </div>
        
        <div class="cards-grid">
            <!-- البطاقات سيتم ملؤها بالجافاسكريبت -->
        </div>
        
        <div class="table-container">
            <h3><i class="fas fa-clock"></i> آخر الطلبات</h3>
            <div id="recentOrdersList"></div>
        </div>
        
        <div class="table-container">
            <h3><i class="fas fa-exclamation-triangle"></i> تنبيهات حديثة</h3>
            <div id="recentAlertsList"></div>
        </div>
    `;
    
    // تحميل البيانات
    await loadDashboardData();
}

// العملاء
async function loadCustomersContent() {
    const contentDiv = document.getElementById('customersContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <div class="search-bar">
                <input type="text" id="searchCustomer" placeholder="بحث عن عميل...">
                <button onclick="searchCustomers()"><i class="fas fa-search"></i></button>
            </div>
            <button class="btn btn-primary" onclick="showAddCustomerModal()">
                <i class="fas fa-user-plus"></i> إضافة عميل
            </button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>رقم الهاتف</th>
                    <th>تاريخ التسجيل</th>
                    <th>عدد الطلبات</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="customersTableBody">
                <tr><td colspan="7" class="loading">جاري تحميل بيانات العملاء...</td></tr>
            </tbody>
        </table>
        
        <div class="pagination" id="customersPagination"></div>
    `;
    
    // تحميل بيانات العملاء
    await loadCustomersData();
}

// الطلبات
async function loadOrdersContent() {
    const contentDiv = document.getElementById('ordersContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <select id="orderFilterStatus" onchange="filterOrders()">
                <option value="">جميع الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="processing">قيد التجهيز</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
            </select>
            <input type="date" id="orderFilterDate" onchange="filterOrders()">
            <button class="btn btn-success" onclick="exportOrders()">
                <i class="fas fa-download"></i> تصدير
            </button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>التاريخ</th>
                    <th>المجموع</th>
                    <th>طريقة الدفع</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="ordersTableBody">
                <tr><td colspan="7" class="loading">جاري تحميل الطلبات...</td></tr>
            </tbody>
        </table>
        
        <div class="pagination" id="ordersPagination"></div>
    `;
    
    await loadOrdersData();
}

// الأقسام
async function loadCategoriesContent() {
    const contentDiv = document.getElementById('categoriesContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <button class="btn btn-primary" onclick="showAddCategoryModal()">
                <i class="fas fa-plus"></i> إضافة قسم
            </button>
        </div>
        
        <div class="categories-grid" id="categoriesGrid">
            <div class="loading">جاري تحميل الأقسام...</div>
        </div>
    `;
    
    await loadCategoriesData();
}

// تنبيهات المخزون
async function loadInventoryContent() {
    const contentDiv = document.getElementById('inventoryContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-circle"></i>
            المنتجات التي تقل كميتها عن 5 وحدات
        </div>
        
        <div class="table-actions">
            <select id="inventoryThreshold" onchange="updateInventoryThreshold()">
                <option value="5">أقل من 5 قطع</option>
                <option value="10">أقل من 10 قطع</option>
                <option value="20">أقل من 20 قطعة</option>
            </select>
            <button class="btn btn-warning" onclick="restockAllLowProducts()">
                <i class="fas fa-boxes"></i> إعادة تخزين الكل
            </button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>المخزون الحالي</th>
                    <th>الحد الأدنى</th>
                    <th>سعر الشراء</th>
                    <th>سعر البيع</th>
                    <th>هامش الربح</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="inventoryTableBody">
                <tr><td colspan="7" class="loading">جاري تحميل التنبيهات...</td></tr>
            </tbody>
        </table>
    `;
    
    await loadInventoryData();
}

// التقارير
async function loadReportsContent() {
    const contentDiv = document.getElementById('reportsContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <input type="date" id="reportStartDate">
            <span>إلى</span>
            <input type="date" id="reportEndDate">
            <button class="btn btn-primary" onclick="generateReport()">
                <i class="fas fa-filter"></i> تطبيق
            </button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon gradient-1">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="stat-info">
                    <h3 id="reportTotalSales">0 ر.س</h3>
                    <p>إجمالي المبيعات</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gradient-2">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-info">
                    <h3 id="reportTotalProfit">0 ر.س</h3>
                    <p>إجمالي الربح</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gradient-3">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="stat-info">
                    <h3 id="reportTotalOrders">0</h3>
                    <p>عدد الطلبات</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gradient-4">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="stat-info">
                    <h3 id="reportProfitMargin">0%</h3>
                    <p>هامش الربح</p>
                </div>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="salesChart"></canvas>
        </div>
        
        <div class="table-container">
            <h3>أكثر المنتجات ربحية</h3>
            <div id="topProductsList"></div>
        </div>
    `;
    
    await loadReportsData();
}

// المنتجات
async function loadProductsContent() {
    const contentDiv = document.getElementById('productsContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <div class="search-bar">
                <input type="text" id="searchProduct" placeholder="بحث عن منتج...">
                <button onclick="searchProducts()"><i class="fas fa-search"></i></button>
            </div>
            <button class="btn btn-success" onclick="showAddProductModal('real')">
                <i class="fas fa-plus"></i> إضافة منتج حقيقي
            </button>
            <button class="btn btn-primary" onclick="showAddProductModal('digital')">
                <i class="fas fa-plus"></i> إضافة منتج رقمي
            </button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>القسم</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th>الربحية</th>
                    <th>المورد</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="productsTableBody">
                <tr><td colspan="7" class="loading">جاري تحميل المنتجات...</td></tr>
            </tbody>
        </table>
        
        <div class="pagination" id="productsPagination"></div>
    `;
    
    await loadProductsData();
}

// المشتريات
async function loadPurchasesContent() {
    const contentDiv = document.getElementById('purchasesContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <button class="btn btn-primary" onclick="showAddInvoiceModal()">
                <i class="fas fa-plus"></i> إضافة فاتورة
            </button>
            <button class="btn btn-success" onclick="printAllInvoices()">
                <i class="fas fa-print"></i> طباعة الكل
            </button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>التاريخ</th>
                    <th>المورد</th>
                    <th>المبلغ</th>
                    <th>حالة الدفع</th>
                    <th>ملاحظات</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="purchasesTableBody">
                <tr><td colspan="7" class="loading">جاري تحميل الفواتير...</td></tr>
            </tbody>
        </table>
        
        <div class="pagination" id="purchasesPagination"></div>
    `;
    
    await loadPurchasesData();
}

// الوحدات
async function loadUnitsContent() {
    const contentDiv = document.getElementById('unitsContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <button class="btn btn-primary" onclick="showAddUnitModal()">
                <i class="fas fa-plus"></i> إضافة وحدة
            </button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>اسم الوحدة</th>
                    <th>الرمز</th>
                    <th>الوصف</th>
                    <th>تاريخ الإضافة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="unitsTableBody">
                <tr><td colspan="5" class="loading">جاري تحميل الوحدات...</td></tr>
            </tbody>
        </table>
    `;
    
    await loadUnitsData();
}

// العملات
async function loadCurrenciesContent() {
    const contentDiv = document.getElementById('currenciesContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <button class="btn btn-primary" onclick="showAddCurrencyModal()">
                <i class="fas fa-plus"></i> إضافة عملة
            </button>
            <button class="btn btn-warning" onclick="updateCurrencyRates()">
                <i class="fas fa-sync"></i> تحديث الأسعار
            </button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>العملة</th>
                    <th>الرمز</th>
                    <th>سعر الصرف</th>
                    <th>الحالة</th>
                    <th>تاريخ التحديث</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="currenciesTableBody">
                <tr><td colspan="6" class="loading">جاري تحميل العملات...</td></tr>
            </tbody>
        </table>
    `;
    
    await loadCurrenciesData();
}

// الإعدادات
async function loadSettingsContent() {
    const contentDiv = document.getElementById('settingsContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="tabs">
            <button class="tab active" onclick="switchSettingsTab('general')">عام</button>
            <button class="tab" onclick="switchSettingsTab('payment')">الدفع</button>
            <button class="tab" onclick="switchSettingsTab('shipping')">الشحن</button>
            <button class="tab" onclick="switchSettingsTab('notifications')">التنبيهات</button>
        </div>
        
        <div id="settingsGeneralTab" class="tab-content active">
            <form id="generalSettingsForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>اسم المتجر</label>
                        <input type="text" id="storeName" required>
                    </div>
                    <div class="form-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" id="storeEmail" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>رقم الهاتف</label>
                        <input type="tel" id="storePhone">
                    </div>
                    <div class="form-group">
                        <label>العنوان</label>
                        <input type="text" id="storeAddress">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">حفظ</button>
            </form>
        </div>
        
        <div id="settingsPaymentTab" class="tab-content">
            <form id="paymentSettingsForm">
                <!-- إعدادات الدفع -->
            </form>
        </div>
        
        <div id="settingsShippingTab" class="tab-content">
            <form id="shippingSettingsForm">
                <!-- إعدادات الشحن -->
            </form>
        </div>
        
        <div id="settingsNotificationsTab" class="tab-content">
            <form id="notificationsSettingsForm">
                <!-- إعدادات التنبيهات -->
            </form>
        </div>
    `;
    
    await loadSettingsData();
}

// الموردين
async function loadSuppliersContent() {
    const contentDiv = document.getElementById('suppliersContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="table-actions">
            <div class="search-bar">
                <input type="text" id="searchSupplier" placeholder="بحث عن مورد...">
                <button onclick="searchSuppliers()"><i class="fas fa-search"></i></button>
            </div>
            <button class="btn btn-primary" onclick="showAddSupplierModal()">
                <i class="fas fa-plus"></i> إضافة مورد
            </button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>اسم المورد</th>
                    <th>رقم الهاتف</th>
                    <th>البريد الإلكتروني</th>
                    <th>المنتجات</th>
                    <th>تاريخ الإضافة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="suppliersTableBody">
                <tr><td colspan="6" class="loading">جاري تحميل الموردين...</td></tr>
            </tbody>
        </table>
        
        <div class="pagination" id="suppliersPagination"></div>
    `;
    
    await loadSuppliersData();
}

// ========== دوال المساعدة ==========

// تحميل بيانات لوحة التحكم
async function loadDashboardData() {
    try {
        // إحصائيات العملاء
        const { count: customersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_admin', false);
        
        document.getElementById('totalCustomers').textContent = customersCount || 0;
        
        // تحديث بقية الإحصائيات...
        
        // تحميل البطاقات
        const cardsGrid = document.querySelector('.cards-grid');
        if (cardsGrid) {
            cardsGrid.innerHTML = `
                <div class="card" onclick="changeActiveSection('customers')">
                    <div class="card-icon gradient-1">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>العملاء</h3>
                    <p>إدارة حسابات العملاء</p>
                </div>
                <div class="card" onclick="changeActiveSection('orders')">
                    <div class="card-icon gradient-2">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>الطلبات</h3>
                    <p>إدارة طلبات الشراء</p>
                </div>
                <div class="card" onclick="changeActiveSection('products')">
                    <div class="card-icon gradient-3">
                        <i class="fas fa-box"></i>
                    </div>
                    <h3>المنتجات</h3>
                    <p>إدارة جميع المنتجات</p>
                </div>
                <div class="card" onclick="changeActiveSection('inventory')">
                    <div class="card-icon gradient-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>المخزون</h3>
                    <p>مراقبة المخزون</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
    }
}

// تحميل بيانات العملاء
async function loadCustomersData() {
    try {
        const { data: customers, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_admin', false)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;
        
        if (!customers || customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">لا يوجد عملاء</td></tr>';
            return;
        }
        
        let html = '';
        customers.forEach((customer, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${customer.display_name || 'غير محدد'}</td>
                    <td>${customer.email || 'غير محدد'}</td>
                    <td>${customer.phone || 'غير محدد'}</td>
                    <td>${new Date(customer.created_at).toLocaleDateString('ar-SA')}</td>
                    <td>0</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-primary" onclick="viewCustomer('${customer.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editCustomer('${customer.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ في تحميل العملاء:', error);
        document.getElementById('customersTableBody').innerHTML = 
            '<tr><td colspan="7" class="error">حدث خطأ في تحميل البيانات</td></tr>';
    }
}

// ========== تهيئة النظام ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    
    // إضافة مستمع للأحداث العامة
    document.getElementById('refreshData')?.addEventListener('click', function() {
        const activeSection = document.querySelector('.sidebar-nav a.active');
        if (activeSection) {
            const sectionId = activeSection.getAttribute('data-section');
            loadSectionData(sectionId);
        }
    });
    
    // زر تسجيل الخروج
    document.getElementById('logoutBtn')?.addEventListener('click', async function() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            await logoutUser();
            window.location.href = 'login.html';
        }
    });
});

// ========== CSS إضافي ==========
const extraStyles = `
    .section-content {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .table-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-top: 20px;
    }
    
    .pagination button {
        padding: 5px 10px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        border-radius: 4px;
    }
    
    .pagination button.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
    }
    
    .category-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.2s;
    }
    
    .category-card:hover {
        transform: translateY(-5px);
    }
    
    .tab-content {
        display: none;
        padding: 20px 0;
    }
    
    .tab-content.active {
        display: block;
    }
    
    .tabs {
        display: flex;
        border-bottom: 2px solid #eee;
        margin-bottom: 20px;
    }
    
    .tab {
        padding: 10px 20px;
        background: none;
        border: none;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
    }
    
    .tab.active {
        border-bottom-color: var(--primary-color);
        color: var(--primary-color);
        font-weight: bold;
    }
`;

// إضافة التنسيقات الإضافية
const styleSheet = document.createElement('style');
styleSheet.textContent = extraStyles;
document.head.appendChild(styleSheet);