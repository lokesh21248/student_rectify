require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('event_attendance')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error fetching event_attendance:", error);
  } else {
    if (data && data.length > 0) {
      console.log("COLUMNS IN EVENT_ATTENDANCE TABLE:");
      console.log(Object.keys(data[0]));
    } else {
      console.log("No attendance found, let's insert a dummy one to see error.");
      const { error: insertError } = await supabase.from('event_attendance').insert([{
        event_id: '7078e148-e9c7-4390-9882-a6b19646e4c6',
        registration_id: '7078e148-e9c7-4390-9882-a6b19646e4c6'
      }]);
      console.log("Insert Error:", insertError);
    }
  }
}

checkSchema();
