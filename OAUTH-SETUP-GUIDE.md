# OAuth Setup Guide for Zavira

## ✅ Code Fixes Completed

The following code issues have been fixed in `src/pages/Auth.tsx`:

### 1. **Absolute Redirect URLs**
- ❌ **Before:** Using relative paths like `/auth/sso-callback`
- ✅ **After:** Using absolute URLs like `https://zavira.ca/auth/sso-callback`

### 2. **Dynamic Base URL Detection**
- Added `getBaseUrl()` helper that uses `VITE_APP_URL` in production
- Fallback to `window.location.origin` in development

### Changes Applied:
```typescript
// New helper function
const getBaseUrl = () => {
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  return window.location.origin;
};

// Updated all OAuth handlers to use:
const baseUrl = getBaseUrl();
await signIn.authenticateWithRedirect({
  strategy: 'oauth_google',
  redirectUrl: `${baseUrl}/auth/sso-callback`,      // ✅ Now absolute
  redirectUrlComplete: `${baseUrl}/onboarding`,      // ✅ Now absolute
});
```

---

## 🔧 Required: Clerk Dashboard Configuration

The OAuth providers must be configured in the Clerk Dashboard. Follow these steps:

### Step 1: Access Clerk Dashboard

1. Go to https://dashboard.clerk.com/
2. Sign in to your account
3. Select your **Client App** instance (the one using `VITE_CLIENT_CLERK_PUBLISHABLE_KEY`)

### Step 2: Configure Google OAuth

1. In Clerk Dashboard, go to **User & Authentication** → **Social Connections**
2. Find **Google** and click **Configure**
3. Enable Google OAuth
4. You'll need to create a Google OAuth Client:
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
   - Application type: **Web application**
   - Name: `Zavira Client App`
   - **Authorized JavaScript origins:**
     - `https://zavira.ca`
     - `http://localhost:8080` (for development)
   - **Authorized redirect URIs:**
     - Copy the redirect URI from Clerk Dashboard (looks like `https://accounts.clerk.dev/...`)
     - Add `https://zavira.ca/auth/sso-callback`
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**
5. Back in Clerk Dashboard, paste the Client ID and Client Secret
6. Click **Save**

### Step 3: Configure Apple OAuth

1. In Clerk Dashboard, go to **Social Connections** → **Apple**
2. Enable Apple OAuth
3. You'll need to create an Apple Services ID:
   - Go to https://developer.apple.com/account/
   - Sign in with your Apple Developer account
   - Go to **Certificates, Identifiers & Profiles**
   - Click **Identifiers** → **+** (plus icon)
   - Select **Services IDs** → **Continue**
   - Register a Services ID (e.g., `com.zavira.signin`)
   - Enable **Sign In with Apple**
   - Configure **Domains and Subdomains:**
     - Add `zavira.ca`
   - Configure **Return URLs:**
     - Copy the redirect URI from Clerk Dashboard
     - Add `https://zavira.ca/auth/sso-callback`
   - Download the **Key** file and note the **Key ID** and **Team ID**
4. In Clerk Dashboard, enter:
   - Services ID
   - Team ID
   - Key ID
   - Private Key (from the .p8 file)
5. Click **Save**

### Step 4: Configure Facebook OAuth

1. In Clerk Dashboard, go to **Social Connections** → **Facebook**
2. Enable Facebook OAuth
3. You'll need to create a Facebook App:
   - Go to https://developers.facebook.com/
   - Click **My Apps** → **Create App**
   - Select **Consumer** as app type
   - App Name: `Zavira Client App`
   - Contact Email: `zavirasalonandspa@gmail.com`
   - Click **Create App**
   - In the app dashboard, go to **Settings** → **Basic**
   - Copy the **App ID** and **App Secret**
   - Add **App Domains:** `zavira.ca`
   - In **Facebook Login** → **Settings**:
     - **Valid OAuth Redirect URIs:**
       - Copy the redirect URI from Clerk Dashboard
       - Add `https://zavira.ca/auth/sso-callback`
   - Make the app **Live** (switch from Development to Live mode)
4. Back in Clerk Dashboard, paste the App ID and App Secret
5. Click **Save**

---

## 🔐 Redirect URLs to Configure

For all OAuth providers, ensure these redirect URLs are configured:

### Clerk OAuth Callback (Primary)
- The Clerk-generated callback URL (e.g., `https://accounts.clerk.dev/v1/oauth_callback`)

### Application Callback (Secondary)
- `https://zavira.ca/auth/sso-callback`
- `https://zavira.ca/onboarding`

### Development (Optional)
- `http://localhost:8080/auth/sso-callback`
- `http://localhost:8080/onboarding`

---

## 🧪 Testing OAuth After Configuration

### 1. Test in Production
1. Go to https://zavira.ca/auth
2. Click "Sign in with Google" / "Apple" / "Facebook"
3. Should redirect to OAuth provider
4. After authorization, should redirect back to `/auth/sso-callback`
5. Then complete to `/onboarding`

### 2. Verify No Errors
- ✅ No "Missing required parameter: client_id" error
- ✅ No "Invalid App ID" error
- ✅ Successful OAuth flow completion

### 3. Check Console
1. Open browser DevTools (F12)
2. Check Console for any errors
3. Check Network tab for failed OAuth requests

---

## 📋 Checklist

Before marking OAuth setup as complete, verify:

- [ ] Code changes deployed to production (Vercel)
- [ ] `VITE_APP_URL=https://zavira.ca` set in Vercel environment variables
- [ ] Google OAuth configured in Clerk Dashboard
- [ ] Apple OAuth configured in Clerk Dashboard (requires Apple Developer account)
- [ ] Facebook OAuth configured in Clerk Dashboard
- [ ] All redirect URLs added to OAuth provider consoles
- [ ] Tested Google login in production - works ✅
- [ ] Tested Apple login in production - works ✅
- [ ] Tested Facebook login in production - works ✅
- [ ] No console errors during OAuth flow

---

## 🚨 Common Issues & Solutions

### Issue: "Missing required parameter: client_id"
**Cause:** Google OAuth not configured in Clerk Dashboard
**Solution:** Complete Step 2 above

### Issue: "Invalid App ID"
**Cause:** Facebook OAuth not configured or wrong credentials
**Solution:** Complete Step 4 above, verify App ID is correct

### Issue: "Redirect URI mismatch"
**Cause:** The redirect URL in the provider console doesn't match the one Clerk is sending
**Solution:** Copy the exact redirect URL from Clerk Dashboard and add it to the OAuth provider console

### Issue: OAuth works locally but not in production
**Cause:** `VITE_APP_URL` not set in Vercel environment variables
**Solution:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `VITE_APP_URL=https://zavira.ca`
3. Redeploy the application

---

## 📞 Support Resources

- **Clerk Documentation:** https://clerk.com/docs/authentication/social-connections
- **Google OAuth Setup:** https://developers.google.com/identity/protocols/oauth2
- **Apple Sign In:** https://developer.apple.com/sign-in-with-apple/
- **Facebook Login:** https://developers.facebook.com/docs/facebook-login/

---

*Last Updated: December 22, 2025*
