const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Validate environment
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Hash password function (same as in AuthContext)
const hashPassword = (password) => {
  return crypto.createHash('md5').update(password).digest('hex');
};

async function resetPasswords() {
  try {
    console.log('🔄 Resetting all user passwords to "1234"...');

    // Calculate hash for "1234"
    const newPasswordHash = hashPassword('1234');
    console.log('📝 New password hash:', newPasswordHash);

    // Update all users
    const { data, error } = await supabase
      .from('users')
      .update({ password: newPasswordHash })
      .neq('id', ''); // Update all users

    if (error) {
      console.error('❌ Error updating passwords:', error);
      process.exit(1);
    }

    console.log('✅ Passwords reset successfully for all users');

    // Get updated user list
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, name, role');

    if (!fetchError && users) {
      console.log('👥 Users with reset passwords:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.role})`);
      });
    }

  } catch (error) {
    console.error('❌ Error during password reset:', error);
    process.exit(1);
  }
}

resetPasswords();
