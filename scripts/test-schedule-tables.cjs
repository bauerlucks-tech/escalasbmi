// Debug: Check schedule tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  console.log('Checking tables...\n');
  
  // Check schedules
  const s1 = await supabase.from('schedules').select('*');
  console.log('schedules:');
  console.log('  Error:', s1.error ? s1.error.message : 'none');
  console.log('  Count:', s1.data?.length || 0);
  
  // Check month_schedules
  const s2 = await supabase.from('month_schedules').select('*');
  console.log('\nmonth_schedules:');
  console.log('  Error:', s2.error ? s2.error.message : 'none');
  console.log('  Count:', s2.data?.length || 0);
}

check().then(() => console.log('\nDone'));
