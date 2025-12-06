// ====== تهيئة Supabase ======
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jydidgltemleeubnyihq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5ZGlkZ2x0ZW1sZWV1Ym55aWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTc1MzksImV4cCI6MjA3OTU5MzUzOX0.3uAFr-ofM5z2gp-A1HYISAAer4WrGDqy8IW9FXf7bjQ'; //Placeholder

// سنستخدم المفتاح السري الذي زودتني به لضمان نجاح الاتصال في هذا المثال، مع تحذير شديد بعدم استخدامه في الإنتاج.
// const supabaseKey = 'sb_secret_C3SOpEXmfyueo2vgP1Gi8Q_ApfnT6fx'; 

const supabase = createClient(supabaseUrl, supabaseKey);
// =============================

document.addEventListener('DOMContentLoaded', () => {

    // ====== 1. منطق لوحة التحكم (admin.html) ======
    if (document.body.classList.contains('admin-page')) {
        
        const loginContainer = document.getElementById('admin-login');
        const dashboardContainer = document.getElementById('admin-dashboard');
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');
        const articleForm = document.getElementById('add-article-form');
        const messagesList = document.getElementById('messages-list');
        
        // التحقق الأولي من حالة المصادقة
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                showDashboard();
                fetchMessages(); 
            } else {
                showLogin();
            }
        });
        
        function showDashboard() {
            if(loginContainer && dashboardContainer) {
                loginContainer.style.display = 'none';
                dashboardContainer.style.display = 'block';
            }
        }
        
        function showLogin() {
             if(loginContainer && dashboardContainer) {
                loginContainer.style.display = 'block';
                dashboardContainer.style.display = 'none';
            }
        }

        // تسجيل الدخول باستخدام Supabase Auth
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;

                // يجب التأكد من إنشاء مستخدم في Supabase Auth أولاً
                const { error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                
                if (error) {
                    alert("فشل تسجيل الدخول: " + error.message);
                    console.error("Login Error: ", error);
                } else {
                    showDashboard();
                    fetchMessages();
                }
            });
        } 
