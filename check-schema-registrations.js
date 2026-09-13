require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error fetching event_registrations:", error);
  } else {
    if (data && data.length > 0) {
      console.log("COLUMNS IN EVENT_REGISTRATIONS TABLE:");
      console.log(Object.keys(data[0]));
    } else {
      console.log("No registrations found");
    }
  }
}

checkSchema();
