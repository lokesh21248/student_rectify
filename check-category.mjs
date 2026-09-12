import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => { const [k, v] = line.split('='); if(k&&v) acc[k.trim()] = v.trim(); return acc; }, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function run() { const res = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;' }); console.log(res); } run();
