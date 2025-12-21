# Resend API Key Rotation Instructions

## Current Status
🔴 **CRITICAL**: The Resend API key was exposed in the EMAIL file and committed to Git.

**Exposed Key**: `re_CyBgdUxr_K37fqo6QcqEMQ2xggPNnTHfR`

## Immediate Actions Required

### Step 1: Login to Resend Dashboard
- **URL**: https://resend.com/dashboard
- Use your Zavira account credentials

### Step 2: Delete Exposed Key
1. Navigate to: **API Keys** section
2. Find key: `re_CyBgdUxr_K37fqo6QcqEMQ2xggPNnTHfR`
3. Click **"Delete"** or **"Revoke"**
4. Confirm deletion

### Step 3: Create New API Key
1. Click **"Create API Key"** button
2. **Name**: `Zavira Production`
3. **Permissions**: Full Access (or as needed)
4. Click **"Create"**
5. **IMPORTANT**: Copy the new key immediately (it won't be shown again)

### Step 4: Update Environment Variables

#### Local Development
1. Open your `.env` file (create if it doesn't exist)
2. Add or update:
   ```env
   VITE_RESEND_API_KEY=<paste_new_key_here>
   ```
3. Save the file
4. Restart your development server

#### Vercel Production
1. Login to Vercel Dashboard: https://vercel.com/dashboard
2. Navigate to your Zavira project
3. Go to: **Settings** → **Environment Variables**
4. Find or add: `VITE_RESEND_API_KEY`
5. Update value with new key
6. Select environments: **Production**, **Preview**, **Development**
7. Click **"Save"**
8. Redeploy the application

### Step 5: Verify Functionality
1. Test email sending functionality:
   - Contact form submissions
   - Appointment confirmations
   - Newsletter signups
2. Check Resend Dashboard for activity
3. Monitor for any errors in application logs

### Step 6: Monitor for Unauthorized Usage
1. Check Resend Dashboard for unusual activity
2. Review recent API calls for unauthorized requests
3. Set up alerts for quota limits
4. Consider enabling IP restrictions if available

## Security Improvements Implemented

### Files Updated
- ✅ Deleted `EMAIL` file containing exposed key
- ✅ Updated `.gitignore` to prevent future exposure
- ✅ Added `VITE_RESEND_API_KEY` to `.env.template`
- ✅ Created this rotation guide

### .gitignore Additions
```gitignore
# Email configuration files
EMAIL
email.txt
*.email
CREDENTIALS
CREDENTIALS.*
API_KEYS
API_KEYS.*
```

## Best Practices Going Forward

1. **Never commit API keys** to Git
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (every 90 days recommended)
4. **Monitor usage** in service dashboards
5. **Set up alerts** for unusual activity
6. **Use separate keys** for development and production
7. **Document key locations** securely (password manager)

## Incident Timeline
- **Date Exposed**: Unknown (EMAIL file committed to Git)
- **Date Discovered**: December 20, 2025
- **Date Remediated**: December 20, 2025
- **Rotation Completed**: [PENDING - Complete steps above]

## Checklist
- [ ] Logged into Resend Dashboard
- [ ] Deleted exposed key: `re_CyBgdUxr_K37fqo6QcqEMQ2xggPNnTHfR`
- [ ] Created new API key
- [ ] Updated local `.env` file
- [ ] Updated Vercel environment variables
- [ ] Tested email functionality
- [ ] Monitored for unauthorized usage
- [ ] Documented new key securely

## Support
If you encounter issues:
- **Resend Support**: https://resend.com/support
- **Resend Documentation**: https://resend.com/docs

---

**Last Updated**: December 20, 2025
**Next Review**: March 20, 2026 (90 days)
