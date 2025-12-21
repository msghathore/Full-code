# Vercel Environment Variables Setup

> **Important:** All API keys have been removed from `vercel.json` for security. You must configure them in the Vercel Dashboard.

---

## Quick Setup Steps

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable from the list below
4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**
6. Redeploy your project for changes to take effect

---

## Required Environment Variables

### 1. Supabase Configuration

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

**Where to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **Zavira Salon**
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### 2. Square Payment Configuration

```
VITE_SQUARE_APPLICATION_ID
VITE_SQUARE_LOCATION_ID
VITE_SQUARE_ENVIRONMENT
```

**Where to get these:**
1. Go to [Square Dashboard](https://squareup.com/dashboard)
2. Navigate to **Apps** → **My Apps**
3. Select your app: **Zavira Salon**
4. Copy:
   - **Application ID** → `VITE_SQUARE_APPLICATION_ID`
5. Go to **Locations** in Square Dashboard
6. Copy your location ID → `VITE_SQUARE_LOCATION_ID`
7. Set environment:
   - `VITE_SQUARE_ENVIRONMENT=production` (for production)
   - `VITE_SQUARE_ENVIRONMENT=sandbox` (for development/testing)

---

### 3. Clerk Authentication

```
VITE_CLIENT_CLERK_PUBLISHABLE_KEY
VITE_STAFF_CLERK_PUBLISHABLE_KEY
```

**Where to get these:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. You need **TWO separate Clerk applications**:
   - **Client App** - For customer authentication
   - **Staff App** - For staff/admin authentication
3. For each app:
   - Go to **API Keys**
   - Copy the **Publishable Key**
4. Assign keys:
   - Client app key → `VITE_CLIENT_CLERK_PUBLISHABLE_KEY`
   - Staff app key → `VITE_STAFF_CLERK_PUBLISHABLE_KEY`

---

### 4. Application Configuration

```
VITE_APP_ENV
VITE_APP_URL
```

**Set these values:**
- `VITE_APP_ENV=production`
- `VITE_APP_URL=https://zavira.ca` (your production domain)

For preview/development environments:
- `VITE_APP_ENV=development` or `preview`
- `VITE_APP_URL=https://your-preview-url.vercel.app`

---

## How to Add Variables in Vercel

### Step-by-Step Instructions

1. **Access Vercel Dashboard:**
   - Go to https://vercel.com
   - Select your project: **zavira-salon**

2. **Navigate to Environment Variables:**
   - Click **Settings** tab
   - Click **Environment Variables** in sidebar

3. **Add Each Variable:**
   - Click **Add New** button
   - Enter **Key** (e.g., `VITE_SUPABASE_URL`)
   - Enter **Value** (e.g., `https://stppkvkcjsyusxwtbaej.supabase.co`)
   - Select environments to apply:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **Repeat for all variables** from the list above

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click **⋯** menu on latest deployment
   - Click **Redeploy**
   - This applies the new environment variables

---

## Verification Checklist

After adding all variables:

- [ ] All 9 environment variables are added
- [ ] Each variable is set for Production, Preview, and Development
- [ ] Project has been redeployed
- [ ] Application loads without errors
- [ ] Authentication works (customer and staff login)
- [ ] Square payment integration works
- [ ] Supabase data loads correctly

---

## Troubleshooting

### "Environment variable not found" error

**Solution:** Make sure you:
1. Added the variable with the correct name (case-sensitive)
2. Selected the right environment (Production/Preview/Development)
3. Redeployed after adding variables

### Authentication not working

**Solution:**
1. Verify both Clerk keys are added
2. Check you're using the correct app keys (client vs staff)
3. Ensure Clerk apps have correct domains configured

### Payment errors

**Solution:**
1. Verify Square environment matches (`production` vs `sandbox`)
2. Check Application ID and Location ID are from the same Square account
3. Ensure Square app is approved for production (if using production mode)

### Supabase connection failed

**Solution:**
1. Verify URL format: `https://your-project.supabase.co` (no trailing slash)
2. Ensure you're using the **anon/public** key, not the service role key
3. Check Supabase project is active and not paused

---

## Security Notes

- **NEVER commit API keys to Git** - they should only exist in:
  - Vercel Dashboard (for deployment)
  - Local `.env` file (for development, git-ignored)
- `.env.vercel.example` is safe to commit (contains only templates)
- If a key is compromised, regenerate it immediately in the respective service
- Rotate keys periodically for enhanced security

---

## Reference Files

- `.env.vercel.example` - Template with all required variables
- `vercel.json` - Configuration (no secrets)
- `.gitignore` - Ensures `.env` is never committed

---

## Need Help?

If you encounter issues:
1. Check [Vercel Documentation](https://vercel.com/docs/environment-variables)
2. Review service-specific docs:
   - [Supabase](https://supabase.com/docs)
   - [Square](https://developer.squareup.com)
   - [Clerk](https://clerk.com/docs)
3. Contact support for the respective service

---

*Last updated: December 20, 2025*
