// Environment configuration for Vercel deployment
window.ENV = {
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY_HERE'
};

console.log('🔑 ENV loaded:', window.ENV.SUPABASE_SERVICE_KEY ? '✅ Key configured' : '❌ Key missing');
console.log('🌐 Environment:', window.location.hostname);
