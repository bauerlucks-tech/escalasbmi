// Environment configuration - Using Anon Key
window.ENV = {
  SUPABASE_URL: 'https://fxslbhpjiqtzimtosira.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4c2xiaHBqaXF0emltdG9zaXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDIxNjUsImV4cCI6MjA4ODA3ODE2NX0.78M7903IsRcx5vmDHbZx2dJPRw-hUy6_8Qpn4qIPqqs',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4c2xiaHBqaXF0emltdG9zaXJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwMjE2NSwiZXhwIjoyMDg4MDc4MTY1fQ.n5H8Lk7x9V6q8kZ4Y8M2pP7R9S8T4U2V6W8X0Y2Z4',
  VITE_ADMIN_PASSWORD: '1234'
};

console.log('🔑 ENV loaded:', window.ENV.SUPABASE_ANON_KEY ? '✅ Key configured' : '❌ Key missing');
console.log('🔑 Service Key:', window.ENV.SUPABASE_SERVICE_KEY ? '✅ Service Key configured' : '❌ Service Key missing');
console.log('🌐 Environment:', window.location.hostname);