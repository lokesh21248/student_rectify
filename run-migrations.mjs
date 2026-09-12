// run-migrations.mjs
// Uses the Supabase JS client to run DDL SQL via rpc or direct query
// Run from college-event-platform dir: node ../supabase/run-migrations.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://etwlozgtxkvuptkacrbg.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_now';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Test connection by querying a table
const { data: test, error: testError } = await supabase.from('categories').select('count').limit(1);
if (testError) {
  console.error('Connection test failed:', testError.message);
} else {
  console.log('✓ Connected to Supabase successfully');
  console.log('Categories count test:', test);
}

// Try creating admin_certificates table via an RPC call
// First, let's check if the table already exists
const { data: tableCheck, error: tableCheckError } = await supabase
  .from('admin_certificates')
  .select('count')
  .limit(1);

if (tableCheckError && tableCheckError.code === '42P01') {
  console.log('admin_certificates table does not exist - needs SQL migration');
  console.log('\n======================================================');
  console.log('MANUAL STEP REQUIRED:');
  console.log('Please run the following SQL in your Supabase SQL editor:');
  console.log('https://supabase.com/dashboard/project/etwlozgtxkvuptkacrbg/sql/new');
  console.log('======================================================\n');
  console.log(readFileSync(new URL('./fix_storage_and_rls.sql', import.meta.url), 'utf-8').split('\n').slice(0, 60).join('\n'));
} else if (tableCheckError) {
  console.log('Table check error:', tableCheckError.message);
} else {
  console.log('✓ admin_certificates table already exists');
}

// Check events table organizer_id constraint
const { data: evtTest, error: evtError } = await supabase.from('events').select('id, organizer_id').limit(1);
if (evtError) {
  console.log('Events table error:', evtError.message);
} else {
  console.log('✓ Events table accessible');
}

// Test insert into events (to check if organizer_id is nullable)
const testInsert = {
  title: 'Test Event Schema Check',
  slug: `test-schema-${Date.now()}`,
  start_at: new Date(Date.now() + 86400000).toISOString(),
  end_at: new Date(Date.now() + 172800000).toISOString(),
  status: 'draft',
  approved: false,
};

// Get a category and college for the test
const { data: cats } = await supabase.from('categories').select('id').limit(1).single();
const { data: cols } = await supabase.from('colleges').select('id').limit(1).single();

if (cats?.id && cols?.id) {
  const { error: insertError } = await supabase
    .from('events')
    .insert({ ...testInsert, category_id: cats.id, college_id: cols.id })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.message.includes('organizer_id')) {
      console.log('✗ organizer_id is NOT NULL - need to run: ALTER TABLE events ALTER COLUMN organizer_id DROP NOT NULL;');
    } else {
      console.log('Test insert error:', insertError.message);
    }
  } else {
    console.log('✓ Event insert works (organizer_id is nullable)');
    // Clean up test event
    await supabase.from('events').delete().eq('slug', testInsert.slug);
  }
}

console.log('\n=== DIAGNOSIS COMPLETE ===');
