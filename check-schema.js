require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error fetching college:", error);
  } else {
    if (data && data.length > 0) {
      console.log("COLUMNS IN COLLEGES TABLE:");
      console.log(Object.keys(data[0]));
    } else {
      console.log("No colleges found, trying to insert a dummy one to see error.");
      const { error: insertError } = await supabase.from('colleges').insert([{ name: 'test', slug: 'test' }]);
      console.log("Insert Error:", insertError);
    }
  }
}

checkSchema();
