const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function replaceSchedule(month, year, entries, importedBy) {
  const { error } = await supabase
    .from('month_schedules')
    .upsert({
      month,
      year,
      entries,
      imported_by: importedBy,
      imported_at: new Date().toISOString(),
      is_active: true
    });
  if (error) throw error;
}

async function createVacationRequest(request) {
  const { error } = await supabase
    .from('vacation_requests')
    .insert(request);
  if (error) throw error;
}

async function importSimulations() {
  try {
    console.log('Starting import of simulations...');

    // Delete existing schedules
    console.log('Deleting existing schedules for 2026 Mar-Dec...');
    await supabase.from('month_schedules').delete().eq('year', 2026).gte('month', 3).lte('month', 12);

    // Import schedules
    const schedulesPath = path.join(__dirname, 'simulations', '2026-mar-dez', 'month-schedules.json');
    const schedules = JSON.parse(fs.readFileSync(schedulesPath, 'utf8'));

    console.log(`Importing ${schedules.length} month schedules...`);
    for (const schedule of schedules) {
      await replaceSchedule(schedule.month, schedule.year, schedule.entries, 'SIMULADOR_IA');
      console.log(`Imported schedule for ${schedule.month}/${schedule.year}`);
    }

    // // Import vacations
    // const vacationsPath = path.join(__dirname, 'simulations', '2026-mar-dez', 'vacation-requests.json');
    // const vacations = JSON.parse(fs.readFileSync(vacationsPath, 'utf8'));

    // console.log(`Importing ${vacations.length} vacation requests...`);
    // for (const vacation of vacations) {
    //   const { id, requested_at, ...vacationData } = vacation;
    //   await createVacationRequest(vacationData);
    //   console.log(`Imported vacation for ${vacation.operator_name} in ${vacation.month}/${vacation.year}`);
    // }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
  }
}

importSimulations();
