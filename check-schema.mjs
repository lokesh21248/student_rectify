import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => { const [k, v] = line.split('='); if(k&&v) acc[k.trim()] = v.trim(); return acc; }, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function run() { 
  const { error } = await supabase.from('organizers').select('*').limit(1);
  console.log('organizers:', error);
  const { error: e2 } = await supabase.from('event_interests').select('*').limit(1);
  console.log('event_interests:', e2);
  const { error: e3 } = await supabase.from('event_attendance').select('*').limit(1);
  console.log('event_attendance:', e3);
}
run();
