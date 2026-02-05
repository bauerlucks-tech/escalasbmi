// Environment configuration - Using Anon Key
window.ENV = {
  SUPABASE_URL: 'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
};

console.log('🔑 ENV loaded:', window.ENV.SUPABASE_ANON_KEY ? '✅ Key configured' : '❌ Key missing');
console.log('🌐 Environment:', window.location.hostname);