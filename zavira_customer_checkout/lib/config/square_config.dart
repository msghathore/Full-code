/// Square Mobile Payments SDK configuration for Zavira Customer Checkout App
///
/// IMPORTANT: Replace these values with your actual Square credentials
/// You can find these in your Square Developer Dashboard:
/// https://developer.squareup.com/apps
///
/// For production in Canada, ensure your Square account is verified

class SquareConfig {
  // Square Application ID
  // Format: sandbox-sq0idb-XXXXX or sq0idp-XXXXX (production)
  static const String applicationId = 'sq0idp-_h9VMgdBekjwqCkLMetFHg';

  // Square Location ID
  // The location where payments will be processed
  static const String locationId = 'LKH6TY590G319';

  // Environment: 'sandbox' for testing, 'production' for live payments
  // Start with 'sandbox' for testing, change to 'production' when ready
  static const String environment = 'sandbox';

  // Whether we're in sandbox mode
  static bool get isSandbox => environment == 'sandbox';

  // Currency for payments (CAD for Canada)
  static const String currency = 'CAD';

  // Country code
  static const String countryCode = 'CA';

  // Minimum amount in cents (Square requires at least $1.00 CAD)
  static const int minimumAmountCents = 100;
}
