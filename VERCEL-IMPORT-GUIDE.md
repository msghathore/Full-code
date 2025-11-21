# 🚀 Quick Vercel Import Guide

## 📋 Using .env.template in Vercel

### **Step 1: Copy Environment Variables**
1. Open the `.env.template` file in your repository
2. Copy all the lines (except comments)
3. Each line should look like: `VITE_VARIABLE_NAME=value`

### **Step 2: Paste into Vercel**
1. In Vercel dashboard → Your project → Settings → Environment Variables
2. Click "Add New"
3. For each variable:
   - **Name:** Copy the part before the `=` (e.g., `VITE_SUPABASE_URL`)
   - **Value:** Copy the part after the `=` (replace `your_*_here` with actual values)
   - **Environment:** Select "Production", "Preview", and "Development"
4. Click "Save" for each variable

### **Step 3: Get Your Actual API Keys**

**Supabase:**
- Go to https://supabase.com/dashboard
- Select your project → Settings → API
- Copy `URL` and `anon public` key

**Stripe:**
- Go to https://dashboard.stripe.com
- Developers → API keys
- Copy the "Publishable key"

**Clerk:**
- Go to https://dashboard.clerk.com
- Select your app → Configure → API Keys
- Copy "Publishable key"

**Brevo/Sendinblue:**
- Go to https://brevo.com (or sendinblue.com)
- SMTP & API → API keys
- Copy your API key

### **Step 4: Replace Template Values**
Replace these placeholders with your actual keys:
- `your_supabase_url_here` → Your actual Supabase URL
- `your_supabase_publishable_key_here` → Your actual Supabase key
- `your_stripe_publishable_key_here` → Your actual Stripe key
- `your_clerk_publishable_key_here` → Your actual Clerk key
- `your_brevo_api_key_here` → Your actual Brevo key

### **Step 5: Deploy**
1. Go back to "Deployments" tab in Vercel
2. Click "Redeploy" on the latest deployment
3. Or push to GitHub to trigger automatic deployment

## ✅ **That's it! Your app will be deployed with all environment variables configured.**