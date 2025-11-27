// نظام الأمان والحماية
class SecurityManager {
    constructor() {
        this.encryptionKey = this.generateEncryptionKey();
        this.maxLoginAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 دقيقة
    }

    // توليد مفتاح تشفير
    generateEncryptionKey() {
        let key = localStorage.getItem('encryptionKey');
        if (!key) {
            key = this.randomString(32);
            localStorage.setItem('encryptionKey', key);
        }
        return key;
    }

    // إنشاء سلسلة عشوائية
    randomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // تشفير البيانات
    encrypt(data) {
        try {
            const text = typeof data === 'string' ? data : JSON.stringify(data);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
            }
            return btoa(result);
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    // فك تشفير البيانات
    decrypt(encryptedData) {
        try {
            const text = atob(encryptedData);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
            }
            return result;
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // التحقق من صحة البريد الإلكتروني
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // التحقق من قوة كلمة المرور
    validatePassword(password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const strength = Object.values(requirements).filter(Boolean).length;
        
        return {
            isValid: Object.values(requirements).every(Boolean),
            strength: strength,
            requirements: requirements
        };
    }

    // التحقق من رقم الهاتف
    validatePhone(phone) {
        const phoneRegex = /^[\+]?[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // التحقق من السعر
    validatePrice(price) {
        return !isNaN(price) && price >= 0 && price <= 1000000;
    }

    // التحقق من الكمية
    validateQuantity(quantity) {
        return Number.isInteger(quantity) && quantity >= 0 && quantity <= 10000;
    }

    // تنظيف المدخلات من الهجمات
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#x27;')
            .replace(/"/g, '&quot;')
            .replace(/\//g, '&#x2F;')
            .replace(/\\/g, '&#x5C;')
            .replace(/`/g, '&#x60;')
            .replace(/\$/g, '&#36;')
            .trim();
    }

    // التحقق من هجمات XSS
    detectXSS(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<\s*iframe/gi,
            /<\s*form/gi,
            /<\s*meta/gi,
            /<\s*object/gi,
            /<\s*embed/gi,
            /<\s*applet/gi
        ];

        return xssPatterns.some(pattern => pattern.test(input));
    }

    // التحقق من هجمات SQL Injection
    detectSQLInjection(input) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC)\b)/gi,
            /('|"|;|\-\-)/g,
            /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/gi
        ];

        return sqlPatterns.some(pattern => pattern.test(input));
    }

    // إدارة محاولات تسجيل الدخول
    checkLoginAttempts(email) {
        const attempts = this.getLoginAttempts(email);
        if (attempts.count >= this.maxLoginAttempts) {
            const timeSinceLock = Date.now() - attempts.lastAttempt;
            if (timeSinceLock < this.lockoutTime) {
                return {
                    allowed: false,
                    timeRemaining: Math.ceil((this.lockoutTime - timeSinceLock) / 1000 / 60)
                };
            } else {
                this.resetLoginAttempts(email);
            }
        }
        return { allowed: true };
    }

    // تسجيل محاولة تسجيل دخول فاشلة
    recordFailedLogin(email) {
        const attempts = this.getLoginAttempts(email);
        attempts.count++;
        attempts.lastAttempt = Date.now();
        localStorage.setItem(`login_attempts_${btoa(email)}`, this.encrypt(JSON.stringify(attempts)));
    }

    // الحصول على محاولات تسجيل الدخول
    getLoginAttempts(email) {
        const encrypted = localStorage.getItem(`login_attempts_${btoa(email)}`);
        if (encrypted) {
            const decrypted = this.decrypt(encrypted);
            return JSON.parse(decrypted || '{"count":0,"lastAttempt":0}');
        }
        return { count: 0, lastAttempt: 0 };
    }

    // إعادة تعيين محاولات تسجيل الدخول
    resetLoginAttempts(email) {
        localStorage.removeItem(`login_attempts_${btoa(email)}`);
    }

    // إنشاء هاش لكلمة المرور (محاكاة)
    hashPassword(password) {
        // في التطبيق الحقيقي، استخدم bcrypt أو similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    // التحقق من CSRF Token
    generateCSRFToken() {
        const token = this.randomString(32);
        sessionStorage.setItem('csrf_token', token);
        return token;
    }

    validateCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return token === storedToken;
    }

    // التحقق من صلاحية البيانات
    validateFormData(formData, rules) {
        const errors = {};
        const sanitizedData = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            const sanitized = value ? this.sanitizeInput(value.toString()) : '';
            sanitizedData[field] = sanitized;
            
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors[field] = `${field} مطلوب`;
                continue;
            }

            if (value && value.toString().trim() !== '') {
                // التحقق من الهجمات
                if (this.detectXSS(value)) {
                    errors[field] = 'تحذير: تم اكتشاف محتوى ضار';
                    continue;
                }

                if (this.detectSQLInjection(value)) {
                    errors[field] = 'تحذير: تم اكتشاف محاولة حقن SQL';
                    continue;
                }

                // التحقق من النوع
                if (rule.type === 'email' && !this.validateEmail(sanitized)) {
                    errors[field] = 'البريد الإلكتروني غير صحيح';
                } else if (rule.type === 'phone' && !this.validatePhone(sanitized)) {
                    errors[field] = 'رقم الهاتف غير صحيح';
                } else if (rule.type === 'password') {
                    const passwordValidation = this.validatePassword(sanitized);
                    if (!passwordValidation.isValid) {
                        errors[field] = 'كلمة المرور ضعيفة';
                    }
                } else if (rule.type === 'number' && isNaN(sanitized)) {
                    errors[field] = 'يجب أن يكون رقماً';
                } else if (rule.minLength && sanitized.length < rule.minLength) {
                    errors[field] = `يجب أن يكون ${rule.minLength} أحرف على الأقل`;
                } else if (rule.maxLength && sanitized.length > rule.maxLength) {
                    errors[field] = `يجب أن لا يتجاوز ${rule.maxLength} أحرف`;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors,
            sanitizedData: sanitizedData
        };
    }

    // تسجيل أحداث الأمان
    async logSecurityEvent(event, details) {
        const log = {
            event_type: event,
            details: details,
            user_agent: navigator.userAgent,
            ip_address: 'client-side',
            user_id: this.getCurrentUserId()
        };

        try {
            const { error } = await supabase
                .from('security_logs')
                .insert([log]);

            if (error) {
                console.error('Error logging security event to Supabase:', error);
                // Fallback إلى localStorage
                this.logSecurityEventLocal(event, details);
            }
        } catch (error) {
            console.error('Error logging to Supabase:', error);
            this.logSecurityEventLocal(event, details);
        }
    }

    // Fallback للتخزين المحلي
    logSecurityEventLocal(event, details) {
        const log = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            ip: 'client-side'
        };

        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        logs.push(log);
        
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('security_logs', this.encrypt(JSON.stringify(logs)));
    }

    // الحصول على ID المستخدم الحالي
    getCurrentUserId() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
            return user?.id || null;
        } catch {
            return null;
        }
    }

    // التحقق من صلاحية الجلسة
    validateSession() {
        const user = localStorage.getItem('currentUser');
        if (!user) return false;

        try {
            const userData = JSON.parse(user);
            const sessionTime = Date.now() - userData.loginTime;
            const maxSessionTime = 24 * 60 * 60 * 1000; // 24 ساعة

            if (sessionTime > maxSessionTime) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    // تسجيل الخروج الآمن
    logout() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('csrf_token');
        window.location.reload();
    }

    // الحصول على سجلات الأمان
    getSecurityLogs() {
        try {
            const encryptedLogs = localStorage.getItem('security_logs');
            if (encryptedLogs) {
                const decrypted = this.decrypt(encryptedLogs);
                return JSON.parse(decrypted || '[]');
            }
            return [];
        } catch (error) {
            console.error('Error getting security logs:', error);
            return [];
        }
    }
}

// إنشاء نسخة عامة من مدير الأمان
const security = new SecurityManager();