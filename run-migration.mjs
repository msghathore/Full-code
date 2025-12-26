import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationSQL = readFileSync(
      join(__dirname, 'supabase', 'migrations', '20251226_create_service_tiers.sql'),
      'utf-8'
    );

    console.log('🚀 Applying migration to database...');
    console.log('Note: This uses the anon key, so some DDL might fail. Check results.\n');

    // Try to query if table already exists
    console.log('Checking if service_tiers table exists...');
    const { data: existingData, error: checkError } = await supabase
      .from('service_tiers')
      .select('count');

    if (!checkError) {
      console.log('✓ Table already exists!');
      const { data, error } = await supabase.from('service_tiers').select('*');
      if (!error && data) {
        console.log(`Found ${data.length} existing tiers`);
        if (data.length > 0) {
          console.log('Tiers:', data.map(t => t.tier_name).join(', '));
          process.exit(0);
        }
      }
    } else {
      console.log('Table does not exist yet. Migration is needed.');
    }

    console.log('\n⚠️  The anon key cannot run DDL (CREATE TABLE).');
    console.log('Please run this migration manually in Supabase SQL Editor:');
    console.log(`\n${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new\n`);
    console.log('Or use Supabase CLI with service role key.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

applyMigration();
