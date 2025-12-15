// supabase-config.js
const SUPABASE_URL = 'https://bmehblfgoxxbokiqvojb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWhibGZnb3h4Ym9raXF2b2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTA1NzYsImV4cCI6MjA3OTY4NjU3Nn0.CJKGad9xl5ZZv-hHkc0Ot3yLEsHyGfb-R3yfm5p_mfc';

// تهيئة عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// وظيفة للتحقق من صلاحيات المسؤول
async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return false;
    }
    
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
    
    if (error || !profile || !profile.is_admin) {
        return false;
    }
    
    return true;
}

// وظيفة تسجيل الدخول
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        throw error;
    }
    
    return data;
}

// وظيفة تسجيل الخروج
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
}
