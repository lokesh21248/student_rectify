import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => { const [k, v] = line.split('='); if(k&&v) acc[k.trim()] = v.trim(); return acc; }, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function run() { const { data } = await supabase.rpc('get_column_type', { _table_name: 'events', _column_name: 'banner_url' }); console.log(data); } run();
