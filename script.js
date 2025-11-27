// نظام إدارة المتجر الإلكتروني المتكامل مع Supabase
class ECommerceStore {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.security = new SecurityManager();
        this.currentDetailProduct = null;
        this.detailQuantity = 1;
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.setupEventListeners();
        this.setupStoreEvents();
        await this.loadInitialData();
        this.updateCartUI();
        
        // التحقق من الجلسة بشكل دوري
        setInterval(() => {
            if (!this.security.validateSession() && this.currentUser) {
                this.showNotification('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى', 'error');
                this.handleLogout();
            }
        }, 60000);
    }

    // نظام المصادقة مع Supabase
    async checkAuthStatus() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Session error:', error);
                this.showAuth();
                return;
            }
            
            if (session && session.user) {
                // جلب بيانات المستخدم الإضافية
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (userError && userError.code !== 'PGRST116') {
                    console.warn('User data not found, creating...');
                    // إنشاء سجل المستخدم إذا لم يوجد
                    await this.createUserProfile(session.user);
                }

                this.currentUser = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.email,
                    phone: session.user.user_metadata?.phone,
                    role: userData?.role || 'customer',
                    loginTime: Date.now()
                };

                if (userData) {
                    this.currentUser = { ...this.currentUser, ...userData };
                }

                await this.loadCart();
                this.showApp();
                this.updateDashboardStats();
            } else {
                this.showAuth();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.showAuth();
        }
    }

    // إنشاء ملف المستخدم إذا لم يكن موجوداً
    async createUserProfile(authUser) {
        try {
            const { error } = await supabase
                .from('users')
                .insert([
                    {
                        id: authUser.id,
                        name: authUser.user_metadata?.name || authUser.email.split('@')[0],
                        email: authUser.email,
                        phone: authUser.user_metadata?.phone,
                        role: 'customer',
                        is_active: true
                    }
                ]);

            if (error) throw error;
            
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    // تسجيل الدخول مع Supabase
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        };

        // التحقق من الأمان
        const validation = this.security.validateFormData(formData, {
            email: { required: true, type: 'email' },
            password: { required: true, type: 'password', minLength: 1 }
        });

        if (!validation.isValid) {
            this.showNotification(Object.values(validation.errors)[0], 'error');
            return;
        }

        // التحقق من محاولات تسجيل الدخول
        const attemptCheck = this.security.checkLoginAttempts(formData.email);
        if (!attemptCheck.allowed) {
            this.showNotification(`تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${attemptCheck.timeRemaining} دقيقة`, 'error');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    this.security.recordFailedLogin(formData.email);
                    this.security.logSecurityEvent('login_failed', { email: formData.email });
                    this.showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
                } else {
                    this.showNotification('حدث خطأ أثناء تسجيل الدخول', 'error');
                }
                return;
            }

            // تسجيل الدخول ناجح
            this.security.resetLoginAttempts(formData.email);
            
            // جلب بيانات المستخدم
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            this.currentUser = {
                id: data.user.id,
                email: data.user.email,
                name: userData?.name || data.user.user_metadata?.name || data.user.email,
                phone: userData?.phone,
                role: userData?.role || 'customer',
                loginTime: Date.now()
            };

            if (userData) {
                this.currentUser = { ...this.currentUser, ...userData };
            }

            await this.loadCart();
            
            this.security.logSecurityEvent('login_success', { email: formData.email, userId: data.user.id });
            this.showApp();
            this.showNotification(`مرحباً ${this.currentUser.name}!`, 'success');

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('حدث خطأ غير متوقع أثناء تسجيل الدخول', 'error');
        }
    }

    // التسجيل مع Supabase
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            password: document.getElementById('registerPassword').value,
            confirmPassword: document.getElementById('registerConfirmPassword').value
        };

        // التحقق من صحة البيانات
        const validation = this.security.validateFormData(formData, {
            name: { required: true, minLength: 2, maxLength: 50 },
            email: { required: true, type: 'email' },
            phone: { required: true, type: 'phone' },
            password: { required: true, type: 'password', minLength: 8 },
            confirmPassword: { required: true }
        });

        if (!validation.isValid) {
            this.showNotification(Object.values(validation.errors)[0], 'error');
            return;
        }

        // التحقق من تطابق كلمات المرور
        if (formData.password !== formData.confirmPassword) {
            this.showNotification('كلمات المرور غير متطابقة', 'error');
            return;
        }

        try {
            // إنشاء حساب في Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        phone: formData.phone
                    }
                }
            });

            if (authError) {
                if (authError.message.includes('User already registered')) {
                    this.showNotification('هذا البريد الإلكتروني مسجل بالفعل', 'error');
                } else {
                    this.showNotification('حدث خطأ أثناء إنشاء الحساب', 'error');
                }
                return;
            }

            if (authData.user) {
                this.security.logSecurityEvent('registration_success', { 
                    email: formData.email, 
                    userId: authData.user.id 
                });
                
                this.showNotification('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.', 'success');
                this.showLoginPage();
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('حدث خطأ غير متوقع أثناء إنشاء الحساب', 'error');
        }
    }

    // تسجيل الخروج مع Supabase
    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            this.security.logSecurityEvent('logout', { 
                email: this.currentUser?.email,
                userId: this.currentUser?.id 
            });
            
            this.currentUser = null;
            this.cart = [];
            this.updateCartUI();
            this.showAuth();
            this.showNotification('تم تسجيل الخروج بنجاح', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
        }
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // المصادقة
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('showRegister').addEventListener('click', (e) => this.showRegisterPage(e));
        document.getElementById('showLogin').addEventListener('click', (e) => this.showLoginPage(e));
        document.getElementById('logoutBtn').addEventListener('click', (e) => this.handleLogout(e));

        // التنقل
        document.querySelectorAll('.section-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.navigateTo(target);
            });
        });

        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.navigateTo('dashboard');
            });
        });

        // عربة التسوق
        document.getElementById('cartButton').addEventListener('click', () => {
            this.navigateTo('cart');
        });

        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.navigateTo('checkout');
        });

        // أحداث كلمة المرور
        document.getElementById('registerPassword').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        // إتمام الشراء
        this.setupCheckoutEvents();
        
        // النوافذ المنبثقة
        this.setupModalEvents();

        // إعدادات الدفع
        this.setupPaymentSettings();
    }

    setupStoreEvents() {
        // فتح/إغلاق التصفية
        document.getElementById('filterToggle').addEventListener('click', () => {
            document.getElementById('filterSidebar').classList.add('active');
        });

        document.getElementById('closeFilter').addEventListener('click', () => {
            document.getElementById('filterSidebar').classList.remove('active');
        });

        // تطبيق التصفية
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
            document.getElementById('filterSidebar').classList.remove('active');
        });

        // البحث في الوقت الحقيقي
        document.getElementById('storeSearch').addEventListener('input', (e) => {
            this.searchProducts(e.target.value);
        });

        // الترتيب
        document.getElementById('sortProducts').addEventListener('change', (e) => {
            this.sortProducts(e.target.value);
        });

        // نطاق السعر
        document.getElementById('priceRange').addEventListener('input', (e) => {
            document.getElementById('maxPrice').textContent = `${e.target.value} ر.س`;
        });

        // تحميل المزيد
        document.getElementById('loadMore').addEventListener('click', () => {
            this.loadMoreProducts();
        });
    }

    setupCheckoutEvents() {
        // خطوات الشراء
        document.querySelectorAll('.next-step-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nextStep = e.target.getAttribute('data-next');
                this.goToCheckoutStep(nextStep);
            });
        });

        document.querySelectorAll('.prev-step-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prevStep = e.target.getAttribute('data-prev');
                this.goToCheckoutStep(prevStep);
            });
        });

        // طرق الدفع
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const cardDetails = document.getElementById('cardDetails');
                if (e.target.value === 'mastercard') {
                    cardDetails.classList.add('active');
                } else {
                    cardDetails.classList.remove('active');
                }
            });
        });

        // تأكيد الطلب
        document.getElementById('checkoutForm').addEventListener('submit', (e) => this.placeOrder(e));
    }

    setupModalEvents() {
        // نافذة إضافة منتج
        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            this.openProductModal();
        });

        // إغلاق النوافذ المنبثقة
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        document.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeAllModals();
        });

        // إرسال نموذج المنتج
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // إغلاق النوافذ عند النقر خارجها
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    setupPaymentSettings() {
        // تحميل إعدادات الدفع
        this.loadPaymentSettings();

        // حفظ التغييرات
        document.getElementById('mastercardToggle').addEventListener('change', (e) => {
            this.updatePaymentSetting('mastercard', e.target.checked);
        });

        document.getElementById('paypalToggle').addEventListener('change', (e) => {
            this.updatePaymentSetting('paypal', e.target.checked);
        });

        document.getElementById('codToggle').addEventListener('change', (e) => {
            this.updatePaymentSetting('cod', e.target.checked);
        });
    }

    async loadPaymentSettings() {
        try {
            const { data: settings, error } = await supabase
                .from('payment_settings')
                .select('*');

            if (error) throw error;

            if (settings) {
                settings.forEach(setting => {
                    const toggle = document.getElementById(`${setting.payment_method}Toggle`);
                    if (toggle) {
                        toggle.checked = setting.is_enabled;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading payment settings:', error);
        }
    }

    async updatePaymentSetting(method, enabled) {
        try {
            const { error } = await supabase
                .from('payment_settings')
                .update({ is_enabled: enabled })
                .eq('payment_method', method);

            if (error) throw error;

            this.showNotification(`تم ${enabled ? 'تفعيل' : 'تعطيل'} ${method} بنجاح`, 'success');
        } catch (error) {
            console.error('Error updating payment setting:', error);
            this.showNotification('حدث خطأ أثناء تحديث الإعدادات', 'error');
        }
    }

    // جلب المنتجات من Supabase
    async getProducts(filters = {}) {
        try {
            let query = supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            // تطبيق الفلاتر
            if (filters.category && filters.category.length > 0) {
                query = query.in('category', filters.category);
            }

            if (filters.maxPrice) {
                query = query.lte('sale_price', filters.maxPrice);
            }

            if (filters.inStock) {
                query = query.gt('quantity', 0);
            }

            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }

            const { data: products, error } = await query;

            if (error) throw error;

            return products || [];

        } catch (error) {
            console.error('Error fetching products:', error);
            this.showNotification('حدث خطأ في جلب المنتجات', 'error');
            return [];
        }
    }

    // جلب المنتجات للعرض في المتجر
    async getFilteredProducts(filters = {}) {
        const products = await this.getProducts(filters);
        
        return products.map(product => ({
            ...product,
            description: product.description || 'منتج عالي الجودة مع ضمان الجودة',
            isNew: this.isProductNew(product.created_at),
            originalPrice: this.hasDiscount(product) ? product.sale_price * 1.2 : null,
            image: this.getProductImage(product.category)
        }));
    }

    // التحقق إذا المنتج جديد (أقل من 7 أيام)
    isProductNew(createdAt) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(createdAt) > sevenDaysAgo;
    }

    // التحقق إذا يوجد خصم
    hasDiscount(product) {
        return Math.random() > 0.7; // 30% فرصة للخصم
    }

    // حفظ المنتج في Supabase
    async saveProduct() {
        const formData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            purchasePrice: document.getElementById('purchasePrice').value,
            salePrice: document.getElementById('salePrice').value,
            quantity: document.getElementById('quantity').value,
            supplier: document.getElementById('supplier').value,
            description: document.getElementById('productDescription')?.value || ''
        };

        // التحقق من صحة البيانات
        const validation = this.security.validateFormData(formData, {
            name: { required: true, minLength: 2, maxLength: 100 },
            category: { required: true },
            purchasePrice: { required: true, type: 'number' },
            salePrice: { required: true, type: 'number' },
            quantity: { required: true, type: 'number' },
            supplier: { required: true }
        });

        if (!validation.isValid) {
            this.showNotification(Object.values(validation.errors)[0], 'error');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .insert([
                    {
                        name: validation.sanitizedData.name,
                        category: formData.category,
                        purchase_price: parseFloat(formData.purchasePrice),
                        sale_price: parseFloat(formData.salePrice),
                        quantity: parseInt(formData.quantity),
                        supplier_id: parseInt(formData.supplier),
                        description: validation.sanitizedData.description,
                        is_active: true,
                        created_by: this.currentUser.id
                    }
                ])
                .select();

            if (error) throw error;

            this.closeAllModals();
            await this.renderStoreProducts();
            
            this.security.logSecurityEvent('product_added', { 
                productId: data[0].id,
                productName: data[0].name 
            });
            
            this.showNotification('تم إضافة المنتج بنجاح', 'success');

        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('حدث خطأ أثناء حفظ المنتج', 'error');
        }
    }

    // حفظ الطلب في Supabase
    async placeOrder(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showNotification('يجب تسجيل الدخول لإتمام الطلب', 'error');
            return;
        }

        if (this.cart.length === 0) {
            this.showNotification('عربة التسوق فارغة', 'error');
            return;
        }

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethod) {
            this.showNotification('يرجى اختيار طريقة الدفع', 'error');
            return;
        }

        const formData = {
            shippingName: document.getElementById('shippingName').value,
            shippingPhone: document.getElementById('shippingPhone').value,
            shippingAddress: document.getElementById('shippingAddress').value,
            shippingCity: document.getElementById('shippingCity').value,
            shippingPostal: document.getElementById('shippingPostal').value
        };

        // التحقق من بيانات الشحن
        const validation = this.security.validateFormData(formData, {
            shippingName: { required: true, minLength: 2, maxLength: 100 },
            shippingPhone: { required: true, type: 'phone' },
            shippingAddress: { required: true, minLength: 10, maxLength: 200 },
            shippingCity: { required: true, minLength: 2, maxLength: 50 },
            shippingPostal: { required: true, minLength: 3, maxLength: 10 }
        });

        if (!validation.isValid) {
            this.showNotification(Object.values(validation.errors)[0], 'error');
            return;
        }

        try {
            // حساب المجاميع
            const subtotal = this.cart.reduce((sum, item) => sum + (item.product.sale_price * item.quantity), 0);
            const shippingCost = 15;
            const total = subtotal + shippingCost;

            // إنشاء الطلب
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        customer_id: this.currentUser.id,
                        customer_name: validation.sanitizedData.shippingName,
                        customer_phone: validation.sanitizedData.shippingPhone,
                        shipping_address: validation.sanitizedData.shippingAddress,
                        shipping_city: validation.sanitizedData.shippingCity,
                        shipping_postal: validation.sanitizedData.shippingPostal,
                        subtotal: subtotal,
                        shipping_cost: shippingCost,
                        total: total,
                        payment_method: paymentMethod.value,
                        payment_status: 'pending',
                        status: 'pending'
                    }
                ])
                .select();

            if (orderError) throw orderError;

            const orderId = order[0].id;

            // إضافة عناصر الطلب
            const orderItems = this.cart.map(item => ({
                order_id: orderId,
                product_id: item.product.id,
                product_name: item.product.name,
                quantity: item.quantity,
                unit_price: item.product.sale_price,
                total_price: item.product.sale_price * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // تحديث المخزون لكل منتج
            for (const item of this.cart) {
                const newQuantity = item.product.quantity - item.quantity;
                
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ 
                        quantity: Math.max(0, newQuantity),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.product.id);

                if (updateError) throw updateError;
            }

            // تفريغ عربة التسوق
            this.cart = [];
            await this.saveCart();
            this.updateCartUI();

            this.security.logSecurityEvent('order_placed', { 
                orderId: orderId,
                orderNumber: order[0].order_number,
                total: total,
                itemsCount: orderItems.length,
                paymentMethod: paymentMethod.value 
            });

            this.navigateTo('dashboard');
            this.showNotification(`تم تقديم الطلب بنجاح! رقم الطلب: ${order[0].order_number}`, 'success');

        } catch (error) {
            console.error('Error placing order:', error);
            this.showNotification('حدث خطأ أثناء تقديم الطلب', 'error');
        }
    }

    // جلب الموردين من Supabase
    async getSuppliers() {
        try {
            const { data: suppliers, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;

            return suppliers || [];

        } catch (error) {
            console.error('Error fetching suppliers:', error);
            return [];
        }
    }

    // جلب الطلبات من Supabase
    async getOrders(userId = null, filters = {}) {
        try {
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    order_items(*)
                `)
                .order('created_at', { ascending: false });

            if (userId) {
                query = query.eq('customer_id', userId);
            }

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            const { data: orders, error } = await query;

            if (error) throw error;

            return orders || [];

        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    // حفظ عربة التسوق في Supabase
    async saveCart() {
        if (!this.currentUser) return;

        try {
            const { error } = await supabase
                .from('user_carts')
                .upsert({
                    user_id: this.currentUser.id,
                    cart_data: this.cart,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // تحميل عربة التسوق من Supabase
    async loadCart() {
        if (!this.currentUser) {
            this.cart = [];
            this.updateCartUI();
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_carts')
                .select('cart_data')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            this.cart = data?.cart_data || [];
            this.updateCartUI();

        } catch (error) {
            console.error('Error loading cart:', error);
            this.cart = [];
            this.updateCartUI();
        }
    }

    // تحديث إحصائيات لوحة التحكم
    async updateDashboardStats() {
        try {
            // إجمالي المنتجات
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id')
                .eq('is_active', true);

            if (!productsError) {
                document.getElementById('totalProducts').textContent = products.length;
            }

            // إجمالي الطلبات
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id, total');

            if (!ordersError) {
                document.getElementById('totalOrders').textContent = orders.length;
                const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
                document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
            }

            // إحصائيات المستخدم
            if (this.currentUser) {
                const { data: userOrders, error: userOrdersError } = await supabase
                    .from('orders')
                    .select('id, total, status')
                    .eq('customer_id', this.currentUser.id);

                if (!userOrdersError) {
                    document.getElementById('userTotalOrders').textContent = userOrders.length;
                    document.getElementById('userPendingOrders').textContent = userOrders.filter(order => order.status === 'pending').length;
                    const userTotalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
                    document.getElementById('userTotalSpent').textContent = userTotalSpent.toFixed(2) + ' ر.س';
                }
            }

        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    // تحميل البيانات الأولية
    async loadInitialData() {
        console.log('Initial data loaded from Supabase');
    }

    // عرض المنتجات في المتجر
    async renderStoreProducts(products = null) {
        const productsGrid = document.getElementById('productsGrid');
        const productsCount = document.getElementById('productsCount');
        
        const productsToShow = products || await this.getFilteredProducts();
        
        if (productsGrid) {
            productsGrid.innerHTML = productsToShow.map(product => `
                <div class="product-card fade-in" data-product-id="${product.id}">
                    ${product.quantity < 5 ? '<span class="product-badge sale">منخفض</span>' : ''}
                    ${product.isNew ? '<span class="product-badge new">جديد</span>' : ''}
                    
                    <div class="product-image">
                        ${product.image || '📦'}
                    </div>
                    
                    <div class="product-info">
                        <span class="product-category">${this.getCategoryName(product.category)}</span>
                        <div class="product-name">${product.name}</div>
                        <div class="product-description">${product.description || 'منتج عالي الجودة'}</div>
                        
                        <div class="product-price">
                            <span class="current-price">${product.sale_price} ر.س</span>
                            ${product.originalPrice ? `<span class="original-price">${product.originalPrice} ر.س</span>` : ''}
                        </div>
                        
                        <div class="product-stock ${product.quantity > 10 ? 'stock-in' : product.quantity > 0 ? 'stock-low' : 'stock-out'}">
                            ${product.quantity > 10 ? 'متوفر' : product.quantity > 0 ? `منخفض (${product.quantity} فقط)` : 'غير متوفر'}
                        </div>
                        
                        <div class="product-actions">
                            <button class="add-to-cart-btn" onclick="store.addToCartFromStore(${product.id})" 
                                    ${product.quantity === 0 ? 'disabled' : ''}>
                                🛒 إضافة للسلة
                            </button>
                            <button class="view-details-btn" onclick="store.showProductDetail(${product.id})">
                                👁️ التفاصيل
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        if (productsCount) productsCount.textContent = productsToShow.length;
    }

    // إضافة منتج من المتجر إلى السلة
    async addToCartFromStore(productId) {
        try {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            if (product) {
                this.addToCart(product);
                
                // تأثير مرئي عند الإضافة
                const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (productCard) {
                    productCard.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        productCard.style.transform = '';
                    }, 300);
                }
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            this.showNotification('حدث خطأ أثناء إضافة المنتج', 'error');
        }
    }

    // تصفية المنتجات
    async applyFilters() {
        const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
            .map(cb => cb.value);
        
        const maxPrice = parseInt(document.getElementById('priceRange').value);
        const inStockOnly = document.querySelector('input[name="availability"]:checked');
        
        const filters = {
            category: selectedCategories,
            maxPrice: maxPrice,
            inStock: inStockOnly ? true : false
        };

        const filteredProducts = await this.getFilteredProducts(filters);
        this.renderStoreProducts(filteredProducts);
    }

    // البحث في المنتجات
    async searchProducts(query) {
        const sanitizedQuery = this.security.sanitizeInput(query);
        
        if (this.security.detectXSS(sanitizedQuery) || this.security.detectSQLInjection(sanitizedQuery)) {
            this.showNotification('طلب بحث غير آمن', 'error');
            return;
        }

        const filters = {
            search: sanitizedQuery
        };

        const filteredProducts = await this.getFilteredProducts(filters);
        this.renderStoreProducts(filteredProducts);
        
        this.security.logSecurityEvent('product_search', { 
            query: sanitizedQuery,
            results: filteredProducts.length 
        });
    }

    // ترتيب المنتجات
    async sortProducts(sortBy) {
        const products = await this.getFilteredProducts();
        
        switch(sortBy) {
            case 'price-low':
                products.sort((a, b) => a.sale_price - b.sale_price);
                break;
            case 'price-high':
                products.sort((a, b) => b.sale_price - a.sale_price);
                break;
            case 'newest':
                products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'name':
            default:
                products.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                break;
        }
        
        this.renderStoreProducts(products);
    }

    // الحصول على صورة المنتج حسب الفئة
    getProductImage(category) {
        const images = {
            'electronics': '📱',
            'clothing': '👕',
            'home': '🏠',
            'office': '📎'
        };
        return images[category] || '📦';
    }

    // عرض تفاصيل المنتج
    async showProductDetail(productId) {
        try {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            if (product) {
                const modalContent = document.getElementById('productDetailContent');
                modalContent.innerHTML = `
                    <div class="product-detail-image">
                        ${this.getProductImage(product.category)}
                    </div>
                    <div class="product-detail-info">
                        <h2>${product.name}</h2>
                        <div class="product-detail-meta">
                            <span>الفئة: ${this.getCategoryName(product.category)}</span>
                            <span>المورد: ${await this.getSupplierName(product.supplier_id)}</span>
                        </div>
                        <div class="product-detail-price">${product.sale_price} ر.س</div>
                        <div class="product-detail-description">
                            ${product.description || 'منتج عالي الجودة مصمم لتلبية احتياجاتك. يتميز بالأداء المتميز والجودة العالية.'}
                        </div>
                        
                        <div class="product-detail-specs">
                            <div class="spec-item">
                                <span class="spec-label">الحالة:</span>
                                <span class="spec-value ${product.quantity > 0 ? 'stock-in' : 'stock-out'}">
                                    ${product.quantity > 0 ? 'متوفر' : 'غير متوفر'}
                                </span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">الكمية المتاحة:</span>
                                <span class="spec-value">${product.quantity} قطعة</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">سعر الشراء:</span>
                                <span class="spec-value">${product.purchase_price} ر.س</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">هامش الربح:</span>
                                <span class="spec-value profit-positive">
                                    ${(((product.sale_price - product.purchase_price) / product.purchase_price) * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="quantity-selector">
                            <label>الكمية:</label>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="store.updateDetailQuantity(-1)">-</button>
                                <span class="quantity-display" id="detailQuantity">1</span>
                                <button class="quantity-btn" onclick="store.updateDetailQuantity(1)">+</button>
                            </div>
                        </div>
                        
                        <div class="product-detail-actions">
                            <button class="add-to-cart-btn" onclick="store.addToCartFromDetail(${product.id})" 
                                    ${product.quantity === 0 ? 'disabled' : ''}>
                                🛒 إضافة إلى السلة
                            </button>
                            <button class="buy-now-btn" onclick="store.buyNow(${product.id})" 
                                    ${product.quantity === 0 ? 'disabled' : ''}>
                                💳 شراء الآن
                            </button>
                        </div>
                    </div>
                `;
                
                document.getElementById('productDetailModal').style.display = 'block';
                this.currentDetailProduct = product;
                this.detailQuantity = 1;
            }
        } catch (error) {
            console.error('Error showing product detail:', error);
            this.showNotification('حدث خطأ في عرض تفاصيل المنتج', 'error');
        }
    }

    // الحصول على اسم المورد
    async getSupplierName(supplierId) {
        try {
            const { data: supplier, error } = await supabase
                .from('suppliers')
                .select('name')
                .eq('id', supplierId)
                .single();

            if (error) throw error;

            return supplier?.name || 'غير معروف';
        } catch (error) {
            console.error('Error getting supplier name:', error);
            return 'غير معروف';
        }
    }

    // تحديث الكمية في تفاصيل المنتج
    updateDetailQuantity(change) {
        const newQuantity = this.detailQuantity + change;
        if (newQuantity >= 1 && newQuantity <= this.currentDetailProduct.quantity) {
            this.detailQuantity = newQuantity;
            document.getElementById('detailQuantity').textContent = newQuantity;
        }
    }

    // إضافة من تفاصيل المنتج
    addToCartFromDetail(productId) {
        this.addToCart(this.currentDetailProduct, this.detailQuantity);
        this.closeProductDetail();
    }

    // شراء مباشر
    buyNow(productId) {
        this.addToCart(this.currentDetailProduct, this.detailQuantity);
        this.closeProductDetail();
        this.navigateTo('checkout');
    }

    // إغلاق تفاصيل المنتج
    closeProductDetail() {
        document.getElementById('productDetailModal').style.display = 'none';
        this.currentDetailProduct = null;
        this.detailQuantity = 1;
    }

    // تحميل المزيد من المنتجات (محاكاة)
    loadMoreProducts() {
        this.showNotification('يتم تحميل المزيد من المنتجات...', 'info');
        
        setTimeout(() => {
            this.showNotification('تم تحميل المزيد من المنتجات', 'success');
        }, 1000);
    }

    // إدارة المنتجات
    async openProductModal() {
        const modal = document.getElementById('productModal');
        modal.style.display = 'block';
        await this.populateSuppliers();
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.getElementById('productForm').reset();
    }

    async populateSuppliers() {
        const suppliers = await this.getSuppliers();
        const supplierSelect = document.getElementById('supplier');
        if (supplierSelect) {
            supplierSelect.innerHTML = '<option value="">اختر المورد</option>';
            
            suppliers.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier.id;
                option.textContent = supplier.name;
                supplierSelect.appendChild(option);
            });
        }
    }

    // نظام عربة التسوق
    async addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                product: product,
                quantity: quantity
            });
        }
        
        await this.saveCart();
        this.updateCartUI();
        this.showNotification('تمت إضافة المنتج إلى عربة التسوق', 'success');
    }

    async removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product.id !== productId);
        await this.saveCart();
        this.updateCartUI();
        this.showNotification('تم إزالة المنتج من عربة التسوق', 'success');
    }

    async updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.product.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                await this.saveCart();
                this.updateCartUI();
            }
        }
    }

    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.getElementById('cartItems');
        const subtotal = document.getElementById('subtotal');
        const total = document.getElementById('totalAmount');

        // تحديث العداد
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;

        // تحديث العناصر
        if (cartItems) {
            cartItems.innerHTML = this.cart.length === 0 ? 
                '<p class="empty-cart">عربة التسوق فارغة</p>' :
                this.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">${this.getProductImage(item.product.category)}</div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.product.name}</div>
                            <div class="cart-item-price">${item.product.sale_price} ر.س</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn" onclick="store.updateCartQuantity(${item.product.id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn" onclick="store.updateCartQuantity(${item.product.id}, ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <button class="remove-btn" onclick="store.removeFromCart(${item.product.id})">🗑️</button>
                    </div>
                `).join('');
        }

        // تحديث الإجمالي
        const cartSubtotal = this.cart.reduce((sum, item) => sum + (item.product.sale_price * item.quantity), 0);
        const shippingCost = cartSubtotal > 0 ? 15 : 0;
        const totalAmount = cartSubtotal + shippingCost;

        if (subtotal) subtotal.textContent = `${cartSubtotal.toFixed(2)} ر.س`;
        if (total) total.textContent = `${totalAmount.toFixed(2)} ر.س`;
        if (document.getElementById('shippingCost')) {
            document.getElementById('shippingCost').textContent = `${shippingCost.toFixed(2)} ر.س`;
        }
    }

    // نظام إتمام الشراء
    goToCheckoutStep(stepId) {
        document.querySelectorAll('.checkout-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(stepId).classList.add('active');

        // تحديث خطوات التقدم
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.remove('active');
        });
        
        const stepIndex = Array.from(document.querySelectorAll('.checkout-step')).findIndex(step => step.id === stepId);
        if (steps[stepIndex]) {
            steps[stepIndex].classList.add('active');
        }

        // إذا كانت خطوة التأكيد، قم بتحديث الملخص
        if (stepId === 'confirmStep') {
            this.updateOrderSummary();
        }
    }

    updateOrderSummary() {
        const confirmItems = document.getElementById('confirmOrderItems');
        const confirmSubtotal = document.getElementById('confirmSubtotal');
        const confirmShipping = document.getElementById('confirmShipping');
        const confirmTotal = document.getElementById('confirmTotal');

        const subtotal = this.cart.reduce((sum, item) => sum + (item.product.sale_price * item.quantity), 0);
        const shipping = subtotal > 0 ? 15 : 0;
        const total = subtotal + shipping;

        if (confirmItems) {
            confirmItems.innerHTML = this.cart.map(item => `
                <div class="order-item">
                    <span>${item.product.name} (${item.quantity})</span>
                    <span>${(item.product.sale_price * item.quantity).toFixed(2)} ر.س</span>
                </div>
            `).join('');
        }

        if (confirmSubtotal) confirmSubtotal.textContent = `${subtotal.toFixed(2)} ر.س`;
        if (confirmShipping) confirmShipping.textContent = `${shipping.toFixed(2)} ر.س`;
        if (confirmTotal) confirmTotal.textContent = `${total.toFixed(2)} ر.س`;
    }

    // وظائف مساعدة
    showAuth() {
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('registerPage').classList.remove('active');
        document.getElementById('app').style.display = 'none';
    }

    showApp() {
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('registerPage').classList.remove('active');
        document.getElementById('app').style.display = 'block';
        this.updateUserProfile();
    }

    updateUserProfile() {
        if (this.currentUser) {
            document.querySelector('.user-name').textContent = this.currentUser.name;
        }
    }

    // تحديث قوة كلمة المرور
    updatePasswordStrength(password) {
        const strengthDiv = document.getElementById('passwordStrength');
        const strengthBar = strengthDiv.querySelector('.strength-bar');
        const strengthText = strengthDiv.querySelector('.strength-text');