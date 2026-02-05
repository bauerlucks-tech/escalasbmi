// Environment configuration for Vercel + Supabase integration
window.ENV = {
  // Vercel automatically injects environment variables into window.ENV
  SUPABASE_SERVICE_KEY: window.ENV?.SUPABASE_SERVICE_KEY || localStorage.getItem('temp_service_key') || ''
};

console.log(' ENV loaded:', window.ENV.SUPABASE_SERVICE_KEY ? ' Key configured' : ' Key missing');
console.log(' Environment:', window.location.hostname);