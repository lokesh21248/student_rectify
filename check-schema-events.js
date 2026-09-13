require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error fetching event:", error);
  } else {
    if (data && data.length > 0) {
      console.log("COLUMNS IN EVENTS TABLE:");
      console.log(Object.keys(data[0]));
      // Let's also check if we can insert an event with null category_id
      const { error: insertError } = await supabase.from('events').insert([{
        slug: 'test-null-cat',
        title: 'test',
        category_id: null,
        organizer_id: '74ceff26-18a0-4a7b-afe9-35fd340e79cc',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        status: 'draft',
        format: 'in_person'
      }]);
      console.log("Insert Error with null category:", insertError);
    } else {
      console.log("No events found");
    }
  }
}

checkSchema();
