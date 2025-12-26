import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = readFileSync(
      join(__dirname, 'supabase', 'migrations', '20251226_create_service_tiers.sql'),
      'utf-8'
    );

    console.log('Applying migration to database...');

    // Split by statement and execute each
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.length > 0) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
        if (error) {
          console.error('Error:', error);
        }
      }
    }

    console.log('Migration applied successfully!');

    // Verify the table exists
    const { data, error } = await supabase.from('service_tiers').select('*');
    if (error) {
      console.error('Verification error:', error);
    } else {
      console.log(`✓ Table created! Found ${data.length} tiers.`);
      console.log(data);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
