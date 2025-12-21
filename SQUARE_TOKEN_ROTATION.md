# Square Access Token Rotation Instructions

> **⚠️ CRITICAL SECURITY ACTION REQUIRED**
> **Date:** December 20, 2025

## Overview

A hardcoded Square access token was found in the codebase and has been removed. This token has been exposed in version control and **MUST be rotated immediately** to prevent unauthorized access to your Square account.

---

## What Was Fixed

The following changes have been made to secure your Square credentials:

1. **Removed hardcoded token** from `supabase/functions/process-payment/index.ts`
2. **Updated code** to use environment variables (`SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`)
3. **Added validation** to ensure the token is configured before processing payments
4. **Created example file** (`.env.supabase.example`) for configuration reference

---

## Immediate Actions Required

### Step 1: Revoke the Exposed Token

1. **Login to Square Dashboard**
   - Go to: https://squareup.com/dashboard
   - Navigate to: **Developer** → **Applications**

2. **Find Your Application**
   - Locate the application associated with Zavira Salon & Spa
   - Click on the application name

3. **Revoke the Old Token**
   - Go to the **Access Tokens** section
   - Find the token starting with `EAAAl-RUwasfDDumATJMPcM2a8pb9LZ6iL0bbTqWUqC5chg1Iyl84eT0rgXvnu4Y`
   - Click **Revoke** or **Delete**
   - Confirm the revocation

### Step 2: Generate a New Production Token

1. **Create New Access Token**
   - In the same **Access Tokens** section
   - Click **Generate New Production Token**
   - Give it a descriptive name: `Zavira Salon Production - Dec 2025`
   - Copy the new token **immediately** (you won't be able to see it again)

2. **Save the Token Securely**
   - Store it in a password manager (1Password, LastPass, Bitwarden, etc.)
   - Never commit it to version control
   - Never share it via email or messaging apps

### Step 3: Configure Supabase Edge Function Secrets

You need to add the new Square token to your Supabase project as a secret:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref <your-project-ref>

# Set the Square access token secret
npx supabase secrets set SQUARE_ACCESS_TOKEN=<your_new_token>

# Set the location ID (if different)
npx supabase secrets set SQUARE_LOCATION_ID=LKH6TY590G319

# Verify secrets were set
npx supabase secrets list
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Settings** → **Secrets**
3. Add a new secret:
   - **Name:** `SQUARE_ACCESS_TOKEN`
   - **Value:** Your new Square production token
4. Add another secret:
   - **Name:** `SQUARE_LOCATION_ID`
   - **Value:** `LKH6TY590G319`

### Step 4: Redeploy the Edge Function

After setting the secrets, redeploy the payment processing function:

```bash
# Deploy the updated function
npx supabase functions deploy process-payment

# Test the function (optional but recommended)
npx supabase functions serve process-payment
```

### Step 5: Verify the Fix

1. **Test a payment** in your development or staging environment
2. **Check logs** in Supabase dashboard:
   - Go to **Edge Functions** → **process-payment** → **Logs**
   - Look for successful payment processing
   - Ensure no errors about missing environment variables

3. **Monitor for issues:**
   - Check for any payment failures
   - Verify that real transactions are processing correctly

---

## Security Best Practices

### DO
✅ Store secrets in environment variables or secret management systems
✅ Use Supabase secrets for Edge Function credentials
✅ Rotate tokens immediately when exposed
✅ Use different tokens for development and production
✅ Enable alerts for unauthorized Square API usage

### DON'T
❌ Commit secrets to version control
❌ Share tokens via email or chat
❌ Hardcode credentials in source code
❌ Use production tokens in development
❌ Reuse revoked tokens

---

## Verification Checklist

- [ ] Old token revoked in Square Dashboard
- [ ] New production token generated
- [ ] Token saved securely in password manager
- [ ] `SQUARE_ACCESS_TOKEN` secret set in Supabase
- [ ] `SQUARE_LOCATION_ID` secret set in Supabase
- [ ] Edge function redeployed
- [ ] Test payment processed successfully
- [ ] No errors in Supabase logs

---

## Troubleshooting

### Error: "SQUARE_ACCESS_TOKEN environment variable is required"

**Cause:** The secret hasn't been set in Supabase or the function hasn't been redeployed.

**Solution:**
1. Verify secrets are set: `npx supabase secrets list`
2. Redeploy function: `npx supabase functions deploy process-payment`
3. Wait 1-2 minutes for deployment to complete

### Error: "Unauthorized" from Square API

**Cause:** The token is invalid or has been revoked.

**Solution:**
1. Generate a new token in Square Dashboard
2. Update the Supabase secret
3. Redeploy the function

### Payments Still Failing

**Cause:** Multiple possible reasons.

**Solution:**
1. Check Supabase Edge Function logs
2. Verify Square account is active and in good standing
3. Ensure location ID `LKH6TY590G319` is correct
4. Test with Square's sandbox environment first

---

## Support Resources

- **Square Developer Docs:** https://developer.squareup.com/docs
- **Supabase Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Supabase Secrets Guide:** https://supabase.com/docs/guides/functions/secrets

---

## Timeline

| Action | Deadline |
|--------|----------|
| Revoke old token | **IMMEDIATELY** |
| Generate new token | **Within 1 hour** |
| Configure Supabase secrets | **Within 2 hours** |
| Redeploy function | **Within 2 hours** |
| Verify payments work | **Within 4 hours** |

---

*This file was generated as part of security remediation on December 20, 2025*
