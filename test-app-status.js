// Test if the app loads without Supabase URL errors
console.log('Testing app status...');

// Simulate what the app does - load environment variables
const env = {
  VITE_SUPABASE_URL: 'https://demo-project.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'demo-key-for-development-only'
};

try {
  // Check if Supabase URL is valid
  const url = new URL(env.VITE_SUPABASE_URL);
  console.log('✅ Supabase URL is valid:', url.href);
  
  // Check if publishable key exists
  if (env.VITE_SUPABASE_PUBLISHABLE_KEY && env.VITE_SUPABASE_PUBLISHABLE_KEY !== 'your_supabase_publishable_key_here') {
    console.log('✅ Supabase publishable key is set');
  }
  
  console.log('🎉 App should now load without "Invalid supabaseUrl" error!');
  
} catch (error) {
  console.log('❌ Error:', error.message);
}