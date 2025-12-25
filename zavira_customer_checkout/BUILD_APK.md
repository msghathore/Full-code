# Build APK - Quick Guide

## ✅ What You Have Installed

- [x] Flutter SDK at `C:\flutter\bin\flutter`
- [x] All Flutter dependencies installed
- [x] Git repo created and pushed to GitHub

## ❌ What's Missing

- [ ] **Android SDK** (required to build Android apps)

---

## 🚀 Install Android SDK (2 Options)

### **Option 1: Android Studio (Recommended - Easiest)**

1. **Download Android Studio:**
   - Go to: https://developer.android.com/studio
   - Download Android Studio
   - Run installer (takes ~5-10 min)

2. **During Installation:**
   - Accept all defaults
   - It will automatically install Android SDK
   - Let it download all components

3. **After Installation:**
   - Open Android Studio
   - Click "More Actions" > "SDK Manager"
   - Verify Android SDK is installed (should show path like `C:\Users\Ghath\AppData\Local\Android\Sdk`)

4. **That's it!** Close Android Studio

### **Option 2: Command Line Only (Faster)**

If you don't want Android Studio:

1. **Download SDK Command Line Tools:**
   - Go to: https://developer.android.com/studio#command-line-tools-only
   - Download "Command line tools only" for Windows

2. **Extract and Install:**
   ```powershell
   # Create SDK folder
   mkdir C:\Android\sdk

   # Extract downloaded zip to: C:\Android\sdk\cmdline-tools\latest

   # Set environment variable
   setx ANDROID_HOME "C:\Android\sdk"
   setx PATH "%PATH%;C:\Android\sdk\cmdline-tools\latest\bin"

   # Install platform tools
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

---

## 📦 Build the APK (After Installing Android SDK)

Once Android SDK is installed, run:

```powershell
# Navigate to project
cd C:\Users\Ghath\OneDrive\Desktop\Zavira-Front-End\zavira_customer_checkout

# Build APK
C:\flutter\bin\flutter\bin\flutter.bat build apk --release
```

**APK Location:**
```
C:\Users\Ghath\OneDrive\Desktop\Zavira-Front-End\zavira_customer_checkout\build\app\outputs\flutter-apk\app-release.apk
```

---

## 📱 Install on Android Tablet

### **Method 1: USB Cable**
```powershell
# Connect tablet via USB
# Enable USB debugging on tablet (Settings > Developer Options)

# Install APK
adb install build\app\outputs\flutter-apk\app-release.apk
```

### **Method 2: Transfer File**
1. Copy `app-release.apk` to Google Drive / USB drive
2. Download on tablet
3. Open file and tap "Install"
4. Allow "Install from unknown sources" if prompted

---

## 🔧 Verify Setup

Check if Android SDK is installed:

```powershell
C:\flutter\bin\flutter\bin\flutter.bat doctor
```

Should show:
- ✅ Flutter
- ✅ Android toolchain
- ✅ Android SDK

---

## ⚠️ Square Payment Integration

**NOTE:** This APK will compile but **Square Reader payments won't work yet**.

Square Mobile Payments SDK is not available on pub.dev. You need to:
1. Contact Square Developer Support
2. Get access to their SDK
3. Follow their integration guide

For now, the app will run and show the UI, but payment processing will be stubbed out.

---

## 🎯 Recommended Next Steps

1. **Install Android Studio** (Option 1 above) - takes 10-15 min
2. **Build APK** - takes 2-3 min
3. **Install on tablet** - takes 1 min
4. **Test the UI** (payments won't work without Square SDK)
5. **Integrate Square SDK** (requires Square developer account)

---

## 🆘 Troubleshooting

### "Android SDK not found"
- Install Android Studio (Option 1) OR
- Set ANDROID_HOME environment variable manually

### "Build failed"
```powershell
# Clean and rebuild
C:\flutter\bin\flutter\bin\flutter.bat clean
C:\flutter\bin\flutter\bin\flutter.bat pub get
C:\flutter\bin\flutter\bin\flutter.bat build apk --release
```

### "License not accepted"
```powershell
# Accept Android licenses
C:\flutter\bin\flutter\bin\flutter.bat doctor --android-licenses
```

---

**GitHub Repo:** https://github.com/msghathore/customer-app-android

*Need help? Check INSTALLATION_GUIDE.md for full details.*
