// Environment configuration for Vercel + Supabase integration
window.ENV = {
  // Vercel environment variable will be injected automatically
  SUPABASE_SERVICE_KEY: typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
    ? process.env.SUPABASE_SERVICE_KEY || '' // Production (Vercel)
    : localStorage.getItem('temp_service_key') || '' // Development (localhost)
};

// Log para debug
console.log('🔑 ENV loaded:', window.ENV.SUPABASE_SERVICE_KEY ? '✅ Key configured' : '❌ Key missing');
console.log('🌐 Environment:', window.location.hostname);