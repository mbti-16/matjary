// تكوين Supabase - مع البيانات الحقيقية
const SUPABASE_CONFIG = {
    url: 'https://bmehblfgoxxbokiqvojb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWhibGZnb3h4Ym9raXF2b2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTA1NzYsImV4cCI6MjA3OTY4NjU3Nn0.CJKGad9xl5ZZv-hHkc0Ot3yLEsHyGfb-R3yfm5p_mfc'
};

// تهيئة Supabase client
const supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// اختبار الاتصال
async function testConnection() {
    try {
        const { data, error } = await supabase.from('products').select('id').limit(1);
        if (error) {
            console.warn('Supabase connection test failed:', error.message);
            return false;
        } else {
            console.log('✅ Connected to Supabase successfully');
            return true;
        }
    } catch (error) {
        console.error('Connection test error:', error);
        return false;
    }
}

// اختبار الاتصال عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    testConnection().then(success => {
        if (!success) {
            console.warn('❌ Supabase connection failed - running in offline mode');
        }
    });
});