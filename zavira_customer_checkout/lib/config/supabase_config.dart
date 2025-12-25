/// Supabase configuration for Zavira Customer Checkout App
///
/// IMPORTANT: Replace these values with your actual Supabase credentials
/// You can find these in your Supabase project dashboard:
/// Settings > API > Project URL and anon/public key

class SupabaseConfig {
  // Your Supabase project URL
  // Format: https://[project-id].supabase.co
  static const String url = 'https://stppkvkcjsyusxwtbaej.supabase.co';

  // Your Supabase anon/public key
  // This key is safe to use in client apps
  static const String anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0';

  // Table name for pending checkouts
  static const String pendingCheckoutTable = 'pending_checkout';

  // Realtime channel name
  static const String realtimeChannel = 'pending_checkout_channel';

  // Fallback polling interval (per GROK suggestion - every 10 seconds)
  static const Duration pollingInterval = Duration(seconds: 10);
}
