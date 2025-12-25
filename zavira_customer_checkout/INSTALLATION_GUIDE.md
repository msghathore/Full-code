# Zavira Customer Checkout - Installation Guide

## Samsung Galaxy Tab S7 Setup Guide

This guide will help you install and configure the Zavira Customer Checkout app on your Samsung Galaxy Tab S7.

---

## Prerequisites

Before you begin, ensure you have:

- [ ] Samsung Galaxy Tab S7 (Android 11-13)
- [ ] Square Reader (Bluetooth - tap/insert card)
- [ ] Flutter SDK installed on your development machine (v3.16.0+)
- [ ] Android Studio with Android SDK
- [ ] USB-C cable for connecting tablet to computer
- [ ] Square Developer Account (https://developer.squareup.com)

---

## Step 1: Apply Supabase Migration

Before the app can work, you need to create the `pending_checkout` table in Supabase.

### Option A: Via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your Zavira project
3. Go to **SQL Editor**
4. Open the file: `supabase/migrations/20251225_create_pending_checkout.sql`
5. Copy the entire SQL content
6. Paste into SQL Editor and click **Run**

### Option B: Via Supabase CLI

```bash
cd C:\Users\Ghath\OneDrive\Desktop\Zavira-Front-End
npx supabase db push
```

---

## Step 2: Download Custom Fonts

Download these fonts and place them in `zavira_customer_checkout/assets/fonts/`:

### Cormorant Garamond
1. Go to: https://fonts.google.com/specimen/Cormorant+Garamond
2. Download: Regular (400), Medium (500), SemiBold (600), Bold (700)
3. Save as:
   - `CormorantGaramond-Regular.ttf`
   - `CormorantGaramond-Medium.ttf`
   - `CormorantGaramond-SemiBold.ttf`
   - `CormorantGaramond-Bold.ttf`

### Inter
1. Go to: https://fonts.google.com/specimen/Inter
2. Download: Regular (400), Medium (500), SemiBold (600), Bold (700)
3. Save as:
   - `Inter-Regular.ttf`
   - `Inter-Medium.ttf`
   - `Inter-SemiBold.ttf`
   - `Inter-Bold.ttf`

### Playfair Display
1. Go to: https://fonts.google.com/specimen/Playfair+Display
2. Download: Regular (400), Bold (700)
3. Save as:
   - `PlayfairDisplay-Regular.ttf`
   - `PlayfairDisplay-Bold.ttf`

---

## Step 3: Configure Square Sandbox (Testing)

The app is pre-configured for **sandbox mode**. Before going to production:

1. Go to https://developer.squareup.com/apps
2. Find your Zavira application
3. Get your **Sandbox** credentials:
   - Application ID: `sq0idp-_h9VMgdBekjwqCkLMetFHg` (already configured)
   - Location ID: `LKH6TY590G319` (already configured)

To switch to **production** later, edit `lib/config/square_config.dart`:
```dart
static const Environment environment = Environment.production;
```

---

## Step 4: Enable Developer Mode on Samsung Tab S7

1. Go to **Settings** > **About tablet**
2. Tap **Build number** 7 times
3. Enter your PIN/password when prompted
4. Go back to **Settings** > **Developer options**
5. Enable:
   - **USB debugging**
   - **Stay awake** (keeps screen on when charging)
   - **Allow mock locations** (for testing)

---

## Step 5: Build and Install the App

### Connect Tablet

1. Connect Samsung Tab S7 to computer via USB-C
2. On tablet, allow USB debugging when prompted
3. Verify connection:
```bash
adb devices
# Should show your device
```

### Build and Install

```bash
cd C:\Users\Ghath\OneDrive\Desktop\Zavira-Front-End\zavira_customer_checkout

# Get dependencies
flutter pub get

# Run on connected device (debug mode for testing)
flutter run

# OR build release APK
flutter build apk --release

# Install release APK
adb install build/app/outputs/flutter-apk/app-release.apk
```

---

## Step 6: Pair Square Reader

1. Turn on your Square Reader (hold power button)
2. Open the Zavira Checkout app on tablet
3. The app will automatically search for nearby readers
4. When prompted, tap to pair with your reader
5. Wait for "Reader Connected" confirmation

**Troubleshooting:**
- Ensure Bluetooth is enabled on tablet
- Keep reader within 3 feet during pairing
- If pairing fails, restart the reader and try again

---

## Step 7: Test the Complete Flow

### On iPad (Staff Dashboard):
1. Open https://zavira.ca/staff/checkout
2. Add services/products to cart
3. Click **"Send to Customer Tablet (Square Reader)"**
4. Note the session code displayed

### On Samsung Tab S7 (Customer Checkout):
1. The app should automatically receive the checkout
2. If not, check:
   - Both devices on same network
   - Supabase connection (green indicator)
3. Customer reviews invoice and adds tip
4. Customer taps **"Pay"**
5. Customer taps/inserts card on Square Reader
6. Payment processes and success screen appears

---

## Step 8: Kiosk Mode Setup (Recommended)

For a true checkout experience, lock the tablet to only run this app:

### Samsung Knox Kiosk Mode:
1. Go to **Settings** > **Lock screen** > **Screen lock type**
2. Set up a PIN for admin access
3. Go to **Settings** > **Biometrics and security** > **Secure Folder**
4. Or use Samsung Knox to configure single-app mode

### Alternative - Android Screen Pinning:
1. Go to **Settings** > **Security** > **Other security settings**
2. Enable **Pin windows**
3. Open Zavira Checkout app
4. Open Recent Apps, tap the app icon, select **Pin this app**

---

## Production Checklist

Before going live:

- [ ] Switch Square from sandbox to production mode
- [ ] Test real payment with $0.01 transaction (then refund)
- [ ] Verify receipt emails are sending correctly
- [ ] Enable kiosk/single-app mode on tablet
- [ ] Position tablet securely at checkout counter
- [ ] Train staff on the checkout flow
- [ ] Have backup charging cable nearby

---

## Troubleshooting

### "Offline - Reconnecting..."
- Check WiFi connection on tablet
- Verify Supabase is accessible
- Restart app if needed

### "Reader Not Connected"
- Turn reader off and on
- Check Bluetooth is enabled
- Re-pair the reader

### Payment Failed
- Ensure reader is properly connected
- Check if card was inserted/tapped correctly
- Try a different card
- Check Square Dashboard for error details

### No Checkout Appearing
- Verify staff clicked "Send to Customer Tablet"
- Check both devices are connected to internet
- Check Supabase realtime is working
- Fallback: App polls every 10 seconds

---

## App Structure

```
zavira_customer_checkout/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── config/
│   │   ├── supabase_config.dart  # Supabase credentials
│   │   ├── square_config.dart    # Square SDK config
│   │   └── theme_config.dart     # Zavira theme (black/white glow)
│   ├── models/
│   │   └── checkout_session.dart # Data models
│   ├── services/
│   │   ├── checkout_service.dart # Supabase sync + polling
│   │   └── square_payment_service.dart # Square SDK wrapper
│   ├── widgets/
│   │   ├── glowing_text.dart     # White text with glow
│   │   ├── tip_selector.dart     # Tip percentage picker
│   │   └── service_item_row.dart # Invoice line item
│   └── screens/
│       ├── waiting_screen.dart   # "Waiting for checkout"
│       ├── invoice_screen.dart   # Service summary + tip
│       ├── payment_screen.dart   # Tap/insert card prompt
│       └── success_screen.dart   # Payment confirmation
├── android/                      # Android-specific config
├── assets/fonts/                 # Offline fonts
└── pubspec.yaml                  # Dependencies
```

---

## Support

For issues with:
- **Square Reader:** https://squareup.com/help
- **Flutter:** https://flutter.dev/docs
- **Supabase:** https://supabase.com/docs

---

*Last Updated: December 25, 2025*
