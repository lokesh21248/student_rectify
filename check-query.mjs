import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => { const [k, v] = line.split('='); if(k&&v) acc[k.trim()] = v.trim(); return acc; }, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('events').select('*, categories!category_id(id), colleges!college_id(id)').limit(1).then(r => console.log('Result:', JSON.stringify(r))).catch(console.error);
