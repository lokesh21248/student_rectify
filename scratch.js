const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars", { supabaseUrl, hasKey: !!supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data: colleges, error: cErr } = await supabase.from('colleges').select('*').limit(1);
  console.log("Colleges Schema:", colleges?.[0] ? Object.keys(colleges[0]) : "No data, error:", cErr);

  const { data: categories, error: catErr } = await supabase.from('categories').select('*').limit(1);
  console.log("Categories Schema:", categories?.[0] ? Object.keys(categories[0]) : "No data, error:", catErr);
}

checkSchema();
