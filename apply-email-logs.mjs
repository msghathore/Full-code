import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

config();

const projectId = 'stppkvkcjsyusxwtbaej';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('VITE_SUPABASE_ANON_KEY not set in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function apply() {
  try {
    const sql = fs.readFileSync('./supabase/migrations/20251226_email_logs.sql', 'utf8');

    console.log('Attempting to apply migration...');
    console.log('SQL length:', sql.length, 'characters');

    // The migration should be applied via the dashboard or via the migration system
    console.log('Note: Direct SQL execution requires service role key or via migration system.');
    console.log('Use: npx supabase db push --linked --include-all');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

apply();
