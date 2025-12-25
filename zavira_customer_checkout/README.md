# Zavira Customer Checkout - Android App

Flutter mobile application for customer checkout with Square Reader integration at Zavira Salon & Spa.

![Zavira Logo](https://zavira.ca/logo.png)

## 🎯 Overview

This is a **customer-facing checkout app** designed to run on a Samsung Galaxy Tab S7 at the salon's checkout counter. Customers can review their invoice, add a tip, and pay using tap/insert card via a Bluetooth-connected Square Reader.

### Key Features

✅ **Black & White Glow Theme** - Matches Zavira brand identity
✅ **Square Mobile Payments SDK** - Accept tap, chip, and swipe payments
✅ **Bluetooth Square Reader** - Auto-pairing with card reader
✅ **Realtime Sync** - Instant checkout updates from staff iPad via Supabase
✅ **Tip Selection** - 15%, 18%, 20%, or custom tip amount
✅ **Invoice Review** - Customer sees services, prices, tax, and total
✅ **Payment Confirmation** - Success screen with receipt details

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Flutter 3.16.0+** | Cross-platform mobile framework |
| **Supabase** | Realtime database & sync |
| **Square Mobile Payments SDK** | Payment processing |
| **Dart** | Programming language |
| **Android 11-13** | Target platform |

---

## 📱 How It Works

1. **Staff sends checkout** from iPad (zavira.ca/staff/checkout)
2. **Tablet receives** checkout via Supabase realtime
3. **Customer reviews** invoice and selects tip
4. **Customer taps** "Pay" button
5. **Customer taps/inserts** card on Square Reader
6. **Payment processes** via Square
7. **Success screen** shows confirmation

---

## 🚀 Installation

See **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** for complete setup instructions.

### Quick Start

```bash
# Prerequisites
- Flutter SDK 3.16.0+
- Android Studio with Android SDK
- Samsung Galaxy Tab S7 (Android 11-13)
- Square Reader (Bluetooth)

# Install dependencies
flutter pub get

# Build release APK
flutter build apk --release

# Install on tablet
adb install build/app/outputs/flutter-apk/app-release.apk
```

---

## 📂 Project Structure

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
│   │   ├── glowing_text.dart     # White text with glow effect
│   │   ├── tip_selector.dart     # Tip percentage picker
│   │   └── service_item_row.dart # Invoice line item
│   └── screens/
│       ├── waiting_screen.dart   # "Waiting for checkout"
│       ├── invoice_screen.dart   # Service summary + tip
│       ├── payment_screen.dart   # Tap/insert card prompt
│       └── success_screen.dart   # Payment confirmation
├── android/                      # Android-specific config
├── assets/fonts/                 # Offline fonts (download separately)
└── pubspec.yaml                  # Dependencies
```

---

## 🎨 Branding

**Zavira Salon & Spa**
- **Colors:** Black background, white glowing text
- **Fonts:** Cormorant Garamond, Inter, Playfair Display
- **Theme:** Modern, luxurious, minimalist

---

## 🔧 Configuration

### Supabase Setup

Update `lib/config/supabase_config.dart` with your Supabase credentials:
```dart
static const String supabaseUrl = 'YOUR_SUPABASE_URL';
static const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### Square Setup

App is pre-configured for **sandbox mode** for testing.

For **production**, edit `lib/config/square_config.dart`:
```dart
static const Environment environment = Environment.production;
static const String applicationId = 'YOUR_PRODUCTION_APP_ID';
static const String locationId = 'YOUR_PRODUCTION_LOCATION_ID';
```

---

## 🧪 Testing

### Test Flow

1. Connect tablet to WiFi
2. Pair Square Reader via Bluetooth
3. Open app (shows "Waiting for checkout")
4. From staff iPad: Add items → Click "Send to Customer Tablet"
5. Checkout appears on tablet
6. Select tip → Tap "Pay"
7. Use **test card** in Square sandbox

### Square Test Cards

| Card Number | Result |
|-------------|--------|
| `4111 1111 1111 1111` | Success |
| `4000 0000 0000 0002` | Declined |

---

## 📦 Building APK

```bash
# Debug build (for testing)
flutter run

# Release build (for production)
flutter build apk --release

# APK location
build/app/outputs/flutter-apk/app-release.apk
```

---

## 🐛 Troubleshooting

### "Offline - Reconnecting..."
- Check WiFi connection
- Verify Supabase URL/key
- Restart app

### "Reader Not Connected"
- Turn Square Reader off/on
- Enable Bluetooth on tablet
- Re-pair reader

### Payment Failed
- Check Square Dashboard for errors
- Verify card was tapped/inserted correctly
- Try different test card

### No Checkout Appearing
- Verify staff clicked "Send to Customer Tablet"
- Check Supabase realtime is enabled
- App polls every 10 seconds as fallback

---

## 🔐 Security

- ✅ Supabase Row Level Security (RLS) enabled
- ✅ Square PCI-compliant payment processing
- ✅ No card data stored on device
- ✅ Encrypted Bluetooth connection to reader

---

## 📄 License

Proprietary - © 2025 Zavira Salon & Spa

---

## 🤝 Support

For issues:
- **Square Reader:** https://squareup.com/help
- **Flutter:** https://flutter.dev/docs
- **Supabase:** https://supabase.com/docs

---

## 🏢 About Zavira

**Zavira Salon & Spa**
283 Tache Avenue, Winnipeg, MB, Canada
(431) 816-3330
zavirasalonandspa@gmail.com
https://zavira.ca

---

*Built with ❤️ using Flutter & Claude Code*
