const { createClient } = require('@supabase/supabase-js');

// Environment variables for active TESTESB project
const supabaseUrl = 'https://fxslbhpjiqtzimtosira.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4c2xiaHBqaXF0emltdG9zaXJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwMjE2NSwiZXhwIjoyMDg4MDc4MTY1fQ.n5H8Lk7x9V6q8kZ4Y8M2pP7R9S8T4U2V6W8X0Y2Z4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Hash password function (same as in AuthContext)
const hashPassword = (password) => {
  return require('crypto').createHash('md5').update(password).digest('hex');
};

async function importUsers() {
  try {
    console.log('Starting user import to TESTESB project...');

    // Define users to import
    const users = [
      { id: 'fd38b592-2986-430e-98be-d9d104d90442', name: 'CARLOS', role: 'operador', status: 'ativo', password: hashPassword('1234') },
      { id: 'b5a1b456-e837-4f47-ab41-4734a00a0355', name: 'GUILHERME', role: 'operador', status: 'ativo', password: hashPassword('1234') },
      { id: '2e7e953f-5b4e-44e9-bc69-d463a92fa99a', name: 'HENRIQUE', role: 'administrador', status: 'ativo', password: hashPassword('1234') },
      { id: '9a91c13a-cf3a-4a08-af02-986163974acc', name: 'KELLY', role: 'operador', status: 'ativo', password: hashPassword('1234') },
      { id: '3826fb9b-439b-49e2-bfb5-a85e6d3aba23', name: 'LUCAS', role: 'operador', status: 'ativo', password: hashPassword('1234') },
      { id: '07935022-3fdf-4f83-907f-e57ae8831511', name: 'MATHEUS', role: 'operador', status: 'ativo', password: hashPassword('1234') },
      { id: 'd793d805-3468-4bc4-b7bf-a722b570ec98', name: 'ROSANA', role: 'operador', status: 'ativo', password: hashPassword('1234') },
      { id: 'super-admin-hidden', name: 'SUPER_ADMIN_HIDDEN', role: 'super_admin', status: 'ativo', password: hashPassword('1234') }
    ];

    console.log(`Importing ${users.length} users...`);

    // Insert users
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' });

      if (error) {
        console.error(`Error importing user ${user.name}:`, error);
      } else {
        console.log(`✅ Imported user: ${user.name} (${user.role})`);
      }
    }

    console.log('User import completed successfully!');

    // Verify users were imported
    const { data: importedUsers, error: fetchError } = await supabase
      .from('users')
      .select('name, role, status');

    if (!fetchError && importedUsers) {
      console.log('👥 Users in database:');
      importedUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.role}) - ${user.status}`);
      });
    }

  } catch (error) {
    console.error('Error during user import:', error);
    process.exit(1);
  }
}

importUsers();
