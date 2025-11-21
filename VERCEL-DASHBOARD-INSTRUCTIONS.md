# 🎯 Step-by-Step Vercel Deployment Instructions

## 📋 Vercel Dashboard Setup - Exact Answers

### **Step 1: Import Project**
When you see "Import Project" options:

1. **Click "Import Git Repository"**
2. **Select "GitHub"** if not already selected
3. **Find your repository:** `msghathore/Zavira-Full-Codebase`
4. **Click "Import"**

### **Step 2: Configure Project Settings**
Vercel will ask these questions - **use these exact answers:**

**Project Name:** 
```
zavira-salon
```

**Framework Preset:** 
```
Vite
```

**Root Directory:** 
```
Leave empty (use root)
```

**Build Command:** 
```
npm run build
```

**Output Directory:** 
```
dist
```

**Install Command:** 
```
npm install
```

**Development Command:** 
```
npm run dev
```

### **Step 3: Environment Variables**
Click "Add Environment Variable" and add these **one by one:**

**Variable 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `[Enter your Supabase URL here]`
- **Environment:** Production, Preview, Development

**Variable 2:**
- **Name:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** `[Enter your Supabase publishable key here]`
- **Environment:** Production, Preview, Development

**Variable 3:**
- **Name:** `VITE_STRIPE_PUBLISHABLE_KEY`
- **Value:** `[Enter your Stripe publishable key here]`
- **Environment:** Production, Preview, Development

**Variable 4:**
- **Name:** `VITE_CLERK_PUBLISHABLE_KEY`
- **Value:** `[Enter your Clerk publishable key here]`
- **Environment:** Production, Preview, Development

**Variable 5:**
- **Name:** `VITE_BREVO_API_KEY`
- **Value:** `[Enter your Brevo/Sendinblue API key here]`
- **Environment:** Production, Preview, Development

**Variable 6:**
- **Name:** `VITE_APP_ENV`
- **Value:** `production`
- **Environment:** Production, Preview, Development

**Variable 7:**
- **Name:** `VITE_APP_URL`
- **Value:** `https://zavira.ca`
- **Environment:** Production, Preview, Development

### **Step 4: Domains**
**After deployment is complete:**

1. **Go to Project Settings** → Domains
2. **Add Domain:** `zavira.ca`
3. **Add Domain:** `www.zavira.ca`

### **Step 5: Deploy**
1. **Click "Deploy"** button
2. **Wait for build** (2-3 minutes)
3. **Check deployment URL** (will be something like: `zavira-salon-abc123.vercel.app`)

## 🚨 Important Notes

### **Environment Variables - Where to Find Them:**

**Supabase:**
- Go to your Supabase project dashboard
- Settings → API
- Copy your URL and anon key

**Stripe:**
- Go to Stripe Dashboard
- Developers → API keys
- Copy your publishable key (starts with `pk_`)

**Clerk:**
- Go to your Clerk dashboard
- API Keys
- Copy your publishable key (starts with `pk_`)

**Brevo/Sendinblue:**
- Go to your Brevo dashboard
- SMTP & API
- API keys section
- Copy your API key

### **Build Process**
The build should complete successfully with these messages:
```
✓ Building...
✓ Built in 2-3 minutes
✓ Ready to use!
```

### **If Build Fails**
Common issues and solutions:

**Error:** `npm install failed`
**Solution:** Check if all dependencies in package.json are valid

**Error:** `Build failed`
**Solution:** Check environment variables are set correctly

**Error:** `Module not found`
**Solution:** Verify package.json has all required dependencies

## 🎯 After Successful Deployment

1. **Test your deployment:** Visit the Vercel URL
2. **Add custom domain:** Follow Step 4 above
3. **Update DNS:** Point your domain to Vercel
4. **Test production:** Visit `https://zavira.ca`

## 📞 Troubleshooting

**Deployment takes too long?**
- Normal for first deployment
- Should complete in 2-3 minutes

**"Build failed" error?**
- Check environment variables
- Verify all API keys are correct

**Domain not working?**
- DNS propagation takes 24-48 hours
- Check domain settings in Vercel

---

**🚀 You should now have a successful deployment!**