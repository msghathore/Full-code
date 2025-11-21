# OAuth Setup Guide - Fix "Provider Not Enabled" Error

## 🚨 **The Problem**
You're getting error: "Unsupported provider provider is not enabled"

**Root Cause**: OAuth providers (Google, Facebook, Apple) are NOT enabled in your Supabase project.

## ✅ **Solution Steps**

### **Step 1: Enable OAuth Providers in Supabase**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Enable the following providers:

#### **Google OAuth Setup:**
1. **Enable Google provider** (toggle ON)
2. Get credentials from [Google Cloud Console](https://console.cloud.google.com):
   - Create project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret to Supabase
4. Click **Save**

#### **Facebook OAuth Setup:**
1. **Enable Facebook provider** (toggle ON)
2. Get credentials from [Facebook Developers](https://developers.facebook.com):
   - Create new app
   - Add Facebook Login product
   - Configure OAuth redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Copy App ID and App Secret to Supabase
4. Click **Save**

#### **Apple OAuth Setup:**
1. **Enable Apple provider** (toggle ON)
2. Get credentials from [Apple Developer](https://developer.apple.com):
   - Create Sign in with Apple key
   - Configure service ID and private key
   - Add redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Copy Service ID, Team ID, Key ID, and Private Key to Supabase
4. Click **Save**

### **Step 2: Update Redirect URLs**

In your OAuth app configurations, ensure redirect URL is:
```
https://YOUR_PROJECT.supabase.co/auth/v1/callback
```

**Replace `YOUR_PROJECT` with your actual Supabase project ID**

### **Step 3: Test the Setup**

After enabling providers:
1. Visit your app's auth page
2. Click any social login button
3. Should redirect to provider (not show error)

## 🔧 **Emergency Fix: Disable Broken Providers**

If you want to hide broken providers temporarily, I can modify the code to only show working providers.

## 📋 **Required URLs to Configure**

For each provider, add this exact redirect URL:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

**To find your project reference:**
- Go to Supabase Dashboard → Project Settings → API
- Look for "Project URL" - it's in format: `https://YOUR_PROJECT_REF.supabase.co`

## 💰 **Cost Information**

**Everything is FREE:**
- Supabase OAuth: Free up to 50,000 monthly users
- Google Developer Account: Free
- Facebook Developer Account: Free  
- Apple Developer Account: Free (for basic use)

## 🆘 **Need Help?**

If you still get errors after setup:
1. Double-check redirect URLs match exactly
2. Verify provider credentials are copied correctly
3. Ensure providers are toggled ON in Supabase
4. Check browser console for additional error details