require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUpdate() {
  const payload = {
    name: "Test Update",
    slug: "test-update",
    institution_type: "College",
    city: "Test",
    state: "Test",
    country: "India",
    logo_url: "",
    cover_url: "",
    status: "active",
    sort_order: 0
  };

  const { data, error } = await supabase
    .from('colleges')
    .update(payload)
    .eq('id', '74ceff26-18a0-4a7b-afe9-35fd340e79cc')
    .select()
    .single();
    
  console.log("Error:", error);
  console.log("Data:", data);
}

testUpdate();
